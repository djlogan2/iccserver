import { ReactiveVar } from 'meteor/reactive-var';

export class LegacyUser {
    constructor(user) {
        this.user = user;
        this.msg = new ReactiveVar('message');
        Tracker.autorun(() => {
            Meteor.subscribe(user.username, this.msg);
        });
        Meteor.call('legacy.login', user, (err, res) => {
            if(err)
                alert(err);
            else
                alert('success');
        });
    }
}
