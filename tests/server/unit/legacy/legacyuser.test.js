//
// server-side unit test
// legacyuser.test.js
//
import assert from "assert";
import { LegacyUser } from '../../../../server/legacy/legacyuser';
import { PublicationCollector } from 'meteor/johanbrook:publication-collector';

module.exports = function() {

  let ls = new LegacyUser({username: 'djlogan'});
  describe('myPublication', function() {
    it('should publish 10 documents', function(done) {
      const collector = new PublicationCollector('djlogan');

      collector.collect('djlogan', {username: 'djlogan'}, (collections) => {
        console.dir('test:' + collections.djlogan);
        //assert.equal(collections.djlogan.length, 10);
        //done();
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