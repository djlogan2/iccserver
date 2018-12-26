import {check} from "meteor/check";

import net from "net";

let users = {};

const LEVEL1EMPTY = -1;
const LEVEL1ENDED = -2;
const CONTROL_Y = String.fromCharCode(25);
const CONTROL_Z = String.fromCharCode(26);

export class LegacyUser {
    constructor(user) {
        this.user = user;
        this.user.password = 'ca014dedjl';
        this.state = 'login';
        this.databuffer = '';
        this.packets_sent = 0;
        this.ctrl = false;
        this.level1 = LEVEL1EMPTY;
        this.level1Array = [];
        this.level2Array = [];
        this.currentLevel1 = '';
        this.currentLevel2 = '';
        //this.login();
    }
}

LegacyUser.prototype.login = function() {
    let us = this;

    Meteor.publish(us.user.username, function() {
        let publish = this;

        publish.onStop(() => {
            us.socket.end();
        });

        us.socket = new net.Socket();
        us.socket.connect({
            host: 'chessclub.com',
            port: 23
        });

        us.socket.setEncoding('utf8');

        setTimeout(function(){
            //console.log('why are we here');
        });

        us.socket.on('data', function(data) {
            console.log('socket.on data=[' + data.length + ']=' + data);
            us.databuffer += data;
            let packets = us.parse();
            console.log('packets[' + us.packets_sent + ']=' + JSON.stringify(packets));
            if(packets) {
                if(packets.level2Packets.length && packets.level2Packets[0].packet.indexOf('69 5') === 0) {
                    us.socket.write(us.user.password + '\n');
                } else {
                    publish.added(us.user.username, us.packets_sent++, packets);
                    publish.ready();
                }
            }
        });

        us.socket.on('error', function(e) {
            //console.log('Error ' + e.code + ' occurred\n');
            publish.changed(us.user.username, {error: e.code});
            publish.ready();
        });
    });
};

LegacyUser.prototype.logout = function() {

};

