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

Template.mainmenu.onRendered(function(){
    initializeMenuListeners();
});

Template.mainmenu.helpers({
    MessageCount: function() { return 20; }
});

Template.mainmenu.events({
    "click #mm_logout": function(event){
        event.preventDefault();
        Meteor.logout();
    }
});