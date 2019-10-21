import { Meteor } from "meteor/meteor";
import { Logger } from "../../../lib/server/Logger";
import { Accounts } from "meteor/accounts-base";
import { Roles } from "meteor/alanning:roles";
import { standard_member_roles } from "../../server/userConstants";

let log = new Logger("server/firstRunUsers_js");

export default function firstRunUsers() {
  if (Meteor.users.find().count() === 0) {
    const id = Accounts.createUser({
      username: "admin",
      locale: "en-us",
      board_css: "developmentcss",
      email: "icc@chessclub.com",
      password: "administrator",
      profile: {
        firstname: "Default",
        lastname: "Administrator"
      },
      settings: {
        autoaccept: false
      }
    });
    Roles.addUsersToRoles(id, ["administrator"], Roles.GLOBAL_GROUP);
    Roles.addUsersToRoles(id, standard_member_roles, Roles.GLOBAL_GROUP);
    //TODO: Remove this too
    const id3 = Accounts.createUser({
      username: "djlogan",
      locale: "en-us",
      board_css: "developmentcss",
      email: "djlogan@chessclub.com",
      password: "ca014dedjl",
      profile: {
        firstname: "David",
        lastname: "Logan",
        legacy: {
          username: "stcbot",
          password: "ca014dedjl",
          autologin: true,
          validated: true
        }
      },
      settings: {
        autoaccept: true
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
      locale: "en-us",
      board_css: "developmentcss",
      email: "d@c.com",
      password: "d",
      profile: {
        firstname: "David",
        lastname: "Logan"
      },
      settings: {
        autoaccept: true
      }
    });
    Roles.addUsersToRoles(
      id2,
      ["administrator", "developer"],
      Roles.GLOBAL_GROUP
    );
    Roles.addUsersToRoles(id2, standard_member_roles, Roles.GLOBAL_GROUP);

    for (let x = 1; x < 3; x++) {
      const idx = Accounts.createUser({
        username: "uiuxtest" + x,
        locale: "en-us",
        board_css: "developmentcss",
        email: "iccserver" + x + "@chessclub.com",
        password: "iccserver" + x,
        profile: {
          firstname: "David" + x,
          lastname: "Logan" + x,
          legacy: {
            username: "uiuxtest" + x,
            password: "iccserver" + x,
            autologin: true,
            validated: true
          }
        },
        settings: {
          autoaccept: true
        }
      });
      Roles.addUsersToRoles(idx, standard_member_roles, Roles.GLOBAL_GROUP);
      Roles.addUsersToRoles(idx, ["legacy_login"], Roles.GLOBAL_GROUP);
    }
  }
}
