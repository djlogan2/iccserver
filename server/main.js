import { Meteor } from "meteor/meteor";
import { encrypt } from "../lib/server/encrypt";
import { LegacyUser } from "./LegacyUser";
import { Logger } from "../lib/server/Logger";
import { Accounts } from "meteor/accounts-base";
import { Roles } from "meteor/alanning:roles";
import { Mongo } from "meteor/mongo";
import { check, Match } from "meteor/check";
import { systemcss, usercss } from "./developmentcss";
let log = new Logger("server/main_js");

const bound = Meteor.bindEnvironment(callback => {
  callback();
});

process.on("uncaughtException", err => {
  bound(() => {
    log.error("Server Crashed!", err);
    console.error(err.stack);
    process.exit(7);
  });
});

const standard_guest_roles = ["login"];

const standard_member_roles = ["login", "send_messages", "play_rated_games"];

const fields_viewable_by_account_owner = {
  username: 1,
  email: 1,
  "profile.firstname": 1,
  "profile.lastname": 1,
  "profile.legacy.username": 1
};
const mongoCss = new Mongo.Collection("css");
const Game = new Mongo.Collection("game");

Meteor.publish("game", function tasksPublication() {
  return Game.find({
    $or: [
      { "black.name": Meteor.user().username },
      { "white.name": Meteor.user().username }
    ]
  });
});

//if (Meteor.isServer) {
// This code only runs on the server

Meteor.methods({
  "game-messages.insert"(label, black) {
    check(label, String);
    check(black, String);
    // Make sure the user is logged in before inserting a task
    if (!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    let game = {
      status: "scratch-game",
      owner: "djlogan",
      white: { name: Meteor.user().username, rating: "2800" },
      black: { name: black, rating: "1400" },
      moves: []
    };
    Game.insert(game);
  },
  "game-move.insert"(Id, move) {
    check(Id, String);
    check(move, String);

    Game.update(
      { _id: Id },
      {
        $push: { moves: move }
      }
    );
    Game.update(
      { _id: Id },
      {
        $push: { actions: { moves: move } }
      }
    );
  },

  "execute-game-action"(Id, action, responType) {
    check(action, String);
    check(Id, String);
    check(responType, String);
    if (action === "accept") {
      Game.update({ _id: Id }, { $pop: { moves: 1 } });
      Game.update(
        { _id: Id },
        {
          $push: { actions: { accept: responType } }
        }
      );
    } else if (action === "request") {
      Game.update(
        { _id: Id },
        {
          $push: { actions: { request: responType } }
        }
      );
    } else {
      Game.update(
        { _id: Id },
        {
          $push: { actions: { rejected: responType } }
        }
      );
    }
  }
});

function firstRunCSS() {
  if (mongoCss.find().count() === 0) {
    mongoCss.insert(systemcss);
    mongoCss.insert(usercss);
  }
}

function firstRunUsers() {
  if (Meteor.users.find().count() === 0) {
    const id = Accounts.createUser({
      username: "admin",
      email: "icc@chessclub.com",
      password: "administrator",
      profile: {
        firstname: "Default",
        lastname: "Administrator"
      }
    });
    Roles.addUsersToRoles(id, ["administrator"], Roles.GLOBAL_GROUP);
    Roles.addUsersToRoles(id, standard_member_roles, Roles.GLOBAL_GROUP);
    //TODO: Remove this too
    const id3 = Accounts.createUser({
      username: "djlogan",
      email: "djlogan@chessclub.com",
      password: "ca014dedjl",
      profile: {
        firstname: "David",
        lastname: "Logan",
        legacy: {
          username: "stcbot",
          password: "ca014dedjl",
          autologin: true
        }
      }
    });

    Roles.addUsersToRoles(
      id3,
      ["administrator", "legacy_login", "developer"],
      Roles.GLOBAL_GROUP
    );
    Roles.addUsersToRoles(id3, standard_member_roles, Roles.GLOBAL_GROUP);
    //TODO: Remove this too
    const id2 = Accounts.createUser({
      username: "d",
      email: "d@c.com",
      password: "d",
      profile: {
        firstname: "David",
        lastname: "Logan"
      }
    });
    Roles.addUsersToRoles(
      id2,
      ["administrator", "developer"],
      Roles.GLOBAL_GROUP
    );
    Roles.addUsersToRoles(id2, standard_member_roles, Roles.GLOBAL_GROUP);
  }
}

Meteor.startup(() => {
  firstRunCSS();
  firstRunUsers();
});

Meteor.publish("css", function() {
  return mongoCss.find({ type: { $in: ["system", "board"] } });
});

Meteor.publish("loggedOnUsers", function() {
  return Meteor.users.find({});
});
//
// The fields an average user will see of his own record
//
Meteor.publish("userData", function() {
  if (!this.userId) return Meteor.users.find({ _id: null });

  const self = this;

  this.onStop(function() {
    log.debug("User left");
    LegacyUser.logout(self.userId);
  });

  log.debug("User has arrived");
  const user = Meteor.users.findOne({ _id: this.userId });

  if (!user.roles)
    Roles.addUsersToRoles(user._id, standard_guest_roles, Roles.GLOBAL_GROUP);

  log.debug("user record", user);
  log.debug(
    "User is in leagy_login role",
    Roles.userIsInRole(user, "legacy_login")
  );

  if (
    Roles.userIsInRole(user, "legacy_login") &&
    user.profile &&
    user.profile.legacy &&
    user.profile.legacy.username &&
    user.profile.legacy.password &&
    user.profile.legacy.autologin
  ) {
    LegacyUser.login(user);
  }

  return Meteor.users.find(
    { _id: this.userId },
    { fields: fields_viewable_by_account_owner }
  );
});

Accounts.onCreateUser(function(options, user) {
  if (options.profile) {
    user.profile = {
      firstname: options.profile.firstname || "?",
      lastname: options.profile.lastname || "?"
    };

    if (
      options.profile.legacy &&
      (options.profile.legacy.username || options.profile.legacy.password)
    )
      user.profile.legacy = {
        username: options.profile.legacy.username,
        password: encrypt(options.profile.legacy.password),
        autologin: true
      };
  }
  return user;
});
