import { Template } from 'meteor/templating';

import './login.html';

Template.login.onCreated(function(){
    this.error = new ReactiveVar();
});

Template.login.events({
    "click input[value='Login']": function(event, templateInstance) {
        event.preventDefault();
        var email = $('[name=email]').val();
        var password = $('[name=password]').val();
        Meteor.loginWithPassword(email, password, function(error){
            templateInstance.error.set(error);
        });
    },
    "click input[value='Register']": function(event) {
        event.preventDefault();
        var email = $('[name=email]').val();
        var password = $('[name=password]').val();
        var firstname = $('[name=firstname]').val();
        var lastname = $('[name=lastname]').val();
        var legacyusername = $('[name=legacyusername]').val();
        var legacypassword = $('[name=legacypassword]').val();
        Accounts.createUser({
            email: email,
            password: password,
            profile: {
                firstname: firstname,
                lastname: lastname,
                legacy: {
                    username: legacyusername,
                    password: legacypassword
                }
            }
        }, function(error){
            templateInstance.error.set(error);
        });
    }
});

Template.login.helpers({
    Error() { return Template.instance().error.get(); }
});