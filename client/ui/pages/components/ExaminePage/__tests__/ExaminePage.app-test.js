import React from "react";
import chai from "chai";
import { mount } from "enzyme";
import Chess from "chess.js/chess";
import ExaminePage from "../ExaminePage";
import CssManager from "../../Css/CssManager";
import { defaultCapture, gameObserveDefault } from "../../../../../constants/gameConstants";

// describe("Examine Page component", () => {
//   const chess = new Chess.Chess();
//   chess.load("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR");
//
//   const mockProps = {
//     cssManager: new CssManager(),
//     board: chess,
//     observeUser: () => null,
//     unObserveUser: () => null,
//     onPgnUpload: () => null,
//     capture: defaultCapture,
//     game: gameObserveDefault,
//     onImportedGames: () => null,
//     onDrop: () => null,
//     onDrawObject: () => null,
//   };
//
//   const component = mount(<ExaminePage {...mockProps} />);
//   it("should render", () => {
//     chai.assert.isDefined(component);
//   });
// });
