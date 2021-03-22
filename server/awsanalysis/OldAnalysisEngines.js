


//
// instance statuses:
//   spot - We have the spot information, but not the instance information yet
//   starting - We know it's out there, but AWS has not yet notified us that the instance is ready to use
//   needs_check - AWS has notified us that the instance is ready to use, but we have not done anything with it yet
//   checking - We are trying to discern whether or not stockfish has been installed
//   check_failed - We were unable to get a valid check
//   needs_install - Check determined we need a stockfish install
//   installing - We are installing stockfish
//   installed - It should now be installed, and ready for another check
//   install_failed - We were unable to install stockfish
//   needs_engine_load - Should be installed and ready to load engine data
//   loading_engines - Getting information on all of the engines
//   ready - Ready to go!
//   interrupted - AWS has notified us that the instance is going to go away
//   terminating - We have asked AWS to terminate this instance
//   stopping - AWS has notified us that the instance is stopping, but it isn't gone yet
//

const DOWN_STATUSES = ["interrupted", "termination_delay", "terminating", "stopping", "terminated"];

//*****************************************************************************
//** These are the AWS routines to obtain info and modify the spot instances **
//*****************************************************************************


AnalysisEngines.removeInstances = function(instanceArray) {
  log.debug("removeInstances " + JSON.stringify(instanceArray));
  const count = this.instance_collection.find({}).count();
  const spot_instance_request_ids = [];
  const instance_ids = [];
  this.instance_collection.find({ _id: { $in: instanceArray } }).forEach(rec => {
    spot_instance_request_ids.push(rec.spot_fleet_instance.SpotInstanceRequestId);
    instance_ids.push(rec.aws_instance.InstanceId);
  });
  const newcount = count - spot_instance_request_ids.length;
  this.cancelSpotInstanceRequests(spot_instance_request_ids, instance_ids, newcount);
};

AnalysisEngines.getInstallationStatusFromInstance = function(record) {
  log.debug("getInstallationStatusFromInstance instance=" + record._id);
  return new Promise((resolve, reject) => {
    this.httpGet(record, "/ok")
      .then(response => {
        log.debug("getInstallationStatusFromInstance resolving 'running'");
        resolve("running");
      })
      .catch(error => {
        log.debug("getInstallationStatusFromInstance error=" + error.message);
        if (error.errno === "ECONNREFUSED") {
          log.debug("getInstallationStatusFromInstance returning 'refused'");
          resolve("refused");
        } else {
          log.error("getInstallationStatusFromInstance rejecting on error=" + error.message);
          reject(error);
        }
      });
  });
};

AnalysisEngines.checkInstanceInstallationStatus = function(record) {
  log.debug("checkInstanceInstallationStatus instance=" + record._id);
  this.setStatus(record._id, "checking");
  // this.instance_collection.update(
  //   { _id: record._id },
  //   { $set: { status: "checking", check_count: (record.check_count || 0) + 1 } }
  // );

  return this.getInstallationStatusFromInstance(record)
    .then(instance_status => {
      log.debug(
        "checkInstanceInstallationStatus promise return from getInstallationStatusFromInstance, instance_status=" +
          instance_status
      );
      if (instance_status === "running") {
        this.setStatus(record._id, "needs_engine_load");
      } else if (instance_status === "refused") {
        this.setStatus(record._id, "needs_install");
      } else {
        log.error("Check returned unknown status: " + instance_status);
        this.setStatus(record._id, "check_failed");
      }
    })
    .catch(error => {
      log.error("getInstallationStatusFromInstance error=" + error.message);
      this.setStatus(record._id, "check_failed");
    });
};

AnalysisEngines.sshReadyFunction = function(sshConn) {
  log.debug("sshReadyFunction");
  return new Promise((resolve, reject) => {
    try {
      sshConn.exec(
        "curl -sL https://raw.githubusercontent.com/djlogan2/stockfish2/master/install.sh | sudo /bin/bash ; exit",
        (err, stream) => {
          if (err) {
            reject(err);
            return;
          }
          stream
            .on("close", () => {
              log.debug("Closing ssh from stockfish install");
              sshConn.end();
              resolve();
            })
            .on("data", data => {
              // Just ignore this
              log.debug("ssh stockfish install stdout: " + data);
            })
            .stderr.on("data", data => {
              // Just ignore this too
              log.debug("ssh stockfish install STDERR: " + data);
            });
        }
      );
    } catch (e) {
      log.error("ssh stockfish install ssh exec failed: " + e);
      reject(e);
    }
  });
};

AnalysisEngines.getSSHClient = function() {
  return new ssh2.Client.Client();
};

