import { Meteor } from "meteor/meteor";

let protocol;

let delay;
let clock_offset;

Meteor.startup(function() {
  // eslint-disable-next-line no-undef
  protocol = JsonProtocol.getInstance();

  protocol.on("timestamp", function(data) {
    const arrival = new Date().getTime();
    delay = arrival - data.originate - (data.transmit - data.receive);
    clock_offset =
      (data.receive - data.originate + data.transmit - arrival) / 2;
    protocol.send("results", {
      user: Meteor.userId(),
      delay: delay,
      clock_offset: clock_offset
    });
  });

  Meteor.setInterval(function() {
    protocol.send("timestamp", {
      user: Meteor.userId(),
      originate: new Date().getTime()
    });
  }, 1000);
});
