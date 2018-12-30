//
// server-side unit test
// legacyuser.test.js
//
import assert from 'assert';
import fs from "fs";
import sinon from "sinon";

import {LegacyUser} from '../../../../server/legacy/legacyuser';
import {PublicationCollector} from 'meteor/johanbrook:publication-collector';

const CONTROL_Y = String.fromCharCode(25);

function startlevel1(number) {
    return CONTROL_Y + '[' + number + ' ' + '%';
}
function endlevel1() { return CONTROL_Y + ']'}

function level2() {
    let str = CONTROL_Y + '(';
    let space = '';
    for(let x = 0 ; x < arguments.length ; x++) {
        str += space + arguments[x];
        space = ' ';
    }
    str += CONTROL_Y + ')';
    return str;
}

module.exports = function () {

    //let major = this;
    //beforeEach(function() { major.mitm = Mitm() });
    //afterEach(function(){ major.mitm.disable() });

    describe('basic legacyuser parse', function () {
        it('should return some valid l1 and l2 packets', function () {
            let ls = new LegacyUser({username: 'stcbot'});
            ls.state = 'loggedon';
            let test_string = startlevel1(21) + startlevel1(22) + startlevel1(23);
            for(let x = 0 ; x < 10 ; x++) test_string += level2(100 + x, 'level2', 'text');
            test_string += endlevel1() + endlevel1() + endlevel1() + endlevel1();
            ls.databuffer = test_string;
            let packets = ls.parse();
            assert(packets);
            assert(packets.level1Packets);
            assert(packets.level2Packets);
            assert(Array.isArray(packets.level1Packets));
            assert(Array.isArray(packets.level2Packets));
            assert.equal(3, packets.level1Packets.length);
            assert.equal(10, packets.level2Packets.length);
        });

        it('should return packets when there is extra data after the last level 1 packet close', function (done) {
            let saveme = [];
            fs.readFile('/Users/davidlogan/workspace/icc/iccserver/tests/server/unit/legacy/loggedin2.dat', function(err, data){
                let ls = new LegacyUser({username: 'stcbot'});
                ls.state = 'loggedon';

                ls.databuffer = '';
                for(let x = 0 ; x < data.length ; x++) {
                    ls.databuffer += String.fromCharCode(data[x]);
                    if(x && (x % 1000 === 0 || x === data.length)) {
                        let packets = ls.parse();
                        if(packets)
                            saveme.push(packets);
                        ls.databuffer = '';
                    }
                }

                let packets = ls.parse();
                if(packets)
                    saveme.push(packets);


                assert(saveme);
                assert(Array.isArray(saveme));
                assert(1 === saveme.length);
                assert(saveme[0]);
                assert(saveme[0].level1Packets);
                assert(saveme[0].level2Packets);
                assert(Array.isArray(saveme[0].level1Packets));
                assert(Array.isArray(saveme[0].level2Packets));
                assert.equal(4, saveme[0].level1Packets.length);
                assert.equal(129, saveme[0].level2Packets.length);
                done();
            });
        });

        it('should parse packets correctly', function(done){
            let saveme = [];
            fs.readFile('/Users/davidlogan/workspace/icc/iccserver/tests/server/unit/legacy/loggedin.dat', function(err, data){
                let ls = new LegacyUser({username: 'stcbot'});
                ls.state = 'loggedon';

                ls.databuffer = '';
                for(let x = 0 ; x < data.length ; x++) {
                    ls.databuffer += String.fromCharCode(data[x]);
                    if(x && (x % 1000 === 0 || x === data.length)) {
                        let packets = ls.parse();
                        if(packets)
                            saveme.push(packets);
                        ls.databuffer = '';
                    }
                }

                let packets = ls.parse();
                if(packets)
                    saveme.push(packets);


                assert(saveme);
                assert(Array.isArray(saveme));
                assert(1 === saveme.length);
                assert(saveme[0]);
                assert(saveme[0].level1Packets);
                assert(saveme[0].level2Packets);
                assert(Array.isArray(saveme[0].level1Packets));
                assert(Array.isArray(saveme[0].level2Packets));
                assert.equal(4, saveme[0].level1Packets.length);
                assert.equal(3423, saveme[0].level2Packets.length);
                done();
            });
        });

        it('should publish packets correctly', function(){
            this.timeout(200000);
            //let saveme = [];

            return new Promise(function(resolve, reject){
                fs.readFile('/Users/davidlogan/workspace/icc/iccserver/tests/server/unit/legacy/loggedin2.dat', function(err, data){
                    if(err) reject(err);
                    else resolve(data);
                });
            }).then(function(loggedin_data){
                let ls = new LegacyUser({username: 'stcbot'});

                sinon.stub(ls.socket, 'connect');
                sinon.stub(ls.socket, 'on').callsFake(function(event, listener) {
                    if(event === 'data') {
                        let data = '';
                        for(let x = 0 ; x <= loggedin_data.length ; x++) {
                            data += String.fromCharCode(loggedin_data[x]);
                            if(x && (x % 1000 === 0 || x === loggedin_data.length)) {
                                listener(data);
                                data = '';
                            }
                        }
                    }
                });

                ls.login();
                ls.state = 'loggedin';

                const collector = new PublicationCollector({username: 'stcbot'});

                return new Promise(function(resolve) {
                    collector.collect('stcbot', (collections) => {
                        //assert.fail('fail: ' +  JSON.stringify(collections));
                        assert(collections);
                        assert(collections.stcbot);
                        assert(Array.isArray(collections.stcbot));
                        assert(1 === collections.stcbot.length);
                        assert(collections.stcbot[0]);
                        assert(collections.stcbot[0].level1Packets);
                        assert(collections.stcbot[0].level2Packets);
                        assert(Array.isArray(collections.stcbot[0].level1Packets));
                        assert(Array.isArray(collections.stcbot[0].level2Packets));
                        assert.equal(4, collections.stcbot[0].level1Packets.length);
                        assert.equal(129, collections.stcbot[0].level2Packets.length);
                        resolve();
                    });
                });
            });
        });
    });

    describe("Legacy Server Unit test", function () {
        it("fails on purpose until we do something interesting", function () {
            //assert.strictEqual(Meteor.isClient, false);
            assert.fail('Do something interesting and remove me');
        });
    })
};