AnalysisEngines.installStockfish = function(record) {
  log.debug("installStockfish instance=" + record._id);
  const self = this;
  log.debug("installStockfish");
  this.setStatus(record._id, "installing");
  // this.instance_collection.update(
  //   { _id: record._id },
  //   { $set: { status: "installing", install_count: (record.install_count || 0) + 1 } }
  // );
  const sshConn = this.getSSHClient();
  const creds = {
    host: record.aws_instance.PublicIpAddress,
    port: 22,
    username: "ubuntu",
    privateKey: require("fs").readFileSync("/Users/davidlogan/.ssh/id_rsa")
  };
  sshConn.on("ready", () =>
    self
      .sshReadyFunction(sshConn)
      .then(() => {
        log.debug("installStockfish promise return");
        this.setStatus(record._id, "installed");
      })
      .catch(() => {
        log.debug("installStockfish promise reject");
        this.setStatus(record._id, "install_failed");
      })
  );
  sshConn.on("error", err => {
    log.error(
      "installStockfish unable to connect to instance " +
        record.instance_id +
        ", err=" +
        err.message
    );
    this.setStatus(record._id, "install_failed");
  });
  sshConn.connect(creds);
};

AnalysisEngines.httpGet = function(record, endpoint) {
  log.debug("httpGet instance=" + record._id + ", endpoint=" + endpoint);
  return new Promise((resolve, reject) => {
    // Could be an instance or an engine
    const ip_address = !!record.aws_instance
      ? record.aws_instance.PublicIpAddress
      : record.ip_address;
    const url = "http://" + ip_address + endpoint;
    HTTP.call("GET", url, (error, response) => {
      if (!!error) reject(error);
      else resolve();
    });
  });
};

AnalysisEngines.load3 = function(engine) {
  log.debug("load3 engine=" + engine._id);
  if (!this.waiting_allocations.length) return Promise.resolve();
  return new Promise((resolve1, reject) => {
    const resolve2 = this.waiting_allocations.shift();
    this.allocateEngineInstance(engine, resolve2.ourid)
      .then(engine_id => {
        log.debug("Sending a free engine to a one of our wait-ors. id=" + engine_id);
        resolve2.resolve(engine_id);
        resolve1();
      })
      .catch(error => {
        log.error("Unable to allocate engine instance " + engine._id + " : " + error.message);
        this.waiting_allocations.unshift(resolve2);
        reject(error);
      });
  });
};

AnalysisEngines.load2 = function(record, engine) {
  log.debug("load2 instance=" + record._id + ", engine=" + engine.id);
  return new Promise((resolve, reject) => {
    const selector = { instance_id: record.instance_id, engine_id: engine.id };
    delete engine.id;
    engine.ip_address = record.aws_instance.PublicIpAddress;
    engine.when = new Date();
    this.engine_collection.upsert(selector, { $set: engine }, (error, result) => {
      if (!!error) {
        reject(error);
        return;
      }
      engine = this.engine_collection.findOne(selector);
      this.load3(engine)
        .then(resolve)
        .catch(reject);
    });
  });
};

AnalysisEngines.load_engines = function(record) {
  log.debug("load_engines instance=" + record._id);
  this.setStatus(record._id, "loading_engines");
  this.httpGet(record, "/engines")
    .then(instresp => {
      if (!!instresp.content) instresp.content = JSON.parse(instresp.content);
      if (instresp.content.status !== "success") {
        log.error("Engine load failed");
        this.setStatus(record._id, "engine_load_failed");
        return;
      }
      const promises = instresp.content.engines.map(engine => this.load2(record, engine));
      return Promise.all(promises);
    })
    .then(() => {
      this.setStatus(record._id, "ready", (error, result) =>
        this.events.emit("instanceReady", record._id, error, result)
      );
      if (!!this.allocation_requested) this.allocation_requested--;
    })
    .catch(error => {
      this.setStatus(record._id, "engine_load_failed");
      log.error("Engine load failed: " + error.message);
    });
};
//*****************************************************************************
//** ???   **
//*****************************************************************************
Picker.route("/analysis/:engine_id", function(params, req, res) {
  log.debug("analysis callback from engine");
  let post_data = "";
  req.on("data", data => (post_data += data));
  req.on("end", () => {
    const payload = JSON.parse(post_data);
    log.debug("analysis callback from engine, payload=" + payload);
    res.end("ok");
    // {engine_id: xxx, our_id: yyy, command: aaa, response: bbb}
    const record = this.engine_collection.findOne({
      _id: payload.engine_id,
      our_id: payload.our_id
    });
    const promise = this.engine_promises[payload.engine_id];
    if (!promise) {
      log.error("Unable to find a promise for: " + JSON.stringify(payload));
      return;
    } else delete this.engine_promises[payload.engine_id];
    if (!record) {
      promise.reject(
        new Error(
          "Unable to successfully execute " + payload.command,
          "Unable to find engine record for this request"
        )
      );
    } else if (record.status !== payload.command) {
      promise.reject(
        new Error(
          "Unable to successfully execute " + payload.command,
          "Database record shows command " + record.status + ", engine returned " + payload.command
        )
      );
    } else {
      promise.resolve(payload.response);
      AnalysisEngines.engine_collection.update(
        { _id: payload.engine_id },
        { $set: { status: "busy" } }
      );
    }
  });
});

