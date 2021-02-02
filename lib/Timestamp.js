import { Meteor } from "meteor/meteor";
import { Random } from "meteor/random";

export const TimestampServer = function(log, debug, sender_function, lagging_function, count) {
  let pendingrequests = {};
  let pingcount = count || 60;
  let delay;
  let clock_offset = 0;
  let current_clock_offset = 0;
  let pingtimes = [];
  let _sender = sender_function;
  let _lagfunc = lagging_function;
  let interval_id = null;

  function sendPing() {
    const request = Random.id();
    pendingrequests[request] = {
      id: request,
      originate: getMilliseconds()
    };
    _sender("ping", pendingrequests[request]);
  }

  function getMilliseconds() {
    return new Date().getTime() + current_clock_offset;
  }

  function stop() {
    if (!!interval_id) Meteor.clearInterval(interval_id);
  }

  function cleanupOldPings() {
    const old = new Date().getTime() - 60 * 1000; // One minute ago
    Object.keys(pendingrequests)
      .filter(key => pendingrequests[key].originate < old)
      .forEach(key => delete pendingrequests[key]);
  }

  function pongArrived(response) {
    if (!response.id) throw new Meteor.Error("No random id in ping response");
    if (!pendingrequests[response.id]) {
      // This is going to happen, in slower connections, happen often, because
      // the client send a response for every object still in the game array, so if we
      // do not process this fast enough, the client will send us responses multiple times.
      // So just eat this and return.
      // log.error("Unable to find request for response: " + response.id);
      return;
    }

    const arrival = getMilliseconds();
    delay = arrival - response.originate - (response.transmit - response.receive);
    clock_offset = (response.receive - response.originate + response.transmit - arrival) / 2;
    current_clock_offset += clock_offset;
    if (pingtimes.length === pingcount) pingtimes.shift();
    pingtimes.push(delay);
    _sender("pingresult", {
      id: response.id,
      delay: delay,
      clock_offset: clock_offset
    });
    delete pendingrequests[response.id];
  }
  interval_id = Meteor.setInterval(() => {
    if (
      Object.entries(pendingrequests).length !== 0 &&
      pendingrequests.constructor === Object &&
      typeof _lagfunc === "function"
    )
      Meteor.bindEnvironment(_lagfunc());
    sendPing();
    cleanupOldPings();
  }, 1000);

  return {
    getMilliseconds: () => getMilliseconds(),

    lastPing: function() {
      return pingtimes.length ? pingtimes[pingtimes.length - 1] : 0;
    },

    averageLag: function() {
      return pingtimes.length
        ? pingtimes.reduce((pv, cv) => {
            return pv + cv;
          }, 0) / pingtimes.length
        : 0;
    },
    pongArrived: function(response) {
      pongArrived(response);
    },
    end: function() {
      stop();
    }
  };
};

export const TimestampClient = function(log, debug, sender_function, count) {
  let _sender = sender_function;
  let pingtimes = [];
  let pingcount = count || 60;

  function pingArrived(ping) {
    const pong = {
      id: ping.id,
      originate: ping.originate,
      receive: new Date().getTime(), // When the packet came in
      transmit: new Date().getTime() // When the packet gets sent out
    };
    _sender("pong", pong);
  }

  function resultArrived(result) {
    if (pingtimes.length === pingcount) pingtimes.shift();
    pingtimes.push(result.delay);
  }

  return {
    pingArrived: function(ping) {
      pingArrived(ping);
    },
    resultArrived: function(result) {
      resultArrived(result);
    },
    lastPing: function() {
      return pingtimes.length ? pingtimes[pingtimes.length - 1] : 0;
    },
    averageLag: function() {
      return pingtimes.length
        ? pingtimes.reduce((pv, cv) => {
            return pv + cv;
          }, 0) / pingtimes.length
        : 0;
    }
  };
};
