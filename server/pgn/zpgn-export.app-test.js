import chai from "chai";
import { Parser } from "./pgnparser";
//import { Game } from "../Game";
import { TestHelpers } from "../../imports/server/TestHelpers";
import { buildPgnFromMovelist } from "../../lib/exportpgn";

describe("PGN exports", function() {
  const self = TestHelpers.setupDescribe.apply(this);
  // [Event]
  // [Site]
  // [Date] startTime and [Time]
  // [Round]
  // [White] white.name
  // [Black] black.name
  // [Result] result
  // [WhiteElo] white.rating
  // [BlackElo] black.rating
  // [TimeControl] time control
  // [misc tags]
  //

  it("should ...", function() {
    self.loggedonuser = TestHelpers.createUser();
    const imported_pgn =
      '[Event "?"]\n' +
      '[Site "?"]\n' +
      '[Date "????.??.??"]\n' +
      '[Round "?"]\n' +
      '[White "?"]\n' +
      '[Black "?"]\n' +
      '[Result "*"]\n' +
      "\n" +
      "1. e4 (1. d4 d5 2. e4 (2. c4))(1. c4 c5 2. d4 (2. e4)) 1. ... h5 (1. ... d5 2. d4 e5 (2. ... c5))(1. ... c5 2. d4 d5 (2. ... e5)) *";
    const parser = new Parser();
    chai.assert.doesNotThrow(() => parser.feed(imported_pgn));
    chai.assert.equal(1, parser.gamelist.length);

    const game_id = Game.startLocalExaminedGameWithObject("mi1", parser.gamelist[0]);
    const exported_pgn = Game.exportToPGN(game_id);
    const expected_exported_pgn = imported_pgn.replace(/\[.*]\n/g, "");
    const actual_exported_pgn = exported_pgn.pgn.replace(/\[.*]\n/g, "");
    chai.assert.equal(actual_exported_pgn, expected_exported_pgn);
  });

  it("should pass this test, which is failing in production", function() {
    const game_id = Game.collection.insert(game_record);
    const exported_pgn = Game.exportToPGN(game_id);
    //chai.assert.equal(exported_pgn, "");
  });

  it("should export the pgn with the variations in the correct order", function() {
    const us = TestHelpers.createUser({ premove: false });
    const them = TestHelpers.createUser({ premove: false });
    self.loggedonuser = us;
    const game_id = Game.startLocalGame(
      "mi1",
      them,
      0,
      "standard",
      true,
      15,
      0,
      "none",
      15,
      0,
      "none",
      "white"
    );
    Game.saveLocalMove("e4", game_id, "e4");
    self.loggedonuser = them;
    Game.saveLocalMove("f5", game_id, "f5");
    Game.resignLocalGame("resignLocalGame", game_id);

    Game.moveBackward("mi2", game_id, 1);
    Game.saveLocalMove("c5", game_id, "c5");

    Game.moveBackward("mi3", game_id, 1);
    Game.saveLocalMove("d5", game_id, "d5");

    Game.moveBackward("mi4", game_id, 1);
    Game.saveLocalMove("e5", game_id, "e5");
    const game = Game.GameCollection.findOne({ _id: game_id, status: "examining" });
    chai.assert.isDefined(game, "Game does not exist");

    const pgn = buildPgnFromMovelist(game.variations.movelist);
    let expectedPgn = "1. e4 e5 (1. ... d5)(1. ... c5)(1. ... f5)"
    chai.assert.equal(pgn, expectedPgn);
  });
  
  const game_record = {
    actions: [
      {
        type: "move",
        issuer: "computer",
        parameter: {
          move: "c4",
          lag: 0,
          ping: 0,
          gamelag: 0,
          gameping: 0
        },
        time: { $date: "2020-08-02T01:47:49.063Z" }
      },
      {
        type: "move",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          move: "d5",
          lag: 67,
          ping: 66,
          gamelag: 92,
          gameping: 83
        },
        time: { $date: "2020-08-02T01:47:51.962Z" }
      },
      {
        type: "move",
        issuer: "computer",
        parameter: {
          move: "Nc3",
          lag: 0,
          ping: 0,
          gamelag: 0,
          gameping: 0
        },
        time: { $date: "2020-08-02T01:48:02.865Z" }
      },
      {
        type: "move",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          move: "d4",
          lag: 65,
          ping: 65,
          gamelag: 96,
          gameping: 78
        },
        time: { $date: "2020-08-02T01:48:05.980Z" }
      },
      {
        type: "move",
        issuer: "computer",
        parameter: {
          move: "Ne4",
          lag: 0,
          ping: 0,
          gamelag: 0,
          gameping: 0
        },
        time: { $date: "2020-08-02T01:48:15.887Z" }
      },
      {
        type: "move",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          move: "e5",
          lag: 65,
          ping: 66,
          gamelag: 85,
          gameping: 81
        },
        time: { $date: "2020-08-02T01:48:17.517Z" }
      },
      {
        type: "move",
        issuer: "computer",
        parameter: {
          move: "Ng3",
          lag: 0,
          ping: 0,
          gamelag: 0,
          gameping: 0
        },
        time: { $date: "2020-08-02T01:48:29.406Z" }
      },
      {
        type: "move",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          move: "Nf6",
          lag: 65,
          ping: 64,
          gamelag: 80,
          gameping: 78
        },
        time: { $date: "2020-08-02T01:48:35.318Z" }
      },
      {
        type: "move",
        issuer: "computer",
        parameter: {
          move: "d3",
          lag: 0,
          ping: 0,
          gamelag: 0,
          gameping: 0
        },
        time: { $date: "2020-08-02T01:48:46.687Z" }
      },
      {
        type: "move",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          move: "Bd6",
          lag: 64,
          ping: 65,
          gamelag: 16,
          gameping: 81
        },
        time: { $date: "2020-08-02T01:48:52.035Z" }
      },
      {
        type: "move",
        issuer: "computer",
        parameter: {
          move: "Bd2",
          lag: 0,
          ping: 0,
          gamelag: 0,
          gameping: 0
        },
        time: { $date: "2020-08-02T01:48:57.895Z" }
      },
      {
        type: "move",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          move: "O-O",
          lag: 64,
          ping: 65,
          gamelag: 82,
          gameping: 85
        },
        time: { $date: "2020-08-02T01:49:01.248Z" }
      },
      {
        type: "move",
        issuer: "computer",
        parameter: {
          move: "Nf3",
          lag: 0,
          ping: 0,
          gamelag: 0,
          gameping: 0
        },
        time: { $date: "2020-08-02T01:49:12.237Z" }
      },
      {
        type: "move",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          move: "c5",
          lag: 64,
          ping: 64,
          gamelag: 82,
          gameping: 84
        },
        time: { $date: "2020-08-02T01:49:14.806Z" }
      },
      {
        type: "move",
        issuer: "computer",
        parameter: {
          move: "e4",
          lag: 0,
          ping: 0,
          gamelag: 0,
          gameping: 0
        },
        time: { $date: "2020-08-02T01:49:25.504Z" }
      },
      {
        type: "move",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          move: "Nc6",
          lag: 64,
          ping: 65,
          gamelag: 81,
          gameping: 83
        },
        time: { $date: "2020-08-02T01:49:31.467Z" }
      },
      {
        type: "move",
        issuer: "computer",
        parameter: {
          move: "Be2",
          lag: 0,
          ping: 0,
          gamelag: 0,
          gameping: 0
        },
        time: { $date: "2020-08-02T01:49:42.011Z" }
      },
      {
        type: "move",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          move: "Bd7",
          lag: 64,
          ping: 66,
          gamelag: 81,
          gameping: 83
        },
        time: { $date: "2020-08-02T01:49:48.990Z" }
      },
      {
        type: "move",
        issuer: "computer",
        parameter: {
          move: "Rb1",
          lag: 0,
          ping: 0,
          gamelag: 0,
          gameping: 0
        },
        time: { $date: "2020-08-02T01:49:59.046Z" }
      },
      {
        type: "move",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          move: "a6",
          lag: 64,
          ping: 65,
          gamelag: 90,
          gameping: 82
        },
        time: { $date: "2020-08-02T01:50:00.584Z" }
      },
      {
        type: "move",
        issuer: "computer",
        parameter: {
          move: "a3",
          lag: 0,
          ping: 0,
          gamelag: 0,
          gameping: 0
        },
        time: { $date: "2020-08-02T01:50:09.767Z" }
      },
      {
        type: "move",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          move: "b5",
          lag: 64,
          ping: 65,
          gamelag: 82,
          gameping: 81
        },
        time: { $date: "2020-08-02T01:50:12.762Z" }
      },
      {
        type: "move",
        issuer: "computer",
        parameter: {
          move: "cxb5",
          lag: 0,
          ping: 0,
          gamelag: 0,
          gameping: 0
        },
        time: { $date: "2020-08-02T01:50:21.203Z" }
      },
      {
        type: "move",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          move: "axb5",
          lag: 64,
          ping: 64,
          gamelag: 82,
          gameping: 81
        },
        time: { $date: "2020-08-02T01:50:24.104Z" }
      },
      {
        type: "move",
        issuer: "computer",
        parameter: {
          move: "O-O",
          lag: 0,
          ping: 0,
          gamelag: 0,
          gameping: 0
        },
        time: { $date: "2020-08-02T01:50:33.590Z" }
      },
      {
        type: "move",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          move: "h6",
          lag: 65,
          ping: 64,
          gamelag: 84,
          gameping: 83
        },
        time: { $date: "2020-08-02T01:51:08.153Z" }
      },
      {
        type: "move",
        issuer: "computer",
        parameter: {
          move: "Rc1",
          lag: 0,
          ping: 0,
          gamelag: 0,
          gameping: 0
        },
        time: { $date: "2020-08-02T01:51:17.479Z" }
      },
      {
        type: "move",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          move: "Be6",
          lag: 65,
          ping: 64,
          gamelag: 82,
          gameping: 83
        },
        time: { $date: "2020-08-02T01:51:21.309Z" }
      },
      {
        type: "move",
        issuer: "computer",
        parameter: {
          move: "Re1",
          lag: 0,
          ping: 0,
          gamelag: 0,
          gameping: 0
        },
        time: { $date: "2020-08-02T01:51:30.489Z" }
      },
      {
        type: "move",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          move: "Qd7",
          lag: 65,
          ping: 64,
          gamelag: 82,
          gameping: 82
        },
        time: { $date: "2020-08-02T01:51:41.265Z" }
      },
      {
        type: "move",
        issuer: "computer",
        parameter: {
          move: "Rf1",
          lag: 0,
          ping: 0,
          gamelag: 0,
          gameping: 0
        },
        time: { $date: "2020-08-02T01:51:50.153Z" }
      },
      {
        type: "move",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          move: "Rfc8",
          lag: 65,
          ping: 65,
          gamelag: 83,
          gameping: 84
        },
        time: { $date: "2020-08-02T01:51:52.432Z" }
      },
      {
        type: "move",
        issuer: "computer",
        parameter: {
          move: "h4",
          lag: 0,
          ping: 0,
          gamelag: 0,
          gameping: 0
        },
        time: { $date: "2020-08-02T01:52:01.092Z" }
      },
      {
        type: "move",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          move: "Na5",
          lag: 65,
          ping: 65,
          gamelag: 86,
          gameping: 87
        },
        time: { $date: "2020-08-02T01:52:05.218Z" }
      },
      {
        type: "move",
        issuer: "computer",
        parameter: {
          move: "Re1",
          lag: 0,
          ping: 0,
          gamelag: 0,
          gameping: 0
        },
        time: { $date: "2020-08-02T01:52:13.616Z" }
      },
      {
        type: "move",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          move: "c4",
          lag: 65,
          ping: 64,
          gamelag: 85,
          gameping: 86
        },
        time: { $date: "2020-08-02T01:52:15.534Z" }
      },
      {
        type: "move",
        issuer: "computer",
        parameter: {
          move: "Rc2",
          lag: 0,
          ping: 0,
          gamelag: 0,
          gameping: 0
        },
        time: { $date: "2020-08-02T01:52:23.719Z" }
      },
      {
        type: "move",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          move: "Nb3",
          lag: 65,
          ping: 65,
          gamelag: 84,
          gameping: 84
        },
        time: { $date: "2020-08-02T01:52:45.228Z" }
      },
      {
        type: "move",
        issuer: "computer",
        parameter: {
          move: "Nh2",
          lag: 0,
          ping: 0,
          gamelag: 0,
          gameping: 0
        },
        time: { $date: "2020-08-02T01:52:53.189Z" }
      },
      {
        type: "move",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          move: "Nxd2",
          lag: 65,
          ping: 64,
          gamelag: 84,
          gameping: 83
        },
        time: { $date: "2020-08-02T01:52:59.698Z" }
      },
      {
        type: "move",
        issuer: "computer",
        parameter: {
          move: "Qxd2",
          lag: 0,
          ping: 0,
          gamelag: 0,
          gameping: 0
        },
        time: { $date: "2020-08-02T01:53:05.810Z" }
      },
      {
        type: "move",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          move: "Bc7",
          lag: 65,
          ping: 67,
          gamelag: 84,
          gameping: 85
        },
        time: { $date: "2020-08-02T01:53:30.514Z" }
      },
      {
        type: "move",
        issuer: "computer",
        parameter: {
          move: "Rec1",
          lag: 0,
          ping: 0,
          gamelag: 0,
          gameping: 0
        },
        time: { $date: "2020-08-02T01:53:38.073Z" }
      },
      {
        type: "move",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          move: "Ba5",
          lag: 66,
          ping: 69,
          gamelag: 85,
          gameping: 85
        },
        time: { $date: "2020-08-02T01:53:40.807Z" }
      },
      {
        type: "move",
        issuer: "computer",
        parameter: {
          move: "Qd1",
          lag: 0,
          ping: 0,
          gamelag: 0,
          gameping: 0
        },
        time: { $date: "2020-08-02T01:53:45.773Z" }
      },
      {
        type: "move",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          move: "c3",
          lag: 66,
          ping: 66,
          gamelag: 85,
          gameping: 85
        },
        time: { $date: "2020-08-02T01:53:54.722Z" }
      },
      {
        type: "move",
        issuer: "computer",
        parameter: {
          move: "b4",
          lag: 0,
          ping: 0,
          gamelag: 0,
          gameping: 0
        },
        time: { $date: "2020-08-02T01:54:01.957Z" }
      },
      {
        type: "move",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          move: "Bb6",
          lag: 66,
          ping: 67,
          gamelag: 84,
          gameping: 84
        },
        time: { $date: "2020-08-02T01:54:06.892Z" }
      },
      {
        type: "move",
        issuer: "computer",
        parameter: {
          move: "Ra1",
          lag: 0,
          ping: 0,
          gamelag: 0,
          gameping: 0
        },
        time: { $date: "2020-08-02T01:54:13.952Z" }
      },
      {
        type: "move",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          move: "Ra4",
          lag: 66,
          ping: 64,
          gamelag: 86,
          gameping: 86
        },
        time: { $date: "2020-08-02T01:54:17.004Z" }
      },
      {
        type: "move",
        issuer: "computer",
        parameter: {
          move: "Qb1",
          lag: 0,
          ping: 0,
          gamelag: 0,
          gameping: 0
        },
        time: { $date: "2020-08-02T01:54:23.776Z" }
      },
      {
        type: "move",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          move: "Rca8",
          lag: 66,
          ping: 65,
          gamelag: 85,
          gameping: 86
        },
        time: { $date: "2020-08-02T01:54:28.504Z" }
      },
      {
        type: "move",
        issuer: "computer",
        parameter: {
          move: "Nf3",
          lag: 0,
          ping: 0,
          gamelag: 0,
          gameping: 0
        },
        time: { $date: "2020-08-02T01:54:34.958Z" }
      },
      {
        type: "move",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          move: "Bd8",
          lag: 65,
          ping: 65,
          gamelag: 84,
          gameping: 84
        },
        time: { $date: "2020-08-02T01:54:43.819Z" }
      },
      {
        type: "move",
        issuer: "computer",
        parameter: {
          move: "Nxe5",
          lag: 0,
          ping: 0,
          gamelag: 0,
          gameping: 0
        },
        time: { $date: "2020-08-02T01:54:50.044Z" }
      },
      {
        type: "move",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          move: "Qd6",
          lag: 67,
          ping: 76,
          gamelag: 87,
          gameping: 87
        },
        time: { $date: "2020-08-02T01:55:01.324Z" }
      },
      {
        type: "move",
        issuer: "computer",
        parameter: {
          move: "f4",
          lag: 0,
          ping: 0,
          gamelag: 0,
          gameping: 0
        },
        time: { $date: "2020-08-02T01:55:06.616Z" }
      },
      {
        type: "move",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          move: "Nd7",
          lag: 69,
          ping: 78,
          gamelag: 84,
          gameping: 84
        },
        time: { $date: "2020-08-02T01:55:14.884Z" }
      },
      {
        type: "move",
        issuer: "computer",
        parameter: {
          move: "h5",
          lag: 0,
          ping: 0,
          gamelag: 0,
          gameping: 0
        },
        time: { $date: "2020-08-02T01:55:20.555Z" }
      },
      {
        type: "move",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          move: "Nxe5",
          lag: 71,
          ping: 82,
          gamelag: 86,
          gameping: 85
        },
        time: { $date: "2020-08-02T01:55:22.485Z" }
      },
      {
        type: "move",
        issuer: "computer",
        parameter: {
          move: "Qc1",
          lag: 0,
          ping: 0,
          gamelag: 0,
          gameping: 0
        },
        time: { $date: "2020-08-02T01:55:27.950Z" }
      },
      {
        type: "move",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          move: "Nc6",
          lag: 76,
          ping: 91,
          gamelag: 89,
          gameping: 88
        },
        time: { $date: "2020-08-02T01:55:36.123Z" }
      },
      {
        type: "move",
        issuer: "computer",
        parameter: {
          move: "Bf3",
          lag: 0,
          ping: 0,
          gamelag: 0,
          gameping: 0
        },
        time: { $date: "2020-08-02T01:55:41.257Z" }
      },
      {
        type: "move",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          move: "Nxb4",
          lag: 79,
          ping: 80,
          gamelag: 88,
          gameping: 90
        },
        time: { $date: "2020-08-02T01:55:47.417Z" }
      },
      {
        type: "move",
        issuer: "computer",
        parameter: {
          move: "e5",
          lag: 0,
          ping: 0,
          gamelag: 0,
          gameping: 0
        },
        time: { $date: "2020-08-02T01:55:52.332Z" }
      },
      {
        type: "move",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          move: "Qa6",
          lag: 83,
          ping: 83,
          gamelag: 86,
          gameping: 85
        },
        time: { $date: "2020-08-02T01:56:08.772Z" }
      },
      {
        type: "move",
        issuer: "computer",
        parameter: {
          move: "Bxa8",
          lag: 0,
          ping: 0,
          gamelag: 0,
          gameping: 0
        },
        time: { $date: "2020-08-02T01:56:13.377Z" }
      },
      {
        type: "move",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          move: "Nxc2",
          lag: 84,
          ping: 85,
          gamelag: 94,
          gameping: 87
        },
        time: { $date: "2020-08-02T01:56:15.146Z" }
      },
      {
        type: "move",
        issuer: "computer",
        parameter: {
          move: "Bb7",
          lag: 0,
          ping: 0,
          gamelag: 0,
          gameping: 0
        },
        time: { $date: "2020-08-02T01:56:19.552Z" }
      },
      {
        type: "move",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          move: "Qxb7",
          lag: 79,
          ping: 65,
          gamelag: 86,
          gameping: 85
        },
        time: { $date: "2020-08-02T01:56:30.647Z" }
      },
      {
        type: "move",
        issuer: "computer",
        parameter: {
          move: "Qxc2",
          lag: 0,
          ping: 0,
          gamelag: 0,
          gameping: 0
        },
        time: { $date: "2020-08-02T01:56:33.957Z" }
      },
      {
        type: "move",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          move: "Be7",
          lag: 77,
          ping: 69,
          gamelag: 87,
          gameping: 86
        },
        time: { $date: "2020-08-02T01:56:38.102Z" }
      },
      {
        type: "move",
        issuer: "computer",
        parameter: {
          move: "Ne4",
          lag: 0,
          ping: 0,
          gamelag: 0,
          gameping: 0
        },
        time: { $date: "2020-08-02T01:56:42.018Z" }
      },
      {
        type: "move",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          move: "Rxa3",
          lag: 81,
          ping: 100,
          gamelag: 89,
          gameping: 90
        },
        time: { $date: "2020-08-02T01:56:49.911Z" }
      },
      {
        type: "move",
        issuer: "computer",
        parameter: {
          move: "Rxa3",
          lag: 0,
          ping: 0,
          gamelag: 0,
          gameping: 0
        },
        time: { $date: "2020-08-02T01:56:53.679Z" }
      },
      {
        type: "move",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          move: "Bxa3",
          lag: 82,
          ping: 101,
          gamelag: 90,
          gameping: 88
        },
        time: { $date: "2020-08-02T01:56:56.178Z" }
      },
      {
        type: "move",
        issuer: "computer",
        parameter: {
          move: "Qd1",
          lag: 0,
          ping: 0,
          gamelag: 0,
          gameping: 0
        },
        time: { $date: "2020-08-02T01:56:59.635Z" }
      },
      {
        type: "move",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          move: "b4",
          lag: 81,
          ping: 71,
          gamelag: 88,
          gameping: 87
        },
        time: { $date: "2020-08-02T01:57:01.586Z" }
      },
      {
        type: "move",
        issuer: "computer",
        parameter: {
          move: "Nd6",
          lag: 0,
          ping: 0,
          gamelag: 0,
          gameping: 0
        },
        time: { $date: "2020-08-02T01:57:04.896Z" }
      },
      {
        type: "move",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          move: "Qc6",
          lag: 79,
          ping: 81,
          gamelag: 90,
          gameping: 93
        },
        time: { $date: "2020-08-02T01:57:16.707Z" }
      },
      {
        type: "move",
        issuer: "computer",
        parameter: {
          move: "Nf5",
          lag: 0,
          ping: 0,
          gamelag: 0,
          gameping: 0
        },
        time: { $date: "2020-08-02T01:57:19.794Z" }
      },
      {
        type: "move",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          move: "Bxf5",
          lag: 80,
          ping: 74,
          gamelag: 90,
          gameping: 88
        },
        time: { $date: "2020-08-02T01:57:23.114Z" }
      },
      {
        type: "move",
        issuer: "computer",
        parameter: {
          move: "Qc2",
          lag: 0,
          ping: 0,
          gamelag: 0,
          gameping: 0
        },
        time: { $date: "2020-08-02T01:57:25.936Z" }
      },
      {
        type: "move",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          move: "Qb5",
          lag: 83,
          ping: 86,
          gamelag: 91,
          gameping: 90
        },
        time: { $date: "2020-08-02T01:57:32.335Z" }
      },
      {
        type: "move",
        issuer: "computer",
        parameter: {
          move: "Qa2",
          lag: 0,
          ping: 0,
          gamelag: 0,
          gameping: 0
        },
        time: { $date: "2020-08-02T01:57:34.978Z" }
      },
      {
        type: "move",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          move: "Bxd3",
          lag: 85,
          ping: 84,
          gamelag: 92,
          gameping: 90
        },
        time: { $date: "2020-08-02T01:57:38.177Z" }
      },
      {
        type: "move",
        issuer: "computer",
        parameter: {
          move: "g4",
          lag: 0,
          ping: 0,
          gamelag: 0,
          gameping: 0
        },
        time: { $date: "2020-08-02T01:57:40.934Z" }
      },
      {
        type: "move",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          move: "c2",
          lag: 84,
          ping: 77,
          gamelag: 89,
          gameping: 87
        },
        time: { $date: "2020-08-02T01:57:42.586Z" }
      },
      {
        type: "move",
        issuer: "computer",
        parameter: {
          move: "Qxf7+",
          lag: 0,
          ping: 0,
          gamelag: 0,
          gameping: 0
        },
        time: { $date: "2020-08-02T01:57:45.063Z" }
      },
      {
        type: "move",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          move: "Kxf7",
          lag: 83,
          ping: 84,
          gamelag: 91,
          gameping: 92
        },
        time: { $date: "2020-08-02T01:57:47.434Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:57:58.123Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:57:58.325Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:57:58.676Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:57:58.844Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:57:59.185Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:57:59.337Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:57:59.543Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:57:59.653Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:00.467Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:00.485Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:00.503Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:00.521Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:00.537Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:00.557Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:00.573Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:00.592Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:00.608Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:00.626Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:00.643Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:00.658Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:00.676Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:00.691Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:00.710Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:00.726Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:00.744Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:00.759Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:00.775Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:00.793Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:00.809Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:00.829Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:00.846Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:00.864Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:00.879Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:00.896Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:00.913Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:00.930Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:00.948Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:00.962Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:00.979Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:00.994Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:01.009Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:01.066Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:01.086Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:01.102Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:01.119Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:01.135Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:01.152Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:01.167Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:01.184Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:01.197Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:01.214Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:01.229Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:01.243Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:01.260Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:01.273Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:01.289Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:01.304Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:01.318Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:01.335Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:01.350Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:01.367Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:01.380Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:01.395Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:01.410Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:01.424Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:01.441Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:01.455Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:01.468Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:01.484Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:01.497Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:01.513Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:01.528Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:01.544Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:01.558Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:01.570Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:01.588Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:01.600Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:01.616Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:01.630Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:01.644Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:01.659Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:01.672Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:01.689Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:01.703Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:01.719Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:01.733Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:01.750Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:01.764Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:01.780Z" }
      },
      {
        type: "move_backward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: 1,
        time: { $date: "2020-08-02T01:58:01.794Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: null
        },
        time: { $date: "2020-08-02T01:58:03.187Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: null
        },
        time: { $date: "2020-08-02T01:58:03.924Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: null
        },
        time: { $date: "2020-08-02T01:58:04.306Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: null
        },
        time: { $date: "2020-08-02T01:58:04.486Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: null
        },
        time: { $date: "2020-08-02T01:58:04.918Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: null
        },
        time: { $date: "2020-08-02T01:58:05.084Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: null
        },
        time: { $date: "2020-08-02T01:58:05.270Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: null
        },
        time: { $date: "2020-08-02T01:58:05.469Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:07.182Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:07.201Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:07.218Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:07.236Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:07.256Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:07.272Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:07.290Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:07.303Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:07.320Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:07.335Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:07.352Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:07.367Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:07.384Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:07.397Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:07.415Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:07.430Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:07.449Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:07.465Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:07.484Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:07.499Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:07.520Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:07.536Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:07.554Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:07.574Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:07.591Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:07.613Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:07.632Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:07.650Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:07.668Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:07.687Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:07.705Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:07.721Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:07.741Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:07.759Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:07.777Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:07.796Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:07.812Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:07.831Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:07.846Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:07.866Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:07.881Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:07.899Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:07.925Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:07.983Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:08.001Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:08.021Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:08.038Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:08.057Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:08.075Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:08.095Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:08.114Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:08.134Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:08.153Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:08.179Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:08.200Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:08.217Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:08.235Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:08.253Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:08.270Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:08.287Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:08.306Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:08.323Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:08.340Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:08.359Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:08.374Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:08.396Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:08.415Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:08.434Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:08.451Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:08.471Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:08.486Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:08.504Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:08.522Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:08.540Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:08.557Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:08.575Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:08.593Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:08.612Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:08.631Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:08.650Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:08.667Z" }
      },
      {
        type: "move_forward",
        issuer: "xJsLqdYSmPnnAzpdJ",
        parameter: {
          movecount: 1,
          variation: 0
        },
        time: { $date: "2020-08-02T01:58:08.686Z" }
      }
    ],
    black: {
      id: "xJsLqdYSmPnnAzpdJ",
      name: "djlogan",
      rating: 1600
    },
    clocks: {
      white: {
        initial: 5,
        inc_or_delay: 0,
        delaytype: "none",
        current: 966,
        starttime: 1596333467415
      },
      black: {
        initial: 5,
        inc_or_delay: 0,
        delaytype: "none",
        current: 1227,
        starttime: 1596333465041
      }
    },
    computer_variations: [],
    examiners: [
      {
        id: "xJsLqdYSmPnnAzpdJ",
        username: "djlogan"
      }
    ],
    fen: "8/5kp1/7p/1q2P2P/1p1p1PP1/b2b4/2p5/6K1 w - - 0 46",
    isolation_group: "public",
    lag: {
      white: {
        active: [],
        pings: []
      },
      black: {
        active: [],
        pings: [
          84,
          83,
          82,
          82,
          82,
          81,
          80,
          81,
          79,
          81,
          78,
          79,
          83,
          79,
          81,
          78,
          86,
          89,
          78,
          85,
          80,
          79,
          80,
          79,
          79,
          80,
          90,
          81,
          82,
          80,
          78,
          82,
          86,
          84,
          81,
          80,
          81,
          81,
          79,
          78,
          79,
          86,
          78,
          86,
          83,
          78,
          82,
          81,
          81,
          85,
          79,
          79,
          84,
          80,
          82,
          80,
          81,
          80,
          81,
          79,
          84,
          81,
          106,
          80,
          81,
          80,
          84,
          81,
          79,
          79,
          79,
          85,
          82,
          83,
          82,
          82,
          81,
          82,
          87,
          80,
          85,
          80,
          83,
          81,
          84,
          84,
          81,
          81,
          80,
          82,
          77,
          80,
          83,
          80,
          81,
          79,
          80,
          82,
          84,
          79,
          80,
          83,
          83,
          86,
          79,
          80,
          80,
          85,
          81,
          80,
          79,
          82,
          85,
          80,
          101,
          80,
          80,
          80,
          83,
          85,
          82,
          86,
          81,
          80,
          80,
          80,
          82,
          81,
          80,
          98,
          82,
          82,
          90,
          85,
          83,
          80,
          81,
          89,
          81,
          79,
          81,
          84,
          81,
          84,
          81,
          81,
          85,
          82,
          81,
          82,
          82,
          82,
          82,
          84,
          81,
          84,
          83,
          82,
          81,
          82,
          85,
          84,
          86,
          82,
          83,
          82,
          82,
          83,
          83,
          83,
          81,
          85,
          87,
          84,
          84,
          85,
          85,
          81,
          87,
          83,
          82,
          83,
          84,
          86,
          82,
          81,
          85,
          83,
          86,
          84,
          82,
          81,
          88,
          84,
          87,
          81,
          85,
          86,
          83,
          85,
          84,
          82,
          85,
          103,
          86,
          83,
          82,
          82,
          86,
          82,
          82,
          83,
          82,
          80,
          82,
          82,
          82,
          83,
          82,
          83,
          82,
          89,
          82,
          85,
          84,
          82,
          82,
          83,
          81,
          82,
          82,
          82,
          85,
          84,
          89,
          81,
          86,
          83,
          83,
          91,
          91,
          83,
          84,
          83,
          84,
          85,
          92,
          83,
          83,
          86,
          83,
          86,
          86,
          82,
          86,
          87,
          83,
          84,
          87,
          84,
          85,
          83,
          84,
          88,
          85,
          86,
          88,
          85,
          84,
          85,
          87,
          83,
          84,
          85,
          85,
          85,
          81,
          88,
          85,
          85,
          84,
          85,
          84,
          83,
          85,
          84,
          82,
          84,
          87,
          86,
          82,
          95,
          84,
          85,
          85,
          84,
          84,
          84,
          86,
          84,
          83,
          84,
          84,
          84,
          84,
          85,
          87,
          83,
          85,
          83,
          83,
          83,
          84,
          89,
          85,
          84,
          84,
          85,
          85,
          84,
          85,
          83,
          88,
          84,
          84,
          85,
          82,
          86,
          83,
          84,
          85,
          83,
          84,
          84,
          89,
          82,
          85,
          84,
          84,
          83,
          85,
          82,
          85,
          87,
          83,
          88,
          82,
          85,
          89,
          86,
          85,
          85,
          85,
          84,
          85,
          84,
          83,
          84,
          85,
          85,
          86,
          84,
          83,
          85,
          85,
          86,
          83,
          84,
          84,
          84,
          85,
          84,
          102,
          86,
          85,
          85,
          84,
          89,
          90,
          87,
          91,
          87,
          90,
          86,
          88,
          86,
          86,
          165,
          87,
          91,
          91,
          92,
          89,
          88,
          85,
          101,
          84,
          85,
          86,
          86,
          89,
          87,
          86,
          87,
          86,
          100,
          85,
          88,
          85,
          88,
          86,
          85,
          84,
          84,
          90,
          85,
          87,
          87,
          84,
          86,
          206,
          86,
          84,
          86,
          85,
          88,
          86,
          86,
          85,
          86,
          87,
          87,
          86,
          86,
          86,
          87,
          88,
          85,
          85,
          87,
          87,
          84,
          87,
          85,
          84,
          95,
          86,
          87,
          88,
          85,
          87,
          88,
          85,
          88,
          88,
          86,
          88,
          89,
          127,
          86,
          87,
          86,
          90,
          88,
          86,
          88,
          88,
          87,
          90,
          88,
          86,
          89,
          86,
          85,
          89,
          88,
          87,
          90,
          90,
          86,
          88,
          89,
          89,
          88,
          86,
          87,
          87,
          87,
          86,
          87,
          86,
          91,
          88,
          89,
          87,
          85,
          86,
          88,
          85,
          87,
          87,
          89,
          87,
          88,
          87,
          95,
          89,
          91,
          86,
          87,
          88,
          88,
          87,
          89,
          88,
          88,
          87,
          87,
          89,
          88,
          85,
          91,
          86,
          88,
          144,
          88,
          88,
          86,
          164,
          89,
          89,
          90,
          150,
          89,
          89,
          89,
          88,
          88,
          88,
          90,
          90,
          90,
          89,
          89,
          89,
          88,
          96,
          88,
          90,
          87,
          90,
          87,
          93,
          91,
          89,
          84,
          90,
          87,
          87,
          92,
          88,
          88,
          92,
          90,
          91,
          88,
          93,
          89,
          91,
          92,
          87,
          93,
          88,
          169,
          90,
          90,
          89,
          90,
          87,
          87,
          87,
          93,
          90,
          90,
          91,
          124,
          94,
          90,
          99,
          93,
          97,
          92,
          87,
          93,
          89,
          107,
          91,
          92,
          88
        ]
      }
    },
    observers: [
      {
        id: "xJsLqdYSmPnnAzpdJ",
        username: "djlogan"
      }
    ],
    rated: false,
    rating_type: "blitz",
    result: "0-1",
    skill_level: 3,
    startTime: { $date: "2020-08-02T01:58:08.686Z" },
    status: "examining",
    status2: 2,
    tomove: "white",
    variations: {
      hmtb: 0,
      cmi: 90,
      movelist: [
        {
          variations: [1]
        },
        {
          move: "c4",
          prev: 0,
          current: 300000,
          variations: [2]
        },
        {
          move: "d5",
          prev: 1,
          current: 300066,
          variations: [3]
        },
        {
          move: "Nc3",
          prev: 2,
          current: 299866,
          variations: [4]
        },
        {
          move: "d4",
          prev: 3,
          current: 297161,
          variations: [5]
        },
        {
          move: "Ne4",
          prev: 4,
          current: 288976,
          variations: [6]
        },
        {
          move: "e5",
          prev: 5,
          current: 294039,
          variations: [7]
        },
        {
          move: "Ng3",
          prev: 6,
          current: 279080,
          variations: [8]
        },
        {
          move: "Nf6",
          prev: 7,
          current: 292408,
          variations: [9]
        },
        {
          move: "d3",
          prev: 8,
          current: 267201,
          variations: [10]
        },
        {
          move: "Bd6",
          prev: 9,
          current: 286506,
          variations: [11]
        },
        {
          move: "Bd2",
          prev: 10,
          current: 255841,
          variations: [12]
        },
        {
          move: "O-O",
          prev: 11,
          current: 281234,
          variations: [13]
        },
        {
          move: "Nf3",
          prev: 12,
          current: 249999,
          variations: [14]
        },
        {
          move: "c5",
          prev: 13,
          current: 277904,
          variations: [15]
        },
        {
          move: "e4",
          prev: 14,
          current: 239011,
          variations: [16]
        },
        {
          move: "Nc6",
          prev: 15,
          current: 275343,
          variations: [17]
        },
        {
          move: "Be2",
          prev: 16,
          current: 228321,
          variations: [18]
        },
        {
          move: "Bd7",
          prev: 17,
          current: 269405,
          variations: [19]
        },
        {
          move: "Rb1",
          prev: 18,
          current: 217783,
          variations: [20]
        },
        {
          move: "a6",
          prev: 19,
          current: 262373,
          variations: [21]
        },
        {
          move: "a3",
          prev: 20,
          current: 207730,
          variations: [22]
        },
        {
          move: "b5",
          prev: 21,
          current: 260833,
          variations: [23]
        },
        {
          move: "cxb5",
          prev: 22,
          current: 198557,
          variations: [24]
        },
        {
          move: "axb5",
          prev: 23,
          current: 257844,
          variations: [25]
        },
        {
          move: "O-O",
          prev: 24,
          current: 190124,
          variations: [26]
        },
        {
          move: "h6",
          prev: 25,
          current: 254953,
          variations: [27]
        },
        {
          move: "Rc1",
          prev: 26,
          current: 180650,
          variations: [28]
        },
        {
          move: "Be6",
          prev: 27,
          current: 220399,
          variations: [29]
        },
        {
          move: "Re1",
          prev: 28,
          current: 171333,
          variations: [30]
        },
        {
          move: "Qd7",
          prev: 29,
          current: 216574,
          variations: [31]
        },
        {
          move: "Rf1",
          prev: 30,
          current: 162162,
          variations: [32]
        },
        {
          move: "Rfc8",
          prev: 31,
          current: 205817,
          variations: [33]
        },
        {
          move: "h4",
          prev: 32,
          current: 153284,
          variations: [34]
        },
        {
          move: "Na5",
          prev: 33,
          current: 203481,
          variations: [35]
        },
        {
          move: "Re1",
          prev: 34,
          current: 144634,
          variations: [36]
        },
        {
          move: "c4",
          prev: 35,
          current: 199362,
          variations: [37]
        },
        {
          move: "Rc2",
          prev: 36,
          current: 136247,
          variations: [38]
        },
        {
          move: "Nb3",
          prev: 37,
          current: 197454,
          variations: [39]
        },
        {
          move: "Nh2",
          prev: 38,
          current: 128084,
          variations: [40]
        },
        {
          move: "Nxd2",
          prev: 39,
          current: 175954,
          variations: [41]
        },
        {
          move: "Qxd2",
          prev: 40,
          current: 120129,
          variations: [42]
        },
        {
          move: "Bc7",
          prev: 41,
          current: 169452,
          variations: [43]
        },
        {
          move: "Rec1",
          prev: 42,
          current: 114027,
          variations: [44]
        },
        {
          move: "Ba5",
          prev: 43,
          current: 144772,
          variations: [45]
        },
        {
          move: "Qd1",
          prev: 44,
          current: 106473,
          variations: [46]
        },
        {
          move: "c3",
          prev: 45,
          current: 142046,
          variations: [47]
        },
        {
          move: "b4",
          prev: 46,
          current: 101516,
          variations: [48]
        },
        {
          move: "Bb6",
          prev: 47,
          current: 133103,
          variations: [49]
        },
        {
          move: "Ra1",
          prev: 48,
          current: 94292,
          variations: [50]
        },
        {
          move: "Ra4",
          prev: 49,
          current: 128175,
          variations: [51]
        },
        {
          move: "Qb1",
          prev: 50,
          current: 87243,
          variations: [52]
        },
        {
          move: "Rca8",
          prev: 51,
          current: 125130,
          variations: [53]
        },
        {
          move: "Nf3",
          prev: 52,
          current: 80481,
          variations: [54]
        },
        {
          move: "Bd8",
          prev: 53,
          current: 120412,
          variations: [55]
        },
        {
          move: "Nxe5",
          prev: 54,
          current: 74035,
          variations: [56]
        },
        {
          move: "Qd6",
          prev: 55,
          current: 111558,
          variations: [57]
        },
        {
          move: "f4",
          prev: 56,
          current: 67828,
          variations: [58]
        },
        {
          move: "Nd7",
          prev: 57,
          current: 100284,
          variations: [59]
        },
        {
          move: "h5",
          prev: 58,
          current: 62539,
          variations: [60]
        },
        {
          move: "Nxe5",
          prev: 59,
          current: 92029,
          variations: [61]
        },
        {
          move: "Qc1",
          prev: 60,
          current: 56876,
          variations: [62]
        },
        {
          move: "Nc6",
          prev: 61,
          current: 90136,
          variations: [63]
        },
        {
          move: "Bf3",
          prev: 62,
          current: 51395,
          variations: [64]
        },
        {
          move: "Nxb4",
          prev: 63,
          current: 81970,
          variations: [65]
        },
        {
          move: "e5",
          prev: 64,
          current: 46270,
          variations: [66]
        },
        {
          move: "Qa6",
          prev: 65,
          current: 75816,
          variations: [67]
        },
        {
          move: "Bxa8",
          prev: 66,
          current: 41403,
          variations: [68]
        },
        {
          move: "Nxc2",
          prev: 67,
          current: 59348,
          variations: [69]
        },
        {
          move: "Bb7",
          prev: 68,
          current: 36807,
          variations: [70]
        },
        {
          move: "Qxb7",
          prev: 69,
          current: 57580,
          variations: [71]
        },
        {
          move: "Qxc2",
          prev: 70,
          current: 32410,
          variations: [72]
        },
        {
          move: "Be7",
          prev: 71,
          current: 46494,
          variations: [73]
        },
        {
          move: "Ne4",
          prev: 72,
          current: 29112,
          variations: [74]
        },
        {
          move: "Rxa3",
          prev: 73,
          current: 42353,
          variations: [75]
        },
        {
          move: "Rxa3",
          prev: 74,
          current: 25207,
          variations: [76]
        },
        {
          move: "Bxa3",
          prev: 75,
          current: 34466,
          variations: [77]
        },
        {
          move: "Qd1",
          prev: 76,
          current: 21447,
          variations: [78]
        },
        {
          move: "b4",
          prev: 77,
          current: 31973,
          variations: [79]
        },
        {
          move: "Nd6",
          prev: 78,
          current: 17995,
          variations: [80]
        },
        {
          move: "Qc6",
          prev: 79,
          current: 30040,
          variations: [81]
        },
        {
          move: "Nf5",
          prev: 80,
          current: 14686,
          variations: [82]
        },
        {
          move: "Bxf5",
          prev: 81,
          current: 18240,
          variations: [83]
        },
        {
          move: "Qc2",
          prev: 82,
          current: 11623,
          variations: [84]
        },
        {
          move: "Qb5",
          prev: 83,
          current: 14910,
          variations: [85]
        },
        {
          move: "Qa2",
          prev: 84,
          current: 8808,
          variations: [86]
        },
        {
          move: "Bxd3",
          prev: 85,
          current: 8516,
          variations: [87]
        },
        {
          move: "g4",
          prev: 86,
          current: 6173,
          variations: [88]
        },
        {
          move: "c2",
          prev: 87,
          current: 5338,
          variations: [89]
        },
        {
          move: "Qxf7+",
          prev: 88,
          current: 3433,
          variations: [90]
        },
        {
          move: "Kxf7",
          prev: 89,
          current: 3685
        }
      ],
    },
    white: {
      id: "computer",
      name: "Computer",
      rating: 1600
    },
    wild: 0
  };
});
