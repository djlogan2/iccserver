import { Meteor } from "meteor/meteor";
import { encrypt } from "../lib/server/encrypt";
import { LegacyUser } from "./LegacyUser";
import { Logger } from "../lib/server/Logger";
import { Accounts } from "meteor/accounts-base";
import { Roles } from "meteor/alanning:roles";
import { Mongo } from "meteor/mongo";
import { check, Match } from "meteor/check";

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

const developmentcss = {
  name: "developmentcss",
  type: "board",
  square: {
    all: {},
    w: {
      backgroundColor: "#fff"
    },
    b: {
      backgroundColor: "#1565c0"
    }
  },
  rank_and_file: {
    all: {
      position: "absolute",
      zIndex: 3
    },
    color: {
      w: {
        color: "red"
      },
      b: {
        color: "white"
      }
    },
    position: {
      tl: {
        top: 0,
        left: 0
      },
      tr: {
        top: 0,
        right: 0
      },
      bl: {
        bottom: 0,
        left: 0
      },
      br: {
        bottom: 0,
        right: 0
      }
    }
  },
  pieces: {
    all: {
      backgroundRepeat: "no-repeat",
      backgroundSize: "100%",
      backgroundPosition: "center"
    },
    w: {
      r: {
        backgroundImage: `url(https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg)`
      },
      b: {
        backgroundImage: `url(https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg)`
      },
      n: {
        backgroundImage: `url(https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg)`
      },
      q: {
        backgroundImage: `url(https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg)`
      },
      k: {
        backgroundImage: `url(https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg)`
      },
      p: {
        backgroundImage: `url(https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg)`
      }
    },
    b: {
      r: {
        backgroundImage: `url(https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg)`
      },
      b: {
        backgroundImage: `url(https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg)`
      },
      n: {
        backgroundImage: `url(https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg)`
      },
      q: {
        backgroundImage: `url(https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg)`
      },
      k: {
        backgroundImage: `url(https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg)`
      },
      p: {
        backgroundImage: `url(https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg)`
      }
    }
  }
};

Meteor.startup(() => {

  if (mongoCss.find().count() === 0) {
    mongoCss.insert(developmentcss);
  }

 
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
});

Meteor.methods({
  getcss: function(whichone) {
    check(whichone, String);
    return mongoCss.find({ name: whichone });
  }
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
