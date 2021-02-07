import { Meteor } from "meteor/meteor";
import { Logger } from "../../../lib/server/Logger";
import { Accounts } from "meteor/accounts-base";
import { Roles } from "meteor/alanning:roles";
import { all_roles, standard_member_roles } from "../../server/userConstants";
import { Users } from "../../collections/users";

// eslint-disable-next-line no-unused-vars
const log = new Logger("server/firstRunUsers_js");

export default function firstRunUsers() {
  if (!Meteor.isTest && !Meteor.isAppTest && Meteor.users.find().count() === 0) {
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
    Roles.addUsersToRoles(id, "administrator");
    Roles.addUsersToRoles(id, standard_member_roles);

    // TODO: Remove this after we are done with development
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
      Users.addUserToRoles(idx, standard_member_roles);
      Users.addUserToRoles(idx, "legacy_login");
    }
  }
}
