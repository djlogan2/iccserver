import { Meteor } from "meteor/meteor";
import { render } from "react-dom";
import React from "react";
import "../lib/client/timestamp";
import { Logger } from "../lib/client/Logger";
import { current_release } from "../imports/startup/release";

import App from "./App";

const log = new Logger("client/main_js");

window.onerror = function myErrorHandler(
  message: Event | string,
  source: string | undefined,
  lineno: number | undefined,
  colno: number | undefined,
  error: Error | undefined
): boolean {
  log.error(
    message + "::" + source + "::" + lineno + "::" + colno + "::" + error?.toString(),
    error?.stack || "no error"
  );
  return false;
};

Meteor.startup(() => {
  // @ts-ignore
  Meteor.current_release = current_release.release;
  // @ts-ignore
  Meteor.current_commit = current_release.commit;
  render(<App />, document.getElementById("target"));
});
