import { TestHelpers } from "../imports/server/TestHelpers";
import chai from "chai";
//
// create_date: [date saved],
// chat_room
// { _id: "xxx",
//   name: "Room name",
//   members: [{id: "xxx", username: "yyy}]
// }
//
// chat
// {
//    _id: "xxx",
//---------------------------
//      type: "kibitz",
//      id: "game-id",
//[or]
//      type: "whisper",
//      id: "game-id",
//[or]
//      type: "room",
//      id: "room-id",
//[or]
//      type: "private",
//      id: "user-id",
//      logons: ## <- 2 if both logged on, 1 if only one is, record deleted if both logoff
//---------------------------
//    issuer: {id: "xxx", username: "yyy"},
//    child_chat: true/false,
//    what: "the text"
// }
import { Chat } from "./Chat";

describe("Chats", function() {
  const self = TestHelpers.setupDescribe.apply(this);
//createRoom

  it("should allow creating a room if user has 'create_room' role", function() {
    self.loggedonuser = TestHelpers.createUser({ roles: ["create_room"] });
    const room_id = Chat.createRoom("mi1", "The room");
    chai.assert.equal(Chat.collection.find().count(), 1);
  });

  it("should disallow creating a room if user does not have 'create_room' role", function() {
    self.loggedonuser = TestHelpers.createUser();
    const room_id = Chat.createRoom("mi1", "The room");
    chai.assert.equal(Chat.collection.find().count(), 0);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, p1._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi1");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "?");
  });

  it("should disallow creating a room with a duplicate room name", function() {
    self.loggedonuser = TestHelpers.createUser({ roles: ["create_room"] });
    const room_id1 = Chat.createRoom("mi1", "The room");
    chai.assert.equal(Chat.collection.find().count(), 1);
    const room_id2 = Chat.createRoom("mi2", "The room");
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, p1._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "?");
  });

  it("should join the creator to the room upon room create", function() {
    chai.assert.fail("do me");
  });

//deleteRoom
  it("should allow deleting a room if the user has 'create_room' role", function() {
    self.loggedonuser = TestHelpers.createUser({ roles: ["create_room"] });
    const room_id = Chat.createRoom("mi1", "The room");
    chai.assert.equal(Chat.collection.find().count(), 1);
    Chat.deleteRoom("mi2", room_id);
    chai.assert.equal(Chat.collection.find().count(), 0);
  });

  it("should not allow deleting a room if the user does not have 'create_room' role", function() {
    self.loggedonuser = TestHelpers.createUser({ roles: ["create_room"] });
    const abuser = TestHelpers.createUser();
    const room_id = Chat.createRoom("mi1", "The room");
    chai.assert.equal(Chat.collection.find().count(), 1);
    self.loggedonuser = abuser;
    Chat.deleteRoom("mi2", room_id);
    chai.assert.equal(Chat.collection.find().count(), 1);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, p1._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "?");
  });

  it("should return a message if no room id exists to delete", function() {
    self.loggedonuser = TestHelpers.createUser({ roles: ["create_room", "room_chat", "join_room"] });
    const room_id = Chat.deleteRoom("mi1", "boogus");
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, p1._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "?");
  });

