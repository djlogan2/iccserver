import chai from "chai";
import PolyGlot from "./polyglot";

describe.skip("Polyglot class", function() {
  const polyglot = new PolyGlot("/users/davidlogan/workspace/icc/stockfish/docker/book.bin");
  it("should find hash values correctly", function(done) {
    polyglot
      .initialize()
      .then(() => polyglot.getBookMoves("7k/8/7P/6K1/8/8/8/8 w - - 33 116"))
      .then(entries => {
        done();
      });
    chai.assert.isTrue(BigInt("0xaf4c1fa599dc0ba6") === polyglot.hash("K7/2Q5/1k6/3q4/4B3/6N1/5b2/7n w - - 0 1"));
    chai.assert.isTrue(BigInt("0x612613fc72a70419") === polyglot.hash("7k/8/7P/6K1/8/8/8/8 w - - 33 116"));
    //chai.assert.isTrue(BigInt("0x463b96181691fc9c") === polyglot.hash("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"));
    //chai.assert.isTrue(BigInt("0x823c9b50fd114196") === polyglot.hash("rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1"));
    //chai.assert.isTrue(BigInt("0x0756b94461c50fb0") === polyglot.hash("rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 2"));
    //chai.assert.isTrue(BigInt("0x662fafb965db29d4") === polyglot.hash("rnbqkbnr/ppp1pppp/8/3pP3/8/8/PPPP1PPP/RNBQKBNR b KQkq - 0 2"));
    //chai.assert.isTrue(BigInt("0x22a48b5a8e47ff78") === polyglot.hash("rnbqkbnr/ppp1p1pp/8/3pPp2/8/8/PPPP1PPP/RNBQKBNR w KQkq f6 0 3"));
    //chai.assert.isTrue(BigInt("0x652a607ca3f242c1") === polyglot.hash("rnbqkbnr/ppp1p1pp/8/3pPp2/8/8/PPPPKPPP/RNBQ1BNR b kq - 0 3"));
    //chai.assert.isTrue(BigInt("0x00fdd303c946bdd9") === polyglot.hash("rnbq1bnr/ppp1pkpp/8/3pPp2/8/8/PPPPKPPP/RNBQ1BNR w - - 0 4"));
    //chai.assert.isTrue(BigInt("0x3c8123ea7b067637") === polyglot.hash("rnbqkbnr/p1pppppp/8/8/PpP4P/8/1P1PPPP1/RNBQKBNR b KQkq c3 0 3"));
    //chai.assert.isTrue(BigInt("0x5c3f9b829b279560") === polyglot.hash("rnbqkbnr/p1pppppp/8/8/P6P/R1p5/1P1PPPP1/1NBQKBNR b Kkq - 0 4"));
  });
});
