//import {AccountsServer as user} from "meteor/accounts-base";
import {decrypt} from "../lib/server/encrypt";
import {RealTime} from "./RealTime";
import net from 'net';
import * as L2 from '../lib/server/l2';
import * as CN from '../lib/server/cn';

const legacy_user_map = {};

const LEVEL1EMPTY = -1;
const LEVEL1ENDED = -2;
const CONTROL_Y = String.fromCharCode(25);
const CONTROL_Z = String.fromCharCode(26);

const ADMIN_LEVEL2_PACKETS = [
    L2.WHO_AM_I,
    L2.LOGIN_FAILED,
    L2.CHANNEL_QTELL,
    L2.CHANNEL_TELL
];

const USER_LEVEL2_PACKETS = [
    L2.WHO_AM_I,
    L2.LOGIN_FAILED,
    L2.MOVE_ALGEBRAIC,
    L2.MOVE_CLOCK,
    L2.MOVE_LIST,
    L2.MOVE_SMITH,
    L2.MOVE_TIME,
    L2.SET2,
    L2.ERROR,
    L2.MESSAGELIST_BEGIN,
    L2.MESSAGELIST_ITEM,
    L2.PERSONAL_QTELL,
    L2.PERSONAL_TELL,
    L2.PERSONAL_TELL_ECHO
];

console.log('user level2settings=' + L2.LEVEL2STRING(USER_LEVEL2_PACKETS));
console.log('admin level2settings=' + L2.LEVEL2STRING(USER_LEVEL2_PACKETS));

//function incomingMessage(index, from, time, date, msg) {
//}

export class LegacyUserConnection {
    constructor(user) {
        console.log('LegacyUser::constructor userId=' + JSON.stringify(user));
        console.log('password=' + decrypt(user.profile.legacy.password));
        this.user = user;
        this.state = 'login';
        this.databuffer = '';
        this.ctrl = false;
        this.level1 = LEVEL1EMPTY;
        this.level1Array = [];
        this.level2Array = [];
        this.currentLevel1 = '';
        this.currentLevel2 = '';
        this.socket = new net.Socket();
    }

    login() {
        console.log('LegacyUser::login');
        let self = this;

        self.socket.connect({
            host: 'chessclub.com',
            port: 23
        });

        self.socket.setEncoding('utf8');

        setTimeout(function(){
            //TODO: What do we do here?
            console.log('server/legacyuser: why are we here');
        });

        self.socket.on('data', function(data) {
            self.databuffer += data;
            let packets = self.parse();
            if(packets) {
                if(packets.level2Packets.length && packets.level2Packets[0].packet.indexOf('69 5') === 0) {
                    self.socket.write(decrypt(self.user.profile.legacy.password) + '\n');
                } else {
                    self.processPackets(packets);
                }
            }
        });

        self.socket.on('error', function(e) {
            self.processError(self.user._id, e);
        });
    }

    logout() {
        console.log('LegacyUser::logout');
    }

