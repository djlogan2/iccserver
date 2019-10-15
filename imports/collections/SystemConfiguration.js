import { check } from "meteor/check";

export const SystemConfiguration = {};

SystemConfiguration.meetsTimeAndIncRules = function(time, inc) {
  check(time, Number);
  check(inc, Number);
  return time > 0 || inc > 0;
};

