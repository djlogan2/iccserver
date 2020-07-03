import { Mongo } from "meteor/mongo";
import { check } from "meteor/check";
import { Game } from "./Game";
import { Meteor } from "meteor/meteor";
import { Users } from "../imports/collections/users";
import { ClientMessages } from "../imports/collections/ClientMessages";
import SimpleSchema from "simpl-schema";

const ChatCollectionSchema = new SimpleSchema({
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
  type: { type: String, allowedValues: ["kibitz", "whisper", "room", "private"] },
  logons: { type: Number, required: false },
  what: String,
  child_chat: Boolean
});

const RoomCollectionSchema = {
  name: String,
  owner: String, // For public rooms, just the user that created the room
  public: Boolean,
  isolation_group: String,
  members: { type: Array, defaultValue: [] },
  "members.$": Object,
  "members.$.id": String,
  "members.$.username": String,
  invited: { type: Array, defaultValue: [] },
  "invited.$": Object,
  "invited.$.id": String,
  "invited.$.username": String,
  "invited.$.message_identifier": String
};

class Chat {
  constructor() {
    this.collection = new Mongo.Collection("chat");
    this.collection.attachSchema(ChatCollectionSchema);
    this.childChatCollection = new Mongo.Collection("child_chat");
    this.childChatCollection.attachSchema({ text: String });
    this.roomCollection = new Mongo.Collection("rooms");
    this.roomCollection.attachSchema(RoomCollectionSchema);
    const self = this;

    Meteor.publishComposite("chat", {
      find() {
        return Meteor.users.find({ _id: this.userId });
      },
      children: [
        // personal chat
        {
          find(user) {
            const query_object = { $and: [{ isolation_group: user.isolation_group }, { type: "private" }, { $or: [{ id: user._id }, { "issuer.id": user._id }] }] };
            if (Users.isAuthorized(user, "child_chat")) query_object.$and.push({ child_chat: true });
            return self.collection.find(query_object);
          }
        },
        // room chat
        {
          find(user) {
            if (Users.isAuthorized(user, "child_chat")) return self.roomCollection.find({ _id: "none" });
            return self.roomCollection.find({
              isolation_group: user.isolation_group,
              $or: [{ public: true }, { "members.id": user._id, "invited.id": user._id }]
            });
          },
          children: [
            {
              find(room, user) {
                // Children cannot be in rooms
                if (Users.isAuthorized(user, "child_chat")) return self.collection.find({ _id: "none" });
                // No chats if they aren't members. If they are just invited, no chats!
                if (!room.members.some(member => member.id === user._id)) return self.collection.find({ _id: "none" });
                return self.collection.find({
                  isolation_group: user.isolation_group,
                  type: "room",
                  id: room._id
                });
              }
            }
          ]
        },
        // game chat - players
        {
          find(user) {
            return Game.collection.find({ $and: [{ status: "playing" }, { $or: [{ "white.id": user._id }, { "black.id": user._id }] }] });
          },
          children: [
            {
              find(game, user) {
                const query_object = {
                  type: "kibitz",
                  id: game._id,
                  isolation_group: user.isolation_group
                };
                if (Users.isAuthorized(user, "child_chat")) query_object.child_chat = true;
                return self.collection.find(query_object);
              }
            }
          ]
        },
        // game chat - observers
        {
          find(user) {
            return Game.collection.find({ "observers.id": user._id });
          },
          children: [
            {
              find(game, user) {
                const query_object = {
                  type: { $in: ["kibitz", "whisper"] },
                  id: game._id,
                  isolation_group: user.isolation_group
                };
                if (Users.isAuthorized(user, "child_chat")) query_object.child_chat = true;
                return self.collection.find(query_object);
              }
            }
          ]
        }
      ]
    });

    Meteor.startup(() => {
      self.collection.remove({});
      Users.addLogoutHook(user => self.chatLogoutHook.bind(self, user));
      Users.addLoginHook(user => self.chatLoginHook.bind(self, user));
      // Game.GameCollection.observeChanges({}, {
      //   removed(id) {
      //     self.collection.remove({ type: { $in: ["kibitz", "whisper"] }, id: id });
      //   }
      // });
    });
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

    const game_ = Game.GameCollection.find({ _id: game_id }).fetch();
    const game = !!game_ && game_.length ? game_[0] : null;
    let child_chat = false;

    if (!game) {
      ClientMessages.sendMessageToClient(self, message_identifier, "INVALID_GAME");
      return;
    }

    // Anyone can send a child chat.
    // Anything an exempt person sends is a child chat
    const child_chat_record = this.childChatCollection.findOne({ _id: txt });
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

    this.collection.insert({
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
    });
  }

