import { Meteor } from 'meteor/meteor';
import crypto from "crypto";
import user_presence from "./user-presence";

const algorithm = 'aes-256-ctr';
const password = 'd6F3Efeq';

Meteor.startup(() => {
    // code to run on server at startup
    if ( Meteor.users.find().count() === 0 ) {
        var id = Accounts.createUser({
            email: 'icc@chessclub.com',
            password: 'administrator',
            profile: {
                firstname: 'Default',
                lastname: 'Administrator'
            }
        });
        Roles.addUsersToRoles(id, ['administrator'], Roles.GLOBAL_GROUP);
    }
});

function encrypt(text){
    var cipher = crypto.createCipher(algorithm,password);
    var crypted = cipher.update(text,'utf8','hex');
    crypted += cipher.final('hex');
    return crypted;
}

function decrypt(text){
    var decipher = crypto.createDecipher(algorithm,password);
    var dec = decipher.update(text,'hex','utf8');
    dec += decipher.final('utf8');
    return dec;
}

Accounts.onCreateUser(function(options, user){
    user.profile = {
        firstname: options.profile.firstname,
        lastname: options.profile.lastname
    };

    if(options.profile.legacy && (options.profile.legacy.username || options.profile.legacy.password))
        user.profile.legacy = {
            username: options.profile.legacy.username,
            password: encrypt(options.profile.legacy.password)
        };
    return user;
});