LegacyUser.prototype.parse = function() {
    //console.log('LegacyUser.prototype.parse');
    if(this.state === 'login') {
        if(this.databuffer.indexOf('login') !== -1) {
            this.databuffer = '';
            this.socket.write('level1=15\n');
            this.socket.write('level2settings=1111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111\n');
            this.socket.write(this.user.username + '\n');
            this.state = 'password';
            return;
        }
//    } else if(this.state === 'password') {
//        if(this.databuffer.indexOf('password') !== -1) {
//            this.databuffer = '';
//            this.socket.write(this.user.password + '\n');
//            this.state = 'loggedon';
//            return;
//        }
    }

    try {
        for (let bx = 0; bx < this.databuffer.length; bx++) {
            //console.log('0: this.databuffer.length=' + this.databuffer.length + ', bx=' + bx);
            let by = this.databuffer.charAt(bx);
            // noinspection FallThroughInSwitchStatementJS
            switch (by) {
                case CONTROL_Y: // ^Y
                    //console.log('1');
                    this.ctrl = true;
                    break;
                case '[':
                    //console.log('2');
                    if (this.ctrl) {
                        //console.log('start of level 1');
                        this.ctrl = false;
                        if (this.level1 > LEVEL1EMPTY) {
                            if (this.level1Array.length > this.level1) {
                                //console.log('[Replacing ' + this.currentLevel1 + ' to level1array[' + this.level1 + ']');
                                this.level1Array[this.level1] = this.currentLevel1;
                            } else {
                                //console.log('[Adding new level1Array: ' + this.currentLevel1);
                                this.level1Array.push(this.currentLevel1);
                            }
                        }
                        this.level1++;
                        if (this.level1Array.length > this.level1) {
                            this.currentLevel1 = this.level1Array[this.level1];
                            //console.log('[Setting currentLevel1 to ' + this.currentLevel1 + ' from level1Array[' + this.level1 + ']');
                        } else {
                            this.currentLevel1 = "";
                        }
                    } else if (this.level2) {
                        this.currentLevel2 += '[';
                    } else {
                        this.currentLevel1 += '[';
                    }
                    //console.log('level1array=' + JSON.stringify(this.level1Array) + ", level1=" + this.level1 + ", currentLevel1=" + this.currentLevel1);
                    break;
                // I think ^Z is when we "overflow ICC's buffer", which is a very bad thing. Using this hack will get you through
                // the hole (and processing continues), but it LOSES DATA!!
                case CONTROL_Z:
                    //console.log('3');
                    // ^Z Means ICC and their dumb decsions have hit us again. They had some sort of "buffer overrun",
                    // and can't send us the rest of our data, even though there should be no earthly reason that they have
                    // this problem. Nevertheless, we have to RESET and RECOVER.
                    this.ctrl = true;
                    this.level1 = LEVEL1EMPTY + 1;
                    //console.log('CONTROL_Z!');
                case ']':
                    //console.log('4');
                    if (this.ctrl) {
                        //console.log('end of level 1');
                        this.ctrl = false;
                        if (this.level1 === LEVEL1ENDED) {
                            //console.log(']End of level 1 - Theoretically we are on our way to logging out now, or at least getting no more packets.');
                            return; // We get here when we close our last packet (i.e. logging/logged off!)
                            //TODO: We have to figure out how to convey that, then clean up
                        }
                        if (this.level1Array.length > this.level1) {
                            this.level1Array[this.level1] = this.currentLevel1;
                            //console.log(']Setting currentLevel1 to ' + this.currentLevel1 + ' from level1Array[' + this.level1 + ']');
                        } else {
                            this.level1Array.push(this.currentLevel1);
                            //console.log(']Adding new level1Array: ' + this.currentLevel1);
                        }
                        if (--this.level1 === LEVEL1EMPTY) {
                            //console.log(']End of last level 1, returning packets');
                            this.databuffer = this.databuffer.substr(bx + 1);
                            let ret = {
                                level1Packets: this.level1Array,
                                level2Packets: this.level2Array
                            };
                            //console.log(']returning packets=' + JSON.stringify(ret));
                            this.level1Array = [];
                            this.level2Array = [];
                            return ret;
                        }
                        this.currentLevel1 = this.level1Array[this.level1];
                        //console.log(']currentLevel1=' + this.currentLevel1 + ', level1=' + this.level1);
                    } else if (this.level2) {
                        this.currentLevel2 += ']';
                    } else {
                        this.currentLevel1 += ']';
                    }
                    //console.log(']level1array=' + JSON.stringify(this.level1Array) + ", level1=" + this.level1 + ", currentLevel1=" + this.currentLevel1);
                    break;
                case '(':
                    //console.log('5');
                    if (this.ctrl) {
                        //console.log('start of level 2');
                        this.ctrl = false;
                        this.level2 = true;
                        this.currentLevel2 = "";
                    } else if (this.level2) {
                        this.currentLevel2 += '(';
                    } else {
                        this.currentLevel1 += '(';
                    }
                    break;
                case ')':
                    //console.log('6');
                    if (this.ctrl) {
                        //console.log('end of level 2');
                        this.ctrl = false;
                        this.level2 = false;
                        let hdrstr = (this.level1Array.length > 0 ? this.level1Array[0] : this.currentLevel1);
                        hdrstr.replace(/([\n\r])+$/, '');
                        let cl1 = hdrstr.split(/(\s+)/);
                        this.level2Array.push({l1key: this.level1, l1index: (cl1.length === 3 ? cl1[2] : null), packet: this.currentLevel2});
                        //console.log('level2Array=' + JSON.stringify(this.level2Array));
                    } else if (this.level2) {
                        this.currentLevel2 += ')';
                    } else {
                        this.currentLevel1 += ')';
                    }
                    break;
                default:
                    //console.log('7');
                    if (this.ctrl) {
                        if (this.level2) {
                            this.currentLevel2 += String.fromCharCode(25);
                        } else {
                            this.currentLevel1 += String.fromCharCode(25);
                        }
                        this.ctrl = false;
                    }
                    if (this.level2) {
                        this.currentLevel2 += by;
                    } else {
                        this.currentLevel1 += by;
                    }
                    break;
            }
        }
    } catch (e) {
        console.trace(e);
    }
};

Meteor.methods({
    'legacy.login': function(user) {
        check(user, {username: String});
        users[user.username] = new LegacyUser(user);
        users[user.username].login();
    }
});
