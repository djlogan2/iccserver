import chai from "chai";
import sinon from "sinon";
import { EventEmitter } from "events";
import { Random } from "meteor/random";
import { resetDatabase } from "meteor/xolvio:cleaner";
import { AnalysisEngines } from "./AnalysisEngines";

class FakeEc2 {
  constructor(options, spot_callback, instance_callback) {
    const _options = options || {};
    this.instances = [];
    this.engines = {};
    this.startup_wait = _options.startup_wait || 3;
    this.ssh_wait = _options.ssh_wait || 3;
    this.spot_callback = spot_callback;
    this.instance_callback = instance_callback;
  }

  describeInstances(params, callback) {
    let ip = 0;
    const spots = this.instances.map(inst => {
      return {
        InstanceId: inst.instance_id,
        PublicIpAddress: "1.2.3." + ip++,
        State: { Name: inst.status },
        SpotInstanceRequestId: inst.spot_id
      };
    });
    callback(null, { Reservations: [{ Instances: spots }] });
  }

  describeSpotFleetInstances(params, callback) {
    const spots = this.instances.map(inst => {
      return {
        InstanceId: inst.instance_id,
        SpotInstanceRequestId: inst.spot_id
      };
    });
    callback(null, { ActiveInstances: spots });
  }

  modifySpotFleetRequest(params) {
    return {
      promise: () => {
        return new Promise((resolve, reject) => {
          if (this.instances.length === params.TargetCapacity) resolve();
          if (params.TargetCapacity < this.instances.length) {
          } else {
            for (let x = this.instances.length; x < params.TargetCapacity; x++)
              this._startAWSInstance();
            resolve();
          }
        });
      }
    };
  }

  _interrupt(instance_ids) {}

  _startAWSInstance() {
    const newguy = { instance_id: Random.id(), spot_id: Random.id(), status: "pending" };
    this.instances.push(newguy);
    this.instance_callback("pending", newguy.instance_id);
    newguy.status = "running";
    this.instance_callback("running", newguy.instance_id);
  }

  terminateInstances() {
    chai.assert.fail("Do something here");
  }

  cancelSpotInstanceRequests() {
    chai.assert.fail("Do something here");
  }

  httpGet(instance_id, endpoint) {
    return new Promise((resolve, reject) => {
      const instance = this.instances.find(inst => inst.instance_id === instance_id);

      if (!instance) {
        reject({ errno: "ECONNREFUSED" });
        return;
      }

      if (!instance.engines || !instance.engines.length) {
        if (instance.wait_count === this.startup_wait) {
          reject({ errno: "UPBUTNOTINSTALLED" });
        } else {
          instance.wait_count = (instance.wait_count || 0) + 1;
          reject({ errno: "ECONNREFUSED" });
        }
        return;
      }

      // /ok
      if (endpoint === "/ok") {
        resolve({ status: "ok" });
        return;
      }

      if (endpoint === "/engines") {
        resolve({ content: JSON.stringify({ status: "success", engines: instance.engines }) });
        return;
      }

      // /start/engine.engine_id/ourid?callback=xxx
      if (endpoint.startsWith("/start")) {
        const splits = endpoint.split("/");
        const engine_id = splits[2];
        const secpart = splits[3].split("?");
        const ourid = secpart[0];
        const callbackurl = secpart[1];
        let found = false;
        instance.engines.forEach(eng => {
          if (engine_id === eng.id) {
            found = true;
            if (eng.status === "waiting") {
              eng.status = "busy";
              eng.ourid = ourid;
              resolve({ status: "success", engine_id: eng.id, your_id: ourid });
            } else {
              const fuck1 = AnalysisEngines.instance_collection;
              const fuck2 = AnalysisEngines.engine_collection;
              resolve({ status: "error", error: "Engine is not waiting" });
            }
          }
        });
        if (!found) resolve({ status: "error", error: "Engine was not found" });
        return;
      }
      // /end/engine.engine_id/engine.ourid
      if (endpoint.startsWith("/end")) {
        const splits = endpoint.split("/");
        const engine_id = splits[1];
        const our_id = splits[2];
        let found = false;
        instance.engines.forEach(eng => {
          if (engine_id === eng.id) {
            found = true;
            if (eng.status === "busy" || eng.ourid === our_id) {
              eng.status = "waiting";
              delete eng.ourid;
              resolve({ status: "success", engine_id: eng.id, your_id: our_id });
            } else {
              resolve({ status: "error", error: "Engine is not allocated to you" });
            }
          }
        });
        if (!found) resolve({ status: "error", error: "Engine was not found" });
        return;
      }
      // /startnewgame/engine.engine_id/engine.ourid,
      if (endpoint.startsWith("/startnewgame")) {
      }
      reject(new Error("Unknown endpoint " + endpoint));
    });
  }

