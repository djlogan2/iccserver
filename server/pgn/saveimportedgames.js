import { Mongo } from "meteor/mongo";

const GameCollection = new Mongo.Collection("imported_games");

const save = record => GameCollection.insert(record);

exports.save = save;
