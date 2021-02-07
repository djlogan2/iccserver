import { Mongo } from "meteor/mongo";
import { check, Match } from "meteor/check";
import { Game } from "./Game";
import { Meteor } from "meteor/meteor";
import { Users } from "../imports/collections/users";
import { ClientMessages } from "../imports/collections/ClientMessages";
import SimpleSchema from "simpl-schema";
import { SystemConfiguration } from "../imports/collections/SystemConfiguration";
import { Singular } from "./singular";
import { Logger } from "../lib/server/Logger";

const log = new Logger("server/Chat_js");

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
  child_chat: {
    type: Boolean,
    required: false,
    custom() {
      if (
        this.field("type").isSet &&
        this.field("type").value !== "room" &&
        !this.field("child_chat").isSet
      )
        return [
          {
            name: "child_chat",
            type: SimpleSchema.ErrorTypes.REQUIRED
          }
        ];
    }
  }
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

    if (this.childChatCollection.find().count() === 0) {
      [
        "Hi.",
        "Good luck!",
        "This is fun!",
        "Your turn.",
        "Whoops!",
        "Nice move!",
        "Mouse slip 🙁",
        "It's not looking good, is it?",
        "I've got you now!",
        "Another game after this?",
        "Yes",
        "No",
        "Good game"
      ].forEach(text => this.childChatCollection.insert({ text: text }));
    }

    //
    Meteor.publish("child_chat_texts", () => this.childChatCollection.find());

    function personalChat(user) {
      const query_object = {
        $and: [
          { isolation_group: user.isolation_group },
          { type: "private" },
          { $or: [{ id: user._id }, { "issuer.id": user._id }] }
        ]
      };
      if (user.cf === "c") query_object.$and.push({ child_chat: true });
      const cursor = self.collection.find(query_object, { sort: { createdAt: 1 } });
      log.debug("personalChat", cursor.count());
      return cursor;
    }

    function roomChat(room, user) {
      if (!Users.isAuthorized(user, "join_room")) return self.collection.find({ _id: "0" });
      // Children cannot be in rooms
      if (user.cf === "c") return self.collection.find({ _id: "0" });
      // No chats if they aren't members. If they are just invited, no chats!
      if (!room.members.some(member => member.id === user._id))
        return self.collection.find({ _id: "none" });
      const cursor = self.collection.find(
        {
          isolation_group: user.isolation_group,
          type: "room",
          id: room._id
        },
        { sort: { createdAt: 1 }, limit: SystemConfiguration.roomChatLimit() }
      );
      log.debug("roomChat", cursor.count());
      return cursor;
    }

    function games(user) {
      const cursor = Game.GameCollection.find(
        {
          $and: [
            { isolation_group: user.isolation_group },
            {
              $or: [
                { "white.id": user._id },
                { "black.id": user._id },
                { "observers.id": user._id }
              ]
            }
          ]
        },
        { fields: { _id: 1, observers: 1 } }
      );
      log.debug("playedGames", cursor.count());
      return cursor;
    }

    function gameKibitzes(game, user) {
      const query_object = {
        id: game._id,
        isolation_group: user.isolation_group
      };
      if (game.observers.some(ob => ob.id === user._id))
        query_object.type = { $in: ["kibitz", "whisper"] };
      else query_object.type = "kibitz";
      if (user.cf === "c") query_object.child_chat = true;
      const cursor = self.collection.find(query_object, { sort: { createdAt: 1 } });
      log.debug("gameKibitzes", cursor.count());
      return cursor;
    }

    function ownedRooms(user) {
      if (user.cf === "c") return self.roomCollection.find({ _id: "0" });
      if (!Users.isAuthorized(user, "join_room")) return self.roomCollection.find({ _id: "0" });
      const cursor = self.roomCollection.find({
        owner: user._id,
        public: false,
        isolation_group: user.isolation_group
      });
      log.debug("ownedRooms", cursor.count());
      return cursor;
    }

    function nonOwnedRooms(user) {
      if (user.cf === "c") return self.roomCollection.find({ _id: "0" });
      if (!Users.isAuthorized(user, "join_room")) return self.roomCollection.find({ _id: "0" });
      const cursor = self.roomCollection.find(
        {
          $and: [
            { isolation_group: user.isolation_group },
            { $or: [{ "invited.id": user._id }, { "members.id": user._id }, { public: true }] }
          ]
        },
        { fields: { _id: 1, name: 1, members: 1 } }
      );
      log.debug("nonOwnedRooms", cursor.count());
      return cursor;
    }

    Meteor.publishComposite("chat", {
      find() {
        return Meteor.users.find(
          { _id: this.userId },
          { fields: { _id: 1, isolation_group: 1, cf: 1 } }
        );
      },
      children: [
        { find: games, children: [{ find: gameKibitzes }] },
        { find: ownedRooms, children: [{ find: roomChat }] },
        { find: nonOwnedRooms, children: [{ find: roomChat }] },
        { find: personalChat }
      ]
    });

    Users.events.on("userLogin", function(fields) {
      self.collection.update(
        {
          $and: [
            { type: "private" },
            { logons: 1 },
            { $or: [{ id: fields.userId }, { "issuer.id": fields.userId }] }
          ]
        },
        { $set: { logons: 2 } },
        { multi: true }
      );
    });

    Users.events.on("userLogout", function(fields) {
      //
      // Remove the user as an invitee from all rooms he's been invited to,
      // and inform their owners
      //
      self.roomCollection
        .find({ "invited.id": fields.userId })
        .fetch()
        .forEach(room => {
          const invitee = room.invited.find(invitee => invitee.id === fields.userId);
          if (!invitee)
            throw new Meteor.Error(
              "Unable to remove invitee from room",
              "Unable to find invitee in room list"
            );
          ClientMessages.sendMessageToClient(
            room.owner,
            invitee.message_identifier,
            "USER_LOGGED_OFF"
          );
        });

      self.roomCollection.update(
        { "invited.id": fields.userId },
        { $pull: { invited: { id: fields.userId } } },
        { multi: true }
      );

      //
      // Delete all private rooms for which this member was the last member to logoff
      //
      const private_rooms_to_delete = self.roomCollection
        .find({ public: false, "members.id": fields.userId })
        .fetch()
        .filter(room => room.members.length === 1)
        .map(room => room._id);

      if (!!private_rooms_to_delete.length) {
        self.collection.remove({ type: "room", id: { $in: private_rooms_to_delete } });
        self.roomCollection.remove({ _id: { $in: private_rooms_to_delete } });
      }

      //
      // Remove them as members from all rooms they are in
      //
      self.roomCollection.update(
        { "members.id": fields.userId },
        { $pull: { members: { id: fields.userId } } }
      );

      //
      // Delete all private chats for which this member is the 2nd of the two
      // members to logoff
      //
      self.collection.remove({
        $and: [
          { type: "private" },
          { logons: 1 },
          { $or: [{ "issuer.id": fields.userId }, { id: fields.userId }] }
        ]
      });

      //
      // Mark all private messages as only one user of the private chats
      // still logged on
      //
      self.collection.update(
        {
          $and: [
            { type: "private" },
            { logons: 2 },
            { $or: [{ id: fields.userId }, { "issuer.id": fields.userId }] }
          ]
        },
        { $set: { logons: 1 } },
        { multi: true }
      );
    });

    Singular.addTask(() => {
      Game.GameCollection.find({}).observeChanges({
        removed(id) {
          self.collection.remove({ type: { $in: ["kibitz", "whisper"] }, id: id });
        }
      });
    });
  }

  kibitz(message_identifier, game_id, kibitz, txt) {
    log.debug("kibitz " + message_identifier + ", " + game_id + ", " + kibitz + ", " + txt);
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
      child_chat = self.cf === "e";
    }

    // Otherwise, someone in the child chat role must be sending a child chat.
    if (!child_chat && self.cf === "c") {
      ClientMessages.sendMessageToClient(
        self,
        message_identifier,
        "CHILD_CHAT_FREEFORM_NOT_ALLOWED"
      );
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

  createRoom(message_identifier, roomName, priv) {
    log.debug("createRoom " + message_identifier + ", " + roomName + ", " + priv);
    check(message_identifier, String);
    check(roomName, String);
    check(priv, Match.Maybe(Boolean));
    const self = Meteor.user();
    // check if user is in role
    if (
      !Users.isAuthorized(self, priv ? "create_private_room" : "create_room") ||
      self.cf === "c"
    ) {
      ClientMessages.sendMessageToClient(self, message_identifier, "NOT_AUTHORIZED");
      return;
    }

    const count = this.roomCollection
      .find({
        $and: [
          { name: roomName },
          { isolation_group: self.isolation_group },
          { $or: [{ public: true }, { $and: [{ public: false }, { owner: self._id }] }] }
        ]
      })
      .count();

    if (!!count) {
      ClientMessages.sendMessageToClient(self, message_identifier, "ROOM_ALREADY_EXISTS");
      return;
    }

    if (priv) {
      const private_count = this.roomCollection.find({ owner: self._id, public: false }).count();
      if (private_count >= SystemConfiguration.maximumPrivateRoomCount()) {
        ClientMessages.sendMessageToClient(self, message_identifier, "TOO_MANY_PRIVATE_ROOMS");
        return;
      }
    }

    // finally create room
    return this.roomCollection.insert({
      name: roomName,
      owner: self._id,
      public: !priv,
      members: [{ id: self._id, username: self.username }],
      isolation_group: self.isolation_group
    });
  }

  writeToRoom(message_identifier, room_id, txt) {
    log.debug("writeToRoom " + message_identifier + ", " + room_id + ", " + txt);
    check(message_identifier, String);
    check(room_id, String);
    check(txt, String);

    const self = Meteor.user();
    check(self, Object);

    // does the user have the right role?
    if (
      !Users.isAuthorized(self, "room_chat") ||
      !Users.isAuthorized(self, "join_room") ||
      self.cf === "c"
    ) {
      ClientMessages.sendMessageToClient(self, message_identifier, "NOT_ALLOWED_TO_CHAT_IN_ROOM");
      return;
    }

    const room = this.roomCollection.findOne({
      _id: room_id,
      isolation_group: self.isolation_group
    });

    // does room even exist?
    if (!room) {
      ClientMessages.sendMessageToClient(self, message_identifier, "INVALID_ROOM");
      return;
    }

    if (!room.members.some(member => member.id === self._id)) {
      if (room.public || room.invited.some(invitee => invitee.id === self._id))
        this.joinRoom(message_identifier, room_id);
      else {
        ClientMessages.sendMessageToClient(self, message_identifier, "NOT_ALLOWED_TO_CHAT_IN_ROOM");
        return;
      }
    }

    // Actually write message to chat collection of room
    this.collection.insert({
      isolation_group: self.isolation_group,
      type: "room",
      id: room_id,
      what: txt,
      issuer: { id: self._id, username: self.username }
    });
  }

  deleteRoom(message_identifier, room_id) {
    log.debug("deleteRoom " + message_identifier + ", " + room_id);
    check(message_identifier, String);
    check(room_id, String);

    // check if user is in role
    const self = Meteor.user();
    check(self, Object);

    const room = this.roomCollection.findOne({
      _id: room_id,
      isolation_group: self.isolation_group,
      owner: self._id
    });

    if (!room) {
      ClientMessages.sendMessageToClient(self, message_identifier, "INVALID_ROOM");
      return;
    }

    if (
      !Users.isAuthorized(self, room.public ? "create_room" : "create_private_room") ||
      room.owner !== self._id
    ) {
      ClientMessages.sendMessageToClient(self, message_identifier, "NOT_ALLOWED_TO_DELETE_ROOM");
      return;
    }

    this.collection.remove({ type: "room", id: room_id });
    this.roomCollection.remove({ _id: room_id });
  }

  joinRoom(message_identifier, room_id) {
    log.debug("joinRoom " + message_identifier + ", " + room_id);
    check(message_identifier, String);
    check(room_id, String);

    const self = Meteor.user();
    check(self, Object);

    const room = this.roomCollection.findOne({ _id: room_id });

    if (!room) {
      ClientMessages.sendMessageToClient(self, message_identifier, "INVALID_ROOM");
      return;
    }

    if (room.members && room.members.some(member => member.id === self._id)) {
      return;
    }

    if (!Users.isAuthorized(self, "join_room") || self.cf === "c") {
      const invitee = room.invited.find(invitee => invitee.id === self._id);
      if (!!invitee) {
        ClientMessages.sendMessageToClient(
          room.owner,
          invitee.message_identifier,
          "NOT_ALLOWED_TO_JOIN_ROOM"
        );

        this.roomCollection.update({ _id: room._id }, { $pull: { invited: { id: self._id } } });
        return;
      }
      ClientMessages.sendMessageToClient(self, message_identifier, "NOT_ALLOWED_TO_JOIN_ROOM");
      return;
    }

    if (!room.public) {
      if (!room.invited.some(invitee => invitee.id === self._id) && room.owner !== self._id) {
        ClientMessages.sendMessageToClient(self, message_identifier, "NOT_ALLOWED_TO_JOIN_ROOM");
        return;
      }
      this.roomCollection.update(
        { _id: room_id },
        {
          $addToSet: { members: { id: self._id, username: self.username } },
          $pull: { invited: { id: self._id } }
        }
      );
    } else
      this.roomCollection.update(
        { _id: room._id },
        { $addToSet: { members: { id: self._id, username: self.username } } }
      );
  }

  leaveRoom(message_identifier, room_id, user_id) {
    log.debug("leaveRoom " + message_identifier + ", " + room_id + ", " + user_id);
    check(message_identifier, String);
    check(room_id, String);

    const self = Meteor.user();
    check(self, Object);

    const room = this.roomCollection.findOne({
      _id: room_id,
      isolation_group: self.isolation_group
    });

    if (!user_id) user_id = self._id;

    if (room.public) {
      if (user_id !== self._id) {
        ClientMessages.sendMessageToClient(
          self,
          message_identifier,
          "CANNOT_KICK_USERS_OUT_OF_PUBLIC_ROOM"
        );
        return;
      }
      if (!room.members.some(member => member.id === self._id)) {
        ClientMessages.sendMessageToClient(self, message_identifier, "NOT_IN_ROOM");
        return;
      }
      this.roomCollection.update({ _id: room._id }, { $pull: { members: { id: self._id } } });
    } else {
      if (user_id !== self._id && room.owner !== self._id) {
        ClientMessages.sendMessageToClient(self, message_identifier, "NOT_THE_OWNER");
        return;
      }

      const member = !!room.members ? room.members.find(member => member.id === user_id) : null;
      const invitee = !!room.invited ? room.invited.find(invitee => invitee.id === user_id) : null;

      if (!!member) {
        this.roomCollection.update({ _id: room._id }, { $pull: { members: { id: user_id } } });
      } else if (!!invitee) {
        this.roomCollection.update({ _id: room._id }, { $pull: { invited: { id: user_id } } });
        if (self._id !== room.owner) {
          ClientMessages.sendMessageToClient(self, message_identifier, "USER_DECLINED_INVITE");
        }
      } else {
        ClientMessages.sendMessageToClient(self, message_identifier, "NOT_IN_ROOM");
      }
    }
  }

  inviteToRoom(message_identifier, room_id, user_id) {
    log.debug("inviteToRoom " + message_identifier + ", " + room_id + ", " + user_id);
    check(message_identifier, String);
    check(room_id, String);
    check(user_id, String);

    const self = Meteor.user();
    check(self, Object);

    if (
      !Users.isAuthorized(self, "create_private_room") ||
      !Users.isAuthorized(self, "room_chat") ||
      self.cf === "c"
    ) {
      ClientMessages.sendMessageToClient(self, message_identifier, "NOT_ALLOWED_TO_JOIN_ROOM");
      return;
    }

    if (user_id === self._id) {
      ClientMessages.sendMessageToClient(self, message_identifier, "CANNOT_INVITE_YOURSELF");
      return;
    }

    const room = this.roomCollection.findOne({
      _id: room_id,
      isolation_group: self.isolation_group,
      public: false,
      owner: self._id
    });

    if (!room) {
      ClientMessages.sendMessageToClient(self, message_identifier, "ROOM_DOES_NOT_EXIST");
      return;
    }

    const otherguy = Meteor.users.findOne({ _id: user_id, isolation_group: self.isolation_group });

    if (!otherguy || !otherguy.status.online) {
      ClientMessages.sendMessageToClient(self, message_identifier, "INVALID_USER");
      return;
    }

    if (!Users.isAuthorized(otherguy, "room_chat") || otherguy.cf === "c") {
      ClientMessages.sendMessageToClient(self, message_identifier, "INVALID_USER");
      return;
    }

    if (room.members.some(member => member.id === otherguy._id)) {
      ClientMessages.sendMessageToClient(self, message_identifier, "ALREADY_A_MEMBER");
      return;
    }
    if (room.invited && room.invited.some(invitee => invitee.id === otherguy._id)) {
      ClientMessages.sendMessageToClient(self, message_identifier, "ALREADY_INVITED");
      return;
    }
    if (!room.invited)
      this.roomCollection.update(
        { _id: room_id },
        { $set: { invited: { id: otherguy._id, username: otherguy.username } } }
      );
    else
      this.roomCollection.update(
        { _id: room_id },
        {
          $addToSet: {
            invited: {
              id: otherguy._id,
              username: otherguy.username,
              message_identifier: message_identifier
            }
          }
        }
      );
  }

  writeToUser(message_identifier, user_id, text) {
    log.debug("writeToUser " + message_identifier + ", " + user_id + ", " + text);

    const self = Meteor.user();
    const user = Meteor.users.findOne({ _id: user_id });

    // only allowed if sender has personal chat
    if (!Users.isAuthorized(self, "personal_chat")) {
      ClientMessages.sendMessageToClient(
        self,
        message_identifier,
        "SENDER_NOT_ALLOWED_TO_PERSONAL_CHAT"
      );
      return;
    }

    if (!Users.isAuthorized(user, "personal_chat")) {
      ClientMessages.sendMessageToClient(
        self,
        message_identifier,
        "RECIPIENT_NOT_ALLOWED_TO_PERSONAL_CHAT"
      );
      return;
    }

    let loggedon = 0;

    if (self.status.online) loggedon++;

    if (user.status.online && user_id !== self._id) loggedon++;

    let is_child_chat = user.cf === "e" || self.cf === "e";

    const child_chat = this.childChatCollection.findOne({ _id: text });
    if (!!child_chat) {
      text = child_chat.text;
      is_child_chat = true;
    }

    if (!is_child_chat && self.cf === "c") {
      ClientMessages.sendMessageToClient(
        self,
        message_identifier,
        "CHILD_CHAT_FREEFORM_NOT_ALLOWED"
      );
      return;
    }

    if (!is_child_chat && user.cf === "c") {
      ClientMessages.sendMessageToClient(
        self,
        message_identifier,
        "RECIPIENT_NOT_ALLOWED_TO_FREEFORM_CHAT"
      );
      return;
    }

    // Won't send to loggedoff recipient, but will send to self
    if (loggedon <= 1 && user_id !== self._id) {
      ClientMessages.sendMessageToClient(self, message_identifier, "USER_LOGGED_OFF");
      return;
    }

    // actual private message, uses id field as the recipient
    this.collection.insert({
      isolation_group: self.isolation_group,
      type: "private",
      id: user_id,
      what: text,
      child_chat: is_child_chat,
      logons: loggedon,
      issuer: { id: self._id, username: self.username }
    });
  }
}