  createRoom(message_identifier, roomName) {
    const self = Meteor.user();
    const isoGroup = Meteor.user().isolation_group;
    // check if user is in role
    const roomRole = Users.isAuthorized(Meteor.user(), "create_room");
    const uniqueName = !this.roomCollection.findOne({ name: roomName });

    // check if name is unique in db
    if (!uniqueName) {
      ClientMessages.sendMessageToClient(self, message_identifier, "ROOM_ALREADY_EXISTS");
      return;
    }
    // finally create room
    //x
    // here is a comment
    if (roomRole) {
      const member = [{ id: Meteor.user()._id, username: Meteor.user().username }];
      this.roomCollection.insert({
        name: roomName,
        owner: self._id,
        public: true,
        members: member,
        isolation_group: isoGroup
      });
      return this.roomCollection.findOne({ name: roomName })._id;
    } else ClientMessages.sendMessageToClient(self, message_identifier, "NOT_ALLOWED_TO_CREATE_ROOM");
  }

  writeToRoom(message_identifier, room_id, txt) {
    const self = Meteor.user();
    const isoGroup = Meteor.user().isolation_group;
    const hasRole = Users.isAuthorized(self, "room_chat");
    const joinRole = Users.isAuthorized(self, "join_room");
    const roomExists = this.roomCollection.findOne({ _id: room_id });
    const child_chat_exempt = Users.isAuthorized(self, "child_chat_exempt");
    const child_chat_id = this.childChatCollection.findOne({ _id: txt });
    const child_chat = (Users.isAuthorized(self, "child_chat") || child_chat_id || child_chat_exempt) && true;
    const member = [{ id: Meteor.user()._id, username: Meteor.user().username }];
    const inRoom = this.roomCollection.findOne({ _id: room_id, members: { $in: member } });
    const resultText = child_chat_id ? child_chat_id.text : txt;

    // does the user have the right role?
    if (!hasRole) {
      ClientMessages.sendMessageToClient(self, message_identifier, "NOT_ALLOWED_TO_CHAT_IN_ROOM");
      return;
    }

    // does room even exist?
    if (!roomExists) {
      ClientMessages.sendMessageToClient(self, message_identifier, "INVALID_ROOM");
      return;
    }

    // If user not allowed to join room, can't write either
    if (!joinRole && !inRoom) {
      ClientMessages.sendMessageToClient(self, message_identifier, "NOT_ALLOWED_TO_JOIN_ROOM");
      return;
    }

    // does the user have the join role? if so and not in room, join room.
    if (joinRole && !inRoom) {
      this.joinRoom(message_identifier, room_id);
    }

    // fails if childchat and freeform
    if (!child_chat_exempt && !child_chat_id && child_chat) {
      ClientMessages.sendMessageToClient(self, message_identifier, "CHILD_CHAT_FREEFORM_NOT_ALLOWED");
      return;
    }

    // Actually write message to chat collection of room
    this.collection.insert({
      isolation_group: isoGroup,
      type: "room",
      id: room_id,
      what: resultText,
      child_chat: child_chat,
      create_date: Meteor.date,
      issuer: { id: self._id, username: self.username }
    });
  }

  deleteRoom(message_identifier, room_id) {
    // check if user is in role
    const self = Meteor.user();
    const inRole = Users.isAuthorized(self, "create_room");
    const record = this.roomCollection.findOne({ _id: room_id });
    if (!inRole) {
      ClientMessages.sendMessageToClient(self, message_identifier, "NOT_ALLOWED_TO_DELETE_ROOM");
      return;
    }
    // check if room exists
    if (!record) ClientMessages.sendMessageToClient(self, message_identifier, "INVALID_ROOM");
    // Delete room record
    else this.roomCollection.remove({ _id: room_id });
  }

  joinRoom(message_identifier, room_id) {
    const self = Meteor.user();
    const inRole = Users.isAuthorized(self, "join_room");
    const room = this.roomCollection.findOne({ _id: room_id });
    const member = { id: Meteor.user()._id, username: Meteor.user().username };
    const inRoom = this.roomCollection.findOne({ $and: [{ _id: room_id }, { members: member }] });

    // Currently ignores if user joins an already joined room
    if (inRoom) {
      return;
    }

    // check if user is in role
    if (!inRole) {
      ClientMessages.sendMessageToClient(self, message_identifier, "NOT_ALLOWED_TO_JOIN_ROOM");
      return;
    }

    // See if room exists
    if (!room) ClientMessages.sendMessageToClient(self, message_identifier, "INVALID_ROOM");
    // actually join room
    else this.roomCollection.update({ _id: room._id }, { $addToSet: { members: member } });
  }

  leaveRoom(message_identifier, room_id) {
    const member = { id: Meteor.user()._id, username: Meteor.user().username };
    this.roomCollection.update({ _id: room_id }, { $pull: { members: member } });
  }

