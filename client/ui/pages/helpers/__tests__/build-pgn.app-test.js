import chai from "chai";
import buildPgn from "../build-pgn";

describe("build pgn functions", () => {
  it("should check build pgn function", () => {
    chai.assert.equal(
      buildPgn({
        0: { variations: [1] },
        1: { move: "e4", smith: { piece: "pawn", color: "white" } },
      }),
      "0*-1*-e4| "
    );
  });
});
