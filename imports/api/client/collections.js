import { Mongo } from "meteor/mongo";

export const mongoCss = new Mongo.Collection("css");
export const mongoUser = new Mongo.Collection("userData");
export const Game = new Mongo.Collection("game");
export const Chat = new Mongo.Collection("chat");
export const ChildChatTexts = new Mongo.Collection("child_chat");
export const Rooms = new Mongo.Collection("rooms");
export const GameRequestCollection = new Mongo.Collection("game_requests");
export const ClientMessagesCollection = new Mongo.Collection("client_messages");
export const GameHistoryCollection = new Mongo.Collection("game_history");
export const ImportedGameCollection = new Mongo.Collection("imported_games");