  fakeSSH(instance_id) {
    const self = this;
    return new (class fakeSSHClient extends EventEmitter {
      connect(creds) {
        const instidx = creds.host.split(".")[3];
        this.instance = self.instances[instidx];
        if (!this.instance) this.emit("error", new Error("Connection refused"));
        else if (this.instance.connection_count !== this.ssh_wait) {
          this.instance.connection_count = (this.instance.connection_count || 0) + 1;
          this.emit("error", new Error("Connection refused"));
        } else {
          this.emit("ready");
        }
      }

      exec(cmd, callback) {
        const execemitter = new EventEmitter();
        execemitter.stderr = new EventEmitter();

        if (!this.instance.engines || !this.instance.engines.length) {
          this.instance.engines = [];
          for (let x = 0; x < 8; x++) {
            this.instance.engines.push({
              id: Random.id(),
              status: "waiting"
            });
          }
        }

        callback(null, execemitter);

        const interval = Meteor.setInterval(() => {
          Meteor.clearInterval(interval);
          execemitter.emit("data", "stdout text");
          execemitter.stderr.emit("data", "stderr text");
          execemitter.emit("close");
        });
      }

      end() {
        delete this.instance;
      }
    })();
  }
}

describe.skip("AnalysisEngines", function() {
  let sandbox;
  beforeEach(function(done) {
    sandbox = sinon.createSandbox();
    AnalysisEngines.waiting_allocations = [];
    AnalysisEngines.allocation_requested = 0;
    resetDatabase(null, done);
  });
  afterEach(() => {
    sandbox.restore();
  });

  function initialInstances(count, engines) {
    for (let x = 0; x < count; x++) {
      const instance_id = Random.id();
      const spot_id = Random.id();
      AnalysisEngines.instance_collection.insert({
        aws_instance: {
          InstanceId: instance_id,
          PublicIpAddress: "1.2.3." + x,
          State: {
            Name: "running"
          },
          SpotInstanceRequestId: spot_id
        },
        instance_id: instance_id,
        spot_fleet_instance: {
          InstanceId: instance_id,
          SpotInstanceRequestId: spot_id
        },
        status: "ready"
      });
      if (engines === undefined || !!engines)
        for (let y = 0; y < 8; y++) {
          AnalysisEngines.engine_collection.insert({
            engine_id: Random.id(),
            instance_id: instance_id,
            ip_address: "1.2.3." + x,
            status: "waiting",
            when: new Date()
          });
        }
    }
  }

  it("should set an existing engine record busy, assign our ID, and return the engine ID when one is available", function() {
    sandbox.replace(AnalysisEngines, "intervalWait", 1);
    sandbox.spy(AnalysisEngines.instance_collection);
    sandbox.spy(AnalysisEngines.engine_collection);
    const fakeec2 = new FakeEc2(
      { startup_wait: 0, ssh_wait: 0 },
      AnalysisEngines.spotInterruption,
      AnalysisEngines.instanceChanged
    );
    sandbox.replace(AnalysisEngines, "ec2", fakeec2);
    sandbox.replace(AnalysisEngines, "httpGet", (record, endpoint) => {
      if ("instance_id" in record) return fakeec2.httpGet(record.instance_id, endpoint);
      else {
        const idx = record.ip_address.split(".")[3];
        return fakeec2.httpGet(fakeec2.instances[idx].instance_id, endpoint);
      }
    });
    sandbox.replace(AnalysisEngines, "getSSHClient", sandbox.fake.returns(fakeec2.fakeSSH()));
    let instance_up = 0;
    let instance_up_resolve;
    AnalysisEngines.events.on("instanceReady", () => {
      instance_up++;
      console.log("instanceReady up=" + instance_up + ", call resolve=" + !!instance_up_resolve);
      if (!!instance_up_resolve) {
        console.log("Calling waitors resolve");
        instance_up_resolve();
        instance_up_resolve = null;
      }
    });

    const wait_for_instances = function(expected_instance_count) {
      return new Promise(resolve => {
        if (expected_instance_count === instance_up) {
          console.log("" + expected_instance_count + " instances already up, returning");
          resolve();
        } else {
          console.log("Waiting for " + expected_instance_count + " instances to come up");
          instance_up_resolve = resolve;
        }
      });
    };

    const allocate = function(expected_instance_count, expected_busy_engine_count) {
      console.log("----- ALLOCATE -----");
      const ourid = Random.id();
      let engine_id;
      return AnalysisEngines.allocateEngine(ourid)
        .then(eid => {
          engine_id = eid;
          return wait_for_instances(expected_instance_count);
        })
        .then(() => {
          const engine_record = AnalysisEngines.engine_collection.findOne({ _id: engine_id });
          //return Promise.all([
          chai.assert.equal(
            AnalysisEngines.instance_collection.find().count(),
            expected_instance_count
          );
          chai.assert.equal(
            AnalysisEngines.engine_collection.find().count(),
            expected_instance_count * 8
          );
          chai.assert.equal(
            AnalysisEngines.engine_collection.find({ status: "waiting" }).count(),
            expected_instance_count * 8 - expected_busy_engine_count
          );
          chai.assert.equal(engine_id, engine_record._id);
          chai.assert.equal(engine_record.ourid, ourid);
          console.log("----- END OF ALLOCATE -----");
        });
    };

    return allocate(1, 1)
      .then(() => {
        return allocate(1, 2);
      })
      .then(() => {
        return allocate(1, 3);
      })
      .then(() => {
        return allocate(1, 4);
      })
      .then(() => {
        return allocate(1, 5);
      })
      .then(() => {
        return allocate(1, 6);
      })
      .then(() => {
        return allocate(1, 7);
      })
      .then(() => {
        return allocate(1, 8);
      })
      .then(() => {
        return allocate(2, 9);
      })
      .then(() => {
        return allocate(2, 10);
      })
      .then(() => {
        return allocate(2, 11);
      })
      .then(() => {
        return allocate(2, 12);
      })
      .then(() => {
        return allocate(2, 13);
      })
      .then(() => {
        return allocate(2, 14);
      })
      .then(() => {
        return allocate(2, 15);
      })
      .then(() => {
        return allocate(2, 16);
      })
      .then(() => {
        return allocate(3, 17);
      });
  });

  describe("Each individual function", function() {
    beforeEach(() => {
      sandbox.replace(AnalysisEngines, "setStatus", () => {
        console.log("yay");
        return null;
      });
    });
    describe("AnalysisEngines.allocateEngine", function() {
      it("should message an available instance and set its status to busy and return the engine id to us in happiest path", function() {
        initialInstances(1);
        sandbox.replace(AnalysisEngines, "httpGet", (engine, endpoint) => {
          return new Promise((resolve, reject) => {
            const splits = endpoint.split("/");
            const eid = splits[2];
            const oid = splits[3];
            chai.assert.equal(eid, engine.engine_id);
            resolve({ status: "success", engine_id: eid, your_id: oid });
          });
        });
        return AnalysisEngines.allocateEngine("test1").then(engine_id => {
          const engine = AnalysisEngines.engine_collection.findOne({ _id: engine_id });
          chai.assert.equal(engine.status, "busy");
          chai.assert.equal(engine.ourid, "test1");
        });
      });
      it("should return a promise rejection when we get a failure when trying to set the remote engine to busy?", function() {
        initialInstances(1);
        sandbox.replace(AnalysisEngines, "httpGet", (engine, endpoint) => {
          return new Promise((resolve, reject) => {
            const splits = endpoint.split("/");
            const eid = splits[2];
            const oid = splits[3];
            chai.assert.equal(eid, engine.engine_id);
            resolve({ status: "error", error: "This is an error, dammit!" });
          });
        });
        return AnalysisEngines.allocateEngine("test1")
          .then(engine_id => chai.assert.fail("This should not succeed"))
          .catch(error => {
            chai.assert.equal(
              AnalysisEngines.engine_collection.find({ status: "busy" }).count(),
              0
            );
            chai.assert.equal(error.message, "Engine allocation failed");
          });
      });
      it("should return a promise rejection when we get a connection refused when trying to set the remote engine to busy?", function() {
        initialInstances(1);
        sandbox.replace(AnalysisEngines, "httpGet", (engine, endpoint) => {
          return new Promise((resolve, reject) => {
            const splits = endpoint.split("/");
            const eid = splits[2];
            const oid = splits[3];
            chai.assert.equal(eid, engine.engine_id);
            reject({ errno: "ECONNREFUSED" });
          });
        });
        return AnalysisEngines.allocateEngine("test1")
          .then(engine_id => chai.assert.fail("This should not succeed"))
          .catch(error => {
            chai.assert.equal(error.errno, "ECONNREFUSED");
            chai.assert.equal(
              AnalysisEngines.engine_collection.find({ status: "busy" }).count(),
              0
            );
          });
      });
      it("should return a promise rejection when we get a 'stockfish not installed' error when trying to set the remote engine to busy?", function() {
        initialInstances(1);
        sandbox.replace(AnalysisEngines, "httpGet", (engine, endpoint) => {
          return new Promise((resolve, reject) => {
            const splits = endpoint.split("/");
            const eid = splits[2];
            const oid = splits[3];
            chai.assert.equal(eid, engine.engine_id);
            reject({ errno: "NOTCONNECTIONREFUSED" });
          });
        });
        return AnalysisEngines.allocateEngine("test1")
          .then(engine_id => chai.assert.fail("This should not succeed"))
          .catch(error => {
            chai.assert.equal(error.errno, "NOTCONNECTIONREFUSED");
            chai.assert.equal(
              AnalysisEngines.engine_collection.find({ status: "busy" }).count(),
              0
            );
          });
      });
      it("should return a promise rejection when 'ourid' already has an allocated engine?", function() {
        initialInstances(1);
        sandbox.replace(AnalysisEngines, "httpGet", (engine, endpoint) => {
          return new Promise((resolve, reject) => {
            const splits = endpoint.split("/");
            const eid = splits[2];
            const oid = splits[3];
            chai.assert.equal(eid, engine.engine_id);
            resolve({ status: "success", engine_id: eid, your_id: oid });
          });
        });
        return AnalysisEngines.allocateEngine("test1")
          .then(engine_id => {
            const engine = AnalysisEngines.engine_collection.findOne({ _id: engine_id });
            chai.assert.equal(engine.status, "busy");
            chai.assert.equal(engine.ourid, "test1");
          })
          .catch(error => {
            chai.assert.fail("Should not have failed at this point: " + JSON.stringify(error));
          })
          .then(() => AnalysisEngines.allocateEngine("test1"))
          .then(engine_id => {
            chai.assert.fail(
              "Should not have succeeded in allocating a second engine with the same id"
            );
          })
          .catch(error => {
            chai.assert.equal(
              AnalysisEngines.engine_collection.find({ status: "busy" }).count(),
              1
            );
            chai.assert.equal(error.message, "Duplicate allocation id");
          });
      });
      it("should increase spot fleet by one and put itself on the waiting list if there is no engine available", function() {
        const modify = sandbox.stub(AnalysisEngines, "modifySpotFleetRequest");
        const analysisPromise = AnalysisEngines.allocateEngine("test1")
          .then(() => chai.assert.fail("Allocation should not have completed!"))
          .then(() => chai.assert.fail("The allocation should not have succeeded!"))
          .catch(error =>
            chai.assert.fail(
              "The allocation should not have failed! error=" + JSON.stringify(error)
            )
          );
        const modifyPromise = new Promise(resolve => {
          const interval = Meteor.setInterval(() => {
            Meteor.clearInterval(interval);
            chai.assert.isTrue(modify.calledOnce);
            resolve();
          }, 50);
        });
        return Promise.race([analysisPromise, modifyPromise]);
      });
      it("should resolve its promise and return an engine to the caller when its waiting resolve is called", function() {
        sandbox.replace(AnalysisEngines, "modifySpotFleetRequest", () => {
          chai.assert.equal(AnalysisEngines.allocation_requested, 1);
          chai.assert.equal(AnalysisEngines.waiting_allocations.length, 1);
          const resolve = AnalysisEngines.waiting_allocations.shift();
          chai.assert.isDefined(resolve.resolve);
          chai.assert.isDefined(resolve.reject);
          chai.assert.isDefined(resolve.ourid);
          const result = AnalysisEngines.engine_collection.insert({ status: "busy" });
          resolve.resolve(result.insertedId);
        });
        return AnalysisEngines.allocateEngine("test1")
          .then(engine_id => {
            chai.assert.equal(
              AnalysisEngines.engine_collection.find({ status: "busy" }).count(),
              1
            );
          })
          .catch(error => {
            chai.assert.fail("This should not have failed: " + JSON.stringify(error));
          });
      });
      it("should reject its promise when its waiting reject is called", function() {
        sandbox.replace(AnalysisEngines, "modifySpotFleetRequest", () => {
          chai.assert.equal(AnalysisEngines.allocation_requested, 1);
          chai.assert.equal(AnalysisEngines.waiting_allocations.length, 1);
          const resolve = AnalysisEngines.waiting_allocations.shift();
          chai.assert.isDefined(resolve.resolve);
          chai.assert.isDefined(resolve.reject);
          chai.assert.isDefined(resolve.ourid);
          resolve.reject(new Error("An error"));
        });
        return AnalysisEngines.allocateEngine("test1")
          .then(engine_id => {
            chai.assert.fail("This should have failed");
          })
          .catch(error => {
            chai.assert.equal(
              AnalysisEngines.engine_collection.find({ status: "busy" }).count(),
              0
            );
            chai.assert.isDefined(error);
          });
      });
    });

    describe("AnalysisEngines.allocateEngineInstance", function() {
      it("should call the instance with a start command, and update the database that our engine is now busy", function() {
        initialInstances(1);
        sandbox.replace(AnalysisEngines, "httpGet", (engine, endpoint) => {
          return new Promise((resolve, reject) => {
            const splits = endpoint.split("/");
            const eid = splits[2];
            const oid = splits[3];
            resolve({ status: "success", engine_id: eid, your_id: oid });
          });
        });
        const engine = AnalysisEngines.engine_collection.findOne({ status: "waiting" });
        return AnalysisEngines.allocateEngineInstance(engine, "test1").then(engine_id => {
          const engine2 = AnalysisEngines.engine_collection.findOne({ _id: engine_id });
          chai.assert.equal(engine2.status, "busy");
          chai.assert.equal(engine2.ourid, "test1");
        });
      });
      it("should call the instance with a start command, and what happens if we get a connection refused?", function() {
        initialInstances(1);
        sandbox.replace(AnalysisEngines, "httpGet", (engine, endpoint) => {
          return new Promise((resolve, reject) => {
            const splits = endpoint.split("/");
            const eid = splits[2];
            const oid = splits[3];
            chai.assert.equal(eid, engine.engine_id);
            reject({ errno: "ECONNREFUSED" });
          });
        });
        const engine = AnalysisEngines.engine_collection.findOne({ status: "waiting" });
        return AnalysisEngines.allocateEngine(engine, "test1")
          .then(engine_id => chai.assert.fail("This should not succeed"))
          .catch(error => {
            const engine2 = AnalysisEngines.engine_collection.findOne({ _id: engine._id });
            chai.assert.equal(error.errno, "ECONNREFUSED");
            chai.assert.equal(engine2.status, "waiting");
            chai.assert.isUndefined(engine2.our_id);
          });
      });
      it("should call the instance with a start command, and what happens if we get another error?", function() {
        initialInstances(1);
        sandbox.replace(AnalysisEngines, "httpGet", (engine, endpoint) => {
          return new Promise((resolve, reject) => {
            const splits = endpoint.split("/");
            const eid = splits[2];
            const oid = splits[3];
            chai.assert.equal(eid, engine.engine_id);
            resolve({ status: "error", error: "This is an error, dammit!" });
          });
        });
        const engine = AnalysisEngines.engine_collection.findOne({ status: "waiting" });
        return AnalysisEngines.allocateEngineInstance(engine, "test1")
          .then(engine_id => chai.assert.fail("This should not succeed"))
          .catch(error => {
            const engine2 = AnalysisEngines.engine_collection.findOne({ _id: engine._id });
            chai.assert.equal(error.message, "Engine allocation failed");
            chai.assert.equal(engine2.status, "waiting");
            chai.assert.isUndefined(engine2.our_id);
          });
      });
    });

    describe("AnalysisEngines.analysisPositionForever", function() {
      it("needs to be done", function() {
        chai.assert.fail("do me");
      });
    });
    describe("AnalysisEngines.analysisPositionForMillis", function() {
      it("needs to be done", function() {
        chai.assert.fail("do me");
      });
    });
    describe.skip("AnalysisEngines.cancelSpotInstanceRequests", function() {
      it("needs to be done", function() {
        chai.assert.fail("do me");
      });
    });
    describe("AnalysisEngines.checkInstanceInstallationStatus", function() {
      it("it should set the instance record to 'checking', then wait for a promise return from 'getInstallationStatusFromInstance'", function() {
        initialInstances(1, false);
        const instance1 = AnalysisEngines.instance_collection.findOne();
        chai.assert.isDefined(instance1);
        sandbox.replace(AnalysisEngines, "getInstallationStatusFromInstance", () => {
          const instance2 = AnalysisEngines.instance_collection.findOne();
          chai.assert.equal(instance2.status, "checking");
          return Promise.resolve("running");
        });
        AnalysisEngines.checkInstanceInstallationStatus(instance1).then(() => {
          const instance3 = AnalysisEngines.instance_collection.findOne();
          chai.assert.equal(instance3.status, "needs_engine_load");
        });
      });
      it("it should should set the instance to 'needs_engine_load' when 'getInstallationStatusFromInstance' returns 'running'", function() {
        // Done above, which tests for both the initial 'checking' and the final 'needs_engine_load'
      });
      it("it should should set the instance to 'needs_install' when 'getInstallationStatusFromInstance' returns 'refused'", function() {
        initialInstances(1, false);
        const instance1 = AnalysisEngines.instance_collection.findOne();
        chai.assert.isDefined(instance1);
        sandbox.replace(AnalysisEngines, "getInstallationStatusFromInstance", () => {
          const instance2 = AnalysisEngines.instance_collection.findOne();
          chai.assert.equal(instance2.status, "checking");
          return Promise.resolve("refused");
        });
        AnalysisEngines.checkInstanceInstallationStatus(instance1).then(() => {
          const instance3 = AnalysisEngines.instance_collection.findOne();
          chai.assert.equal(instance3.status, "needs_install");
        });
      });
      it("it should should set the instance to 'check_failed' when 'getInstallationStatusFromInstance' returns an unexpected status", function() {
        initialInstances(1, false);
        const instance1 = AnalysisEngines.instance_collection.findOne();
        chai.assert.isDefined(instance1);
        sandbox.replace(AnalysisEngines, "getInstallationStatusFromInstance", () => {
          const instance2 = AnalysisEngines.instance_collection.findOne();
          chai.assert.equal(instance2.status, "checking");
          return Promise.resolve("ho-hum-fe-fi-fo-fum");
        });
        AnalysisEngines.checkInstanceInstallationStatus(instance1).then(() => {
          const instance3 = AnalysisEngines.instance_collection.findOne();
          chai.assert.equal(instance3.status, "check_failed");
        });
      });
    });

    describe("AnalysisEngines.confirmSubscription", function() {
      it("needs to be done", function() {
        chai.assert.fail("do me");
      });
    });
    describe("AnalysisEngines.describeInstances", function() {
      it("needs to be done", function() {
        chai.assert.fail("do me");
      });
    });
    describe("AnalysisEngines.freeEngine", function() {
      it("needs to be done", function() {
        chai.assert.fail("do me");
      });
    });
    describe("AnalysisEngines.freeEngineInstance", function() {
      it("needs to be done", function() {
        chai.assert.fail("do me");
      });
    });
    describe("AnalysisEngines.getInitialInstanceState", function() {
      it("needs to be done", function() {
        chai.assert.fail("do me");
      });
    });
    describe("AnalysisEngines.getInstallationStatusFromInstance", function() {
      it("needs to be done", function() {
        chai.assert.fail("do me");
      });
    });
    describe("AnalysisEngines.getOurTopics", function() {
      it("needs to be done", function() {
        chai.assert.fail("do me");
      });
    });
    describe("AnalysisEngines.getSSHClient", function() {
      it("needs to be done", function() {
        chai.assert.fail("do me");
      });
    });
    describe("AnalysisEngines.handleStatus", function() {
      it("needs to be done", function() {
        chai.assert.fail("do me");
      });
    });
    describe("AnalysisEngines.httpGet", function() {
      it("needs to be done", function() {
        chai.assert.fail("do me");
      });
    });
    describe("AnalysisEngines.initiateEndpoint", function() {
      it("needs to be done", function() {
        chai.assert.fail("do me");
      });
    });
    describe("AnalysisEngines.installStockfish", function() {
      it("needs to be done", function() {
        chai.assert.fail("do me");
      });
    });
    describe("AnalysisEngines.instanceChanged", function() {
      it("needs to be done", function() {
        chai.assert.fail("do me");
      });
    });
    describe("AnalysisEngines.load2", function() {
      it("needs to be done", function() {
        chai.assert.fail("do me");
      });
    });
    describe("AnalysisEngines.load3", function() {
      it("needs to be done", function() {
        chai.assert.fail("do me");
      });
    });
    describe("AnalysisEngines.load_engines", function() {
      it("needs to be done", function() {
        chai.assert.fail("do me");
      });
    });
    describe("AnalysisEngines.modifySpotFleetRequest", function() {
      it("needs to be done", function() {
        chai.assert.fail("do me");
      });
    });
    describe("AnalysisEngines.removeInstances", function() {
      it("needs to be done", function() {
        chai.assert.fail("do me");
      });
    });
    describe("AnalysisEngines.setupSNS", function() {
      it("needs to be done", function() {
        chai.assert.fail("do me");
      });
    });
    describe("AnalysisEngines.spotInterruption", function() {
      it("needs to be done", function() {
        chai.assert.fail("do me");
      });
    });
    describe("AnalysisEngines.sshReadyFunction", function() {
      it("needs to be done", function() {
        chai.assert.fail("do me");
      });
    });
    describe("AnalysisEngines.startNewGame", function() {
      it("needs to be done", function() {
        chai.assert.fail("do me");
      });
    });
    describe("AnalysisEngines.terminateInstances", function() {
      it("needs to be done", function() {
        chai.assert.fail("do me");
      });
    });
  });
});
