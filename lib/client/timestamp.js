import { Meteor } from "meteor/meteor";

let protocol;

let delay;
let clock_offset = 0;
let current_clock_offset = 0;
let pingtimes = [];

export const Timestamp = {};

Timestamp.pingTime = function() {
  if (!pingtimes || pingtimes.length === 0) return 0;
  return pingtimes[pingtimes.length - 1];
};

Timestamp.averageLag = function() {
  if (!pingtimes || pingtimes.length === 0) return 0;
  let total = pingtimes.reduce((acc, c) => acc + c, 0);
  return total / pingtimes.length;
};

Timestamp.getMilliseconds = function() {
  return new Date().getTime() + current_clock_offset;
};

Meteor.startup(function() {
  // eslint-disable-next-line no-undef
  protocol = JsonProtocol.getInstance();

  protocol.on("opponent", function(data) {
    const opponents_userId = data.user;
    const opponents_average_lag = data.avglag;
    const opponents_last_ping = data.ping;
    // TODO: obviously, do something useful with this
    console.log(
      "opponent " +
        opponents_userId +
        " has an average lag of " +
        opponents_average_lag +
        ", last ping=" +
        opponents_last_ping
    );
  });

  // TODO: Get the number of seconds for average lag from SystemConfiguration
  protocol.on("timestamp", function(data) {
    const arrival = Timestamp.getMilliseconds();
    delay = arrival - data.originate - (data.transmit - data.receive);
    clock_offset =
      (data.receive - data.originate + data.transmit - arrival) / 2;
    current_clock_offset += clock_offset;
    if (pingtimes.length === 60) pingtimes.shift();
    pingtimes.push(delay);
    protocol.send("results", {
      user: Meteor.userId(),
      delay: delay,
      clock_offset: clock_offset
    });
    console.log(
      "ping delay=" + delay + ", current_clock_offset=" + current_clock_offset,
      ", clock_offset=" + clock_offset +
        ", msvalue=" + Timestamp.getMilliseconds() +
        ", avglag=" + Timestamp.averageLag() +
        ", ping=" + Timestamp.pingTime()
    );
  });

  Meteor.setInterval(function() {
    protocol.send("timestamp", {
      user: Meteor.userId(),
      originate: Timestamp.getMilliseconds()
    });
  }, 1000);
});
