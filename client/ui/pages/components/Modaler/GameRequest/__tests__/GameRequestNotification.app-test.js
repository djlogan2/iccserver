import React from "react";
import chai from "chai";
import { mount } from "enzyme";
import gameRequestNotification from "../GameRequestNotification";
import { colorWhite } from "../../../../../../constants/gameConstants";

describe("GameRequestNotification component", () => {
  it("should render", () => {
    const mockProps = {
      gameRequest: {
        challenger: "test",
        challenger_rating: 1500,
        challenger_time: 15,
        challenger_inc_or_delay: "inc",
        rating_type: "rated",
        rated: true,
        challenger_color_request: colorWhite,
      },
      onAcceptGame: () => null,
      onDeclineGame: () => null,
      translate: () => null,
      classes: {},
    };
    gameRequestNotification(
      mockProps.gameRequest,
      mockProps.translate,
      mockProps.classes,
      mockProps.onAcceptGame,
      mockProps.onDeclineGame
    );
  });
});