AnalysisEngines.allocateEngineInstance = function(engine, ourid) {
  log.debug("allocateEngineInstance engine=" + engine._id + ", ourid=" + ourid);
  return new Promise((resolve, reject) => {
    this.httpGet(
      engine,
      "/start/" +
        engine.engine_id +
        "/" +
        ourid +
        "?callback=" +
        encodeURI("http://" + this.my_ip + ":" + this.my_port + "/analysis/" + engine.engine_id)
    )
      .then(response => {
        if (response?.status !== "success") {
          log.error(
            "Failure allocating engine instance, engine=" +
              engine._id +
              ", ourid=" +
              ourid +
              ", error=" +
              JSON.stringify(response)
          );
          reject(
            new Error(
              "Engine allocation failed",
              "No response, or status, or status is not success"
            )
          );
          return;
        }
        this.engine_collection.update(
          { _id: engine._id },
          { $set: { status: "busy", when: new Date(), ourid: ourid } },
          (error, result) => {
            if (!!error) reject(error);
            else resolve(engine._id);
          }
        );
      })
      .catch(reject);
  });
};

AnalysisEngines.freeEngineInstance = function(engine) {
  log.debug("freeEngineInstance engine=" + engine._id);
  return new Promise((resolve, reject) => {
    this.httpGet(engine, "/end/" + engine.engine_id + " / " + engine.ourid)
      .then(response => {
        if (response?.status === "success") {
          reject(
            new Error("Engine free failed", "No response, or status, or status is not success")
          );
          return;
        }
        this.engine_collection.update(
          { _id: engine._id },
          { $set: { status: "free", when: new Date() }, $unset: { ourid: 1 } }
        );
        resolve();
      })
      .catch(reject);
  });
};

AnalysisEngines.allocateEngine = function(ourid) {
  log.debug("allocateEngine " + ourid);
  //
  // Make sure we continue to use the same instances as much as possible
  // Not really even so concerned about the most recently used engine, but hey, why not
  return new Promise((resolve, reject) => {
    const engine = this.engine_collection.findOne(
      { status: "waiting" },
      { sort: [["instance_id", "asc"], ["when", "desc"]] }
    );

    if (!!engine) {
      log.debug("Found an engine to return");
      this.allocateEngineInstance(engine, ourid)
        .then(resolve)
        .catch(reject);
      return;
    }

    log.debug("Have to wait for a new instance");
    this.waiting_allocations.push({ resolve: resolve, reject: reject, ourid: ourid });

    const required_instances = Math.ceil(this.waiting_allocations.length / 8);
    if (this.allocation_requested < required_instances) {
      this.allocation_requested = required_instances;
      const newcount =
        this.instance_collection.find({ status: { $nin: DOWN_STATUSES } }).count() +
        required_instances;
      log.debug("Requesting new instance count of " + newcount);
      this.modifySpotFleetRequest(newcount);
    }
  });
};

AnalysisEngines.freeEngine = function(engine) {
  this.freeEngineInstance(engine)
    .then(() => {
      if (!!this.waiting_allocations.length) {
        const resolve = this.waiting_allocations.shift();
        this.allocateEngineInstance(engine, resolve.ourid)
          .then(() => resolve.resolve())
          .catch(error => {
            log.error("Unable to free engine: " + error.message);
            resolve.resolve();
          });
      }
    })
    .catch(error => {
      log.error("What to do about this engine free failure: " + error.message);
    });
};

AnalysisEngines.startNewGame = function(engine) {
  return new Promise((resolve, reject) => {
    this.httpGet(engine, "/startnewgame/" + engine.engine_id + "/" + engine.ourid)
      .then(response => {
        if (response?.status === "success") {
          reject(
            new Error("Engine free failed", "No response, or status, or status is not success")
          );
          return;
        }
        this.engine_promises[engine._id] = {
          resolve: resolve,
          reject: reject
        };
        this.engine_collection.update(
          { _id: engine._id },
          { $set: { status: "startnewgame", when: new Date() }, $unset: { ourid: 1 } }
        );
      })
      .catch(reject);
  });
};

