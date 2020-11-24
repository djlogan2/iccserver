import { ICCMeteorError } from "../lib/server/ICCMeteorError";
import { Users } from "../imports/collections/users";
import { check } from "meteor/check";
import { Mongo } from "meteor/mongo";
import { Meteor } from "meteor/meteor";

export const templateCollection = new Mongo.Collection("templates");

export class Tourney {
  constructor(name, scope, nodes) {
    this.record = { name: name, scope: scope, nodes: nodes || [] };
  }
  get name() {
    return this.record.name;
  }
  set name(newname) {
    this.record["name"] = newname;
  }
  get scope() {
    return this.record.scope;
  }
  set scope(newscope) {
    this.record["scope"] = newscope;
  }
  get nodes() {
    return this.record.nodes;
  }
  set nodes(newnodes) {
    this.record["nodes"] = newnodes;
  }
  save(message_identifier) {
    const user = Meteor.user();
    check(message_identifier, String);
    check(user, Object);
    if (!this.isAuthorized(user, "create_tournament_template")) {
      throw new ICCMeteorError(
        message_identifier,
        "Unable to save tournament",
        "You are not authorized"
      );
    }
    templateCollection.update(
      { name: this.name, scope: this.scope },
      { $set: { nodes: this.nodes } },
      { upsert: 1 }
    );
  }

  delete(message_identifier) {
    // Searches by scope + name assumed unique, pulls all fields
    // Throws ICCMeteor error if cannot find record to remove
    check(message_identifier, String);
    const game = templateCollection.findOne({ name: this.name, scope: this.scope });
    if (!game) {
      throw new ICCMeteorError(
        message_identifier,
        "Unable to remove tournament",
        "tournament does not exist"
      );
    }
    templateCollection.remove({ name: this.name, scope: this.scope });
  }

  validate() {}
  modifyScope(message_identifier, scope) {
    const user = Meteor.user();
    if (this.isAuthorized(user, "create_tournament_template")) {
      this.scope = scope;
      if (this.isAuthorized(user, "create_tournament_template")) {
        this.save();
      } else {
        throw new ICCMeteorError(
          message_identifier,
          "Unable to modify tournament",
          "this tournament scope you are modifying to is not in your scope"
        );
      }
    } else {
      throw new ICCMeteorError(
        message_identifier,
        "Unable to modify tournament",
        "this tournament is not in your scope"
      );
    }
  }

  isAuthorized(user, role) {
    check(user, Object);
    check(role, String);
    let concat = "";
    for (let index in this.scope) {
      if (index > 0) concat += ".";
      concat += this.scope[index];
      if (Users.isAuthorized(user, role, concat)) {
        return true;
      }
    }
    return false;
  }
}
