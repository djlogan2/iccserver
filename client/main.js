import { Meteor } from "meteor/meteor";
import { render } from "react-dom";
import { renderRoutes } from "../imports/startup/client/routes.jsx";
import i18n from "meteor/universe:i18n";
import "../lib/client/timestamp";
import { Logger } from "../lib/client/Logger";

import english from "./i18nContent/english.json";
import russian from "./i18nContent/russian.json";
import japanese from "./i18nContent/japanese.json";

// eslint-disable-next-line no-unused-vars
const log = new Logger("client/main_js");

let unflatten = function(data) {
  if (Object(data) !== data || Array.isArray(data)) return data;
  var regex = /\.?([^.[\]]+)|\[(\d+)]/g,
    resultholder = {};
  for (var p in data) {
    var cur = resultholder,
      prop = "",
      m;
    while ((m = regex.exec(p))) {
      cur = cur[prop] || (cur[prop] = m[2] ? [] : {});
      prop = m[2] || m[1];
    }
    cur[prop] = data[p];
  }
  return resultholder[""] || resultholder;
};

let flatten = function(data) {
  var result = {};
  function recurse(cur, prop) {
    if (Object(cur) !== cur) {
      result[prop] = cur;
    } else if (Array.isArray(cur)) {
      for (var i = 0, l = cur.length; i < l; i++) recurse(cur[i], prop + "[" + i + "]");
      if (l === 0) result[prop] = [];
    } else {
      var isEmpty = true;
      for (var p in cur) {
        isEmpty = false;
        recurse(cur[p], prop ? prop + "." + p : p);
      }
      if (isEmpty && prop) result[prop] = {};
    }
  }
  recurse(data, "");
  return result;
};

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
  log.error(message + "::" + source + "::" + lineno + "::" + colno + "::" + error.toString());
  return false;
};
// *******************************************************************************************************
// * PLEASE DO NOT REMOVE THIS AGAIN. PLEASE DO NOT REMOVE THIS AGAIN. PLEASE DO NOT REMOVE THIS AGAIN.  *
// *******************************************************************************************************

Meteor.startup(() => {
  // TODO: Hey guys, this should be in the database. It shouldn't be hard coded like this.
  //       You can make your own collection, I suppose, but it seems to me it would make sense
  //       to put it in ClientMessages, and maybe even just use a meteor method? I'm not sure
  //       whata this package does, but you can't leave this like this.
  Meteor.subscribe("i18n_front");
  flatten(english);
  unflatten(english);
  i18n.addTranslations("en-US", english);
  i18n.addTranslations("ru-RU", russian);
  i18n.addTranslations("ja", japanese);

  i18n.setOptions({
    defaultLocale: "en-US"
  });
  render(renderRoutes(), document.getElementById("target"));
});
