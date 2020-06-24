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
  create_date: {
    type: Date,
    autoValue: function() {
      return new Date();
    }
  },
  isolation_group: String,
  id: String, // game_id (kibitz/whisper), room_id, or receiver_id
  issuer: Object,
  "issuer.id": String,
  "issuer.username": String,
  type: {type: String, allowedValues: ["kibitz", "whisper", "room", "private"]},
  logons: {type: Number, required: false},
  what: String,
  child_chat: Boolean
}));

ChildChatCollection.attachSchema({ text: String });

RoomCollection.attachSchema({
  name: String,
  owner: String, // For public rooms, just the user that created the room
  public: Boolean,
  isolation_group: String,
  members: Array,
  "members.$": Object,
  "members.$.id": String,
  "members.$.username": String,
  invited: {type: Array, defaultValue: []},
  "invited.$": Object,
  "invited.$.id": String,
  "invited.$.username": String,
  "invited.$.message_identifier": String
});

class Chat {

  constructor() {
    if (Meteor.isTest || Meteor.isAppTest) {
      this.collection = ChatCollection;
      this.childChatCollection = ChildChatCollection;
      this.roomCollection = RoomCollection;
      this.loginHook = chatLoginHook;
      this.logoutHook = chatLogoutHook;
    }
  }

  kibitz(message_identifier, game_id, kibitz, txt) {
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
    const game = !!game_ && game_.length ? game_[0] : null;
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
      isolation_group: self.isolation_group,
      id: game_id,
      issuer: { id: self._id, username: self.username },
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

  find() {
    return Meteor.users.find({ _id: this.userId });
  },
  children: [{
    find(user) {
      if (Users.isAuthorized(user, "room_chat")) {
        const member = { id: user._id, username: user.username };
        return RoomCollection.find({ "members": member });
      }
      else{
        return;
      }
    }, // room chat
    children: [{
      find(room, user) {
        const queryobject = { id: room._id, type: "room" };
        if (Users.isAuthorized(user, "child_chat"))
          queryobject.child_chat = true;

        if (Users.isAuthorized(user, "personal_chat")) {
          queryobject.type.push("private");
          queryobject.logons = { $gt: 0 };
        }
        return Chat.collection.find(queryobject);
      }
    }]
  },
    {
      find(user) {
        if(Users.isAuthorized(user, "personal_chat")) {
          return ChatCollection.find({ $and: [{ type: "private" }, { $or: [{ "issuer.id": user._id }, { id: user._id }] }]});
        }
        else{
        }
      } // private chat
    },
    {
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
                queryobject.type = { $in: ["kibitz", "whisper"] };
            } else {
              queryobject.type = { $in: ["kibitz", "whisper"] };
            }
            return ChatCollection.find(queryobject);
          }
        }]
      }] // game chat
});

// Meteor.publishComposite("testprivatechat", {
//
//   //TODO: find a way to merge this into publication "chat"
//
//   find() {
//     return Meteor.users.find({ _id: this.userId });
//   },
//   children: [{
//     find(user) {
//
//
//     }
//   }]
// });
//
// // user
// //    game
// //      kibitz/whispers
//
// // what we want:
//
// //user
// //    game/room/personal chat
// //      game:kibitz/whisper
// //      roomchat record
//
// Meteor.publishComposite("chat", {
//   // First, find the user
//   find() {
//     return Meteor.users.find({ _id: this.userId });
//   },
//   children: [{
//     // Next, find the game(s) the user is playing or observing -- as of now, there can only be one
//     find(user) {
//       return Game.find({
//         $or: [{ "white.id": user._id }, { "black.id": user._id }, { "observers.id": user._id }]
//       });
//     },
//     children: [{
//       // Lastly, find the chat records in the game, based on whether it's a player, observer, or child
//       find(game, user) {
//         const queryobject = { id: game._id };
//         if (Users.isAuthorized(user, "child_chat"))
//           queryobject.child_chat = true;
//         if (game.status === "playing") {
//           if (game.white.id === user._id || game.black.id === user._id)
//             queryobject.type = "kibitz";
//           else
//             queryobject.type = { $in: ["kibitz", "whisper"] };
//         } else {
//           queryobject.type = { $in: ["kibitz", "whisper"] };
//         }
//         return ChatCollection.find(queryobject);
//       }
//     }]
//   }]
// });

function chatLoginHook(user) {
  ChatCollection.update({
    $and: [{type: "private"},{logons: 1},{$or: [{id: user._id},{"issuer.id": user._id}]}]}, { $set: { logons: 2 } }, {multi: true});
}

