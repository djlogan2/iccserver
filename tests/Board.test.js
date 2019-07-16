//const Board = require("../imports/ui/pages/components/Board/Board");
import Board from "../imports/ui/pages/components/Board/Board";

describe("Board", () => {
  it("Mmust return correct x and y values with no rank and file and black on top", () => {
    const props = {
      cssmanager: null,
      circle: {
        lineWidth: 2,
        color: "red"
      },
      arrow: {
        lineWidth: 2,
        color: "red"
      },
      board: [],
      draw_rank_and_file: null,
      side: 80,
      top: "b"
    };
    const board = new Board(props);
    const coords = board._squareToCoordinate(2, 6);
    expect(coords).toStrictEqual({ x: 65, y: 55 });
  });

  it("Mmust return correct x and y values with no rank and file and white on top", () => {
    const props = {
      cssmanager: null,
      circle: {
        lineWidth: 2,
        color: "red"
      },
      arrow: {
        lineWidth: 2,
        color: "red"
      },
      board: [],
      draw_rank_and_file: null,
      side: 80,
      top: "w"
    };
    const board = new Board(props);
    const coords = board._squareToCoordinate(2, 6);
    expect(coords).toStrictEqual({ x: 15, y: 25 });
  });

  it("Mmust return correct x and y values with rank and file on bottom right and black on top", () => {
    const props = {
      cssmanager: null,
      circle: {
        lineWidth: 2,
        color: "red"
      },
      arrow: {
        lineWidth: 2,
        color: "red"
      },
      board: [],
      draw_rank_and_file: "br",
      side: 90,
      top: "b"
    };
    const board = new Board(props);
    const coords = board._squareToCoordinate(2, 6);
    expect(coords).toStrictEqual({ x: 65, y: 55 });
  });

  it("Mmust return correct x and y values with rank and file bottom right and white on top", () => {
    const props = {
      cssmanager: null,
      circle: {
        lineWidth: 2,
        color: "red"
      },
      arrow: {
        lineWidth: 2,
        color: "red"
      },
      board: [],
      draw_rank_and_file: "br",
      side: 90,
      top: "w"
    };
    const board = new Board(props);
    const coords = board._squareToCoordinate(2, 6);
    expect(coords).toStrictEqual({ x: 15, y: 25 });
  });

  it("Mmust return correct x and y values with rank and file on top left and black on top", () => {
    const props = {
      cssmanager: null,
      circle: {
        lineWidth: 2,
        color: "red"
      },
      arrow: {
        lineWidth: 2,
        color: "red"
      },
      board: [],
      draw_rank_and_file: "tl",
      side: 90,
      top: "b"
    };
    const board = new Board(props);
    const coords = board._squareToCoordinate(2, 6);
    expect(coords).toStrictEqual({ x: 75, y: 65 });
  });

  it("Mmust return correct x and y values with rank and file top left and white on top", () => {
    const props = {
      cssmanager: null,
      circle: {
        lineWidth: 2,
        color: "red"
      },
      arrow: {
        lineWidth: 2,
        color: "red"
      },
      board: [],
      draw_rank_and_file: "tl",
      side: 90,
      top: "w"
    };
    const board = new Board(props);
    const coords = board._squareToCoordinate(2, 6);
    expect(coords).toStrictEqual({ x: 25, y: 35 });
  });
});
