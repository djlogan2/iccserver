import {check} from "meteor/check";

import net from "net";

let users = {};

const LEVEL1EMPTY = -1;
const LEVEL1ENDED = -2;
const CONTROL_Y = String.fromCharCode(25);
const CONTROL_Z = String.fromCharCode(26);

class LegacyUser {
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
        this.socket = new net.Socket();
    }

    login() {
        let user = this;

        Meteor.publish(user.user.username, function() {
            let publish = this;

            publish.onStop(() => {
                user.socket.end();
            });

            user.socket.connect({
                host: 'chessclub.com',
                port: 23
            });

            user.socket.setEncoding('utf8');

            setTimeout(function(){
                //TODO: What do we do here?
                console.log('server/legacyuser: why are we here');
            });

            user.socket.on('data', function(data) {
                user.databuffer += data;
                let packets = user.parse();
                if(packets) {
                    if(packets.level2Packets.length && packets.level2Packets[0].packet.indexOf('69 5') === 0) {
                        user.socket.write(user.user.password + '\n');
                    } else {
                        console.log('Sending: ' + JSON.stringify(packets));
                        publish.added(user.user.username, (user.packets_sent++).toString(), packets);
                        publish.ready();
                    }
                }
            });

            user.socket.on('error', function(e) {
                publish.added(user.user.username, (user.packets_sent++).toString(), {error: e.code});
                publish.ready();
            });
        });
    }

    logout() {

    }

    parse() {
        if(this.state === 'login') {
            if(this.databuffer.indexOf('login') !== -1) {
                this.databuffer = '';
                this.socket.write('level1=15\n');
                this.socket.write('level2settings=1111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111\n');
                this.socket.write(this.user.username + '\n');
                this.state = 'password';
                return;
            }
        }

        try {
            for (let bx = 0; bx < this.databuffer.length; bx++) {
                let by = this.databuffer.charAt(bx);
                // noinspection FallThroughInSwitchStatementJS
                switch (by) {
                    case CONTROL_Y: // ^Y
                        this.ctrl = true;
                        break;
                    case '[':
                        if (this.ctrl) {
                            this.ctrl = false;
                            if (this.level1 > LEVEL1EMPTY) {
                                if (this.level1Array.length > this.level1) {
                                    this.level1Array[this.level1] = this.currentLevel1;
                                } else {
                                    this.level1Array.push(this.currentLevel1);
                                }
                            }
                            this.level1++;
                            if (this.level1Array.length > this.level1) {
                                this.currentLevel1 = this.level1Array[this.level1];
                            } else {
                                this.currentLevel1 = "";
                            }
                        } else if (this.level2) {
                            this.currentLevel2 += '[';
                        } else {
                            this.currentLevel1 += '[';
                        }
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
                    case ']':
                        if (this.ctrl) {
                            this.ctrl = false;
                            if (this.level1 === LEVEL1ENDED) {
                                return; // We get here when we close our last packet (i.e. logging/logged off!)
                                //TODO: We have to figure out how to convey that, then clean up
                            }
                            if (this.level1Array.length > this.level1) {
                                this.level1Array[this.level1] = this.currentLevel1;
                            } else {
                                this.level1Array.push(this.currentLevel1);
                            }
                            if (--this.level1 === LEVEL1EMPTY) {
                                this.databuffer = this.databuffer.substr(bx + 1);
                                let ret = {
                                    level1Packets: this.level1Array,
                                    level2Packets: this.level2Array
                                };
                                this.level1Array = [];
                                this.level2Array = [];
                                return ret;
                            }
                            this.currentLevel1 = this.level1Array[this.level1];
                        } else if (this.level2) {
                            this.currentLevel2 += ']';
                        } else {
                            this.currentLevel1 += ']';
                        }
                        break;
                    case '(':
                        if (this.ctrl) {
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
                        if (this.ctrl) {
                            this.ctrl = false;
                            this.level2 = false;
                            let hdrstr = (this.level1Array.length > 0 ? this.level1Array[0] : this.currentLevel1);
                            hdrstr.replace(/([\n\r])+$/, '');
                            let cl1 = hdrstr.split(/(\s+)/);
                            this.level2Array.push({l1key: this.level1, l1index: (cl1.length === 3 ? cl1[2] : null), packet: this.currentLevel2});
                        } else if (this.level2) {
                            this.currentLevel2 += ')';
                        } else {
                            this.currentLevel1 += ')';
                        }
                        break;
                    default:
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
            this.databuffer = '';
        } catch (e) {
            console.trace(e);
        }
    }
}

Meteor.methods({
    'legacy.login': function(user) {
        check(user, {username: String});
        users[user.username] = new LegacyUser(user);
        users[user.username].login();
    }
});