function chatLogoutHook(userId) {
  ChatCollection.remove({
    $and: [{ type: "private" }, { logons: 1 }, { $or: [{ "issuer.id": userId }, { id: userId }] }]
  });
  ChatCollection.update({$and: [{type: "private"}, {logons: 2}, {$or: [{id: userId},{"issuer.id": userId}]}]}, { $set: { logons: 1 }}, {multi: true});


}

// TODO: have an option for private rooms?, for now defaults to public
Chat.createRoom = function(message_identifier, roomName) {
  const self = Meteor.user();
  const isoGroup = Meteor.user().isolation_group;
  // check if user is in role
  const roomRole = Users.isAuthorized(Meteor.user(), "create_room");
  const uniqueName = !RoomCollection.findOne({ name: roomName });
  createRoom(message_identifier, roomName){
    const self = Meteor.user();
    const isoGroup = Meteor.user().isolation_group;
    // check if user is in role
    const roomRole = Users.isAuthorized(Meteor.user(), "create_room");
    const uniqueName = !RoomCollection.findOne({name: roomName});

    // check if name is unique in db
    if(!uniqueName) {
      ClientMessages.sendMessageToClient(self, message_identifier, "ROOM_ALREADY_EXISTS");
      return;
    }
    // finally create room
    if(roomRole) {
      const member = [{id: Meteor.user()._id, username: Meteor.user().username}];
      RoomCollection.insert({name: roomName, owner: self._id, members: member, isolation_group: isoGroup});
      return RoomCollection.findOne({name: roomName})._id;
    }
    else
      ClientMessages.sendMessageToClient(self, message_identifier, "NOT_ALLOWED_TO_CREATE_ROOM");
  }
};

