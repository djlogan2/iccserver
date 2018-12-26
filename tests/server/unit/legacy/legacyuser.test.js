//
// server-side unit test
// legacyuser.test.js
//
import assert from 'assert';
import {LegacyUser} from '../../../../server/legacy/legacyuser';
import {PublicationCollector} from 'meteor/johanbrook:publication-collector';

import fs from "fs";

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

        it('should do something', function(done){
            let saveme = [];
            fs.readFile('/Users/davidlogan/workspace/icc/iccserver/tests/server/unit/legacy/loggedin.dat', function(err, data){
                let ls = new LegacyUser({username: 'stcbot'});
                ls.state = 'loggedon';

                ls.databuffer = '';
                for(let x = 0 ; x < data.length ; x++) {
                    ls.databuffer += String.fromCharCode(data[x]);
                    if(x && (x % 1000 === 0 || x === data.length)) {
                        let packets = ls.parse();
                        saveme.push(packets);
                        ls.databuffer = '';
                    }
                }
                let packets = ls.parse();
                saveme.push(packets);


                assert(packets);
                assert(packets.level1Packets);
                assert(packets.level2Packets);
                assert(Array.isArray(packets.level1Packets));
                assert(Array.isArray(packets.level2Packets));
                assert.equal(4, packets.level1Packets.length);
                assert.equal(3423, packets.level2Packets.length);
                done();
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