import {Template} from "meteor/templating";
import {RealTime} from "../../lib/client/RealTime";

import './mainmenu.html';

function initializeMenuListeners(){
    // Main Menu sub menues handlers
    $("#mm-home").hover(function(){
        $("#submenu-home").show(100,"swing",function(){});
    });
    $("#no-roll").hover(function(){
        $("#submenu-home").hide(100,"swing",function(){});
    });
    $("#main-chess-area").hover(function(){
        $("#submenu-home").hide(100,"swing",function(){});
    });
    //Mobile ver. Main Menu button handler
    $("#mobile-menu-btn").click(function(){
        $("#menu-top").toggle(100,"swing",function(){});
        $("#menu-bottom").toggle(100,"swing",function(){});
    });
}

let messagesCollection = new Mongo.Collection('messages');

Template.mainmenu.onCreated(function(){
    this.subscribe('messages');
});

Template.mainmenu.onRendered(function(){
    initializeMenuListeners();
});

Template.mainmenu.helpers({
    MessageCount: function() {
        // TODO: Obviously we have to return just the unread count
        return 0; //messages.find().count();
    }
});

let rmi = 0;
Template.mainmenu.events({
    "click #mm_logout": function(event) {
        event.preventDefault();
        Meteor.logout();
    },
    "keyup #smithmove": function(event) {
        if(event.keyCode === 13) {
            event.preventDefault();
            let smith_move = $('#smithmove').val();
            if(smith_move === 'game_start')
                RealTime.collection.insert({"_id": rmi.toString(),"nid": rmi, "type": "game_start","message": {"white": {"name": "whitePlayer","rating": 1234,"time": 123},"black": {"name": "blackPlayer","rating": 2345,"time": 234}}});
            else
                alert(smith_move);
            $('#smithmove').val('');
        }
    }
});