import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";

const GameCollection = new Mongo.Collection("imported_games");

const save = Meteor.bindEnvironment(record => GameCollection.insert(record));

export const ImportedGames = {};

if (Meteor.isTest || Meteor.isAppTest) {
  ImportedGames.collection = GameCollection;
}

exports.save = save;
