//const Board = require("../imports/ui/pages/components/Board/Board");
import Board from "../imports/ui/pages/components/Board/Board";

describe("Board", () => {
  it("Board must return correct x and y values with no rank and file", () => {
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
    const coords = board._squareToCoordinate(5, 2);
    expect(coords).toBe({ x: 55, y: 65 });
  });
});
