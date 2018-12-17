var net = require('net');

export class LegacyUser {
    constructor(user) {
        this.user = user;
        this.login();
    }
}

LegacyUser.prototype.login = function() {
    var us = this;

    Meteor.publish(us.user.username, function() {
        var publish = this;

        publish.onStop(() => {
            us.socket.end();
        });

        us.socket = net.createConnection(23, 'chessclub.com', function() {
            console.log('connected');
            publish.added(us.user.username, 'id', {a: 'b'});
            publish.ready();
        });

        us.socket.on('data', function(data) {
            console.log('data:' + data);
            publish.changed(username, 'id', {field: data});
            publish.ready();
        });

        us.socket.on('error', function(e) {
            console.log('Error ' + e.code + ' occurred\n');
            publish.changed(us.user.username, {error: e.code});
            publish.ready();
        });
    });
};

//
// Meteor.publish('custom-publication', function() {
//   // We can add documents one at a time
//   this.added('collection-name', 'id', {field: 'values'});
//
//   // We can call ready to indicate to the client that the initial document sent has been sent
//   this.ready();
//
//   // We may respond to some 3rd party event and want to send notifications
//   Meteor.setTimeout(() => {
//     // If we want to modify a document that we've already added
//     this.changed('collection-name', 'id', {field: 'new-value'});
//
//     // Or if we don't want the client to see it any more
//     this.removed('collection-name', 'id');
//   });
//
//   // It's very important to clean up things in the subscription's onStop handler
//   this.onStop(() => {
//     // Perhaps kill the connection with the 3rd party server
//   });
// });
//
LegacyUser.prototype.logout = function() {

};
