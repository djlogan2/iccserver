import React from "react";
import renderNotification from "../index";
import CssManager from "../../Css/CssManager";

describe("Notification modal", () => {
  it("should render notification", () => {
    renderNotification({
      title: "fake_title",
      action: "takeBack",
      cssManager: new CssManager({}, {}),
      gameId: "fake_game_id",
      classes: {},
      translate: () => null,
    });
  });
});
