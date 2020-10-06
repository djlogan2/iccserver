/*
import PlayModaler from "../ui/pages/components/Modaler/PlayModaler";
import chai from "chai";

import React from "react";
//import ReactDOM from "react-dom";
import ReactTestUtils from "react-dom/test-utils";
import JSDOM from "jsdom";

describe.skip("test this", function() {
  //let dom;
  let container;

  before(() => {
    //dom = new JSDOM("<html><body></body></html>");
    global.document = new JSDOM("<html><body></body></html>");
    global.window = global.document.defaultView;
    global.navigator = { userAgent: "node.js" };
  });

  after(() => {
    delete global.document;
    delete global.window;
    delete global.navigator;
  });

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    container = null;
  });

  it("should work", function() {
    this.timeout(500000);
    const component = ReactTestUtils.renderIntoDocument(<PlayModaler />);
    chai.assert.fail("do me");
  });
});
*/
