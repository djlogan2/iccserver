//
// server-side integration test
// legacyuser.test.js
//
import assert from "assert";

module.exports = function() {
  describe("Legacy User Integration test", function () {
    it('fails on purpose until we do something interesting', function(){
      assert.fail('Do something interesting and remove me');
    });
  });
};
