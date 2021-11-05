import React from "react";
import chai from "chai";
import { mount } from "enzyme";
import Chess from "chess.js/chess";

import NewChessBoard from "../NewChessBoard";
import { gameStatusExamining } from "../../../../constants/gameConstants";

describe("NewChessBoard component", () => {
  const chess = new Chess.Chess();
  chess.load("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR");

  const game = {
    _id: "fake_id",
    arrows: [],
    circles: [],
    status: gameStatusExamining,
    premove: true,
    black: { _id: "fake_black_id" },
    white: { _id: "fake_white_id" },
    variations: {
      hmtb: 0,
      cmi: 5,
      movelist: [
        { variations: [1] },
        {
          move: "e4",
          smith: { piece: "p", color: "w", from: "e2", to: "e4" },
          prev: 0,
          current: 5940000,
          variations: [2],
        },
        {
          move: "e5",
          smith: { piece: "p", color: "b", from: "e7", to: "e5" },
          prev: 1,
          current: 5940075,
          variations: [3],
        },
        {
          move: "Nf3",
          smith: { piece: "n", color: "w", from: "g1", to: "f3" },
          prev: 2,
          current: 5932469,
          variations: [4],
        },
        {
          move: "d5",
          smith: { piece: "p", color: "b", from: "d7", to: "d5" },
          prev: 3,
          current: 5928767,
          variations: [5],
        },
        {
          move: "Nxe5",
          smith: { piece: "n", color: "w", from: "f3", to: "e5" },
          prev: 4,
          current: 5929544,
        },
      ],
    },
  };

  const mockProps = {
    gameId: game._id,
    chess: chess,
    height: 200,
    width: 200,
    arrows: game.arrows,
    circles: game.circles,
    orientation: "white",
    onDrop: () => null,
    onDrawObject: () => null,
    gameStatus: game.status,
    premove: game.premove,
    blackId: game?.black?.id,
    whiteId: game?.white?.id,
    variations: game.variations,
  };
  const component = mount(<NewChessBoard {...mockProps} />);

  it("should render", () => {
    chai.assert.isDefined(component);
  });

  // TODO fix it
  // it("should return correct colors", () => {
  //   chai.assert.equal(
  //     component.instance().getColorFromEvent({ altKey: true, shiftKey: true }),
  //     "#d40000"
  //   );
  //   chai.assert.equal(
  //     component.instance().getColorFromEvent({ altKey: true, ctrlKey: true }),
  //     "#f6e000"
  //   );
  //   chai.assert.equal(component.instance().getColorFromEvent({}), "#35bc00");
  // });
});
