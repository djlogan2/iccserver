import chai from "chai";
import { TestHelpers } from "../imports/server/TestHelpers";
import { GameHistory } from "./Game";

describe("Played game clocks", function(){
  const self = TestHelpers.setupDescribe.apply(this);

  it("should add increment to any players clock at beginning his move", function(){
    const p1 = TestHelpers.createUser();
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalGame("mi1", p1, 0, "bullet", true, 1, 52, "inc", 2, 25, "inc", "white");
    const game1 = Game.collection.findOne();
    chai.assert.equal(game1.clocks.white.current, (1 * 60 + 52) * 1000);
    chai.assert.equal(game1.clocks.black.current, (2 * 60) * 1000);
    Game.saveLocalMove("mi2", game_id, "e4");
    const game2 = Game.collection.findOne();
    chai.assert.isTrue(game2.clocks.white.current < (1 * 60 + 52) * 1000);
    chai.assert.equal(game2.clocks.black.current, (2 * 60 + 25) * 1000);
  });

  it("should NOT call delay timer, and SHOULD call move timer with the (added inc) time value in an increment game", function(){
    const p1 = TestHelpers.createUser();
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalGame("mi1", p1, 0, "bullet", true, 1, 52, "inc", 2, 25, "inc", "white");
    const game1 = Game.collection.findOne();
    chai.assert.equal(game1.clocks.white.current, (1 * 60 + 52) * 1000);
    chai.assert.equal(game1.clocks.black.current, (2 * 60) * 1000);
    Game.saveLocalMove("mi2", game_id, "e4");
    const game2 = Game.collection.findOne();
    chai.assert.isTrue(game2.clocks.white.current < (1 * 60 + 52) * 1000);
    chai.assert.equal(game2.clocks.black.current, (2 * 60 + 25) * 1000);
  });

  it("should use original time (not update the clock at start of move) at beginning of move for us delay", function(){
    const p1 = TestHelpers.createUser();
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalGame("mi1", p1, 0, "bullet", true, 1, 52, "us", 2, 25, "us", "white");
    const game1 = Game.collection.findOne();
    chai.assert.equal(game1.clocks.white.current, (1 * 60) * 1000);
    chai.assert.equal(game1.clocks.black.current, (2 * 60) * 1000);
    Game.saveLocalMove("mi2", game_id, "e4");
    const game2 = Game.collection.findOne();
    chai.assert.equal(game1.clocks.white.current, (1 * 60) * 1000);
    chai.assert.equal(game2.clocks.black.current, (2 * 60) * 1000);
  });

  it("should call delay timer with the delay value for us delay at the start of the move", function(){
    self.startMoveTimer.callThrough();
    const p1 = TestHelpers.createUser();
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalGame("mi1", p1, 0, "bullet", true, 1, 52, "us", 2, 25, "us", "white");
    const game1 = Game.collection.findOne();
    chai.assert.equal(game1.clocks.white.current, (1 * 60) * 1000);
    chai.assert.equal(game1.clocks.black.current, (2 * 60) * 1000);
    chai.assert.isTrue(self.startMoveTimer.calledOnce);
    chai.assert.isTrue(self.startDelayTimer.calledOnce);
    //game_id, color, delay_milliseconds, actual_milliseconds
    chai.assert.equal(self.startDelayTimer.args[0][1], "white");
    chai.assert.equal(self.startDelayTimer.args[0][2], 52000);
  });

  it("should not change the time in us delay if seconds used is less than the delay", function(){
    self.startMoveTimer.callThrough();
    self.gameNow.resetBehavior();
    self.gameNow.onFirstCall().returns(0);
    self.gameNow.onSecondCall().returns(50000);
    const p1 = TestHelpers.createUser();
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalGame("mi1", p1, 0, "bullet", true, 1, 52, "us", 2, 25, "us", "white");
    const game1 = Game.collection.findOne();
    chai.assert.equal(game1.clocks.white.current, (1 * 60) * 1000);
    chai.assert.equal(game1.clocks.black.current, (2 * 60) * 1000);
    chai.assert.isTrue(self.startMoveTimer.calledOnce);
    chai.assert.isTrue(self.startDelayTimer.calledOnce);
    //game_id, color, delay_milliseconds, actual_milliseconds
    chai.assert.equal(self.startDelayTimer.args[0][1], "white");
    chai.assert.equal(self.startDelayTimer.args[0][2], 52000);

    Game.saveLocalMove("mi2", game_id, "e4");
    const game2 = Game.collection.findOne();
    chai.assert.equal(game2.clocks.white.current, (1 * 60) * 1000);
    chai.assert.equal(game2.clocks.black.current, (2 * 60) * 1000);
  });

  it("should, in us delay, subtract only the DIFFERENCE between used seconds and delay seconds from the clock when used seconds is greater than the delay", function(){
    self.startMoveTimer.callThrough();
    self.gameNow.resetBehavior();
    self.gameNow.onFirstCall().returns(0);
    self.gameNow.onSecondCall().returns(60000);
    const p1 = TestHelpers.createUser();
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalGame("mi1", p1, 0, "bullet", true, 1, 52, "us", 2, 25, "us", "white");
    const game1 = Game.collection.findOne();
    chai.assert.equal(game1.clocks.white.current, (1 * 60) * 1000);
    chai.assert.equal(game1.clocks.black.current, (2 * 60) * 1000);
    chai.assert.isTrue(self.startMoveTimer.calledOnce);
    chai.assert.isTrue(self.startDelayTimer.calledOnce);
    //game_id, color, delay_milliseconds, actual_milliseconds
    chai.assert.equal(self.startDelayTimer.args[0][1], "white");
    chai.assert.equal(self.startDelayTimer.args[0][2], 52000);

    Game.saveLocalMove("mi2", game_id, "e4");
    const game2 = Game.collection.findOne();
    chai.assert.equal(game2.clocks.white.current, 52000);
    chai.assert.equal(game2.clocks.black.current, (2 * 60) * 1000);
  });

  it("should use original time (not update the clock at start of move) at beginning of move for bronstein delay", function(){
    const p1 = TestHelpers.createUser();
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalGame("mi1", p1, 0, "bullet", true, 1, 52, "us", 2, 25, "us", "white");
    const game1 = Game.collection.findOne();
    chai.assert.equal(game1.clocks.white.current, (1 * 60) * 1000);
    chai.assert.equal(game1.clocks.black.current, (2 * 60) * 1000);
    Game.saveLocalMove("mi2", game_id, "e4");
    const game2 = Game.collection.findOne();
    chai.assert.equal(game1.clocks.white.current, (1 * 60) * 1000);
    chai.assert.equal(game2.clocks.black.current, (2 * 60) * 1000);
  });

  it("should, in bronstein delay, NOT call delay timer, and SHOULD call move timer with the current time without any added in inc/delay", function(){
    self.startMoveTimer.callThrough();
    self.setInterval.resetBehavior();
    self.setInterval.returns(0);

    const p1 = TestHelpers.createUser();
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalGame("mi1", p1, 0, "bullet", true, 1, 52, "bronstein", 2, 25, "bronstein", "white");
    const game1 = Game.collection.findOne();
    chai.assert.equal(game1.clocks.white.current, (1 * 60) * 1000);
    chai.assert.equal(game1.clocks.black.current, (2 * 60) * 1000);

    chai.assert.isTrue(self.startMoveTimer.calledOnce);
    chai.assert.isTrue(self.startDelayTimer.notCalled);
  });

  it("should not change the time in bronstein delay if the used seconds was less than the delay seconds", function(){
    self.gameNow.resetBehavior();
    self.gameNow.onFirstCall().returns(0);
    self.gameNow.onSecondCall().returns(50000);
    const p1 = TestHelpers.createUser();
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalGame("mi1", p1, 0, "bullet", true, 1, 52, "bronstein", 2, 25, "bronstein", "white");
    const game1 = Game.collection.findOne();
    chai.assert.equal(game1.clocks.white.current, (1 * 60) * 1000);
    chai.assert.equal(game1.clocks.black.current, (2 * 60) * 1000);
    chai.assert.isTrue(self.startMoveTimer.calledOnce);
    chai.assert.isTrue(self.startDelayTimer.notCalled);

    Game.saveLocalMove("mi2", game_id, "e4");
    const game2 = Game.collection.findOne();
    chai.assert.equal(game2.clocks.white.current, (1 * 60) * 1000);
    chai.assert.equal(game2.clocks.black.current, (2 * 60) * 1000);
  });

  it("should subtract only the difference in bronstein delay between the delay seconds and used seconds when used seconds is greater than the delay", function(){
    self.gameNow.resetBehavior();
    self.gameNow.onFirstCall().returns(0);
    self.gameNow.onSecondCall().returns(60000);
    const p1 = TestHelpers.createUser();
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalGame("mi1", p1, 0, "bullet", true, 1, 52, "bronstein", 2, 25, "bronstein", "white");
    const game1 = Game.collection.findOne();
    chai.assert.equal(game1.clocks.white.current, (1 * 60) * 1000);
    chai.assert.equal(game1.clocks.black.current, (2 * 60) * 1000);

    Game.saveLocalMove("mi2", game_id, "e4");
    const game2 = Game.collection.findOne();
    chai.assert.equal(game2.clocks.white.current, 52000);
    chai.assert.equal(game2.clocks.black.current, (2 * 60) * 1000);
  });

  it("should write 'wcurrent' and 'bcurrent' into each movelist node with the clocks at the start of each move", function(){
    self.sandbox.replace(Game, "calculateGameLag", self.sandbox.fake.returns(0));
    self.gameNow.resetBehavior();
    let loop = 0;
    let timer = 0;
    self.gameNow.callsFake(() => {
      const t = timer;
      timer += (++loop) * 100;
      return t;
    });
    const p1 = TestHelpers.createUser();
    const p2 = self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalGame("mi1", p1, 0, "bullet", true, 1, 0, "none", 1, 0, "none", "white");
    self.loggedonuser = p2; Game.saveLocalMove("mi2", game_id, "e4");
    self.loggedonuser = p1; Game.saveLocalMove("mi2", game_id, "e5");
    self.loggedonuser = p2; Game.saveLocalMove("mi2", game_id, "Nc3");
    self.loggedonuser = p1; Game.saveLocalMove("mi2", game_id, "Nc6");
    self.loggedonuser = p2; Game.saveLocalMove("mi2", game_id, "Nf3");
    const game2 = Game.collection.findOne();
    chai.assert.equal(60000                                    , game2.variations.movelist[0].wcurrent);
    chai.assert.equal(60000                                    , game2.variations.movelist[0].bcurrent);

    chai.assert.equal(60000 - 100                              , game2.variations.movelist[1].wcurrent);
    chai.assert.equal(60000                                    , game2.variations.movelist[1].bcurrent);

    chai.assert.equal(60000 - 100                              , game2.variations.movelist[2].wcurrent);
    chai.assert.equal(60000        - 200                       , game2.variations.movelist[2].bcurrent);

    chai.assert.equal(60000 - 100         - 300                , game2.variations.movelist[3].wcurrent);
    chai.assert.equal(60000        - 200                       , game2.variations.movelist[3].bcurrent);

    chai.assert.equal(60000 - 100         - 300                , game2.variations.movelist[4].wcurrent);
    chai.assert.equal(60000        - 200          - 400        , game2.variations.movelist[4].bcurrent);

    chai.assert.equal(60000 - 100         - 300          - 500 , game2.variations.movelist[5].wcurrent);
    chai.assert.equal(60000        - 200          - 400        , game2.variations.movelist[5].bcurrent);
  });

  it("should copy wcurrent and bcurrent to game_history upon end of game", function(){
    self.sandbox.replace(Game, "calculateGameLag", self.sandbox.fake.returns(0));
    self.gameNow.resetBehavior();
    let loop = 0;
    let timer = 0;
    self.gameNow.callsFake(() => {
      const t = timer;
      timer += (++loop) * 100;
      return t;
    });
    const p1 = TestHelpers.createUser();
    const p2 = self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalGame("mi1", p1, 0, "bullet", true, 1, 0, "none", 1, 0, "none", "white");
    self.loggedonuser = p2; Game.saveLocalMove("mi2", game_id, "e4");
    self.loggedonuser = p1; Game.saveLocalMove("mi2", game_id, "e5");
    self.loggedonuser = p2; Game.saveLocalMove("mi2", game_id, "Nc3");
    self.loggedonuser = p1; Game.saveLocalMove("mi2", game_id, "Nc6");
    self.loggedonuser = p2; Game.saveLocalMove("mi2", game_id, "Nf3");
    Game.resignLocalGame("mi3", game_id);
    const historygame = GameHistory.collection.findOne();

    chai.assert.equal(60000                                    , historygame.variations.movelist[0].wcurrent);
    chai.assert.equal(60000                                    , historygame.variations.movelist[0].bcurrent);

    chai.assert.equal(60000 - 100                              , historygame.variations.movelist[1].wcurrent);
    chai.assert.equal(60000                                    , historygame.variations.movelist[1].bcurrent);

    chai.assert.equal(60000 - 100                              , historygame.variations.movelist[2].wcurrent);
    chai.assert.equal(60000        - 200                       , historygame.variations.movelist[2].bcurrent);

    chai.assert.equal(60000 - 100         - 300                , historygame.variations.movelist[3].wcurrent);
    chai.assert.equal(60000        - 200                       , historygame.variations.movelist[3].bcurrent);

    chai.assert.equal(60000 - 100         - 300                , historygame.variations.movelist[4].wcurrent);
    chai.assert.equal(60000        - 200          - 400        , historygame.variations.movelist[4].bcurrent);

    chai.assert.equal(60000 - 100         - 300          - 500 , historygame.variations.movelist[5].wcurrent);
    chai.assert.equal(60000        - 200          - 400        , historygame.variations.movelist[5].bcurrent);
  });
});

