import { Meteor } from "meteor/meteor";
import { Timestamp } from "./client/timestamp";
import { Random } from "meteor/random";

export const TimestampServer = function(sender_function, lagging_function) {
  let waitingForRequest = null;
  let delay;
  let clock_offset = 0;
  let current_clock_offset = 0;
  let pingtimes = [];
  let _sender = sender_function;
  let _lagfunc = lagging_function;
  let interval_id = null;

  function sendPing() {
    waitingForRequest = Random.id();
    _sender("ping", {
      id: waitingForRequest,
      user: Meteor.userId(),
      originate: getMilliseconds()
    });
  }

  function sendPingResult(result) {}

  function getMilliseconds() {
    return new Date().getTime() + current_clock_offset;
  }

  function stop() {
    if (!!interval_id) Meteor.clearInterval(interval_id);
  }

  function pingResponse(response) {
    const arrival = getMilliseconds();
    delay =
      arrival - response.originate - (response.transmit - response.receive);
    clock_offset =
      (response.receive - response.originate + response.transmit - arrival) / 2;
    current_clock_offset += clock_offset;
    if (pingtimes.length === 60) pingtimes.shift();
    pingtimes.push(delay);
    sendPingResult({
      user: Meteor.userId(),
      delay: delay,
      clock_offset: clock_offset
    });
  }

  interval_id = Meteor.setInterval(() => {
    if (waitingForRequest) {
      if (lagging_function) lagging_function();
    } else {
      sendPing();
    }
  }, 1000);
  return {
    lastPing: function() {},
    averageLag: function() {},
    pingResponse(respone) {}
  };
};

export const TimestampClient = function(sender_function) {
  let _sender = sender_function;

  function resultArrived() {}

  function sendResponse() {}

  function pingArrived(ping) {
    const pong = {
      originate: ping.originate,
      receive: new Date().getTime(), // When the packet came in
      transmit: new Date().getTime() // When the packet gets sent out
    };
    _sender("pong", pong);
  }

  return {
    pingArrived: function(ping) {
      pingArrived(ping);
    },
    resultArrived: function(result) {
      resultArrived(result);
    }
  };
};
