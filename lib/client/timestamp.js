import { Meteor } from "meteor/meteor";

let protocol;

let delay;
let clock_offset;
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

Meteor.startup(function() {
  // eslint-disable-next-line no-undef
  protocol = JsonProtocol.getInstance();

  protocol.on("timestamp", function(data) {
    const arrival = new Date().getTime();
    delay = arrival - data.originate - (data.transmit - data.receive);
    clock_offset =
      (data.receive - data.originate + data.transmit - arrival) / 2;
    if (pingtimes.length === 60) pingtimes.shift();
    pingtimes.push(delay);
    protocol.send("results", {
      user: Meteor.userId(),
      delay: delay,
      clock_offset: clock_offset
    });
    console.log("ping delay=" + delay + ", clock_offset=" + clock_offset);
  });

  Meteor.setInterval(function() {
    protocol.send("timestamp", {
      user: Meteor.userId(),
      originate: new Date().getTime()
    });
  }, 1000);
});
