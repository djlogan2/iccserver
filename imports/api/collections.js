import { Mongo } from "meteor/mongo";

export const mongoCss = new Mongo.Collection("css");
export const mongoUser = new Mongo.Collection("userData");
export const Game = new Mongo.Collection("game");
export const GameRequestCollection = new Mongo.Collection("game_requests");
export const ClientMessagesCollection = new Mongo.Collection("client_messages");