//writeToRoom
  it("should allow writing to a room if user has 'room_chat' role", function() {
    self.loggedonuser = TestHelpers.createUser({ roles: ["create_room", "room_chat", "join_room"] });
    const room_id = Chat.createRoom("mi1", "The room");
    Chat.writeToRoom("mi2", room_id, "The text");
    const chat = Chat.collection.findOne();
    chai.assert.sameDeepMembers([{
      create_date: chat.create_date,
      id: room_id,
      type: "room",
      issuer: { id: self._id, username: self.username },
      what: "The text"
    }], chat);
  });

  it("should not allow writing to rooms if user does not have 'room_chat' role", function() {
    self.loggedonuser = TestHelpers.createUser({ roles: ["create_room", "join_room"] });
    const room_id = Chat.createRoom("mi1", "The room");
    Chat.writeToRoom("mi2", room_id, "The text");
    chai.assert.equal(Chat.collection.find().count(), 0);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, self.loggedonuser._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi3");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "?");
  });

  it("should automatically join the room if a text is written to, and user has 'join_room' role", function() {
    const newguy = TestHelpers.createUser();
    const creator = TestHelpers.createUser({ roles: ["create_room", "room_chat", "join_room"] });
    self.loggedonuser = creator;
    const room_id = Chat.createRoom("mi1", "The room");
    Chat.writeToRoom("mi2", room_id, "The text");
    self.loggedonuser = newguy;
    Chat.writeToRoom("mi2", room_id, "The newguy text");
    const room = Chat.roomCollection.findOne();
    chai.assert.sameDeepMembers([{ id: creator._id, username: creator.username }, {
      id: newguy._id,
      username: newguy.username
    }], room.members);
    const chat = Chat.collection.find.fetch();
    chai.assert.equal(chat.length, 2);
    chat.forEach(c => delete c.create_date);
    chai.assert.sameDeepMembers([{
      id: room_id,
      type: "room",
      issuer: { id: creator._id, username: self.username },
      what: "The text"
    }], chat[0]);
    chai.assert.sameDeepMembers([{
      id: room_id,
      type: "room",
      issuer: { id: newguy._id, username: newguy.username },
      what: "The newguy text"
    }], chat[1]);
  });

  it("should write an error if unable to join the room due to not being in 'join_room' role", function() {
    const newguy = TestHelpers.createUser({ roles: ["create_room", "room_chat"] });
    const creator = TestHelpers.createUser({ roles: ["create_room", "room_chat", "join_room"] });
    self.loggedonuser = creator;
    const room_id = Chat.createRoom("mi1", "The room");
    Chat.writeToRoom("mi2", room_id, "The text");
    self.loggedonuser = newguy;
    Chat.writeToRoom("mi3", room_id, "The newguy text");
    const room = Chat.roomCollection.findOne();
    chai.assert.sameDeepMembers([{ id: creator._id, username: creator.username }], room.members);
    const chat = Chat.collection.find.fetch();
    chai.assert.equal(chat.length, 1);
    chai.assert.sameDeepMembers([{
      create_date: chat.create_date,
      id: room_id,
      type: "room",
      issuer: { id: creator._id, username: self.username },
      what: "The text"
    }], chat[0]);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, self.loggedonuser._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi3");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "?");
  });

  it("should not allow a child to write text not from child_chat collection", function() {
    self.loggedonuser = TestHelpers.createUser({ roles: ["create_room", "room_chat", "join_room", "child_chat"] });
    const room_id = Chat.createRoom("mi1", "The room");
    chai.assert.equal(Chat.collection.find().count(), 1);
    Chat.writeToRoom("mi2", room_id, "The text");
    chai.assert.equal(Chat.collection.find().count(), 0);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, self.loggedonuser._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi3");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "?");
  });

  it("should allow child_chat_exempt to write child_chat freeform", function() {
    self.loggedonuser = TestHelpers.createUser({ roles: ["create_room", "room_chat", "join_room", "child_exempt"] });
    const room_id = Chat.createRoom("mi1", "The room");
    Chat.writeToRoom("mi2", room_id, "The text");
    const chat = Chat.collection.findOne();
    chai.assert.sameDeepMembers([{
      create_date: chat.create_date,
      id: room_id,
      type: "room",
      issuer: { id: self._id, username: self.username },
      child_chat: true,
      what: "The text"
    }], chat);
  });

  it("should allow child_chat_exempt to write child_chat id text", function() {
    const ccid = Chat.childChatCollection.insert({ text: "child chat text" });
    self.loggedonuser = TestHelpers.createUser({ roles: ["create_room", "room_chat", "join_room", "child_exempt"] });
    const room_id = Chat.createRoom("mi1", "The room");
    Chat.writeToRoom("mi2", room_id, ccid);
    const chat = Chat.collection.findOne();
    chai.assert.sameDeepMembers([{
      create_date: chat.create_date,
      id: room_id,
      type: "room",
      issuer: { id: self._id, username: self.username },
      child_chat: true,
      what: "child chat text"
    }], chat);
  });

  it("should allow normal user to write freeform, but it won't be child_chat friendly", function() {
    const normalguy = TestHelpers.createUser();
    self.loggedonuser = TestHelpers.createUser({ roles: ["create_room", "room_chat", "join_room", "child_exempt"] });
    const room_id = Chat.createRoom("mi1", "The room");
    self.loggedonuser = normalguy;
    Chat.writeToRoom("mi2", room_id, "normal text");
    const chat = Chat.collection.findOne();
    chai.assert.sameDeepMembers([{
      create_date: chat.create_date,
      id: room_id,
      type: "room",
      issuer: { id: self._id, username: self.username },
      what: "normal text"
    }], chat);
  });

  it("should allow normal user to write a child_chat text", function() {
    const ccid = Chat.childChatCollection.insert({ text: "child chat text" });
    const normalguy = TestHelpers.createUser();
    self.loggedonuser = TestHelpers.createUser({ roles: ["create_room", "room_chat", "join_room", "child_exempt"] });
    const room_id = Chat.createRoom("mi1", "The room");
    self.loggedonuser = normalguy;
    Chat.writeToRoom("mi2", room_id, ccid);
    const chat = Chat.collection.findOne();
    chai.assert.sameDeepMembers([{
      create_date: chat.create_date,
      id: room_id,
      type: "room",
      issuer: { id: self._id, username: self.username },
      child_chat: true,
      what: "child chat text"
    }], chat);
  });

  it("should only publish child_chat texts to a user in child_chat role", function(done) {
    const ccid = Chat.childChatCollection.insert({ text: "child chat text" });
    const user = TestHelpers.createUser({ roles: ["room_chat", "create_room"] });
    const child = TestHelpers.createUser({ roles: ["room_chat", "join_room", "child_chat"] });
    const exempt = TestHelpers.createUser({ roles: ["room_chat", "join_room", "child_chat_exempt"] });
    self.loggedonuser = user;
    const room_id = Chat.createRoom("mi1", "The room");
    Chat.writeToRoom("mi2", "normal user text");
    self.loggedonuser = child;
    Chat.writeToRoom("mi3", ccid);
    self.loggedonuser = exempt;
    Chat.writeToRoom("mi4", "exempt text");

    self.loggedonuser = child;
    const collector = new PublicationCollector({ userId: child._id });
    collector.collect("chat", collections => {
      collections.chat.forEach(c => delete c.create_date);
      chai.assert.equal(collections.chat.length, 2);
      chai.assert.sameDeepMembers([{
        type: "room",
        id: room_id,
        issuer: { id: child._id, username: child.username },
        child_chat: true,
        what: "child chat text"
      }, {
        type: "room",
        id: room_id,
        issuer: { id: exempt._id, username: exempt.username },
        child_chat: true,
        what: "exempt text"
      }], collections.chat);
      done();
    });
  });

  it("should publish chats from all rooms a user is in", function(done) {
    const user1 = TestHelpers.createUser({ roles: ["room_chat", "create_room"] });
    const user2 = TestHelpers.createUser({ roles: ["room_chat", "create_room"] });
    const room_id1 = Chat.createRoom("mi1", "room 1");
    const room_id2 = Chat.createRoom("mi2", "room 2");
    const room_id3 = Chat.createRoom("mi3", "room 3");
    const room_id4 = Chat.createRoom("mi3", "room 4");
    Chat.writeToRoom("mi4", room_id1, "room 1 text");
    Chat.writeToRoom("mi5", room_id2, "room 2 text");
    Chat.writeToRoom("mi6", room_id3, "room 3 text");
    Chat.writeToRoom("mi7", room_id4, "room 4 text");
    self.loggedonuser = user2;
    Chat.writeToRoom("mi8", room_id2, "2nd room 2 text");
    Chat.writeToRoom("mi9", room_id4, "2nd room 4 text");

    self.loggedonuser = user2;
    const collector = new PublicationCollector({ userId: user2._id });
    collector.collect("chat", collections => {
      chai.assert.equal(collections.chat.length, 4);
      collections.chat.forEach(c => delete c.create_date);
      chai.assert.sameDeepMembers([
        { type: "room", id: room_id2, issuer: { id: user1._id, username: user1.username }, what: "room 2 text" },
        { type: "room", id: room_id4, issuer: { id: user1._id, username: user1.username }, what: "room 4 text" },
        { type: "room", id: room_id2, issuer: { id: user2._id, username: user1.username }, what: "2nd room 2 text" },
        { type: "room", id: room_id4, issuer: { id: user2._id, username: user1.username }, what: "2ne room 4 text" }
      ], collections.chat);
      done();
    });
  });

  it("should write message if trying to write to a non-existant room id", function() {
    self.loggedonuser = TestHelpers.createUser({ roles: ["create_room", "room_chat", "join_room"] });
    const room_id = Chat.createRoom("mi1", "The room");
    Chat.writeToRoom("mi2", "mickeymouse", "The text");
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, self.loggedonuser._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "?");
  });

