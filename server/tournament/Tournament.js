import { ICCMeteorError } from "../../lib/server/ICCMeteorError";
import { Users } from "../../imports/collections/users";
import { check } from "meteor/check";
import { Mongo } from "meteor/mongo";
import { Meteor } from "meteor/meteor";

export const templateCollection = new Mongo.Collection("tournament_templates");

class Tournament {
  // Day/game/round/etc. setup
  // sections
  // rounds

  // person setup
  // teams
  //     individuals

  // game setup
  //      scheduled
  //      autostart
  //      X minute first move loss
}
