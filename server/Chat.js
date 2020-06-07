import { Mongo } from "meteor/mongo";
import { check } from "meteor/check";
import { Meteor } from "meteor/meteor";
import { Users } from "../imports/collections/users";
import { ClientMessages } from "../imports/collections/ClientMessages";
import { Game } from "./Game";
import SimpleSchema from "simpl-schema";

const RoomCollection = new Mongo.Collection("rooms");
const ChatCollection = new Mongo.Collection("chat");
const ChildChatCollection = new Mongo.Collection("child_chat");

ChatCollection.attachSchema(new SimpleSchema({
  id: String, // game_id (kibitz/whisper), room_id, or receiver_id
  issuer: String,
  type: {type: String, allowedValues: ["kibitz", "whisper", "room", "personal"]},
  what: String,
  child_chat: Boolean
}));

export const Chat = {};

ChildChatCollection.attachSchema({ text: String });

RoomCollection.attachSchema({
  name: String,
  members: Array,
  "members.$": Object,
  "members.$.id": String,
  "members.$.username": String
});

Chat.kibitz = function(message_identifier, game_id, kibitz, txt) {
  check(message_identifier, String);
  check(txt, String);
  check(game_id, String);
  check(kibitz, Boolean);

  const self = Meteor.user();
  check(self, Object);

  if (!Users.isAuthorized(self, "kibitz")) {
    ClientMessages.sendMessageToClient(self, message_identifier, "NOT_ALLOWED_TO_KIBITZ");
    return;
  }

  const game_ = Game.find({ _id: game_id }).fetch();
  const game = !! game_ && game_.length ? game_[0] : null;
  let child_chat = false;

  if (!game) {
    ClientMessages.sendMessageToClient(self, message_identifier, "INVALID_GAME");
    return;
  }

  // Anyone can send a child chat.
  // Anything an exempt person sends is a child chat
  const child_chat_record = ChildChatCollection.findOne({ _id: txt });
  if (child_chat_record) {
    child_chat = true;
    txt = child_chat_record.text;
  } else {
    child_chat = Users.isAuthorized(self, "child_chat_exempt");
  }

  // Otherwise, someone in the child chat role must be sending a child chat.
  if (!child_chat && Users.isAuthorized(self, ["child_chat"])) {
    ClientMessages.sendMessageToClient(self, message_identifier, "CHILD_CHAT_FREEFORM_NOT_ALLOWED");
    return;
  }

  ChatCollection.insert({
    type: kibitz ? "kibitz" : "whisper",
    id: game_id,
    issuer: self._id,
    what: txt,
    child_chat: child_chat
  });

  Game.addAction(game_id, {
          type: kibitz ? "kibitz" : "whisper",
          issuer: self._id,
          parameter: { what: txt }
        }
  );
};

Meteor.publishComposite("chat", {
  // First, find the user
  find() {
    return Meteor.users.find({ _id: this.userId });
  },
  children: [{
    // Next, find the game(s) the user is playing or observing -- as of now, there can only be one
    find(user) {
      return Game.find({
        $or: [{ "white.id": user._id }, { "black.id": user._id }, { "observers.id": user._id }]
      });
    },

    children: [{
      // Lastly, find the chat records in the game, based on whether it's a player, observer, or child
      find(game, user) {
        const queryobject = { id: game._id };
        if (Users.isAuthorized(user, "child_chat"))
          queryobject.child_chat = true;
        if (game.status === "playing") {
          if (game.white.id === user._id || game.black.id === user._id)
            queryobject.type = "kibitz";
          else
            queryobject.type = {$in: ["kibitz", "whisper"]};
        } else {
          queryobject.type = {$in: ["kibitz", "whisper"]};
        }
        return ChatCollection.find(queryobject);
      }
    }]
  }]
});

Meteor.startup(() => {
  Game.observeGameChanges({},{
    removed(id) {
      ChatCollection.remove({type: {$in: ["kibitz", "whisper"]}, id: id});
    }
  });
});

if (Meteor.isTest || Meteor.isAppTest) {
  Chat.collection = ChatCollection;
  Chat.childChatCollection = ChildChatCollection;
  Chat.roomCollection = RoomCollection;
}