//joinRoom
  it("should allow joining if user is in 'join_room' role", function() {
    const creator = TestHelpers.createUser({ roles: ["create_room", "room_chat", "join_room"] });
    self.loggedonuser = creator;
    const room_id = Chat.createRoom("mi1", "The room");
    const joiner = TestHelpers.createUser();
    self.loggedonuser = joiner;
    Chat.joinRoom("mi2", room_id);
    const room = Chat.roomCollection.findOne();
    chai.assert.sameDeepMembers([{ id: creator._id, username: creator.username }, {
      id: joiner._id,
      username: joiner.username
    }], room.members);
  });

  it("should write message if user is not in 'join_room' role", function() {
    const creator = TestHelpers.createUser({ roles: ["create_room", "room_chat", "join_room"] });
    self.loggedonuser = creator;
    const room_id = Chat.createRoom("mi1", "The room");
    self.loggedonuser = TestHelpers.createUser({ roles: ["play_rated_games"] });
    Chat.joinRoom("mi2", room_id);
    const room = Chat.roomCollection.findOne();
    chai.assert.sameDeepMembers([{ id: creator._id, username: creator.username }], room.members);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, self.loggedonuser._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "?");
  });

  it("should write message if room id is non-existant", function() {
    self.loggedonuser = TestHelpers.createUser({ roles: ["create_room", "room_chat", "join_room"] });
    const room_id = Chat.createRoom("mi1", "The room");
    self.loggedonuser = TestHelpers.createUser();
    Chat.joinRoom("mi2", "mickeymouse");
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, self.loggedonuser._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "?");
  });

  it("should ignore a request if the user is already in the room", function() {
    const creator = TestHelpers.createUser({ roles: ["create_room", "room_chat", "join_room"] });
    self.loggedonuser = creator;
    const room_id = Chat.createRoom("mi1", "The room");
    const joiner = TestHelpers.createUser();
    self.loggedonuser = joiner;
    Chat.joinRoom("mi2", room_id);
    const room = Chat.roomCollection.findOne();
    chai.assert.sameDeepMembers([{ id: creator._id, username: creator.username }, {
      id: joiner._id,
      username: joiner.username
    }], room.members);
    Chat.joinRoom("mi2", room_id);
    chai.assert.true(self.clientMessagesSpy.notCalled);
  });