describe("Clocks in examined games", function () {
  const self = TestHelpers.setupDescribe.apply(this);

  it("should create the current values in the clock object in the game record upon load", function () {
    self.sandbox.replace(Game, "calculateGameLag", self.sandbox.fake.returns(0));
    self.gameNow.resetBehavior();
    let loop = 0;
    let timer = 0;
    self.gameNow.callsFake(() => {
      const t = timer;
      timer += (++loop) * 100;
      return t;
    });
    const p1 = TestHelpers.createUser();
    const p2 = self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalGame("mi1", p1, 0, "bullet", true, 1, 0, "none", 1, 0, "none", "white");
    self.loggedonuser = p2; Game.saveLocalMove("mi2", game_id, "e4");
    self.loggedonuser = p1; Game.saveLocalMove("mi2", game_id, "e5");
    self.loggedonuser = p2; Game.saveLocalMove("mi2", game_id, "Nc3");
    self.loggedonuser = p1; Game.saveLocalMove("mi2", game_id, "Nc6");
    self.loggedonuser = p2; Game.saveLocalMove("mi2", game_id, "Nf3");
    Game.resignLocalGame("mi3", game_id);
    const historygame = GameHistory.collection.findOne();
    Game.collection.remove({}); // for safety
    Game.startLocalExaminedGameWithObject("mi1", historygame);
    const game = Game.collection.findOne();

    chai.assert.equal(60000                                    , game.variations.movelist[0].wcurrent);
    chai.assert.equal(60000                                    , game.variations.movelist[0].bcurrent);

    chai.assert.equal(60000 - 100                              , game.variations.movelist[1].wcurrent);
    chai.assert.equal(60000                                    , game.variations.movelist[1].bcurrent);

    chai.assert.equal(60000 - 100                              , game.variations.movelist[2].wcurrent);
    chai.assert.equal(60000        - 200                       , game.variations.movelist[2].bcurrent);

    chai.assert.equal(60000 - 100         - 300                , game.variations.movelist[3].wcurrent);
    chai.assert.equal(60000        - 200                       , game.variations.movelist[3].bcurrent);

    chai.assert.equal(60000 - 100         - 300                , game.variations.movelist[4].wcurrent);
    chai.assert.equal(60000        - 200          - 400        , game.variations.movelist[4].bcurrent);

    chai.assert.equal(60000 - 100         - 300          - 500 , game.variations.movelist[5].wcurrent);
    chai.assert.equal(60000        - 200          - 400        , game.variations.movelist[5].bcurrent);
  });

  it("should set the clocks to the time value upon load", function () {
    const obj = JSON.parse(JSON.stringify(gameobject));;
    self.loggedonuser = TestHelpers.createUser();
    obj.clocks.white.initial = 999;
    obj.clocks.black.initial = 888;
    obj.variations.movelist[0].wcurrent = 123;
    obj.variations.movelist[0].bcurrent = 456;
    Game.startLocalExaminedGameWithObject("mi1", obj);
    const game = Game.collection.findOne();
    chai.assert.equal(123, game.clocks.white.current);
    chai.assert.equal(456, game.clocks.black.current);
  });

  it("should set the clocks to zero if there is no time value upon load", function () {
    const obj = JSON.parse(JSON.stringify(gameobject));
    self.loggedonuser = TestHelpers.createUser();
    obj.clocks.white.initial = 999;
    obj.clocks.black.initial = 888;
    delete obj.variations.movelist[0].wcurrent;
    delete obj.variations.movelist[0].bcurrent;
    Game.startLocalExaminedGameWithObject("mi1", obj);
    const game = Game.collection.findOne();
    chai.assert.equal(0, game.clocks.white.current);
    chai.assert.equal(0, game.clocks.black.current);
  });

  it("should use the current and previous nodes to set the clocks on move forward", function () {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGameWithObject("mi1", gameobject);
    let next = true;
    while(next) {
      const game = Game.collection.findOne();
      const cmi = game.variations.cmi;
      const wcurrent = game.variations.movelist[cmi].wcurrent;
      const bcurrent = game.variations.movelist[cmi].bcurrent;
      chai.assert.equal(game.clocks.white.current, wcurrent);
      chai.assert.equal(game.clocks.black.current, bcurrent);
      if(!!gameobject.variations.movelist[cmi].variations)
        Game.moveForward("mi1", game_id, 1, 0);
      else
        next = false;
    }
  });

  it("should use the current and next nodes to set the clocks on move backward", function () {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGameWithObject("mi1", gameobject);
    let next = true;
    while(next) {
      const game = Game.collection.findOne();
      const cmi = game.variations.cmi;
      const wcurrent = game.variations.movelist[cmi].wcurrent;
      const bcurrent = game.variations.movelist[cmi].bcurrent;
      chai.assert.equal(game.clocks.white.current, wcurrent);
      chai.assert.equal(game.clocks.black.current, bcurrent);
      if(!!gameobject.variations.movelist[cmi].variations)
        Game.moveForward("mi1", game_id, 1, 0);
      else
        next = false;
    }
    next = true;
    while(next) {
      const game = Game.collection.findOne();
      const cmi = game.variations.cmi;
      const wcurrent = game.variations.movelist[cmi].wcurrent;
      const bcurrent = game.variations.movelist[cmi].bcurrent;
      chai.assert.equal(game.clocks.white.current, wcurrent);
      chai.assert.equal(game.clocks.black.current, bcurrent);
      if(cmi > 0)
        Game.moveBackward("mi1", game_id, 1);
      else
        next = false;
    }
  });

  it("should use the current and next nodes to set the clocks on setcmi", function () {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGameWithObject("mi1", gameobject);

    let moves = [];
    for(let x = 0 ; x < gameobject.variations.movelist.length ; x++) moves.push(x);

    moves = moves
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);

    while(!!moves.length) {
      const newcmi = moves.pop();
      Game.moveToCMI("mi1", game_id, newcmi);
      const game = Game.collection.findOne();
      const cmi = game.variations.cmi;
      const wcurrent = game.variations.movelist[cmi].wcurrent;
      const bcurrent = game.variations.movelist[cmi].bcurrent;
      chai.assert.equal(game.clocks.white.current, wcurrent);
      chai.assert.equal(game.clocks.black.current, bcurrent);
    }
  });

  it("should, in moveforward, just set a clock to zero if the associated node does not have clock information", function () {
    self.loggedonuser = TestHelpers.createUser();
    const obj = JSON.parse(JSON.stringify(gameobject));
    for(let x = 0 ; x < obj.variations.movelist.length ; x++) {
      if(!!(x % 2)) delete obj.variations.movelist[x].wcurrent;
      else delete obj.variations.movelist[x].bcurrent;
    }
    const game_id = Game.startLocalExaminedGameWithObject("mi1", obj);
    let next = true;
    while(next) {
      const game = Game.collection.findOne();
      const cmi = game.variations.cmi;
      const deleted = !!(cmi % 2) ? "w" : "b";
      const wcurrent = game.variations.movelist[cmi].wcurrent === undefined ? 0 : game.variations.movelist[cmi].wcurrent;
      const bcurrent = game.variations.movelist[cmi].bcurrent === undefined ? 0 : game.variations.movelist[cmi].bcurrent;
      chai.assert.isTrue(deleted !== "w" || wcurrent === 0);
      chai.assert.isTrue(deleted !== "b" || bcurrent === 0);
      chai.assert.equal(game.clocks.white.current, wcurrent);
      chai.assert.equal(game.clocks.black.current, bcurrent);
      if(!!gameobject.variations.movelist[cmi].variations)
        Game.moveForward("mi1", game_id, 1, 0);
      else
        next = false;
    }
  });

  it("should, in backward, just set a clock to zero if the associated node does not have clock information", function () {
    const obj = JSON.parse(JSON.stringify(gameobject));
    for(let x = 0 ; x < obj.variations.movelist.length ; x++) {
      if(!!(x % 2)) delete obj.variations.movelist[x].wcurrent;
      else delete obj.variations.movelist[x].bcurrent;
    }
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGameWithObject("mi1", obj);
    let next = true;
    while(next) {
      const game = Game.collection.findOne();
      const cmi = game.variations.cmi;
      if(!!gameobject.variations.movelist[cmi].variations)
        Game.moveForward("mi1", game_id, 1, 0);
      else
        next = false;
    }
    next = true;
    while(next) {
      const game = Game.collection.findOne();
      const cmi = game.variations.cmi;
      const deleted = !!(cmi % 2) ? "w" : "b";
      const wcurrent = game.variations.movelist[cmi].wcurrent === undefined ? 0 : game.variations.movelist[cmi].wcurrent;
      const bcurrent = game.variations.movelist[cmi].bcurrent === undefined ? 0 : game.variations.movelist[cmi].bcurrent;
      chai.assert.isTrue(deleted !== "w" || wcurrent === 0);
      chai.assert.isTrue(deleted !== "b" || bcurrent === 0);
      chai.assert.equal(game.clocks.white.current, wcurrent);
      chai.assert.equal(game.clocks.black.current, bcurrent);
      if(cmi > 0)
        Game.moveBackward("mi1", game_id, 1);
      else
        next = false;
    }
  });

  it("should, in setcmi, just set a clock to zero if the associated node does not have clock information", function () {
    const obj = JSON.parse(JSON.stringify(gameobject));
    for(let x = 0 ; x < obj.variations.movelist.length ; x++) {
      if(!!(x % 2)) delete obj.variations.movelist[x].wcurrent;
      else delete obj.variations.movelist[x].bcurrent;
    }
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGameWithObject("mi1", obj);

    let moves = [];
    for(let x = 0 ; x < gameobject.variations.movelist.length ; x++) moves.push(x);

    moves = moves
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);

    while(!!moves.length) {
      const newcmi = moves.pop();
      Game.moveToCMI("mi1", game_id, newcmi);
      const game = Game.collection.findOne();
      const cmi = game.variations.cmi;
      const deleted = !!(cmi % 2) ? "w" : "b";
      const wcurrent = game.variations.movelist[cmi].wcurrent === undefined ? 0 : game.variations.movelist[cmi].wcurrent;
      const bcurrent = game.variations.movelist[cmi].bcurrent === undefined ? 0 : game.variations.movelist[cmi].bcurrent;
      chai.assert.isTrue(deleted !== "w" || wcurrent === 0);
      chai.assert.isTrue(deleted !== "b" || bcurrent === 0);
      chai.assert.equal(game.clocks.white.current, wcurrent);
      chai.assert.equal(game.clocks.black.current, bcurrent);
    }
  });

  it("should allow an examiner to set the current nodes clock", function () {
    chai.assert.fail("do me");
  });

  const gameobject = {
    "_id": "L4hB66PyTuTRBjSmN",
    "white": {
      "id": "3j6hv73dStfa24vL3",
      "name": "Allene_Kling",
      "rating": 1600
    },
    "black": {
      "id": "JuAY233SsGF4gyFfi",
      "name": "Halle_Waters",
      "rating": 1600
    },
    "wild": 0,
    "rating_type": "bullet",
    "rated": true,
    "clocks": {
      "white": {
        "initial": 1,
        "inc_or_delay": 0,
        "delaytype": "none"
      },
      "black": {
        "initial": 1,
        "inc_or_delay": 0,
        "delaytype": "none"
      }
    },
    "actions": [
      {
        "type": "move",
        "issuer": "3j6hv73dStfa24vL3",
        "parameter": {
          "move": "e4"
        },
        "time": "2021-09-11T17:52:28.635Z"
      },
      {
        "type": "move",
        "issuer": "JuAY233SsGF4gyFfi",
        "parameter": {
          "move": "e5"
        },
        "time": "2021-09-11T17:52:28.677Z"
      },
      {
        "type": "move",
        "issuer": "3j6hv73dStfa24vL3",
        "parameter": {
          "move": "Nc3"
        },
        "time": "2021-09-11T17:52:28.719Z"
      },
      {
        "type": "move",
        "issuer": "JuAY233SsGF4gyFfi",
        "parameter": {
          "move": "Nc6"
        },
        "time": "2021-09-11T17:52:28.765Z"
      },
      {
        "type": "move",
        "issuer": "3j6hv73dStfa24vL3",
        "parameter": {
          "move": "Nf3"
        },
        "time": "2021-09-11T17:52:28.810Z"
      },
      {
        "type": "resign",
        "issuer": "3j6hv73dStfa24vL3",
        "time": "2021-09-11T17:52:28.835Z"
      }
    ],
    "variations": {
      "movelist": [
        {
          "wcurrent": 60000,
          "bcurrent": 60000,
          "variations": [
            1
          ]
        },
        {
          "move": "e4",
          "smith": {
            "piece": "p",
            "color": "w",
            "from": "e2",
            "to": "e4"
          },
          "prev": 0,
          "wcurrent": 59900,
          "bcurrent": 60000,
          "variations": [
            2
          ]
        },
        {
          "move": "e5",
          "smith": {
            "piece": "p",
            "color": "b",
            "from": "e7",
            "to": "e5"
          },
          "prev": 1,
          "wcurrent": 59900,
          "bcurrent": 59800,
          "variations": [
            3
          ]
        },
        {
          "move": "Nc3",
          "smith": {
            "piece": "n",
            "color": "w",
            "from": "b1",
            "to": "c3"
          },
          "prev": 2,
          "wcurrent": 59600,
          "bcurrent": 59800,
          "variations": [
            4
          ]
        },
        {
          "move": "Nc6",
          "smith": {
            "piece": "n",
            "color": "b",
            "from": "b8",
            "to": "c6"
          },
          "prev": 3,
          "wcurrent": 59600,
          "bcurrent": 59400,
          "variations": [
            5
          ]
        },
        {
          "move": "Nf3",
          "smith": {
            "piece": "n",
            "color": "w",
            "from": "g1",
            "to": "f3"
          },
          "prev": 4,
          "wcurrent": 59100,
          "bcurrent": 59400
        }
      ]
    },
    "computer_variations": [],
    "startTime": "2021-09-11T17:52:28.881Z",
    "result": "0-1",
    "status2": 0
  };
});
