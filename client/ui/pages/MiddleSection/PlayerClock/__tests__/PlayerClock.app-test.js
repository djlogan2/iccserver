import { expect } from "chai";
import { mount, ReactWrapper } from "enzyme";
import React from "react";
import PlayerClock from "../PlayerClock";
import { TimePicker } from "antd";
import moment from "moment";
import Sinon from "sinon";

describe.only("PlayerClock component", () => {
  const mockProps = {
    color: "white",
    handleUpdate: (data, cb) => {
      cb();
    },
    isGameOn: false,
    isMyTurn: true,
    side: 560,
    tagColor: "White",
    timerBlinkingSecs: 10,
    game: {
      _id: "Hh4RESSJck4C4QnrX",
      observers: [{ id: "3pen9fQ6voeumAR3x", username: "rsv_k" }],
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      tomove: "white",
      pending: {
        white: { draw: "0", abort: "0", adjourn: "0", takeback: { number: 0, mid: "0" } },
        black: { draw: "0", abort: "0", adjourn: "0", takeback: { number: 0, mid: "0" } },
      },
      white: { id: "3pen9fQ6voeumAR3x", name: "rsv_k", rating: 1600 },
      black: { id: "computer", name: "Computer", rating: 1600 },
      wild: 0,
      rating_type: "bullet",
      rated: false,
      skill_level: 5,
      clocks: {
        white: {
          initial: 15,
          inc_or_delay: 10,
          delaytype: "none",
          current: 900000,
          starttime: 1634903561364,
        },
        black: { initial: 15, inc_or_delay: 10, delaytype: "none", current: 900000, starttime: 0 },
      },
      status: "examining",
      variations: { hmtb: 0, cmi: 0, movelist: [{ wcurrent: 60000, bcurrent: 60000 }] },
      computer_variations: [],
      startTime: "2021-10-22T11:52:41.372Z",
      examiners: [{ id: "3pen9fQ6voeumAR3x", username: "rsv_k" }],
      result: "0-1",
      status2: 2,
    },
  };
  let component;
  beforeEach(() => {
    component = mount(<PlayerClock {...mockProps} />);
  });

  afterEach(() => {
    component.unmount();
  });

  it("Should render component", () => {
    const clock = component.find("[aria-label='clock']");
    expect(clock.length).to.equal(1);
  });

  it("Should set initial time", () => {
    const clock = component.find("[aria-label='clock']");
    expect(clock.text()).to.equal("00:15:00");
  });

  it("Should edit clock", async () => {
    const clock = component.find("[aria-label='clock']");
    clock.simulate("click");

    const timePicker = component.find(TimePicker);
    expect(timePicker.length).to.equal(1);

    const time = new Date().setHours(0, 0, 0, 0) + 3 * 60 * 1000;
    timePicker.prop("onChange")(moment(time));
    component.update();

    expect(component.text()).to.equal("00:03:00");
  });
});
