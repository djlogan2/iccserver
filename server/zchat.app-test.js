import { TestHelpers } from "../imports/server/TestHelpers";
import chai from "chai";

//
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
//      type: "game",
//      id: "game-id",
//      kibitz: true/false,
//[or]
//      type: "room",
//      id: "room-id",
//[or]
//      type: "private",
//      id: "user-id",
//---------------------------
//    issuer: {id: "xxx", username: "yyy"},
//    child_chat: true/false,
//    what: "the text"
// }
import {Chat} from "./Chat";

describe.skip("Chats", function() {
  const self = TestHelpers.setupDescribe.apply(this);
//createRoom

  it("should allow creating a room if user has 'create_room' role", function() {
    self.loggedonuser = TestHelpers.createUser({roles: ["create_room"]});
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
    self.loggedonuser = TestHelpers.createUser({roles: ["create_room"]});
    const room_id1 = Chat.createRoom("mi1", "The room");
    chai.assert.equal(Chat.collection.find().count(), 1);
    const room_id2 = Chat.createRoom("mi2", "The room");
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, p1._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "?");
  });

//deleteRoom
  it("should allow deleting a room if the user has 'create_room' role", function() {
    self.loggedonuser = TestHelpers.createUser({roles: ["create_room"]});
    const room_id = Chat.createRoom("mi1", "The room");
    chai.assert.equal(Chat.collection.find().count(), 1);
    Chat.deleteRoom("mi2", room_id);
    chai.assert.equal(Chat.collection.find().count(), 0);
  });

  it("should not allow deleting a room if the user does not have 'create_room' role", function() {
    self.loggedonuser = TestHelpers.createUser({roles: ["create_room"]});
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
    self.loggedonuser = TestHelpers.createUser({roles: ["create_room"]});
    const room_id = Chat.deleteRoom("mi1", "boogus");
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, p1._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "?");
  });

//writeToRoom
  it("should allow writing to a room if user has 'write_to_room' role", function() {
    self.loggedonuser = TestHelpers.createUser({roles: ["create_room", "write_to_room"]});
    const room_id = Chat.createRoom("mi1", "The room");
    chai.assert.equal(Chat.collection.find().count(), 1);
    Chat.writeToRoom("mi2", room_id, "The text");
    const chat = Chat.collection.findOne();
    chai.assert.sameDeepMembers([{id: self.loggedonuser.id, username: self.loggedonuser.username, text: "The text"}], chat.text);
  });
  it("should not allow writing to rooms if user does not have 'write_to_room' role", function() {
    chai.assert.fail("do me");
  });
  it("should automatically join the room if a text is written to, and user has 'join_room' role", function() {
    chai.assert.fail("do me");
  });
  it("should write an error if unable to join the room due to not being in 'join_room' role", function() {
    chai.assert.fail("do me");
  });
  it("should not allow a child to write text not from child_chat collection", function() {
    chai.assert.fail("do me");
  });
  it("should allow child_chat_exempt to write child_chat freeform", function() {
    chai.assert.fail("do me");
  });
  it("should allow child_chat_exempt to write child_chat id text", function() {
    chai.assert.fail("do me");
  });
  it("should allow normal user to write freeform, but it won't be child_chat friendly", function() {
    chai.assert.fail("do me");
  });
  it("should allow normal user to write a child_chat text", function() {
    chai.assert.fail("do me");
  });
  it("should only publish child_chat texts to a user in child_chat role", function() {
    chai.assert.fail("do me");
  });
  it("should publish chats from all rooms a user is in", function() {
    chai.assert.fail("do me");
  });
  it("should write message if trying to write to a non-existant room id", function() {
    chai.assert.fail("do me");
  });

//joinRoom
  it("should allow joining if user is in 'join_room' role", function() {
    chai.assert.fail("do me");
  });
  it("should write message if user is not in 'join_room' role", function() {
    chai.assert.fail("do me");
  });
  it("should write message if room id is non-existant", function() {
    chai.assert.fail("do me");
  });
  it("should ignore a request if the user is already in the room", function() {
    chai.assert.fail("do me");
  });

//leaveRoom
  it("should allow leaving the room if the user is in it", function() {
    chai.assert.fail("do me");
  });
  it("should ignore the user if not in the room", function() {
    chai.assert.fail("do me");
  });
  it("should write a message if room id is non-existant", function() {
    chai.assert.fail("do me");
  });

  //writePrivateText
  it("should allow an administrator to send a freeform text people without personal_chat", function() {
    chai.assert.fail("do me");
  });
  it("should allow administrators to receive freeform text from people without personal chat", function() {
    chai.assert.fail("do me");
  });
  it("should allow people with personal_chat to send to another user with personal_chat", function() {
    chai.assert.fail("do me");
  });
  it("should not allow a write if sender does not have personal_chat", function() {
    chai.assert.fail("do me");
  });
  it("should not allow a write if receiver does not have personal_chat", function() {
    chai.assert.fail("do me");
  });
  it("should allow a child_chat to write freeform text to a child_chat_exempt user", function() {
    chai.assert.fail("do me");
  });
  it("should allow a child_chat_exempt user to write freeform text to a child_chat user", function() {
    chai.assert.fail("do me");
  });
  it("should not allow a user (not admin, not child_chat_exempt) to send a freeform text to a child_chat", function() {
    chai.assert.fail("do me");
  });
});
