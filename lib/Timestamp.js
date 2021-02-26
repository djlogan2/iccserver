import { Meteor } from "meteor/meteor";
import { Random } from "meteor/random";
import { EventEmitter } from "events";

export const TimestampServer = function(sender_function, lagging_function, count) {
  let pendingrequests = {};
  let pingcount = count || 60;
  let delay;
  let clock_offset = 0;
  let current_clock_offset = 0;
  let pingtimes = [];
  let _sender = sender_function;
  let _lagfunc = lagging_function;
  let interval_id = null;
  const eventEmitter = new EventEmitter();
  let isConnected = true;

  function sendPing() {
    if (!isConnected) return;
    const request = Random.id();
    pendingrequests[request] = {
      id: request,
      originate: getMilliseconds()
    };
    eventEmitter.emit("sendingPing", pendingrequests[request]);
    _sender("ping", pendingrequests[request]);
  }

  function getMilliseconds() {
    return new Date().getTime() + current_clock_offset;
  }

  function stop() {
    eventEmitter.emit("stop");
    if (!!interval_id) Meteor.clearInterval(interval_id);
  }

  function cleanupOldPings() {
    const old = new Date().getTime() - 60 * 1000; // One minute ago
    Object.keys(pendingrequests)
      .filter(key => pendingrequests[key].originate < old)
      .forEach(key => {
        eventEmitter.emit("cleanupOldPings", pendingrequests[key]);
        delete pendingrequests[key];
      });
  }

  function pongArrived(response) {
    eventEmitter.emit("pingArrived", response);
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
    delay = Math.abs(arrival - response.originate - (response.transmit - response.receive));
    clock_offset = (response.receive - response.originate + response.transmit - arrival) / 2;

    //
    // For safety, limit clock offsets to 1/4 of a second, and force timestamp to adjust
    // over time if it's really off.
    //
    if (clock_offset > 250) clock_offset = 250;
    else if (clock_offset < -250) clock_offset = -250;

    current_clock_offset += clock_offset;

    if (pingtimes.length >= pingcount) pingtimes.shift();
    pingtimes.push(delay);
    const result = {
      id: response.id,
      delay: delay,
      clock_offset: clock_offset
    };
    eventEmitter.emit("sendingPingResult", result);
    _sender("pingresult", result);
    delete pendingrequests[response.id];
    return result;
  }

  interval_id = Meteor.setInterval(() => {
    if (
      !isConnected ||
      (Object.entries(pendingrequests).length !== 0 && pendingrequests.constructor === Object)
    ) {
      eventEmitter.emit("lagFunc");
      if (typeof _lagfunc === "function") Meteor.bindEnvironment(_lagfunc());
    }
    sendPing();
    cleanupOldPings();
  }, 1000);

  function connected() {
    isConnected = true;
  }

  function disconnected() {
    isConnected = false;
    pendingrequests = {};
  }

  return {
    events: eventEmitter,
    connected: connected,
    disconnected: disconnected,
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
      return pongArrived(response);
    },
    end: function() {
      stop();
    }
  };
};

export const TimestampClient = function(sender_function, count) {
  let _sender = sender_function;
  let pingtimes = [];
  let pingcount = count || 60;
  const eventEmitter = new EventEmitter();

  function pingArrived(ping) {
    const pong = {
      id: ping.id,
      originate: ping.originate,
      receive: new Date().getTime(), // When the packet came in
      transmit: new Date().getTime() // When the packet gets sent out
    };
    _sender("pong", pong);
    // This has to go after the sender just to make sure transmit/receive are as accurate as possible
    eventEmitter.emit("sendingPong", pong);
  }

  function resultArrived(result) {
    eventEmitter.emit("resultArrived", result);
    if (pingtimes.length === pingcount) pingtimes.shift();
    pingtimes.push(result.delay);
  }

  return {
    events: eventEmitter,
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
