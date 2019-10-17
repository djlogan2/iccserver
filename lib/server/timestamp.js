import { Meteor } from "meteor/meteor";
import { addLogoutHook } from "../../imports/collections/users";

export const Timestamp = {};

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
    const newdata = {
      originate: data.originate,
      receive: new Date().getTime(), // When the packet came in
      transmit: new Date().getTime() // When the packet gets sent out
    };
    protocol.send("timestamp", newdata, sessionId);
  });

  protocol.on("results", data => {
    if (!data.user) return; // Ignore timestamp messages when a user isn't logged on
    if (!users[data.user]) users[data.user] = { last60: [] };
    users[data.user].clock = data.clock;
    users[data.user].offset_delay = data.offset_delay;
    if (data.user.last60.length === 60) data.user.last60.shift();
    data.user.last60.push(data.offset_delay);
  });
});

addLogoutHook(function(userId) {
  delete users[userId];
});