AnalysisEngines.analysisPositionForever = function(engine, fen) {
  // ucinewgame
  // setoption MultiPV 4
  // setoption Threads 4
  // position [fen]
  // goinfinite
  //       await engines[engine_id].ucinewgame();
  //       await engines[engine_id].setoption("MultiPV", 4);
  //       await engines[engine_id].setoption("Threads", threads);
  //       await engines[engine_id].position(fen);
  //       engines[engine_id].goInfinite();
};

AnalysisEngines.analysisPositionForMillis = function(engine, fen, millis) {};

AnalysisEngines.setStatus = function(id, status, callback) {
  log.debug("setStatus instance=" + id + ", status=" + status);
  const record = this.instance_collection.findOne({ _id: id });
  let interval;
  if (record.status === status) {
    log.debug("Instance " + id + " is already in status " + status + ". Skipping");
    this.instance_collection.update(
      { _id: record._id },
      { $set: { count: (record.count || 0) + 1 } }
    );
    if (!!callback && typeof callback === "function") callback();
    return;
  }

  log.debug("Instance " + id + " in status " + status + " is being transitioned");
  this.instance_collection.update({ _id: id }, { $set: { status: status, count: 1 } }, callback);
  switch (status) {
    case "starting":
      log.error("Handle status " + status + " or get rid of this case statement");
      break;
    case "needs_check":
      this.checkInstanceInstallationStatus(record);
      break;
    case "checking":
      log.error("Handle status " + status + " or get rid of this case statement");
      break;
    case "check_failed":
      if (!!record.count && record.count >= 5) {
        log.error("Unable to check instance " + record._id + " -- Too many failed checks");
        //removeInstances([id]);
        return;
      }
      interval = Meteor.setInterval(() => {
        Meteor.clearInterval(interval);
        this.checkInstanceInstallationStatus(record);
      }, this.intervalWait);
      //removeInstances([id]);
      break;
    case "needs_install":
      this.installStockfish(record);
      break;
    case "installing":
      log.error("Handle status " + status + " or get rid of this case statement");
      break;
    case "installed":
      this.checkInstanceInstallationStatus(record);
      break;
    case "install_failed":
      if (!!record.count && record.count >= 5) {
        log.error(
          "Unable to install stockfish for instance " + record._id + " -- Too many failed attempts"
        );
        //removeInstances([id]);
        return;
      }
      interval = Meteor.setInterval(() => {
        Meteor.clearInterval(interval);
        this.installStockfish(record);
      }, this.intervalWait);
      break;
    case "needs_engine_load":
      this.load_engines(record);
      break;
    case "engine_load_failed":
      this.installStockfish(record);
      break;
    case "loading_engines":
      break;
    case "ready":
      log.error("Handle status " + status + " or get rid of this case statement");
      break;
    case "interrupted":
      break;
    case "terminating":
      log.error("Handle status " + status + " or get rid of this case statement");
      break;
    case "stopping":
      log.error("Handle status " + status + " or get rid of this case statement");
      break;
    case "spot":
      break;
    default:
      log.error("Unknown status found in observeChanges for id " + id + ", status=" + status);
      break;
  }
};

Meteor.startup(() => {
  if (!Meteor.isTest && !Meteor.isAppTest) {
    AnalysisEngines.setupSNS();
    AnalysisEngines.getInitialInstanceState();
  }
});

Meteor.methods({
  developer_allocateengine: () => {
    check(Meteor.user(), Object);
    if (!Users.isAuthorized(Meteor.user(), "developer"))
      throw new Error("Unable to allocate an engine", "Not a developer");
    return AnalysisEngines.allocateEngine(Meteor.userId()).catch(error => err => log.error(err));
  },
  developer_freeEngine: engine_id => {
    check(Meteor.user(), Object);
    check(engine_id, String);
    if (!Users.isAuthorized(Meteor.user(), "developer"))
      throw new Error("Unable to free an engine", "Not a developer");
    AnalysisEngines.freeEngine(engine_id);
  },
  developer_removeInstance: id => {
    check(Meteor.user(), Object);
    check(id, String);
    if (!Users.isAuthorized(Meteor.user(), "developer"))
      throw new Error("Unable to modify fleet request", "Not a developer");
    AnalysisEngines.removeInstances([id]);
  },
  developer_modifySpotFleetRequest: newcount => {
    check(Meteor.user(), Object);
    check(newcount, Number);
    if (!Users.isAuthorized(Meteor.user(), "developer"))
      throw new Error("Unable to modify fleet request", "Not a developer");
    AnalysisEngines.modifySpotFleetRequest(newcount);
  }
});
