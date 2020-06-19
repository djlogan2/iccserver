import chai from "chai";
import { compare, TestHelpers } from "../imports/server/TestHelpers";
import { Chat } from "./Chat";
import {SystemConfiguration} from "../imports/collections/SystemConfiguration";

describe("private group chats", function(){
  const self = TestHelpers.setupDescribe.apply(this);

  //Chat.createRoom(mi, room_name, private)
  it("should return client message if a new room is requested with same name as a public room", function(){
    const admin = TestHelpers.createUser({roles: ["create_room"]});
    const user = TestHelpers.createUser();
    self.loggedonuser = admin;
    Chat.createRoom("mi1", "Public room");
    chai.assert.equal(1, Chat.roomCollection.find().count());
    self.loggedonuser = user;
    Chat.createRoom("mi2", "Public room", true);
    chai.assert.equal(1, Chat.roomCollection.find().count());
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "DUPLICATE_ROOM_NAME");
    // Let's go ahead and make sure a duplicate public room can't be created either
    self.loggedonuser = admin;
    Chat.createRoom("mi3", "Public room");
    chai.assert.equal(1, Chat.roomCollection.find().count());
    chai.assert.isTrue(self.clientMessagesSpy.calledTwice);
    chai.assert.equal(self.clientMessagesSpy.args[1][2], "DUPLICATE_ROOM_NAME");
  });

  it("should return client message if a new room is requested and user is not in create_private_room role", function(){
    self.loggedonuser = TestHelpers.createUser();
    Roles.removeUsersFromRoles(self.loggedonuser, "create_private_room");
    Chat.createRoom("mi1", "My room", true);
    chai.assert.equal(0, Chat.roomCollection.find().count());
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_AUTHORIZED");
  });

  it("should return a client message if the user is in the child chat role (children cannot create rooms", function(){
    self.loggedonuser = TestHelpers.createUser();
    Roles.addUsersToRoles(self.loggedonuser, "child_chat");
    Chat.createRoom("mi1", "My room", true);
    chai.assert.equal(0, Chat.roomCollection.find().count());
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_AUTHORIZED");
  });

  it("should create a new room if user is in create_private_room role", function(){
    self.loggedonuser = TestHelpers.createUser();
    Chat.createRoom("mi1", "My room", true);
    chai.assert.equal(1, Chat.roomCollection.find().count());
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    const room = Chat.roomCollection.findOne();
    chai.assert.deepEqual({
      name: "My Room",
      owner: self.loggedonuser._id,
      public: false,
      isolation_group: "public",
      members: [{id: self.loggedonuser._id, username: self.loggedonuser.username}],
      invited: []
    }, room);
  });

  //Chat.inviteToRoom(mi, chatroom_id, user_id_to_invite)
  it("should return a client message if user is not logged on", function(){
    const victom = TestHelpers.createUser();
    const loggedoffguy = TestHelpers.createUser({login: false});
    self.loggedonuser = TestHelpers.createUser();
    const room_id = Chat.createRoom("mi1", "My room", true);
    chai.assert.equal(1, Chat.roomCollection.find().count());
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    const room = Chat.roomCollection.findOne();
    chai.assert.deepEqual({
      name: "My Room",
      owner: self.loggedonuser._id,
      public: false,
      isolation_group: "public",
      members: [{id: self.loggedonuser._id, username: self.loggedonuser.username}],
      invited: []
    }, room);
    Chat.inviteToRoom("mi2", "mickey_mouse", victim._id);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "?");
    Chat.inviteToRoom("mi2", room_id, loggedoffguy._id);
    chai.assert.isTrue(self.clientMessagesSpy.calledTwice);
    chai.assert.equal(self.clientMessagesSpy.args[1][2], "?");
    const room2 = Chat.roomCollection.findOne();
    chai.assert.equal(0, room2.invited.length);
  });

  it("should return a client message and remove them from the request list if logged on user logs off", function(){
    const invited = TestHelpers.createUser({login: false});
    self.loggedonuser = TestHelpers.createUser();
    const room_id = Chat.createRoom("mi1", "My room", true);
    chai.assert.equal(1, Chat.roomCollection.find().count());
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    const room = Chat.roomCollection.findOne();
    chai.assert.deepEqual({
      name: "My Room",
      owner: self.loggedonuser._id,
      public: false,
      isolation_group: "public",
      members: [{id: self.loggedonuser._id, username: self.loggedonuser.username}],
      invited: []
    }, room);
    Chat.inviteToRoom("mi2", room_id, invited._id);
    const room2 = Chat.roomCollection.findOne();
    chai.assert.sameDeepMembers([{id: invited._id, username: invited.username, message_identifier: "mi2"}],room2.invited);
    Chat.logoutHook(invited._id);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0], self.loggedonuser._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "?");
    const room3 = Chat.roomCollection.findOne();
    chai.assert.equal(room3.invited.length, 0);
  });

  it("should return a client message if invitee is in the child_chat role (children cannot be in private rooms)", function(){
    const invited = TestHelpers.createUser();
    Roles.addUsersToRoles(invited, "child_chat");
    self.loggedonuser = TestHelpers.createUser();
    const room_id = Chat.createRoom("mi1", "My room", true);
    chai.assert.equal(1, Chat.roomCollection.find().count());
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    const room = Chat.roomCollection.findOne();
    chai.assert.deepEqual({
      name: "My Room",
      owner: self.loggedonuser._id,
      public: false,
      isolation_group: "public",
      members: [{id: self.loggedonuser._id, username: self.loggedonuser.username}],
      invited: []
    }, room);
    Chat.inviteToRoom("mi2", room_id, invited._id);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "?");
    const room3 = Chat.roomCollection.findOne();
    chai.assert.equal(room3.invited.length, 0);
  });

  it("should add the user to the private room request list otherwise", function(){/*already handled in other tests*/});

  it("should return an error if the room is a public room", function(){
    const victim = TestHelpers.createUser();
    self.loggedonuser = TestHelpers.createUser({roles: ["create_room"]});
    const public_room_id = Chat.createRoom("mi1", "Ze public room", true);
    self.loggedonuser = TestHelpers.createUser();
    Chat.createRoom("mi1", "My room", true);
    chai.assert.equal(1, Chat.roomCollection.find().count());
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    const room = Chat.roomCollection.findOne();
    chai.assert.deepEqual({
      name: "My Room",
      owner: self.loggedonuser._id,
      public: false,
      isolation_group: "public",
      members: [{id: self.loggedonuser._id, username: self.loggedonuser.username}],
      invited: []
    }, room);
    Chat.inviteToRoom("mi2", public_room_id, victim._id);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "?");
    const room2 = Chat.roomCollection.findOne();
    chai.assert.equal(0, room2.invited.length);
  });

  //Chat.writeToRoom(mi, room_id, txt)
  it("should return an error if the room is a private room and user is not joined", function(){
    self.loggedonuser = TestHelpers.createUser();
    const abuser = TestHelpers.createUser();

    const private_room = Chat.createRoom("mi1", "My room", true);

    self.loggedonuser = abuser;
    Chat.writeToRoom("mi2", private_room, "I am abuser!");
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "?");
    const room2 = Chat.roomCollection.findOne();
    chai.assert.equal(0, room2.invited.length);
    chai.assert.equal(0, Chat.collection.find().count());
  });

  //Chat.joinRoom(mi, chatroom_id);
  it("should return an error if id does not exist", function(){
    self.loggedonuser = TestHelpers.createUser();
    Chat.joinRoom("mi1", "mickeymouse");
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "?");
  });

  it("should return an error if it's a private room and user was not invited", function(){
    self.loggedonuser = TestHelpers.createUser();
    const abuser = TestHelpers.createUser();

    const private_room = Chat.createRoom("mi1", "My room", true);

    self.loggedonuser = abuser;
    Chat.joinRoom("mi2", private_room);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "?");
    const room2 = Chat.roomCollection.findOne();
    chai.assert.equal(0, room2.invited.length);
  });

  it("should return an error if the user is in the child_chat role (children cannot join private rooms)", function(){
    self.loggedonuser = TestHelpers.createUser();
    const child = TestHelpers.createUser();
    Roles.addUsersToRoles(child, "child_chat");

    const private_room = Chat.createRoom("mi1", "My room", true);
    Chat.inviteToRoom("mi2", private_room, child._id);

    // Fake this out, since a user being added to child_chat should be removed from all things illegal at time of setting
    Chat.roomCollection.update({id: private_room},{$set: {invited: [{id: child._id, username: child.username, message_identifier: "mi2"}]}});

    self.loggedonuser = child;
    Chat.joinRoom("mi2", private_room);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "?");
    const room2 = Chat.roomCollection.findOne();
    chai.assert.equal(0, room2.invited.length);
  });

  it("should allow an invited user to join the private room", function(){
    const firstguy = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser();

    self.loggedonuser = firstguy;
    const private_room = Chat.createRoom("mi1", "My room", true);
    Chat.inviteToRoom("mi2", private_room, otherguy._id);
    const room = Chat.roomCollection.findOne();
    chai.assert.sameDeepMembers([{id: otherguy._id, username: otherguy.username, message_identifier: "mi2"}], room.invited);

    self.loggedonuser = otherguy;
    Chat.joinRoom("mi2", private_room);
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    const room2 = Chat.roomCollection.findOne();
    chai.assert.equal(0, room2.invited.length);
    chai.assert.sameDeepMembers([{id: firstguy._id, username: firstguy.username},{id: otherguy._id, username: otherguy.username}], room2.members);
  });

  it("should allow an owner to join his own room", function(){
    const owner = TestHelpers.createUser();
    const dude = TestHelpers.createUser();
    self.loggedonuser = owner;
    const room_id = Chat.createRoom("mi1", "My room", true);
    chai.assert.equal(1, Chat.roomCollection.find().count());
    Chat.inviteToRoom("mi2", room_id, dude._id);

    self.loggedonuser = dude;
    Chat.joinRoom("mi3", room_id);

    self.loggedonuser = owner;
    Chat.leaveRoom("mi4", room_id);

    const room = Chat.roomCollection.findOne();
    chai.assert.isEmpty(room.invited);
    chai.assert.sameDeepMembers([{id: dude._id, username: dude.username}], room.members);

    Chat.joinRoom("mi5", room_id);
    const room2 = Chat.roomCollection.findOne();
    chai.assert.isEmpty(room.invited);
    chai.assert.sameDeepMembers([{id: dude._id, username: dude.username},{id: owner._id, username: owner.username}], room2.members);

    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
  });

  //Chat.deleteRoom(mi, chatroom_id);
  it.skip("should just fail right now -- when do we want to allow users to delete rooms?", function(){chai.assert.fail("do me");});

  //Chat.leaveRoom(mi, chatroom_id, user_to_evict);
  it("should delete an outstanding join request if one is active for a user and the owner is doing the deleting", function(){
    const firstguy = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser();

    self.loggedonuser = firstguy;
    const private_room = Chat.createRoom("mi1", "My room", true);
    Chat.inviteToRoom("mi2", private_room, otherguy._id);
    const room = Chat.roomCollection.findOne();
    chai.assert.sameDeepMembers([{id: otherguy._id, username: otherguy.username, message_identifier: "mi2"}], room.invited);

    chat.leaveRoom("mi2", private_room, otherguy._id);
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    const room2 = Chat.roomCollection.findOne();
    chai.assert.equal(0, room2.invited.length);
    chai.assert.sameDeepMembers([{id: firstguy._id, username: firstguy.username}], room2.members);
  });

  it("should allow a joined user to leave a private room", function(){
    const firstguy = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser();

    self.loggedonuser = firstguy;
    const private_room = Chat.createRoom("mi1", "My room", true);
    Chat.inviteToRoom("mi2", private_room, otherguy._id);
    const room = Chat.roomCollection.findOne();
    chai.assert.sameDeepMembers([{id: otherguy._id, username: otherguy.username, message_identifier: "mi2"}], room.invited);

    self.loggedonuser = otherguy;
    Chat.joinRoom("mi2", private_room);
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    const room2 = Chat.roomCollection.findOne();
    chai.assert.equal(0, room2.invited.length);
    chai.assert.sameDeepMembers([{id: firstguy._id, username: firstguy.username},{id: otherguy._id, username: otherguy.username}], room2.members);

    Chat.leaveRoom("mi3", private_room);
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    const room3 = Chat.roomCollection.findOne();
    chai.assert.equal(0, room3.invited.length);
    chai.assert.sameDeepMembers([{id: firstguy._id, username: firstguy.username}], room3.members);
  });

  it("should allow the owner to evict a joined user", function(){
    const firstguy = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser();

    self.loggedonuser = firstguy;
    const private_room = Chat.createRoom("mi1", "My room", true);
    Chat.inviteToRoom("mi2", private_room, otherguy._id);
    const room = Chat.roomCollection.findOne();
    chai.assert.sameDeepMembers([{id: otherguy._id, username: otherguy.username, message_identifier: "mi2"}], room.invited);

    self.loggedonuser = otherguy;
    Chat.joinRoom("mi2", private_room);
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    const room2 = Chat.roomCollection.findOne();
    chai.assert.equal(0, room2.invited.length);
    chai.assert.sameDeepMembers([{id: firstguy._id, username: firstguy.username},{id: otherguy._id, username: otherguy.username}], room2.members);

    self.loggedonuser = firstguy;
    Chat.leaveRoom("mi3", private_room, otherguy._id);
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    const room3 = Chat.roomCollection.findOne();
    chai.assert.equal(0, room3.invited.length);
    chai.assert.sameDeepMembers([{id: firstguy._id, username: firstguy.username}], room3.members);
  });

  it("should issue a client message if owner tried to a evict a user that is not joined", function(){
    const firstguy = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser();

    self.loggedonuser = firstguy;
    const private_room = Chat.createRoom("mi1", "My room", true);

    Chat.leaveRoom("mi3", private_room, otherguy._id);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "?");
  });

  it("should issue a client message if user tries to leave a room he is not in", function(){
    const firstguy = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser();

    self.loggedonuser = firstguy;
    const private_room = Chat.createRoom("mi1", "My room", true);
    const private_room2 = Chat.createRoom("mi1", "My room 2", true);
    Chat.inviteToRoom("mi2", private_room, otherguy._id);
    const room = Chat.roomCollection.findOne();
    chai.assert.sameDeepMembers([{id: otherguy._id, username: otherguy.username, message_identifier: "mi2"}], room.invited);

    self.loggedonuser = otherguy;
    Chat.joinRoom("mi2", private_room);
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    const room2 = Chat.roomCollection.findOne();
    chai.assert.equal(0, room2.invited.length);
    chai.assert.sameDeepMembers([{id: firstguy._id, username: firstguy.username},{id: otherguy._id, username: otherguy.username}], room2.members);

    Chat.leaveRoom("mi3", private_room2);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "?");
  });

  it("should issue a client message if user is not the owner", function(){
    const firstguy = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser();
    const victim = TestHelpers.createUser();

    self.loggedonuser = firstguy;
    const private_room = Chat.createRoom("mi1", "My room", true);
    Chat.inviteToRoom("mi2", private_room, otherguy._id);
    Chat.inviteToRoom("mi3", private_room, victim._id);

    self.loggedonuser = otherguy;
    Chat.joinRoom("mi4", private_room);
    self.loggedonuser = victim;
    Chat.joinRoom("mi5", private_room);
    const room2 = Chat.roomCollection.findOne();
    chai.assert.equal(0, room2.invited.length);
    chai.assert.equal(3, room2.members.length);

    Chat.leaveRoom("mi3", private_room, victim._id);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_THE_OWNER");
  });

  it("should only allow users to create 'SystemConfiguration.maximumPrivateRooms' number of rooms", function(){
    self.loggedonuser = TestHelpers.createUser();
    for(let x = 0 ; x < SystemConfiguration.maximumPrivateRoomCount() ; x++)
      Chat.createRoom("mi" + x, "My room " + x, true);
    chai.assert.equal(5, Chat.roomCollection.find().count());
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    Chat.createRoom("mie", "My room - crash", true);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "?");
  });

  //room stays if owner logs off if anyone else is in room
  //room is deleted when last user logs off
  it("should remain in the collection if logged on users are still in a private room when owner logs off", function(){
    const firstguy = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser();

    self.loggedonuser = firstguy;
    const private_room = Chat.createRoom("mi1", "My room", true);
    Chat.inviteToRoom("mi2", private_room, otherguy._id);
    const room = Chat.roomCollection.findOne();
    chai.assert.sameDeepMembers([{id: otherguy._id, username: otherguy.username, message_identifier: "mi2"}], room.invited);

    self.loggedonuser = otherguy;
    Chat.joinRoom("mi2", private_room);
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    const room2 = Chat.roomCollection.findOne();
    chai.assert.equal(0, room2.invited.length);
    chai.assert.sameDeepMembers([{id: firstguy._id, username: firstguy.username},{id: otherguy._id, username: otherguy.username}], room2.members);

    Chat.logoutHook(firstguy._id);

    const room3 = Chat.roomCollection.findOne();
    chai.assert.sameDeepMembers([{id: firstguy._id, username: firstguy.username},{id: otherguy._id, username: otherguy.username}], room2.members);

    Chat.logoutHook(otherguy._id);
    chai.assert.equal(0, Chat.roomCollection.find().count());
  });

  it("should be deleted if the last person logged and joined to a private room logs off", function(){/* done in previous test*/});

  it("should publish private rooms a user is an owner of even when he has left the room", function(done){
    const owner = TestHelpers.createUser();
    const dude = TestHelpers.createUser();
    self.loggedonuser = owner;
    const room_id = Chat.createRoom("mi1", "My room", true);
    chai.assert.equal(1, Chat.roomCollection.find().count());
    Chat.inviteToRoom("mi2", room_id, dude._id);

    self.loggedonuser = dude;
    Chat.joinRoom("mi3", room_id);

    self.loggedonuser = owner;
    Chat.leaveRoom("mi4", room_id);

    const collector = new PublicationCollector({ userId: owner._id });
    collector.collect("rooms", collections => {
      chai.assert.equal(collections.rooms.length, 1);
      done();
    });
  });

  it("should publish private rooms a user is member of", function(){
    const owner = TestHelpers.createUser();
    const dude = TestHelpers.createUser();
    self.loggedonuser = owner;
    const room_id = Chat.createRoom("mi1", "My room", true);
    Chat.createRoom("mi3", "My room 2", true);
    chai.assert.equal(1, Chat.roomCollection.find().count());
    Chat.inviteToRoom("mi2", room_id, dude._id);

    self.loggedonuser = dude;
    Chat.joinRoom("mi3", room_id);

    const collector = new PublicationCollector({ userId: dude._id });
    collector.collect("rooms", collections => {
      chai.assert.equal(collections.rooms.length, 1);
      done();
    });
  });

  it("should publish private rooms a user is an invitee of", function(){
    const owner = TestHelpers.createUser();
    const dude = TestHelpers.createUser();
    self.loggedonuser = owner;
    const room_id = Chat.createRoom("mi1", "My room", true);
    Chat.createRoom("mi3", "My room 2", true);
    chai.assert.equal(1, Chat.roomCollection.find().count());
    Chat.inviteToRoom("mi2", room_id, dude._id);

    self.loggedonuser = dude;
    const collector = new PublicationCollector({ userId: dude._id });
    collector.collect("rooms", collections => {
      chai.assert.equal(collections.rooms.length, 1);
      done();
    });
  });

  it("should not publish even public rooms to users in the child_chat role", function(){chai.assert.fail("do me");});
  it("should not allow a user in the child_chat role to join a public room", function(){chai.assert.fail("do me");});
  it("should delete all of the chats for a public room when it is deleted", function(){chai.assert.fail("do me");});
  it("should delete all of the chats for a private room when it is deleted", function(){chai.assert.fail("do me");});
});

