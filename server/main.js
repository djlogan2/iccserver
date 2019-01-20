import {Meteor} from 'meteor/meteor';
import {encrypt} from '../lib/server/encrypt';
import {LegacyUser} from "./LegacyUser";
import {Logger}     from 'meteor/ostrio:logger';
import {LoggerFile} from 'meteor/ostrio:loggerfile';

let log = new Logger();
(new LoggerFile(log)).enable();

const bound = Meteor.bindEnvironment((callback) => {callback();});
process.on('uncaughtException', (err) => {
    bound(() => {
        log.error("Server Crashed!", err);
        console.error(err.stack);
        process.exit(7);
    });
});

log.debug('test 1');
log.debug('test 2', {testme: 'yep'});
log.error('test 3');
log.error('test 4', {testme: 'yep'});

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
        const id3 = Accounts.createUser({
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

        Roles.addUsersToRoles(id3, ['administrator','legacy_login', 'developer'], Roles.GLOBAL_GROUP);
        Roles.addUsersToRoles(id3, standard_member_roles, Roles.GLOBAL_GROUP);
        //TODO: Remove this too
        const id2 = Accounts.createUser({
            username: 'd',
            email: 'd@c.com',
            password: 'd',
            profile: {
                firstname: 'David',
                lastname: 'Logan'
            }
        });
        Roles.addUsersToRoles(id2, ['administrator', 'developer'], Roles.GLOBAL_GROUP);
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
        log.debug('User left');
        LegacyUser.logout(self.userId);
    });

    log.debug('User has arrived');
    const user = Meteor.users.findOne({_id: this.userId});

    if(!(user.roles))
        Roles.addUsersToRoles(user._id, standard_guest_roles, Roles.GLOBAL_GROUP);

    log.debug('user record', user);
    log.debug('User is in leagy_login role', Roles.userIsInRole(user, 'legacy_login'));

    if(Roles.userIsInRole(user, 'legacy_login') &&
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