if (!global._chatObject) {
  global._chatObject = new Chat();
}

module.exports.Chat = global._chatObject;

Meteor.methods({
  // eslint-disable-next-line meteor/audit-argument-checks
  kibitz: (message_identifier, game_id, kibitz, txt) =>
    global._chatObject.kibitz(message_identifier, game_id, kibitz, txt),
  // eslint-disable-next-line meteor/audit-argument-checks
  writeToUser: (message_identifier, user_id, text) =>
    global._chatObject.writeToUser(message_identifier, user_id, text),
  // eslint-disable-next-line meteor/audit-argument-checks
  leaveroom: (message_identifier, room_id) =>
    global._chatObject.leaveRoom(message_identifier, room_id),
  // eslint-disable-next-line meteor/audit-argument-checks
  joinRoom: (message_identifier, room_id) =>
    global._chatObject.joinRoom(message_identifier, room_id),
  // eslint-disable-next-line meteor/audit-argument-checks
  deleteRoom: (message_identifier, room_id) =>
    global._chatObject.deleteRoom(message_identifier, room_id),
  // eslint-disable-next-line meteor/audit-argument-checks
  writeToRoom: (message_identifier, room_id, txt) =>
    global._chatObject.writeToRoom(message_identifier, room_id, txt),
  // eslint-disable-next-line meteor/audit-argument-checks
  createRoom: (message_identifier, roomName, priv) =>
    global._chatObject.createRoom(message_identifier, roomName, priv),
  // eslint-disable-next-line meteor/audit-argument-checks
  inviteToRoom: (message_identifier, room_id, user_id) =>
    global._chatObject.inviteToRoom(message_identifier, room_id, user_id)
});