  writeToUser(message_identifier, user_id, text) {
    const self = Meteor.user();
    const user = Meteor.users.findOne({ _id: user_id });
    const isoGroup = self.isolation_group;
    const senderInRole = Users.isAuthorized(self, "personal_chat");
    const recieverInRole = Users.isAuthorized(user, "personal_chat");
    const ccsender = Users.isAuthorized(self, "child_chat");
    const ccrec = Users.isAuthorized(user, "child_chat");
    const ccerec = Users.isAuthorized(user, "child_chat_exempt");
    const ccesender = Users.isAuthorized(self, "child_chat_exempt");
    const ccid = this.childChatCollection.findOne({ _id: text });
    const resultText = ccid ? ccid.text : text;
    const child_chat = (ccid || ccrec || (ccsender && ccerec)) && true;
    let loggedon = 0;

    if (self.status.online) {
      loggedon++;
    }
    if (user.status.online && user_id !== self._id) {
      loggedon++;
    }

    // only allowed if sender has personal chat
    if (!senderInRole) {
      ClientMessages.sendMessageToClient(self, message_identifier, "SENDER_NOT_ALLOWED_TO_PERSONAL_CHAT");
      return;
    }

    //only allowed if reciever has personal chat
    if (!recieverInRole) {
      ClientMessages.sendMessageToClient(self, message_identifier, "RECIPIENT_NOT_ALLOWED_TO_PERSONAL_CHAT");
      return;
    }

    //child_chat can child chat only unless to a child chat
    if (ccsender && !ccid && !ccerec) {
      ClientMessages.sendMessageToClient(self, message_identifier, "CHILD_CHAT_FREEFORM_NOT_ALLOWED");
      return;
    }

    // Not allow freeform to child_chat except child_chat_exempt
    if (!ccid && ccrec && !ccerec && !ccesender) {
      ClientMessages.sendMessageToClient(self, message_identifier, "RECIPIENT_NOT_ALLOWED_TO_FREEFORM_CHAT");
      return;
    }

    // Won't send to loggedoff recipient, but will send to self
    if (loggedon <= 1 && user_id !== self._id) {
      ClientMessages.sendMessageToClient(self, message_identifier, "RECIPIENT_LOGGED_OFF_UNABLE_TO_PERSONAL_CHAT");
      return;
    }

    // actual private message, uses id field as the recipient
    this.collection.insert({
      isolation_group: isoGroup,
      type: "private",
      id: user_id,
      what: resultText,
      child_chat: child_chat,
      create_date: Meteor.date,
      logons: loggedon,
      issuer: { id: self._id, username: self.username }
    });
  }

  chatLoginHook(user) {
    this.collection.update(
      {
        $and: [{ type: "private" }, { logons: 1 }, { $or: [{ id: user._id }, { "issuer.id": user._id }] }]
      },
      { $set: { logons: 2 } },
      { multi: true }
    );
  }

  chatLogoutHook(userId) {
    this.collection.remove({
      $and: [{ type: "private" }, { logons: 1 }, { $or: [{ "issuer.id": userId }, { id: userId }] }]
    });
    this.collection.update(
      {
        $and: [{ type: "private" }, { logons: 2 }, { $or: [{ id: userId }, { "issuer.id": userId }] }]
      },
      { $set: { logons: 1 } },
      { multi: true }
    );
  }
}

if (!global._chatObject) {
  global._chatObject = new Chat();
}

module.exports.Chat = global._chatObject;

Meteor.methods({
  // eslint-disable-next-line meteor/audit-argument-checks
  kibitz: (message_identifier, game_id, kibitz, txt) => global._chatObject.kibitz(message_identifier, game_id, kibitz, txt),
  // eslint-disable-next-line meteor/audit-argument-checks
  writeToUser: (message_identifier, user_id, text) => global._chatObject.writeToUser(message_identifier, user_id, text),
  // eslint-disable-next-line meteor/audit-argument-checks
  leaveroom: (message_identifier, room_id) => global._chatObject.leaveRoom(message_identifier, room_id),
  // eslint-disable-next-line meteor/audit-argument-checks
  joinRoom: (message_identifier, room_id) => joinRoom(message_identifier, room_id),
  // eslint-disable-next-line meteor/audit-argument-checks
  deleteRoom: (message_identifier, room_id) => global._chatObject.deleteRoom(message_identifier, room_id),
  // eslint-disable-next-line meteor/audit-argument-checks
  writeToRoom: (message_identifier, room_id, txt) => global._chatObject.writeToRoom(message_identifier, room_id, txt),
  // eslint-disable-next-line meteor/audit-argument-checks
  createRoom: (message_identifier, roomName) => global._chatObject.createRoom(message_identifier, roomName)
});
