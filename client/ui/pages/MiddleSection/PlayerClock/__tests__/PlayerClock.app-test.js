import React from "react";
import chai from "chai";
import { mount } from "enzyme";
import PlayerClock from "../PlayerClock";

describe("PlayerClock component", () => {
  const mockProps = {
    color: "white",
    side: 10,
    game: {
      _id: "qW5KRbN4PAHkN7mZS",
      actions: [],
      analysis: [
        {
          id: "erZJiWtf97Yp8FeRi",
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
          id: "erZJiWtf97Yp8FeRi",
          username: "username1",
        },
      ],
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      isolation_group: "public",
      observers: [
        {
          id: "erZJiWtf97Yp8FeRi",
          username: "username1",
        },
      ],
      owner: "erZJiWtf97Yp8FeRi",
      result: "*",
      startTime: { $date: "2021-06-17T17:17:40.774Z" },
      status: "examining",
      tomove: "white",
      variations: {
        cmi: 0,
        movelist: [{}],
        ecocodes: [],
      },
      white: {
        name: "Mr white",
        rating: 1600,
      },
      wild: 0,
    },
  };
  
  it.only("should render", () => {
    const component = mount(<PlayerClock {...mockProps} />);
    chai.assert.isDefined(component);
  });
});
