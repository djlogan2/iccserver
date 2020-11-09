import chai from "chai";
import { TestHelpers } from "../imports/server/TestHelpers";
import { Chat } from "./Chat";
import { SystemConfiguration } from "../imports/collections/SystemConfiguration";
import { PublicationCollector } from "meteor/johanbrook:publication-collector";
import { Users } from "../imports/collections/users";

describe("private group chats", function() {
  const self = TestHelpers.setupDescribe.apply(this);

  //Chat.createRoom(mi, room_name, private)
  it("should return client message if a new room is requested with same name as a public room", function() {
    const admin = TestHelpers.createUser({ roles: ["create_room"] });
    const user = TestHelpers.createUser();
    self.loggedonuser = admin;
    Chat.createRoom("mi1", "Public room");
    chai.assert.equal(1, Chat.roomCollection.find().count());
    self.loggedonuser = user;
    Chat.createRoom("mi2", "Public room", true);
    chai.assert.equal(1, Chat.roomCollection.find().count());
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "ROOM_ALREADY_EXISTS");
    // Let's go ahead and make sure a duplicate public room can't be created either
    self.loggedonuser = admin;
    Chat.createRoom("mi3", "Public room");
    chai.assert.equal(1, Chat.roomCollection.find().count());
    chai.assert.isTrue(self.clientMessagesSpy.calledTwice);
    chai.assert.equal(self.clientMessagesSpy.args[1][2], "ROOM_ALREADY_EXISTS");
  });

  it("should return client message if a new room is requested and user is not in create_private_room role", function() {
    self.loggedonuser = TestHelpers.createUser();
    Users.removeUserFromRoles(self.loggedonuser, "create_private_room");
    Chat.createRoom("mi1", "My Room", true);
    chai.assert.equal(0, Chat.roomCollection.find().count());
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_AUTHORIZED");
  });

  it("should return a client message if the user is in the child chat role (children cannot create rooms", function() {
    self.loggedonuser = TestHelpers.createUser();
    Users.addUserToRoles(self.loggedonuser, "child_chat");
    Chat.createRoom("mi1", "My Room", true);
    chai.assert.equal(0, Chat.roomCollection.find().count());
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_AUTHORIZED");
  });

  it("should create a new room if user is in create_private_room role", function() {
    self.loggedonuser = TestHelpers.createUser();
    Chat.createRoom("mi1", "My Room", true);
    chai.assert.equal(1, Chat.roomCollection.find().count());
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    const room = Chat.roomCollection.findOne();
    chai.assert.deepEqual(
      {
        _id: room._id,
        name: "My Room",
        owner: self.loggedonuser._id,
        public: false,
        isolation_group: "public",
        members: [{ id: self.loggedonuser._id, username: self.loggedonuser.username }],
        invited: []
      },
      room
    );
  });

  //Chat.inviteToRoom(mi, chatroom_id, user_id_to_invite)
  it("should return a client message if user is not logged on", function() {
    const loggedoffguy = TestHelpers.createUser({ login: false });
    self.loggedonuser = TestHelpers.createUser();
    const room_id = Chat.createRoom("mi1", "My Room", true);
    chai.assert.equal(1, Chat.roomCollection.find().count());
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    const room = Chat.roomCollection.findOne();
    chai.assert.deepEqual(
      {
        _id: room_id,
        name: "My Room",
        owner: self.loggedonuser._id,
        public: false,
        isolation_group: "public",
        members: [{ id: self.loggedonuser._id, username: self.loggedonuser.username }],
        invited: []
      },
      room
    );
    Chat.inviteToRoom("mi2", room_id, loggedoffguy._id);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "INVALID_USER");
    const room2 = Chat.roomCollection.findOne();
    chai.assert.equal(0, room2.invited.length);
  });

  it("should return a client message and remove them from the request list if logged on user logs off", function() {
    const invited = TestHelpers.createUser();
    self.loggedonuser = TestHelpers.createUser();
    const room_id = Chat.createRoom("mi1", "My Room", true);
    chai.assert.equal(1, Chat.roomCollection.find().count());
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    const room = Chat.roomCollection.findOne();
    chai.assert.deepEqual(
      {
        _id: room_id,
        name: "My Room",
        owner: self.loggedonuser._id,
        public: false,
        isolation_group: "public",
        members: [{ id: self.loggedonuser._id, username: self.loggedonuser.username }],
        invited: []
      },
      room
    );
    Chat.inviteToRoom("mi2", room_id, invited._id);
    const room2 = Chat.roomCollection.findOne();
    chai.assert.sameDeepMembers(
      [{ id: invited._id, username: invited.username, message_identifier: "mi2" }],
      room2.invited
    );
    Chat.chatLogoutHook(invited._id);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0], self.loggedonuser._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "USER_LOGGED_OFF");
    const room3 = Chat.roomCollection.findOne();
    chai.assert.equal(room3.invited.length, 0);
  });

  it("should return a client message if invitee is in the child_chat role (children cannot be in private rooms)", function() {
    const invited = TestHelpers.createUser();
    Users.addUserToRoles(invited, "child_chat");
    self.loggedonuser = TestHelpers.createUser();
    const room_id = Chat.createRoom("mi1", "My Room", true);
    chai.assert.equal(1, Chat.roomCollection.find().count());
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    const room = Chat.roomCollection.findOne();
    chai.assert.deepEqual(
      {
        _id: room._id,
        name: "My Room",
        owner: self.loggedonuser._id,
        public: false,
        isolation_group: "public",
        members: [{ id: self.loggedonuser._id, username: self.loggedonuser.username }],
        invited: []
      },
      room
    );
    Chat.inviteToRoom("mi2", room_id, invited._id);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "INVALID_USER");
    const room3 = Chat.roomCollection.findOne();
    chai.assert.equal(room3.invited.length, 0);
  });

  it("should add the user to the private room request list otherwise", function() {
    /*already handled in other tests*/
  });

  it("should return an error if the room is a public room", function() {
    const victim = TestHelpers.createUser();
    self.loggedonuser = TestHelpers.createUser({ roles: ["create_room"] });
    const public_room_id = Chat.createRoom("mi1", "Ze public room");
    Chat.inviteToRoom("mi2", public_room_id, victim._id);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_ALLOWED_TO_JOIN_ROOM");
    const room2 = Chat.roomCollection.findOne();
    chai.assert.equal(0, room2.invited.length);
  });

  //Chat.writeToRoom(mi, room_id, txt)
  it("should return an error if the room is a private room and user is not joined", function() {
    self.loggedonuser = TestHelpers.createUser();
    const abuser = TestHelpers.createUser();

    const private_room = Chat.createRoom("mi1", "My Room", true);

    self.loggedonuser = abuser;
    Chat.writeToRoom("mi2", private_room, "I am abuser!");
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_ALLOWED_TO_CHAT_IN_ROOM");
    const room2 = Chat.roomCollection.findOne();
    chai.assert.equal(0, room2.invited.length);
    chai.assert.equal(0, Chat.collection.find().count());
  });

  //Chat.joinRoom(mi, chatroom_id);
  it("should return an error if id does not exist", function() {
    self.loggedonuser = TestHelpers.createUser();
    Chat.joinRoom("mi1", "mickeymouse");
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "INVALID_ROOM");
  });

  it("should return an error if it's a private room and user was not invited", function() {
    self.loggedonuser = TestHelpers.createUser();
    const abuser = TestHelpers.createUser();

    const private_room = Chat.createRoom("mi1", "My Room", true);

    self.loggedonuser = abuser;
    Chat.joinRoom("mi2", private_room);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_ALLOWED_TO_JOIN_ROOM");
    const room2 = Chat.roomCollection.findOne();
    chai.assert.equal(0, room2.invited.length);
  });

  it("should return an error if the user is in the child_chat role (children cannot join private rooms)", function() {
    self.loggedonuser = TestHelpers.createUser();
    const child = TestHelpers.createUser();

    const private_room = Chat.createRoom("mi1", "My Room", true);
    Chat.inviteToRoom("mi2", private_room, child._id);

    Users.addUserToRoles(child, "child_chat");

    // Fake this out, since a user being added to child_chat should be removed from all things illegal at time of setting
    Chat.roomCollection.update(
      { id: private_room },
      {
        $set: { invited: [{ id: child._id, username: child.username, message_identifier: "mi2" }] }
      }
    );

    self.loggedonuser = child;
    Chat.joinRoom("mi2", private_room);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_ALLOWED_TO_JOIN_ROOM");
    const room2 = Chat.roomCollection.findOne();
    chai.assert.equal(0, room2.invited.length);
  });

  it("should allow an invited user to join the private room", function() {
    const firstguy = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser();

    self.loggedonuser = firstguy;
    const private_room = Chat.createRoom("mi1", "My Room", true);
    Chat.inviteToRoom("mi2", private_room, otherguy._id);
    const room = Chat.roomCollection.findOne();
    chai.assert.sameDeepMembers(
      [{ id: otherguy._id, username: otherguy.username, message_identifier: "mi2" }],
      room.invited
    );

    self.loggedonuser = otherguy;
    Chat.joinRoom("mi2", private_room);
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    const room2 = Chat.roomCollection.findOne();
    chai.assert.equal(0, room2.invited.length);
    chai.assert.sameDeepMembers(
      [
        { id: firstguy._id, username: firstguy.username },
        { id: otherguy._id, username: otherguy.username }
      ],
      room2.members
    );
  });

  it("should allow an owner to join his own room", function() {
    const owner = TestHelpers.createUser();
    const dude = TestHelpers.createUser();
    self.loggedonuser = owner;
    const room_id = Chat.createRoom("mi1", "My Room", true);
    chai.assert.equal(1, Chat.roomCollection.find().count());
    Chat.inviteToRoom("mi2", room_id, dude._id);

    self.loggedonuser = dude;
    Chat.joinRoom("mi3", room_id);

    self.loggedonuser = owner;
    Chat.leaveRoom("mi4", room_id);

    const room = Chat.roomCollection.findOne();
    chai.assert.isEmpty(room.invited);
    chai.assert.sameDeepMembers([{ id: dude._id, username: dude.username }], room.members);

    Chat.joinRoom("mi5", room_id);
    const room2 = Chat.roomCollection.findOne();
    chai.assert.isEmpty(room.invited);
    chai.assert.sameDeepMembers(
      [{ id: dude._id, username: dude.username }, { id: owner._id, username: owner.username }],
      room2.members
    );

    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
  });

  //Chat.deleteRoom(mi, chatroom_id);
  it("should allow the owner should be able to delete a private room", function() {
    const owner = TestHelpers.createUser();
    const dude = TestHelpers.createUser();
    self.loggedonuser = owner;
    const room_id = Chat.createRoom("mi1", "My Room", true);
    chai.assert.equal(1, Chat.roomCollection.find().count());
    Chat.inviteToRoom("mi2", room_id, dude._id);

    self.loggedonuser = dude;
    Chat.joinRoom("mi3", room_id);

    self.loggedonuser = owner;
    Chat.deleteRoom("mi4", room_id);
    chai.assert.equal(0, Chat.roomCollection.find().count());
    chai.assert.equal(0, Chat.collection.find().count());
  });

  it("should return a message if a non-owner tries to delete a private room", function() {
    const owner = TestHelpers.createUser();
    const dude = TestHelpers.createUser();
    self.loggedonuser = owner;
    const room_id = Chat.createRoom("mi1", "My Room", true);
    chai.assert.equal(1, Chat.roomCollection.find().count());
    Chat.inviteToRoom("mi2", room_id, dude._id);

    self.loggedonuser = dude;
    Chat.joinRoom("mi3", room_id);

    Chat.deleteRoom("mi4", room_id);
    chai.assert.equal(1, Chat.roomCollection.find().count());
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "INVALID_ROOM");
  });

  //Chat.leaveRoom(mi, chatroom_id, user_to_evict);
  it("should delete an outstanding join request if one is active for a user and the owner is doing the deleting", function() {
    const firstguy = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser();

    self.loggedonuser = firstguy;
    const private_room = Chat.createRoom("mi1", "My Room", true);
    Chat.inviteToRoom("mi2", private_room, otherguy._id);
    const room = Chat.roomCollection.findOne();
    chai.assert.sameDeepMembers(
      [{ id: otherguy._id, username: otherguy.username, message_identifier: "mi2" }],
      room.invited
    );

    Chat.leaveRoom("mi2", private_room, otherguy._id);
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    const room2 = Chat.roomCollection.findOne();
    chai.assert.equal(0, room2.invited.length);
    chai.assert.sameDeepMembers([{ id: firstguy._id, username: firstguy.username }], room2.members);
  });

  it("should allow a joined user to leave a private room", function() {
    const firstguy = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser();

    self.loggedonuser = firstguy;
    const private_room = Chat.createRoom("mi1", "My Room", true);
    Chat.inviteToRoom("mi2", private_room, otherguy._id);
    const room = Chat.roomCollection.findOne();
    chai.assert.sameDeepMembers(
      [{ id: otherguy._id, username: otherguy.username, message_identifier: "mi2" }],
      room.invited
    );

    self.loggedonuser = otherguy;
    Chat.joinRoom("mi2", private_room);
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    const room2 = Chat.roomCollection.findOne();
    chai.assert.equal(0, room2.invited.length);
    chai.assert.sameDeepMembers(
      [
        { id: firstguy._id, username: firstguy.username },
        { id: otherguy._id, username: otherguy.username }
      ],
      room2.members
    );

    Chat.leaveRoom("mi3", private_room);
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    const room3 = Chat.roomCollection.findOne();
    chai.assert.equal(0, room3.invited.length);
    chai.assert.sameDeepMembers([{ id: firstguy._id, username: firstguy.username }], room3.members);
  });

  it("should allow the owner to evict a joined user", function() {
    const firstguy = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser();

    self.loggedonuser = firstguy;
    const private_room = Chat.createRoom("mi1", "My Room", true);
    Chat.inviteToRoom("mi2", private_room, otherguy._id);
    const room = Chat.roomCollection.findOne();
    chai.assert.sameDeepMembers(
      [{ id: otherguy._id, username: otherguy.username, message_identifier: "mi2" }],
      room.invited
    );

    self.loggedonuser = otherguy;
    Chat.joinRoom("mi2", private_room);
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    const room2 = Chat.roomCollection.findOne();
    chai.assert.equal(0, room2.invited.length);
    chai.assert.sameDeepMembers(
      [
        { id: firstguy._id, username: firstguy.username },
        { id: otherguy._id, username: otherguy.username }
      ],
      room2.members
    );

    self.loggedonuser = firstguy;
    Chat.leaveRoom("mi3", private_room, otherguy._id);
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    const room3 = Chat.roomCollection.findOne();
    chai.assert.equal(0, room3.invited.length);
    chai.assert.sameDeepMembers([{ id: firstguy._id, username: firstguy.username }], room3.members);
  });

  it("should issue a client message if owner tried to a evict a user that is not joined", function() {
    const firstguy = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser();

    self.loggedonuser = firstguy;
    const private_room = Chat.createRoom("mi1", "My Room", true);

    Chat.leaveRoom("mi3", private_room, otherguy._id);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_IN_ROOM");
  });

  it("should issue a client message if user tries to leave a room he is not in", function() {
    const firstguy = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser();

    self.loggedonuser = firstguy;
    const private_room = Chat.createRoom("mi1", "My Room", true);
    const private_room2 = Chat.createRoom("mi1", "My room 2", true);
    Chat.inviteToRoom("mi2", private_room, otherguy._id);
    const room = Chat.roomCollection.findOne();
    chai.assert.sameDeepMembers(
      [{ id: otherguy._id, username: otherguy.username, message_identifier: "mi2" }],
      room.invited
    );

    self.loggedonuser = otherguy;
    Chat.joinRoom("mi2", private_room);
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    const room2 = Chat.roomCollection.findOne();
    chai.assert.equal(0, room2.invited.length);
    chai.assert.sameDeepMembers(
      [
        { id: firstguy._id, username: firstguy.username },
        { id: otherguy._id, username: otherguy.username }
      ],
      room2.members
    );

    Chat.leaveRoom("mi3", private_room2);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_IN_ROOM");
  });

  it("should issue a client message if user is not the owner", function() {
    const firstguy = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser();
    const victim = TestHelpers.createUser();

    self.loggedonuser = firstguy;
    const private_room = Chat.createRoom("mi1", "My Room", true);
    Chat.inviteToRoom("mi2", private_room, otherguy._id);
    Chat.inviteToRoom("mi3", private_room, victim._id);

    self.loggedonuser = otherguy;
    Chat.joinRoom("mi4", private_room);
    self.loggedonuser = victim;
    Chat.joinRoom("mi5", private_room);
    const room2 = Chat.roomCollection.findOne();
    chai.assert.equal(0, room2.invited.length);
    chai.assert.equal(3, room2.members.length);

    self.loggedonuser = otherguy;
    Chat.leaveRoom("mi3", private_room, victim._id);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_THE_OWNER");
  });

  it("should only allow users to create 'SystemConfiguration.maximumPrivateRooms' number of rooms", function() {
    self.loggedonuser = TestHelpers.createUser();
    for (let x = 0; x < SystemConfiguration.maximumPrivateRoomCount(); x++)
      Chat.createRoom("mi" + x, "My room " + x, true);
    chai.assert.equal(5, Chat.roomCollection.find().count());
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    Chat.createRoom("mie", "My room - crash", true);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "TOO_MANY_PRIVATE_ROOMS");
  });

  //room stays if owner logs off if anyone else is in room
  //room is deleted when last user logs off
  it("should remain in the collection if logged on users are still in a private room when owner logs off", function() {
    const firstguy = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser();

    self.loggedonuser = firstguy;
    const private_room = Chat.createRoom("mi1", "My Room", true);
    Chat.inviteToRoom("mi2", private_room, otherguy._id);
    const room = Chat.roomCollection.findOne();
    chai.assert.sameDeepMembers(
      [{ id: otherguy._id, username: otherguy.username, message_identifier: "mi2" }],
      room.invited
    );

    self.loggedonuser = otherguy;
    Chat.joinRoom("mi2", private_room);
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    const room2 = Chat.roomCollection.findOne();
    chai.assert.equal(0, room2.invited.length);
    chai.assert.sameDeepMembers(
      [
        { id: firstguy._id, username: firstguy.username },
        { id: otherguy._id, username: otherguy.username }
      ],
      room2.members
    );

    Chat.chatLogoutHook(firstguy._id);

    const room3 = Chat.roomCollection.findOne();
    chai.assert.sameDeepMembers([{ id: otherguy._id, username: otherguy.username }], room3.members);

    Chat.chatLogoutHook(otherguy._id);
    chai.assert.equal(0, Chat.roomCollection.find().count());
  });

  it("should be deleted if the last person logged and joined to a private room logs off", function() {
    /* done in previous test*/
  });

  it("should publish private rooms to a user is an owner of even when he has left the room", function(done) {
    const owner = TestHelpers.createUser();
    const dude = TestHelpers.createUser();
    self.loggedonuser = owner;
    const room_id = Chat.createRoom("mi1", "My Room", true);
    chai.assert.equal(1, Chat.roomCollection.find().count());
    Chat.inviteToRoom("mi2", room_id, dude._id);

    self.loggedonuser = dude;
    Chat.joinRoom("mi3", room_id);

    self.loggedonuser = owner;
    Chat.leaveRoom("mi4", room_id);

    const collector = new PublicationCollector({ userId: owner._id });
    collector.collect("chat", collections => {
      chai.assert.equal(collections.rooms.length, 1);
      done();
    });
  });

  it("should publish private rooms a user is member of", function(done) {
    const owner = TestHelpers.createUser();
    const dude = TestHelpers.createUser();
    self.loggedonuser = owner;
    const room_id = Chat.createRoom("mi1", "My Room", true);
    Chat.createRoom("mi3", "My room 2", true);
    chai.assert.equal(2, Chat.roomCollection.find().count());
    Chat.inviteToRoom("mi2", room_id, dude._id);

    self.loggedonuser = dude;
    Chat.joinRoom("mi3", room_id);

    const collector = new PublicationCollector({ userId: dude._id });
    collector.collect("chat", collections => {
      chai.assert.equal(collections.rooms.length, 1);
      done();
    });
  });

  it("should publish private rooms a user is an invitee of", function(done) {
    const owner = TestHelpers.createUser();
    const dude = TestHelpers.createUser();
    self.loggedonuser = owner;
    const room_id = Chat.createRoom("mi1", "My Room", true);
    Chat.createRoom("mi3", "My room 2", true);
    chai.assert.equal(2, Chat.roomCollection.find().count());
    Chat.inviteToRoom("mi2", room_id, dude._id);

    self.loggedonuser = dude;
    const collector = new PublicationCollector({ userId: dude._id });
    collector.collect("chat", collections => {
      chai.assert.equal(collections.rooms.length, 1);
      done();
    });
  });

  it.skip("should not publish even public rooms to users in the child_chat role", function(done) {
    //
    // This is a valid test, but when no records are returned from a subscription,
    // collector.collect does not even get called. So it is unclear how to test this.
    //
    self.loggedonuser = TestHelpers.createUser();
    Users.addUserToRoles(self.loggedonuser, "create_room");
    Chat.createRoom("mi1", "Public room");
    Chat.createRoom("mi2", "Private room", true);
    self.loggedonuser = TestHelpers.createUser();
    Users.addUserToRoles(self.loggedonuser, "child_chat");
    const collector = new PublicationCollector({ userId: self.loggedonuser._id });
    collector.collect("chat", collections => {
      chai.assert.isTrue(!collections.rooms || !collections.rooms.length);
      done();
    });
  });

  it("should not allow a user in the child_chat role to join a public room", function() {
    self.loggedonuser = TestHelpers.createUser();
    Users.addUserToRoles(self.loggedonuser, "create_room");
    const pubroom = Chat.createRoom("mi1", "Public room");
    const prvroom = Chat.createRoom("mi2", "Private room", true);
    self.loggedonuser = TestHelpers.createUser();
    Users.addUserToRoles(self.loggedonuser, "child_chat");
    Chat.joinRoom("mi3", pubroom);
    Chat.joinRoom("mi4", prvroom);
    chai.assert.isTrue(self.clientMessagesSpy.calledTwice);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_ALLOWED_TO_JOIN_ROOM");
    chai.assert.equal(self.clientMessagesSpy.args[1][2], "NOT_ALLOWED_TO_JOIN_ROOM");
    const room = Chat.roomCollection.findOne({ _id: pubroom });
    if (!room.members) room.members = [];
    if (!room.invited) room.invited = [];
    chai.assert.equal(room.members.length, 1); // Just creator
    chai.assert.equal(room.invited.length, 0);
  });

  it("should delete all of the chats for a public room when it is deleted", function() {
    const firstguy = TestHelpers.createUser({ roles: ["create_room", "room_chat"] });
    const otherguy = TestHelpers.createUser();

    self.loggedonuser = firstguy;
    const public_room = Chat.createRoom("mi1", "Public room");

    self.loggedonuser = otherguy;
    Chat.joinRoom("mi3", public_room);
    Chat.writeToRoom("mi4", public_room, "The text");

    self.loggedonuser = firstguy;
    Chat.deleteRoom("mi5", public_room);

    chai.assert.equal(0, Chat.roomCollection.find().count());
    chai.assert.equal(0, Chat.collection.find().count());
  });

  it("should delete all of the chats for a private room when it is deleted", function() {
    const firstguy = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser();

    self.loggedonuser = firstguy;
    const private_room = Chat.createRoom("mi1", "My Room", true);
    Chat.inviteToRoom("mi2", private_room, otherguy._id);
    const room = Chat.roomCollection.findOne();
    chai.assert.sameDeepMembers(
      [{ id: otherguy._id, username: otherguy.username, message_identifier: "mi2" }],
      room.invited
    );

    self.loggedonuser = otherguy;
    Chat.joinRoom("mi3", private_room);
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    const room2 = Chat.roomCollection.findOne();
    chai.assert.equal(0, room2.invited.length);
    chai.assert.sameDeepMembers(
      [
        { id: firstguy._id, username: firstguy.username },
        { id: otherguy._id, username: otherguy.username }
      ],
      room2.members
    );
    Chat.writeToRoom("mi4", private_room, "The text");
    Chat.chatLogoutHook(firstguy._id);
    Chat.chatLogoutHook(otherguy._id);
    chai.assert.equal(0, Chat.roomCollection.find().count());
    chai.assert.equal(0, Chat.collection.find().count());
  });
});
