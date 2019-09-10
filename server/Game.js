import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
const Game = new Mongo.Collection("game");

Meteor.publish("game", function tasksPublication() {
  return Game.find({
    $or: [
      { "black.name": Meteor.user().username },
      { "white.name": Meteor.user().username }
    ]
  });
});

Meteor.methods({
  "game-messages.insert"(label, black) {
    check(label, String);
    check(black, String);
    // Make sure the user is logged in before inserting a task
    if (!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    let game = {
      status: "scratch-game",
      owner: "djlogan",
      white: { name: Meteor.user().username, rating: "2800" },
      black: { name: black, rating: "1400" },
      moves: []
    };
    Game.insert(game);
  },
  "game-move.insert"(Id, move) {
    check(Id, String);
    check(move, String);

    Game.update(
      { _id: Id },
      {
        $push: { moves: move }
      }
    );
    Game.update(
      { _id: Id },
      {
        $push: { actions: { moves: move } }
      }
    );
  },

  "execute-game-action"(Id, actionType, action) {    
    check(action, String);
    check(Id, String);
    check(actionType, String);
    if(action === "takeBack")
    {
      if (actionType === "accept") {
        Game.update({ _id: Id }, { $pop: { moves: 1 } });
        Game.update(
          { _id: Id },
          {
            $push: { actions: { accepted: action } }
          }
        );
      } else if (actionType === "request") {        
        Game.update(
          { _id: Id },
          {
            $push: { actions: { request: action } }
          }
        );
      } else {
        Game.update(
          { _id: Id },
          {
            $push: { actions: { rejected: action } }
          }
        );
      }
    }
    else if(action === "draw")
    {
      if (actionType === "accept") {
       Game.update(
        { _id: Id },
        {
          $push: { actions: { accepted: action } }
        }
      );
    } else if (actionType === "request") {        
      Game.update(
        { _id: Id },
        {
          $push: { actions: { request: action } }
        }
      );
    } else {
      Game.update(
        { _id: Id },
        {
          $push: { actions: { rejected: action } }
        }
      );
    }
      
    }else if(action === "resign"){
      if (actionType === "request") {        
       Game.update(
         { _id: Id },
         {
           $push: { actions: { request: action } }
         }
       );
     }  
    }else if(action === "abort"){
      if (actionType === "request"){        
       Game.update(
         { _id: Id },
         {
           $push: { actions: { request: action } }
         }
       );
     }  
    }  
  }
});