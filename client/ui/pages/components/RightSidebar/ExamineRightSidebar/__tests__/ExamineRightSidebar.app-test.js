import React from "react";
import chai from "chai";
import { mount } from "enzyme";
import { createBrowserHistory } from "history";
import { Router } from "react-router-dom";

import ExamineRightSidebar from "../ExamineRightSidebar";
import CssManager from "../../../Css/CssManager";

describe("ExamineRightSidebar component", () => {
  const history = createBrowserHistory();
  const mockProps = {
    gameRequest: { _id: "fake_id" },
    game: {},
    observeUser: () => null,
    unObserveUser: () => null,
    moveList: [],
    cssManager: new CssManager({}, {}),
    flip: () => null,
    onPgnUpload: () => null,
    onImportedGames: () => null,
  };

  // const component = mount(
  //   <Router history={history}>
  //     <ExamineRightSidebar {...mockProps} />
  //   </Router>
  // );
  //
  // it("should render", () => {
  //   chai.assert.isDefined(component);
  // });
});
