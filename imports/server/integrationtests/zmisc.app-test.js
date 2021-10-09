import chai from "chai";
import { compare } from "../TestHelpers";

describe("Miscellaneous tests", function() {
  it("compare should fail if there are fields in the test object not in the actual object", function() {
    chai.assert.equal(compare({ f1: 1, f2: 1, f3: 1 }, { f1: "v1", f3: "v3" }), "f2 not found in database object");
  });
  it("compare should fail if there are subfields in the test object not in the actual object", function() {
    chai.assert.equal(
      compare(
        {
          f1: { f1a: 1, f1b: 1, f1c: 1 },
          f2: { f2a: 1, f2b: 1, f2c: 1 },
          f3: { f3a: 1, f3b: 1, f3c: 1 }
        },
        {
          f1: { f1a: "v1a", f1b: "v1b", f1c: "v1c" },
          f2: { f2a: "v2a", f2c: "v2c" },
          f3: { f3a: "v3a", f3b: "v3b", f3c: "v3c" }
        }
      ),
      "f2.f2b not found in database object"
    );
  });
  it("compare should fail if there are fields in the actual object not in the test object", function() {
    chai.assert.equal(compare({ f1: 1, f3: 1 }, { f1: "v1", f2: "v2", f3: "v3" }), "f2 is not supposed to be viewable, but is in the subscription");
  });
  it("compare should fail if there are subfields in the actual object not in the test object", function() {
    chai.assert.equal(
      compare(
        { f1: { f1a: 1, f1b: 1, f1c: 1 }, f2: { f2a: 1, f2c: 1 }, f3: { f3a: 1, f3b: 1, f3c: 1 } },
        {
          f1: { f1a: "v1a", f1b: "v1b", f1c: "v1c" },
          f2: { f2a: "v2a", f2b: "v2b", f2c: "v2c" },
          f3: { f3a: "v3a", f3b: "v3b", f3c: "v3c" }
        }
      ),
      "f2.f2b is not supposed to be viewable, but is in the subscription"
    );
  });
});
