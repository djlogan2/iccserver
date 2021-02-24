import { Meteor } from "meteor/meteor";
import { render } from "react-dom";
import React from "react";
import "../lib/client/timestamp";
import { Logger } from "../lib/client/Logger";
import current_release from "../imports/startup/release";

import App from "./App";

// eslint-disable-next-line no-unused-vars
const log = new Logger("client/main_js");
const ddplog = new Logger("client/main_js_ddp");

//
// *******************************************************************************************************
// * PLEASE DO NOT REMOVE THIS AGAIN. PLEASE DO NOT REMOVE THIS AGAIN. PLEASE DO NOT REMOVE THIS AGAIN.  *
// * THIS LINE LOGS ERRORS BACK TO THE SERVER, SO THAT WE CAN DEBUG REMOTELY. I DISCOVERED THIS BECAUSE  *
// * A USER IN TESTING IS CLAIMING THINGS HAPPEN, AND I SAW NO CRASHES IN THE LOG FILE. WHY? SOMEBODY    *
// * REMOVED THIS.                                                                                       *
// * PLEASE DO NOT REMOVE THIS AGAIN. PLEASE DO NOT REMOVE THIS AGAIN. PLEASE DO NOT REMOVE THIS AGAIN.  *
// *******************************************************************************************************
//
window.onerror = function myErrorHandler(message, source, lineno, colno, error) {
  log.error(
    message + "::" + source + "::" + lineno + "::" + colno + "::" + error.toString(),
    !!error ? error.stack : "no error"
  );
  return false;
};
// *******************************************************************************************************
// * PLEASE DO NOT REMOVE THIS AGAIN. PLEASE DO NOT REMOVE THIS AGAIN. PLEASE DO NOT REMOVE THIS AGAIN.  *
// *******************************************************************************************************

Meteor.startup(() => {
  Meteor.current_release = current_release.current_release.release;
  Meteor.current_commit = current_release.current_release.commit;
  render(<App />, document.getElementById("target"));

  // log sent messages
  var _send = Meteor.connection._send;
  Meteor.connection._send = function(obj) {
    // Yea, let's not get recursive here, ok? :)
    if (obj.method !== "log_to_file" && obj.msg !== "ping" && obj.msg !== "pong")
      ddplog.debug("DDP send:", obj);
    _send.call(this, obj);
  };

  // log received messages
  Meteor.connection._stream.on("message", function(message) {
    try {
      const msg = JSON.parse(message.replace(/[^\x20-\x7E]/g, ""));
      if (
        msg.msg !== "result" &&
        msg.msg !== "ping" &&
        msg.msg !== "pong" &&
        !("methods" in msg) &&
        msg.__type !== "ping" &&
        msg.__type !== "pong" &&
        msg.__type !== "pingresult"
      )
        ddplog.debug("DDP recv:", msg);
    } catch (e) {
      log.error(e.toString());
    }
  });
});
