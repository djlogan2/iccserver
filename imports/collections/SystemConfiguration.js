import { Match, check } from "meteor/check";
import { Mongo } from "meteor/mongo";

export const SystemConfiguration = {};

const SystemConfigurationCollection = new Mongo.Collection("system_configuration");

SystemConfiguration.minimumMoveTime = function() {
  return 10;
};

SystemConfiguration.minimumLag = function() {
  return 100;
};

SystemConfiguration.winDrawLossAssessValues = function(robject1, robject2) {
  //{ rating: 1, need: 1, won: 1, draw: 1, lost: 1, best: 1 }
  check(robject1, Object);
  check(robject2, Object);
  const oppgames = robject2.won + robject2.draw + robject2.lost;
  const rightpart = 1 / (1 + Math.pow(10, (robject2.rating - robject1.rating) / 100));
  const K = oppgames >= 20 ? 32 : oppgames / 21;
  return {
    win: robject1.rating + K * (1 - rightpart),
    draw: robject1.rating + K * (1 / 2 - rightpart),
    loss: robject1.rating + K * -rightpart
  };
};

SystemConfiguration.maximumGameHistorySearchCount = function() {
  return 100;
};

SystemConfiguration.maximumRunningEngines = function() {
  return 5;
};

SystemConfiguration.enginePath = function() {
  return process.env.DEVELOPER_UCI_ENGINE;
};

SystemConfiguration.uciSecondsToPonderPerMoveScore = function() {
  return 10;
};

SystemConfiguration.uciThreadsPerEngine = function() {
  return 4;
};
