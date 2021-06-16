import { TestHelpers } from "../imports/server/TestHelpers";
import { EcoCollection } from "./Game";
import chai from "chai";
import { forEach } from "async";

describe.only("ecocodes", function(){
  describe("moveForward", function(){
    const self = TestHelpers.setupDescribe.apply(this);
    it("should perform a lookup if there is no eco information (and save it if it exists)", function() {
      chai.assert.fail("do me");
    });

    it("should NOT perform a lookup if there IS eco information", function() {
      chai.assert.fail("do me");
    });
  });
  describe.skip("moveBackward", function() {
    it("should perform a lookup if there is no eco information (and save it if it exists)", function() {
      chai.assert.fail("do me");
    });
    it("should NOT perform a lookup if there IS eco information", function() {
      chai.assert.fail("do me");
    });
  });
  describe.skip("loadFen", function() {
    it("should perform a lookup and add eco info to node 0 if there is an opening match", function() {
      chai.assert.fail("do me");
    });
  });
  describe.skip("setTag", function() {
    chai.assert.fail("do me");
  });
  describe.skip("moveToCMI", function() {
    it("should perform a lookup if there is no eco information (and save it if it exists)", function() {
      chai.assert.fail("do me");
    })
    it("should NOT perform a lookup if there IS eco information", function() {
      chai.assert.fail("do me");
    })
  });
  describe.skip("saveLocalMove", function() {
    it("should not save a code/name until it gets its first eco match in any node", function() {
      chai.assert.fail("do me");
    });
    it("should store the same code/name as previous node if there is no match", function() {
      chai.assert.fail("do me");
    });
    it("should store new code/name when it gets a new match", function() {
      chai.assert.fail("do me");
    });
    it("should arrive at the same code/name with transposed moves", function() {
      chai.assert.fail("do me");
    });
  });
  describe.skip("exportToPGN", function() {
    chai.assert.fail("do me");
  });
  it.skip("should not be saved to the game_history collection", function() {
    chai.assert.fail("do me");
  });
});


