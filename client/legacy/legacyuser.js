import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

//import { Tracker } from 'meteor/tracker';

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
        // Tracker.autorun(() => {
        //     Meteor.subscribe('stcbot', function(msg) {
        //         console.log(msg); //JSON.stringify(msg));
        //     });
        // });

        Meteor.call('legacy.login', user, (err, res) => {
            if(err)
                alert(err);
        });
    }
}

