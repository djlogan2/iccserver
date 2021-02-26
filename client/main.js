import { Meteor } from "meteor/meteor";
import { render } from "react-dom";
import React from "react";
import "../lib/client/timestamp";
import { Logger } from "../lib/client/Logger";
import current_release from "../imports/startup/release";

import App from "./App";

// eslint-disable-next-line no-unused-vars
const log = new Logger("client/main_js");

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
});