    parse() {
        console.log('LegacyUser::parse');
        if(this.state === 'login') {
            if(this.databuffer.indexOf('login') !== -1) {
                this.databuffer = '';
                this.socket.write('level1=15\n');
                this.socket.write('level2settings=' + L2.LEVEL2STRING(USER_LEVEL2_PACKETS) + '\n');
                this.socket.write(this.user.profile.legacy.username + '\n');
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
            console.log(e);
            this.processError(e);
        }
    }

    processPackets(packets) {
        // { level1Packets: [], level2Packets: [] }
        const self = this;
        packets.level2Packets.forEach(function(p){
            console.log('processPackets level2=' + JSON.stringify(p));
            const p2 = self.parseLevel2(p);
            console.log('                     =' + JSON.stringify(p2));
            switch(parseInt(p2[0])) {
                case L2.WHO_AM_I: /* who_am_i */
                    self.socket.write(';messages\n');
                    self.socket.write(';finger\n');
                    break;
                case L2.LOGIN_FAILED: /* login_failed */
                    RealTime.send(self.user._id, 'legacy_error', {type: 'login_failed', reason: parseInt(p2[1]), text: p2[2] });
                    break;
                case L2.MESSAGELIST_ITEM:
                    //incomingMessage(parseInt(p2[1]), p2[2], p2[3], p2[4], p2[5]);
                    RealTime.send(self.user._id, 'legacy_message', [parseInt(p2[1]), p2[2], p2[3], p2[4], p2[5]]);
                    break;
                default:
                    RealTime.send(self.user._id, 'legacy_error', {type: 'unknown_packet', packet: p});
                    //throw new Meteor.Error('Unhandled level 2 packet: ' + p);
            }
        });
    }

    processError(error) {
        RealTime.send(this.user._id, 'error', error);
    }

    parseLevel2(packet) {
        /*
        --- The level 1 stuff ... we will deal with that later right now --
        TODO: Do this later
        this.l1PacketData = new String[ours];
        for (int x = 0; x < ours; x++) {
            l1PacketData[x] = level1Packets.get(x);
        }
        this.l1key = pl1key;
        this.packet = ppacket;
*/
        let ctrl = false;
        let currentparm = "";
        let state = 0; // 0 = in between, 1 = in simple parm, 2=in {} parms, 3=in ^Y{^Y} parms
        let parms = [];
//let bx = 0; bx < this.databuffer.length; bx++
        for (let x = 0 ; x < packet.packet.length ; x++) {
            let by = packet.packet.charAt(x);
            switch (by) {
                case CONTROL_Y: // ^Y
                    ctrl = true;
                    break;
                case '{':
                    if (ctrl && state === 0) {
                        state = 3;
                    } else if (state === 0) {
                        state = 2;
                    } else if (ctrl) {
                        currentparm += String.fromCharCode(CONTROL_Y);
                        currentparm += '{';
                    } else {
                        currentparm += '{';
                    }
                    ctrl = false;
                    break;
                case '}':
                    if ((state === 3 && ctrl) || state === 2) {
                        parms.push(currentparm);
                        currentparm = "";
                        state = 0;
                    } else if (ctrl) {
                        currentparm += String.fromCharCode(CONTROL_Y);
                        currentparm += '}';
                    } else {
                        currentparm += '}';
                    }
                    ctrl = false;
                    break;
                case ' ':
                    if (ctrl) {
                        ctrl = false;
                        currentparm += String.fromCharCode(CONTROL_Y);
                    }
                    if (state > 1) {
                        currentparm += ' ';
                    } else if (state === 1) {
                        parms.push(currentparm);
                        currentparm = "";
                        state = 0;
                    }
                    break;
                default:
                    if (ctrl) {
                        ctrl = false;
                        currentparm += String.fromCharCode(CONTROL_Y);
                    }
                    currentparm += by;
                    if (state === 0) {
                        state = 1;
                    }
                    break;
            }
        }

        if (currentparm.length !== 0) {
            parms.push(currentparm);
        }

        return parms;
    }
}

const LegacyUser = {
    login: function (user) {
        if (!Roles.userIsInRole(user._id, 'legacy_login') ||
            !user.profile ||
            !user.profile.legacy ||
            !user.profile.legacy.username ||
            !user.profile.legacy.password ||
            !user.profile.legacy.autologin) {
            console.log('Not legacy logging in ' + user._id);
            throw new Meteor.Error('Unable to login to the legacy server - Insufficient information in user record or user not authorized: ' + user._id);
        }
        console.log('Legacy logging in ' + user._id);
        legacy_user_map[user._id] = new LegacyUserConnection(user);
        legacy_user_map[user._id].login();
    },
    logout: function (userId) {
        const lu = legacy_user_map[userId];
        if (lu) {
            lu.logout();
            delete lu[userId];
        } else
            throw new Meteor.Error('Unable to find legacy connection for ' + userId + ' to logout from');
    }
};

export {LegacyUser};