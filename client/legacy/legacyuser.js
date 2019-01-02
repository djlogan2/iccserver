import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

export class LegacyUser {
    constructor(user) {
        this.user = user;

        this.mongo = new Mongo.Collection('stcbot');
        this.subscription = Meteor.subscribe('stcbot');
        this.mongo.find().observe({
            added: function(msg) {
                console.log('here? ' + JSON.stringify(msg));
            }
        });

        Meteor.call('legacy.login', user, (err, res) => {
            if(err)
                alert(err);
        });
    }

    shutdown() {
    }

    messages() {
    }

    sendmessage(towhom, themessage) {
    }
}

