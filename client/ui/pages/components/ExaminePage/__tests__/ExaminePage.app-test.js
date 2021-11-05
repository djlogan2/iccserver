import React from "react";
import chai from "chai";
import { mount } from "enzyme";
import { createBrowserHistory } from "history";
import { Router } from "react-router-dom";
import Chess from "chess.js/chess";
import ExaminePage from "../ExaminePage";
import CssManager from "../../Css/CssManager";
import { DEFAULT_CAPTURE } from "../../../../../constants/gameConstants";
import sinon from "sinon";
import { Meteor } from "meteor/meteor";

describe("Examine Page component", () => {
  const currentUser = {
    username: "test",
    email: "test@test.com",
    _id: "fake_id",
    status: { game: "none" },
  };

  beforeEach(() => {
    sinon.stub(Meteor, "user");
    Meteor.user.returns(currentUser);

    sinon.stub(Meteor, "userId");
    Meteor.userId.returns(currentUser._id);

    sinon.stub(Meteor, "logout");
    Meteor.logout.returns();

    sinon.replace(Meteor, "call", (methodName, methodDesc, name1, name2, wildNumber, callback) => {
      if (methodName === "startLocalExaminedGame") {
        callback("fake_error");
      }
    });
  });

  afterEach(() => {
    Meteor.user.restore();
    Meteor.userId.restore();
    Meteor.logout.restore();

    sinon.restore();
  });

  const chess = new Chess.Chess();
  chess.load("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR");

  const mockProps = {
    cssManager: new CssManager(),
    board: chess,
    observeUser: () => null,
    unObserveUser: () => null,
    onPgnUpload: () => null,
    capture: DEFAULT_CAPTURE,
    game: {
      _id: "4saWG76oCBB39RYmN",
      actions: [],
      analysis: [
        {
          id: "zN5bSTufeAS8QFQi8",
          username: "username1",
        },
      ],
      arrows: [],
      black: {
        name: "Mr black",
        rating: 1600,
      },
      circles: [],
      computer_variations: [],
      examiners: [
        {
          id: "zN5bSTufeAS8QFQi8",
          username: "username1",
        },
      ],
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      isolation_group: "public",
      observers: [
        {
          id: "zN5bSTufeAS8QFQi8",
          username: "username1",
        },
      ],
      owner: "zN5bSTufeAS8QFQi8",
      result: "*",
      startTime: { $date: "2021-06-23T13:27:50.460Z" },
      status: "examining",
      tomove: "white",
      variations: {
        cmi: 0,
        movelist: [{}],
      },
      white: {
        name: "Mr white",
        rating: 1600,
      },
      wild: 0,
    },
    onImportedGames: () => null,
    onDrop: () => null,
    onDrawObject: () => null,
  };

  const history = createBrowserHistory();

  it("should render", () => {
    const component = mount(
      <Router history={history}>
        <ExaminePage {...mockProps} />
      </Router>
    );

    Promise.resolve(component).then(() => {
      chai.assert.isDefined(component);
  
      component.unmount();
    })

  });

  it("should call flip function", () => {
    const component = mount(
      <Router history={history}>
        <ExaminePage {...mockProps} />
      </Router>
    );

    Promise.resolve(component).then(() => {
      chai.assert.equal(component.find("button#flip-button").length, 1);
      component.find("button#flip-button").simulate("click");
    })
  });
});
