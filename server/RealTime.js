import { Logger } from "../lib/server/Logger";
import { Meteor } from "meteor/meteor";

const CLIENT_REALTIME_RECORDS_TO_KEEP = 1000;
const realtime_publish_map = {};

let log = new Logger("server/RealTime_js");

// TODO: Do we have to queue up messages if the user isn't in the list? If he's not in the list, he's not logged on. But it could be because he's temporarily gone
// TODO: Keep a timestamp record of when we send a game move for calculating lag
// TODO: If we aren't sending game moves, send 1s interval pings for calculating lag
// TODO: Have the client respond to game-moves and pings, for calculating lag
function send(userId, type, message) {
  log.debug("RealTime::send", { type: type, message: message });
  const pub = realtime_publish_map[userId];
  if (pub) {
    if (pub.prm_id >= CLIENT_REALTIME_RECORDS_TO_KEEP)
      pub.publish.removed(
        "realtime_messages",
        (pub.prm_id - CLIENT_REALTIME_RECORDS_TO_KEEP).toString()
      );
    pub.publish.added("realtime_messages", pub.prm_id.toString(), {
      nid: pub.prm_id,
      type: type,
      message: message
    });
    pub.publish.ready();
    pub.prm_id++;
  }
}

Meteor.publish("realtime_messages", function() {
  const self = this;
  log.debug("publishing realtime_messages");
  realtime_publish_map[this.userId] = {
    publish: self,
    prm_id: 0
  };
  this.onStop(function() {
    log.debug("ending publication realtime_messages");
    delete realtime_publish_map[self.userId];
  });
});

const RealTime = {
  // I'm going to leave this one mostly to serve as a reminder for future programmers
  // how to code for realtime messages.
  send_error(userId, errorValue) {
    send(userId, "error", errorValue);
  }
};

export { RealTime };
