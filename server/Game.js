import { Mongo } from "meteor/mongo";
import { Meteor } from "meteor/meteor";
import SimpleSchema from "simpl-schema";
import { check, Match } from "meteor/check";
import { getUnpackedSettings } from "http2";
import { stringLiteral } from "@babel/types";

const GameCollection = new Mongo.Collection("game");
/*
{
  "_id": "6T5c3bxoT4SCxBmT4",
  "status": "scratch-game",
  "owner": "djlogan",
  "white": {
    "name": "vimal",
    "rating": "2800"
  },
  "black": {
    "name": "test",
    "rating": "1400"
  },
  "moves": [
    "e3"
    
  ],
  "actions": [
    {
      "moves": "e3"
    },
    
    {
      "moves": "g3"
    }
  ]
}

*/
const playerSchema = new SimpleSchema({
  name: { type: String },
  userid: { type: String, regEx: SimpleSchema.RegEx.Id },
  rating: { type: SimpleSchema.Integer }
});

const actionSchema = new SimpleSchema({
  type: {type: String, allowedValues: ["move","takeBack","draw","resigned","aborted","game"]},
  value: {type: String},
  actionBy: {type: String}
});

const GameSchema = new SimpleSchema({
  startTime: {
    type: Date,
    autoValue: function() {
      return new Date();
    }
  },
  white: new SimpleSchema({
    name: { type: String },
    userid: { type: String, regEx: SimpleSchema.RegEx.Id },
    rating: { type: SimpleSchema.Integer },
    time: { type: SimpleSchema.Integer, autoValue: function(){return 1000;} }
  }),
  black: new SimpleSchema({
    name: { type: String },
    userid: { type: String, regEx: SimpleSchema.RegEx.Id },
    rating: { type: SimpleSchema.Integer },
    time: { type: SimpleSchema.Integer, autoValue: function(){return 2000;} }
  }),
  moves:[String],
  actions:[actionSchema]
});

GameCollection.attachSchema(GameSchema);


Meteor.publish("game", function tasksPublication() {
  return GameCollection.find({
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
      white: { name: Meteor.user().username,userid: Meteor.userId(), rating: "2800" },
      black: { name: black, userid: Meteor.userId(), rating : "1400" },
      moves: [],
      actions:[]
    };
    
    GameCollection.insert(game, (error, result) => {
      //The insert will fail, error will be set,
      //and result will be undefined or false because "copies" is required.
      //
      //The list of errors is available on `error.invalidKeys` or
      // by calling Books.simpleSchema().namedContext().validationErrors()
      if(error)
        console.log(error.invalidKeys);
      GameCollection.simpleSchema().namedContext().validationErrors()
    });
  },
  "game-move.insert"(Id, move,actionBy) {
    check(Id, String);
    check(move, String);
    check(actionBy, String);
     GameCollection.update(
      { _id: Id },
      {
        $push: { moves : move }
      }, (error, result) => {        
        //The list of errors is available on `error.invalidKeys` or 
        //by calling Books.simpleSchema().namedContext().validationErrors()
        if(error)
          console.log(error.invalidKeys);
        GameCollection.simpleSchema().namedContext().validationErrors()
      }); 
      GameCollection.update(
        { _id: Id },
        {
          $push: { actions: { type : "move",value: move,actionBy:actionBy }}
        }, (error, result) => {          
          if(error)
            console.log(error.invalidKeys);
          GameCollection.simpleSchema().namedContext().validationErrors()
        });    
  },
  "execute-game-action"(Id,actionType,action,actionBy) {  
   
    check(action, String);
    check(Id, String);
    check(actionType, String);
    check(actionBy, String);
  
    if(action === "takeBack" && actionType === "accepted"){
      console.log(GameCollection.update({ _id: Id }, { $pull: { moves: -1 } }));
    }
    if(action === "aborted" || action === "resigned")
    {
      GameCollection.update(
        { _id: Id },
        {
          $push: { actions: { type: action,value: "game",actionBy:actionBy } }
        }, (error, result) => {
          if(error)
            console.log(error.invalidKeys);
          GameCollection.simpleSchema().namedContext().validationErrors()
        });  
    }else{
      
      GameCollection.update(
        { _id: Id },
        {
          $push: { actions: { type: action,value:actionType,actionBy:actionBy } }
        }, (error, result) => {            
           if(error)
            console.log(error.invalidKeys);
             GameCollection.simpleSchema().namedContext().validationErrors()
        });
    }
  }
});



const Game = {
  /**
   *
   * @param {string} whiteName
   * @param {int} whiteRating
   * @param {string} blackName
   * @param {int} blackRating
   * @param {int} whiteTime
   * @param {int} blackTime
   * @returns {string} gameId
   */
  start(whiteName, whiteRating, blackName, blackRating, whiteTime, blackTime) {
    return;
  },
  end() {}
};