writeToRoom(message_identifier, room_id, txt){
    const self = Meteor.user();
    const isoGroup = Meteor.user().isolation_group;
    const hasRole = Users.isAuthorized(self, "room_chat");
    const joinRole = Users.isAuthorized(self, "join_room");
    const roomExists = RoomCollection.findOne({_id: room_id});
    const child_chat_exempt =  Users.isAuthorized(self, "child_chat_exempt");
    const child_chat_id = (ChildChatCollection.findOne({_id: txt}));
    const child_chat = (Users.isAuthorized(self, "child_chat") || child_chat_id || child_chat_exempt) && true;
    const member = [{id: Meteor.user()._id, username: Meteor.user().username}];
    const inRoom = RoomCollection.findOne({_id: room_id, members: {$in: member}});
    const resultText = child_chat_id ? child_chat_id.text : txt;

    // does the user have the right role?
    if(!hasRole){
      ClientMessages.sendMessageToClient(self, message_identifier, "NOT_ALLOWED_TO_CHAT_IN_ROOM");
      return;
    }

    // does room even exist?
    if(!roomExists){
      ClientMessages.sendMessageToClient(self, message_identifier, "INVALID_ROOM");
      return;
    }
  // does the user have the right role?
  if (!hasRole) {
    ClientMessages.sendMessageToClient(self, message_identifier, "NOT_ALLOWED_TO_CHAT_IN_ROOM");
    return;
  }
  // sets owner, if room exists
  const owner = roomExists.owner;

    // If user not allowed to join room, can't write either
    if(!joinRole && !inRoom){
      ClientMessages.sendMessageToClient(self, message_identifier, "NOT_ALLOWED_TO_JOIN_ROOM");
      return;
    }

    // does the user have the join role? if so and not in room, join room.
    if(joinRole && !inRoom){
      Chat.joinRoom(message_identifier, room_id);
    }



    // fails if childchat and freeform
    if(!child_chat_exempt && !child_chat_id && child_chat){
      ClientMessages.sendMessageToClient(self, message_identifier, "CHILD_CHAT_FREEFORM_NOT_ALLOWED");
      return;
    }


    // Actually write message to chat collection of room
    ChatCollection.insert({
      isolation_group: isoGroup,
      type: "room",
      id: room_id,
      what: resultText,
      child_chat: child_chat,
      create_date: Meteor.date,
      issuer: {id: self._id, username: self.username}
    });
  }
  deleteRoom(message_identifier, room_id){
    // check if user is in role
    const self = Meteor.user();
    const inRole = Users.isAuthorized(self, "create_room");
    const record = RoomCollection.findOne({_id: room_id});
    if(!inRole){
      ClientMessages.sendMessageToClient(self, message_identifier, "NOT_ALLOWED_TO_DELETE_ROOM");
      return;
    }
    // check if room exists
    if(!record)
      ClientMessages.sendMessageToClient(self, message_identifier, "INVALID_ROOM");
    // Delete room record
    else
      RoomCollection.remove({_id: room_id});
  }
  joinRoom(message_identifier, room_id){
    const self = Meteor.user();
    const inRole = Users.isAuthorized(self, "join_room");
    const room = RoomCollection.findOne({_id: room_id});
    const member = {id: Meteor.user()._id, username: Meteor.user().username};
    const inRoom = (RoomCollection.findOne({$and: [ {_id: room_id}, {members: member}]}));

    // Currently ignores if user joins an already joined room
    if(inRoom){
      return;
    }

    // check if user is in role
    if(!inRole){
      ClientMessages.sendMessageToClient(self, message_identifier, "NOT_ALLOWED_TO_JOIN_ROOM");
      return;
    }

    // See if room exists
    if(!room)
      ClientMessages.sendMessageToClient(self, message_identifier, "INVALID_ROOM");
    // actually join room
    else
      RoomCollection.update({name: room.name}, {$push: {members: member}});
  }
  leaveRoom(message_identifier, room_id){

    const member = {id: Meteor.user()._id, username: Meteor.user().username};
    RoomCollection.update({_id: room_id}, {$pull: {members: member}});
  }

  writeToUser(message_identifier, user_id, text){
    const self = Meteor.user();
    const user = Meteor.users.findOne({_id: user_id});
    const isoGroup = self.isolation_group;
    const senderInRole = Users.isAuthorized(self, "personal_chat");
    const recieverInRole = Users.isAuthorized(user, "personal_chat");
    const ccsender = Users.isAuthorized(self, "child_chat");
    const ccrec = Users.isAuthorized(user, "child_chat");
    const ccerec = Users.isAuthorized(user, "child_chat_exempt");
    const ccesender = Users.isAuthorized(self, "child_chat_exempt");
    const ccid = ChildChatCollection.findOne({_id: text});
    const resultText = ccid ? ccid.text : text;
    const child_chat = (ccid || ccrec || ccsender && ccerec) && true;
    let loggedon = 0;

    if(self.status.online){
      loggedon++;
    }
    if(user.status.online && user_id !== self._id){
      loggedon++;
    }

    // only allowed if sender has personal chat
    if(!senderInRole){
      ClientMessages.sendMessageToClient(self, message_identifier, "SENDER_NOT_ALLOWED_TO_PERSONAL_CHAT");
      return;
    }


    //only allowed if reciever has personal chat
    if(!recieverInRole){
      ClientMessages.sendMessageToClient(self, message_identifier, "RECIPIENT_NOT_ALLOWED_TO_PERSONAL_CHAT");
      return;
    }


    //child_chat can child chat only unless to a child chat
    if(ccsender && !ccid && !ccerec){
      ClientMessages.sendMessageToClient(self, message_identifier, "CHILD_CHAT_FREEFORM_NOT_ALLOWED");
      return;
    }


    // Not allow freeform to child_chat except child_chat_exempt
    if(!ccid && ccrec && !ccerec &&!ccesender){
      ClientMessages.sendMessageToClient(self, message_identifier, "RECIPIENT_NOT_ALLOWED_TO_FREEFORM_CHAT");
      return;
    }

    // Won't send to loggedoff recipient, but will send to self
    if(loggedon <= 1 && user_id !== self._id){
      ClientMessages.sendMessageToClient(self, message_identifier, "RECIPIENT_LOGGED_OFF_UNABLE_TO_PERSONAL_CHAT");
      return;
    }

    // actual private message, uses id field as the recipient
    ChatCollection.insert({
      isolation_group: isoGroup,
      type: "private",
      id: user_id,
      what: resultText,
      child_chat: child_chat,
      create_date: Meteor.date,
      logons: loggedon,
      issuer: {id: self._id, username: self.username}
    });
  }
}

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
        const queryobject = { id: game._id, isolation_group: user.isolation_group };
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

if (!global._chatObject) {
  global._chatObject = new Chat();
}

module.exports.Chat = global._chatObject;

Meteor.methods({
  kibitz: global._chatObject.kibitz
});


Meteor.startup(() => {
  ChatCollection.remove({});
  Users.addLogoutHook(chatLogoutHook);
  Users.addLoginHook(chatLoginHook);
  Game.observeGameChanges({}, {
    removed(id) {
      ChatCollection.remove({ type: { $in: ["kibitz", "whisper"] }, id: id });
    }
  });
});
