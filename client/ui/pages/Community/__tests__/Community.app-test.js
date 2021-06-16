import React from "react";
import chai from "chai";
import { createBrowserHistory } from "history";
import Community from "../Community";
import { mount } from "enzyme";
import { Router } from "react-router-dom";

describe("Community component", () => {
  const history = createBrowserHistory();
  const mockProps = {
    isReady: true,
    css: {
      communityCss: {
        sidebar: {},
        messengerWithRightMenu: {},
        messenger: {},
        rightBlock: {},
      },
    },
    allRooms: [],
    notMyRooms: [],
  };

  const component = mount(
    <Router history={history}>
      <Community {...mockProps} />
    </Router>
  );

  it("should render", () => {
    chai.assert.isDefined(component);
  });

  // it("should open modal", () => {
  //   const community = component.find(Community);
  //   chai.assert.equal(component.find(Community).length, 1);
  //   community.setState({ isRightMenu: true });
  // });
});
