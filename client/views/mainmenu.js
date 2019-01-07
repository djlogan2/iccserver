import {Template} from "meteor/templating";

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

var messagesCollection = new Mongo.Collection('messages');
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

Template.mainmenu.events({
    "click #mm_logout": function(event){
        event.preventDefault();
        Meteor.logout();
    }
});