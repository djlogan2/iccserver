export class LegacyUser {
    constructor(user) {
        this.user = user;

        Tracker.autorun(() => {
            Meteor.subscribe('stcbot', function(msg){
                console.log(msg); //JSON.stringify(msg));
            });
        });

        Meteor.call('legacy.login', user, (err, res) => {
            if(err)
                alert(err);
        });
    }
}

