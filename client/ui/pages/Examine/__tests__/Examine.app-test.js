import React from "react";
import chai from "chai";
import { createBrowserHistory } from "history";
import { Router } from "react-router-dom";
import { mount } from "enzyme";
import Examine from "../Examine";
import sinon from "sinon";
import { Meteor } from "meteor/meteor";
import StubCollections from "meteor/hwillson:stub-collections";
import {
  Chat,
  ChildChatTexts,
  DynamicRatingsCollection,
  Game,
  ImportedGameCollection
} from "../../../../../imports/api/client/collections";

describe("Examine component", () => {
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

    StubCollections.stub([
      Chat,
      ChildChatTexts,
      Game,
      ImportedGameCollection,
      DynamicRatingsCollection,
    ]);
    sinon.stub(Meteor, "subscribe").returns({ subscriptionId: 0, ready: () => true });

    sinon.replace(Meteor, "call", (methodName, ...rest) => {
      if (methodName === "startLocalExaminedGame") {
        rest[4]("fake_error");
      }
    });
  });

  afterEach(() => {
    Meteor.user.restore();
    Meteor.userId.restore();

    StubCollections.restore();
    Meteor.subscribe.restore();

    sinon.restore();
  });

  const history = createBrowserHistory();

  it("should render", () => {
    Factory.define("game", Game, {
      _id: "7BBXryAXwojBbKyHP",
      actions: [
        {
          type: "move",
          issuer: "gjzJZsorAuEnrxoGo",
          parameter: {
            move: "e4",
            lag: 61,
            ping: 57,
            gamelag: 0,
            gameping: 0,
          },
          time: "2021-06-02T22:06:35.482Z",
        },
        {
          type: "move",
          issuer: "k5GszXF8T7QyWgjhJ",
          parameter: {
            move: "e5",
            lag: 73,
            ping: 51,
            gamelag: 0,
            gameping: 0,
          },
          time: "2021-06-02T22:06:46.870Z" ,
        },
        {
          type: "move",
          issuer: "gjzJZsorAuEnrxoGo",
          parameter: {
            move: "Nf3",
            lag: 60,
            ping: 56,
            gamelag: 0,
            gameping: 0,
          },
          time: "2021-06-02T22:06:49.865Z",
        },
        {
          type: "move",
          issuer: "k5GszXF8T7QyWgjhJ",
          parameter: {
            move: "d5",
            lag: 71,
            ping: 54,
            gamelag: 0,
            gameping: 0,
          },
          time: "2021-06-02T22:06:54.989Z",
        },
        {
          type: "move",
          issuer: "gjzJZsorAuEnrxoGo",
          parameter: {
            move: "Nxe5",
            lag: 60,
            ping: 58,
            gamelag: 0,
            gameping: 0,
          },
          time: "2021-06-02T22:07:03.029Z",
        },
      ],
      black: {
        id: "k5GszXF8T7QyWgjhJ",
        name: "djl1",
        rating: 1614,
      },
      clocks: {
        white: {
          initial: 99,
          inc_or_delay: 0,
          delaytype: "inc",
          starttime: 1622671614986,
        },
        black: {
          initial: 99,
          inc_or_delay: 0,
          delaytype: "inc",
          starttime: 1622671623022,
        },
      },
      computer_variations: [],
      examiners: [],
      fen: "rnbqkbnr/ppp2ppp/8/3pN3/4P3/8/PPPP1PPP/RNBQKB1R b KQkq - 0 3",
      isolation_group: "public",
      lag: {
        white: {
          active: [],
          pings: [],
        },
        black: {
          active: [],
          pings: [],
        },
      },
      observers: [],
      premove: {
        color: "w",
        from: "e4",
        to: "d5",
        flags: "c",
        piece: "p",
        san: "exd5",
        message_identifier: "gameMove",
      },
      rated: true,
      rating_type: "standard",
      result: "1-0",
      startTime: "2021-06-02T22:06:27.888Z",
      status: "examining",
      status2: 2,
      tomove: "black",
      variations: {
        hmtb: 0,
        cmi: 5,
        movelist: [
          {
            variations: [1],
          },
          {
            move: "e4",
            smith: {
              piece: "p",
              color: "w",
              from: "e2",
              to: "e4",
            },
            prev: 0,
            current: 5940000,
            variations: [2],
          },
          {
            move: "e5",
            smith: {
              piece: "p",
              color: "b",
              from: "e7",
              to: "e5",
            },
            prev: 1,
            current: 5940075,
            variations: [3],
          },
          {
            move: "Nf3",
            smith: {
              piece: "n",
              color: "w",
              from: "g1",
              to: "f3",
            },
            prev: 2,
            current: 5932469,
            variations: [4],
          },
          {
            move: "d5",
            smith: {
              piece: "p",
              color: "b",
              from: "d7",
              to: "d5",
            },
            prev: 3,
            current: 5928767,
            variations: [5],
          },
          {
            move: "Nxe5",
            smith: {
              piece: "n",
              color: "w",
              from: "f3",
              to: "e5",
            },
            prev: 4,
            current: 5929544,
          },
        ],
      },
      white: {
        id: "gjzJZsorAuEnrxoGo",
        name: "djl2",
        rating: 1584,
      },
      wild: 0,
    });
    const test1 = Factory.create("game");
    Factory.define("importedGames", ImportedGameCollection, {});
    const test2 = Factory.create("importedGames");
    Tracker.flush();

    const component = mount(
      <Router history={history}>
        <Examine />
      </Router>
    );

    chai.assert.isDefined(component);
  });
});