//leaveRoom
  it("should allow leaving the room if the user is in it", function() {
    const creator = TestHelpers.createUser({ roles: ["create_room", "room_chat", "join_room"] });
    self.loggedonuser = creator;
    const room_id = Chat.createRoom("mi1", "The room");
    const joiner = TestHelpers.createUser();
    self.loggedonuser = joiner;
    Chat.joinRoom("mi2", room_id);
    const room = Chat.roomCollection.findOne();
    chai.assert.sameDeepMembers([{ id: creator._id, username: creator.username }, {
      id: joiner._id,
      username: joiner.username
    }], room.members);
    Chat.leaveRoom("mi3", room_id);
    const room2 = Chat.roomCollection.findOne();
    chai.assert.sameDeepMembers([{ id: creator._id, username: creator.username }], room2.members);
  });

  it("should ignore the user if not in the room", function() {
    const creator = TestHelpers.createUser({ roles: ["create_room", "room_chat", "join_room"] });
    self.loggedonuser = creator;
    const room_id = Chat.createRoom("mi1", "The room");
    const joiner = TestHelpers.createUser();
    self.loggedonuser = joiner;
    Chat.joinRoom("mi2", room_id);
    const room = Chat.roomCollection.findOne();
    chai.assert.sameDeepMembers([{ id: creator._id, username: creator.username }, {
      id: joiner._id,
      username: joiner.username
    }], room.members);
    Chat.leaveRoom("mi3", room_id);
    const room2 = Chat.roomCollection.findOne();
    chai.assert.sameDeepMembers([{ id: creator._id, username: creator.username }], room2.members);
    Chat.leaveRoom("mi4", room_id);
    chai.assert.true(self.clientMessagesSpy.notCalled);
  });

  it("should write a message if room id is non-existant", function() {
    self.loggedonuser = TestHelpers.createUser({ roles: ["create_room", "room_chat", "join_room"] });
    const room_id = Chat.createRoom("mi1", "The room");
    self.loggedonuser = TestHelpers.createUser();
    Chat.joinRoom("mi2", "mickeymouse");
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, self.loggedonuser._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "?");
  });

  //writePrivateText
  it("should allow people with personal_chat to send to another user with personal_chat", function() {
    const user1 = TestHelpers.createUser();
    const user2 = TestHelpers.createUser();
    self.loggedonuser = user1;
    Chat.writeToUser("mi1", user2._id, "The text");
    const chat = Chat.collection.findOne();
    chai.assert.deepEqual({
      create_date: chat.create_date,
      type: "private",
      id: user2._id,
      logons: 2,
      issuer: { id: user1._id, username: user1.username },
      what: "the text"
    }, chat);
  });

  it("should not allow sending a private chat to a logged off user", function() {
    const user1 = TestHelpers.createUser();
    const user2 = TestHelpers.createUser({ login: false });
    self.loggedonuser = user1;
    Chat.writeToUser("mi1", user2._id, "The text");
    chai.assert.equal(Chat.collection.find().count(), 0);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, self.loggedonuser._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "?");
  });

  it("should not allow a write if sender does not have personal_chat", function() {
    const user1 = TestHelpers.createUser({ roles: ["play_rated_games"] });
    const user2 = TestHelpers.createUser();
    self.loggedonuser = user1;
    Chat.writeToUser("mi1", user2._id, "The text");
    chai.assert.equal(Chat.collection.find().count(), 0);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, self.loggedonuser._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "?");
  });

  it("should not allow a write if receiver does not have personal_chat", function() {
    const user1 = TestHelpers.createUser();
    const user2 = TestHelpers.createUser({ roles: ["play_rated_games"] });
    self.loggedonuser = user1;
    Chat.writeToUser("mi1", user2._id, "The text");
    chai.assert.equal(Chat.collection.find().count(), 0);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, self.loggedonuser._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "?");
  });

  it("should allow a child_chat to write a child chat to another user", function() {
    const ccid = Chat.childChatCollection.insert({ text: "child chat text" });
    const user1 = TestHelpers.createUser({ roles: ["personal_chat", "child_chat"] });
    const user2 = TestHelpers.createUser();
    self.loggedonuser = user1;
    Chat.writeToUser("mi1", user2._id, ccid);
    const chat = Chat.collection.findOne();
    chai.assert.deepEqual({
      create_date: chat.create_date,
      type: "private",
      id: user2._id,
      logons: 2,
      child_chat: true,
      issuer: { id: user1._id, username: user1.username },
      what: "child chat text"
    }, chat);
  });

  it("should allow a child_chat to write freeform text to a child_chat_exempt user", function() {
    const user1 = TestHelpers.createUser({ roles: ["personal_chat", "child_chat"] });
    const user2 = TestHelpers.createUser({ roles: ["personal_chat", "child_chat_exempt"] });
    self.loggedonuser = user1;
    Chat.writeToUser("mi1", user2._id, "freeform text");
    const chat = Chat.collection.findOne();
    chai.assert.deepEqual({
      create_date: chat.create_date,
      type: "private",
      id: user2._id,
      logons: 2,
      child_chat: true,
      issuer: { id: user1._id, username: user1.username },
      what: "freeform text"
    }, chat);
  });

  it("should allow a child_chat_exempt user to write freeform text to a child_chat user", function() {
    const user1 = TestHelpers.createUser({ roles: ["personal_chat", "child_chat_exempt"] });
    const user2 = TestHelpers.createUser({ roles: ["personal_chat", "child_chat"] });
    self.loggedonuser = user1;
    Chat.writeToUser("mi1", user2._id, "freeform text");
    const chat = Chat.collection.findOne();
    // Note that this isn't marked as a child friendly chat!
    chai.assert.deepEqual({
      create_date: chat.create_date,
      type: "private",
      id: user2._id,
      logons: 2,
      child_chat: true,
      issuer: { id: user1._id, username: user1.username },
      what: "freeform text"
    }, chat);
    chai.assert.fail("do me");
  });

  it("should allow any user to write a child chat to a child_chat user", function() {
    const ccid = Chat.childChatCollection.insert({ text: "child chat text" });
    const user1 = TestHelpers.createUser();
    const user2 = TestHelpers.createUser({ roles: ["personal_chat", "child_chat"] });
    self.loggedonuser = user1;
    Chat.writeToUser("mi1", user2._id, ccid);
    const chat = Chat.collection.findOne();
    chai.assert.deepEqual({
      create_date: chat.create_date,
      type: "private",
      id: user2._id,
      logons: 2,
      child_chat: true,
      issuer: { id: user1._id, username: user1.username },
      what: "child chat text"
    }, chat);
  });

  it("should not allow a user (not admin, not child_chat_exempt) to send a freeform text to a child_chat", function() {
    const user1 = TestHelpers.createUser();
    const user2 = TestHelpers.createUser({ roles: ["personal_chat", "child_chat"] });
    self.loggedonuser = user1;
    Chat.writeToUser("mi1", user2._id, "freeform text");
    chai.assert.equal(Chat.collection.find().count(), 0);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, self.loggedonuser._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "?");
  });

  it("should publish private chats to both senders and receivers", function(done) {
    const user1 = TestHelpers.createUser();
    const user2 = TestHelpers.createUser();
    self.loggedonuser = user1;
    Chat.writeToUser("mi1", user2._id, "The text 1");
    self.loggedonuser = user2;
    Chat.writeToUser("mi1", user1._id, "The text 2");
    new Promise((resolve) => {
      self.loggedonuser = user1;
      const collector = new PublicationCollector({ userId: user1._id });
      collector.collect("chat", collections => {
        chai.assert.equal(collections.chat.length, 2);
        collections.chat.forEach(c => delete c.create_date);
        chai.assert.sameDeepMembers([{
          type: "private",
          id: user1._id,
          loggedon: 2,
          issuer: { id: user2._id, username: user2.username },
          what: "The text 2"
        },
          {
            type: "private",
            id: user2._id,
            loggedon: 2,
            issuer: { id: user1._id, username: user1.username },
            what: "The text 1"
          }], collections.chat);
        resolve();
      })
        .then(() => {
          return new Promise((resolve) => {
            self.loggedonuser = user2;
            const collector = new PublicationCollector({ userId: user2._id });
            collector.collect("chat", collections => {
              chai.assert.equal(collections.chat.length, 2);
              collections.chat.forEach(c => delete c.create_date);
              chai.assert.sameDeepMembers([{
                type: "private",
                id: user1._id,
                issuer: { id: user2._id, username: user2.username },
                what: "The text 2"
              },
                {
                  type: "private",
                  id: user2._id,
                  issuer: { id: user1._id, username: user1.username },
                  what: "The text 1"
                }], collections.chat);
              resolve();
            });
          });
        })
        .then(done);
    });
  });

  it("should delete private chats when both users log off", function() {
    const user1 = TestHelpers.createUser();
    const user2 = TestHelpers.createUser();
    self.loggedonuser = user1;
    Chat.writeToUser("mi1", user2._id, "The text 1");
    self.loggedonuser = user2;
    Chat.writeToUser("mi1", user1._id, "The text 2");

    Chat.logoutHook(user1._id);
    const chats1 = Chat.collection.find().fetch();
    chai.assert.equal(chats1.length, 2);
    chai.assert.equal(1, chats1[0].loggedon);
    chai.assert.equal(1, chats1[1].loggedon);

    Chat.loginHook(user1);
    const chats = Chat.collection.find().fetch();
    chai.assert.equal(chats.length, 2);
    chai.assert.equal(2, chats[0].loggedon);
    chai.assert.equal(2, chats[1].loggedon);

    Chat.logoutHook(user2._id);
    const chats3 = Chat.collection.find().fetch();
    chai.assert.equal(chats3.length, 2);
    chai.assert.equal(3, chats1[0].loggedon);
    chai.assert.equal(3, chats1[1].loggedon);

    Chat.logoutHook(user1._id);
    chai.assert.equal(Chat.collection.find().count(), 0);
  });

  it("will mark loggedon field as 1 if a users writes to himself", function() {
    self.loggedonuser = TestHelpers.createUser();
    Chat.writeToUser("mi1", self.loggedonuser._id, "The text 1");
    const chat = Chat.collection.findOne();
    chai.assert.deepEqual({
      create_date: chat.creat_date,
      type: "private",
      id: user1._id,
      loggedon: 1,
      issuer: { id: user1._id, username: user1.username },
      what: "The text 1"
    }, chat);
  });
});