class LegacyUser {
    constructor(user) {
        this.user = user;
        this.msg = new ReactiveVar();
        Tracker.autorun(() => {
            Meteor.subscribe(user.username, this.msg);
        });
        Meteor.call('legacy.login', user);
    }
}
