import { TestHelpers } from "../TestHelpers";

//  constructor() {
//   startAnalysisOnGame(id, fen) {
//   endAnalysisOnGame(id) {
//   getBookmove(fen) {}
//   getTablebaseMove(fen) {}
//   startEngine(id, fen) {
//   startActualEngine(id, fen) {
//   stopEngine(id) {}
//   updateIncomingAnalysis(id, results) {}
//   boardChanged(id) {}
//   watchForAnalyzedGames() {}
describe("Game analysis", function() {
  const self = TestHelpers.setupDescribe.apply(this);

  describe("starting and stopping", function() {
    it("should start automatically when a played game starts", function() {chai.assert.fail("do me");});
    it("should end automatically when a played game ends", function() {chai.assert.fail("do me");});
    it("should start when analysis is turned on in an examined game", function() {chai.assert.fail("do me");});
    it("should NOT start when an examined game is loaded", function() {chai.assert.fail("do me");});
    it("should end when analysis is turned off in an examined game", function() {chai.assert.fail("do me");});
    it("should end automatically when a played game ends", function() {chai.assert.fail("do me");});
    it("should end automatically when an examined game ends", function() {chai.assert.fail("do me");});
    it("should start an 'analysis' operation when the board changes", function() {chai.assert.fail("do me");});
    it("should stop a current 'analysis' operation, and start a new operation, when the board changes", function() {chai.assert.fail("do me");});
  });
  describe("analysis operations", function(){
    it("should not start an engine, but use a book move, when a book move is found", function() {chai.assert.fail("do me");});
    it("should not start an engine, but use a tablebase move, when a tablebase move is found", function() {chai.assert.fail("do me");});
    it("should otherwise start an engine in analysis mode", function() {chai.assert.fail("do me");});
    it("should otherwise start an engine in analysis mode", function() {chai.assert.fail("do me");});
    it("should set all of the parameters (multipv, time, inc, etc.) to values specified in the system configuration during game play", function() {chai.assert.fail("do me");});
    it("should set ponder mode when started on an examined game", function() {chai.assert.fail("do me");});
    it("should allow the setting of multipv from 1 to the system config specified maximum analyzing an examined game", function() {chai.assert.fail("do me");});
    it("should not allow engine parameter settings other than multipv on an examined game", function() {chai.assert.fail("do me");});
    it("should only allow an examiner of a public game to turn analysis on and off", function() {chai.assert.fail("do me");});
    it("should only allow an owner of a private game to turn analysis on and off", function() {chai.assert.fail("do me");});
    it("should NOT allow anyone to turn analysis on or off with a played game", function() {chai.assert.fail("do me");});
    it("should NOT allow any changes to settings or engine parameters on a played game", function() {chai.assert.fail("do me");});
  });
});
