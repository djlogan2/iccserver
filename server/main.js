import {Meteor} from 'meteor/meteor';
import {encrypt} from '../lib/server/encrypt';
import {LegacyUser} from "./LegacyUser";

const standard_guest_roles = [
    'login'
];

const standard_member_roles = [
    'login',
    'send_messages',
    'play_rated_games'
];

const fields_viewable_by_account_owner = {
    'username': 1,
    'email': 1,
    'profile.firstname': 1,
    'profile.lastname': 1,
    'profile.legacy.username': 1
};


Meteor.startup(() => {
    if (Meteor.users.find().count() === 0) {
        const id = Accounts.createUser({
            username: 'admin',
            email: 'icc@chessclub.com',
            password: 'administrator',
            profile: {
                firstname: 'Default',
                lastname: 'Administrator'
            }
        });
        Roles.addUsersToRoles(id, ['administrator'], Roles.GLOBAL_GROUP);
        Roles.addUsersToRoles(id, standard_member_roles, Roles.GLOBAL_GROUP);
        //TODO: Remove this too
        const id2 = Accounts.createUser({
            username: 'djlogan',
            email: 'djlogan@chessclub.com',
            password: 'ca014dedjl',
            profile: {
                firstname: 'David',
                lastname: 'Logan',
                legacy: {
                    username: 'stcbot',
                    password: 'ca014dedjl',
                    autologin: true
                }
            }
        });
        Roles.addUsersToRoles(id2, ['administrator','legacy_login'], Roles.GLOBAL_GROUP);
        Roles.addUsersToRoles(id2, standard_member_roles, Roles.GLOBAL_GROUP);
    }
});

//
// The fields an average user will see of his own record
//
Meteor.publish('userData', function () {
    if(!this.userId) return Meteor.users.find({_id: null});

    const self = this;

    this.onStop(function(){
        console.log(self.userId + ' has left');
    });

    console.log(self.userId + ' has arrived');
    const user = Meteor.users.findOne({_id: this.userId});

    if(!(user.roles))
        Roles.addUsersToRoles(user._id, standard_guest_roles, Roles.GLOBAL_GROUP);

    console.log(JSON.stringify(user));
    console.log(Roles.userIsInRole(user._id, 'legacy_login'));

    if(Roles.userIsInRole(user._id, 'legacy_login') &&
        user.profile &&
        user.profile.legacy &&
        user.profile.legacy.username &&
        user.profile.legacy.password &&
        user.profile.legacy.autologin) {
        LegacyUser.login(user);
    }

    return Meteor.users.find({_id: this.userId},{fields: fields_viewable_by_account_owner});
});

Accounts.onCreateUser(function (options, user) {
    if(options.profile) {
        user.profile = {
            firstname: options.profile.firstname || '?',
            lastname: options.profile.lastname || '?'
        };

        if (options.profile.legacy && (options.profile.legacy.username || options.profile.legacy.password))
            user.profile.legacy = {
                username: options.profile.legacy.username,
                password: encrypt(options.profile.legacy.password),
                autologin: true
            };
    }
    return user;
});
