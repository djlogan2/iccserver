import { Meteor } from "meteor/meteor";
import { Game } from "../../server/Game";
import { Users } from "../../imports/collections/users";
import { Logger } from "./Logger";

export const Timestamp = {};
let log = new Logger("server/Timestamp_js");
let users = {};

Timestamp.averageLag = function(user) {
  if (!users[user._id]) return;
  if (users[user._id].last60.length < 1) return 0;
  let total = users[user._id].last60.reduce((acc, c) => acc + c, 0);
  return total / users[user._id].last60.length;
};

Timestamp.pingTime = function(user) {
  if (!users[user._id]) return;
  if (users[user._id].last60.length < 1) return 0;
  return users[user._id].last60[users[user._id].last60.length - 1];
};

Timestamp.removeUser = function(user) {
  delete users[user._id];
};

Meteor.startup(function() {
  // eslint-disable-next-line no-undef
  const protocol = JsonProtocol.getInstance();

  protocol.on("timestamp", (data, sessionId) => {
    if (!data.user) return; // Ignore timestamp messages when a user isn't logged on
    if (!users[data.user])
      users[data.user] = { last60: [], sessionId: sessionId };
    const newdata = {
      originate: data.originate,
      receive: new Date().getTime(), // When the packet came in
      transmit: new Date().getTime() // When the packet gets sent out
    };
    protocol.send("timestamp", newdata, sessionId);
  });

  // TODO: Get the number of seconds for average lag from SystemConfiguration
  protocol.on(
    "results",
    Meteor.bindEnvironment((data, sessionId) => {
      if (!data.user) return; // Ignore timestamp messages when a user isn't logged on
      if (!users[data.user]) users[data.user] = { last60: [] };
      users[data.user].sessionId = sessionId;
      users[data.user].clock = data.clock;
      users[data.user].offset_delay = data.offset_delay;
      if (users[data.user].last60.length === 60)
        users[data.user].last60.shift();
      users[data.user].last60.push(data.offset_delay);

      const opponentList = Game.opponentUserIdList(data.user);
      if (opponentList.length === 0) return;

      const avg = Timestamp.averageLag(data.user);
      opponentList.forEach(opp => {
        protocol.send(
          "opponent",
          { user: opp, avglag: avg, ping: data.offset_delay },
          users[opp].sessionId
        );
      });
    })
  );

  Users.addLogoutHook(function(userId) {
    delete users[userId];
  });
});
