import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";

const GameCollection = new Mongo.Collection("imported_games");

const save = Meteor.bindEnvironment(record => GameCollection.insert(record));

exports.save = save;
