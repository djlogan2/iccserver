import { check } from "meteor/check";
import { Mongo } from "meteor/mongo";
import date from "date-and-time";

export const SystemConfiguration = {};

const SystemConfigurationCollection = new Mongo.Collection("system_configuration");

function lookup(item, defaultValue) {
  const accessed = date.format(new Date(), "YYYY-MM-DD");
  const itemrecord = SystemConfigurationCollection.findOne({ item: item });
  if (!itemrecord || !itemrecord.value) {
    SystemConfigurationCollection.insert({ item: item, value: defaultValue, accessed: accessed });
    return defaultValue;
  }
  if (itemrecord.accessed !== accessed)
    SystemConfigurationCollection.update({ item: item }, { $set: { accessed: accessed } });
  return itemrecord.value;
}

SystemConfiguration.minimumMoveTime = function() {
  return lookup("minimum_move_time", 10);
};

SystemConfiguration.defaultBoardCSS = function() {
  return lookup("board_css", "development");
}

SystemConfiguration.minimumLag = function() {
  return lookup("minimum_lag", 100);
};

SystemConfiguration.roomChatLimit = function() {
  return lookup("room_chat_limit", 500);
};

SystemConfiguration.gameHistoryCount = function() {
  return lookup("game_history_count", 20);
};

SystemConfiguration.maximumPrivateRoomCount = function() {
  return lookup("maximum_private_rooms", 5);
};

SystemConfiguration.computerGameTimeSubtract = function() {
  return lookup("maximum_computer_game_time_subtract", 1000);
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
  return lookup("maximum_game_history_search_count", 100);
};

SystemConfiguration.maximumRunningEngines = function() {
  return lookup("maximum_running_engines", 5);
};

SystemConfiguration.enginePath = function() {
  return lookup("engine_path", process.env.DEVELOPER_UCI_ENGINE);
};

SystemConfiguration.uciSecondsToPonderPerMoveScore = function() {
  return lookup("uci_seconds_to_ponder_per_move_score", 10);
};

SystemConfiguration.uciThreadsPerEngine = function() {
  return lookup("uci_threads_per_engine", 4);
};
