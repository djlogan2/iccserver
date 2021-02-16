import { check } from "meteor/check";
import { Mongo } from "meteor/mongo";
import date from "date-and-time";

export const SystemConfiguration = {};
const client_published_settings = ["game_history_count"];
const SystemConfigurationCollection = new Mongo.Collection("system_configuration");

Meteor.publish("client_configuration_settings", () => {
  SystemConfigurationCollection.find(
    { item: { $in: client_published_settings } },
    { fields: { item: 1, value: 1 } }
  );
});

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

SystemConfiguration.seekDefault = function() {
  return lookup("seek_default", {
    wild: 0,
    rating_type: "standard",
    time: 15,
    inc_or_delay: 0,
    inc_or_delay_type: "none",
    rated: true
  });
};

SystemConfiguration.matchDefault = function() {
  return lookup("match_default", {
    wild_number: 0,
    rating_type: "standard",
    rated: true,
    challenger_time: 15,
    challenger_inc_or_delay: 0,
    challenger_delaytype: "none",
    receiver_time: 15,
    receiver_inc_or_delay: 0,
    receiver_delaytype: "none"
  });
};

SystemConfiguration.logoutTimeout = function() {
  return lookup("logout_timeout", 120000);
};

SystemConfiguration.minimumMoveTime = function() {
  return lookup("minimum_move_time", 10);
};

SystemConfiguration.defaultBoardCSS = function() {
  return lookup("board_css", "development");
};

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
  check(robject1, Object);
  check(robject2, Object);
  const opponentNumberOfGames = robject2.won + robject2.draw + robject2.lost;
  const yourNumberOfGames = robject1.won + robject1.draw + robject1.lost;
  const Kopp = opponentNumberOfGames > 20 ? 1 : 1 + opponentNumberOfGames;
  const KYou = yourNumberOfGames > 20 ? 1 : 21;
  const KYourDiv = yourNumberOfGames > 20 ? 1 : 1 + yourNumberOfGames;
  const KOppdiv = opponentNumberOfGames > 20 ? 1 : 21;
  const resultw =
    robject1.rating +
    (32 * Kopp * KYou * (1 - 1 / (1 + Math.pow(10, (robject2.rating - robject1.rating) / 400.0)))) /
      KYourDiv /
      KOppdiv;
  const resultd =
    robject1.rating +
    (32 *
      Kopp *
      KYou *
      (0.5 - 1 / (1 + Math.pow(10, (robject2.rating - robject1.rating) / 400.0)))) /
      KYourDiv /
      KOppdiv;
  const resultl =
    robject1.rating +
    (32 * Kopp * KYou * (0 - 1 / (1 + Math.pow(10, (robject2.rating - robject1.rating) / 400.0)))) /
      KYourDiv /
      KOppdiv;

  return {
    win: parseInt(resultw),
    draw: parseInt(resultd),
    loss: parseInt(resultl)
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
