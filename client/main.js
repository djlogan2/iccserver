import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { LegacyUser } from './legacy/legacyuser';
import './main.html';

var ls = new LegacyUser({username: 'djlogan'});

Template.hello.onCreated(function helloOnCreated() {
    // counter starts at 0
    this.counter = new ReactiveVar(0);
    console.log('here!');
});

var legacy_server;

Template.hello.helpers({
    counter() {
        console.log('here2!');
        return Template.instance().counter.get();
    },
});

Template.hello.events({
    'click button'(event, templateInstance) {
    // increment the counter when button is clicked
        console.log('here3!');
        templateInstance.counter.set(templateInstance.counter.get() + 1);
    },
});


