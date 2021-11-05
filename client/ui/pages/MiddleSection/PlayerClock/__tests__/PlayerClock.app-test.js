import { expect } from "chai";
import { mount } from "enzyme";
import React from "react";
import PlayerClock from "../PlayerClock";
import { TimePicker } from "antd";
import moment from "moment";
import Sinon from "sinon";

describe("PlayerClock component", () => {
  const getGameMock = ({
    color = "white",
    isGameOn = false,
    isMyTurn = true,
    tagColor = "White",
    tomove = "white",
    initial = 15,
    inc_or_delay = 10,
    delaytype = "none",
    current = 15 * 60 * 1000,
  }) => ({
    color,
    handleUpdate: (data, cb) => {
      cb();
    },
    isGameOn,
    isMyTurn,
    tagColor,
    timerBlinkingSecs: 10,
    game: {
      tomove,
      clocks: {
        white: {
          initial,
          inc_or_delay,
          delaytype,
          current,
          starttime: Date.now(),
        },
        black: { initial, inc_or_delay, delaytype, current, starttime: Date.now() },
      },
      status: "examining",
      variations: { hmtb: 0, cmi: 0, movelist: [{ wcurrent: 60000, bcurrent: 60000 }] },
    },
  });

  it("Should render component", () => {
    const mockProps = getGameMock({});
    const component = mount(<PlayerClock {...mockProps} />);

    Promise.resolve(component).then(() => {
      const clock = component.find("[aria-label='clock']");
      expect(clock.length).to.equal(1);
    });
  });

  it("Should set initial time", () => {
    const mockProps = getGameMock({});

    const component = mount(<PlayerClock {...mockProps} />);
    Promise.resolve(component).then(() => {
      const clock = component.find("[aria-label='clock']");
      expect(clock.text()).to.equal("00:15:00");
    });
  });

  it("Should edit clock", () => {
    const mockProps = getGameMock({});

    const component = mount(<PlayerClock {...mockProps} />);
    Promise.resolve(component).then(() => {
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

  it("Should show ms when running out of time", () => {
    const mockProps = getGameMock({ isGameOn: true, initial: 1, current: 60 });

    const timer = Sinon.useFakeTimers(mockProps.game.clocks.white.starttime);

    const component = mount(<PlayerClock {...mockProps} />);
    Promise.resolve(component).then(() => {
      const clock = component.find("[aria-label='clock']");
      expect(clock.length).to.equal(1);
      timer.tick(55.5 * 1000);

      expect(clock.text()).to.equal("00:00:04:5");
    });
  });

  it("Should show -00:00:00:0 when ran out of time", () => {
    const mockProps = getGameMock({ isGameOn: true, initial: 1, current: 60 });

    const timer = Sinon.useFakeTimers(mockProps.game.clocks.white.starttime);

    const component = mount(<PlayerClock {...mockProps} />);
    Promise.resolve(component).then(() => {
      const clock = component.find("[aria-label='clock']");
      expect(clock.length).to.equal(1);
      timer.tick(61 * 1000);

      expect(clock.text()).to.equal("-00:00:00:0");
    });
  });

  it("Should not substract time when it's not my turn", () => {
    const mockProps = getGameMock({
      isGameOn: true,
      initial: 1,
      current: 60,
      isMyTurn: false,
      tomove: "black",
    });

    const timer = Sinon.useFakeTimers(mockProps.game.clocks.white.starttime);

    const component = mount(<PlayerClock {...mockProps} />);
    Promise.resolve(component).then(() => {
      const clock = component.find("[aria-label='clock']");
      timer.tick(10 * 1000);

      expect(clock.text()).to.equal("00:01:00");
    });
  });

  it("Should substract 10 seconds in NO INC mode when the game is on", () => {
    const mockProps = getGameMock({
      isGameOn: true,
      delaytype: "inc",
    });

    const timer = Sinon.useFakeTimers(mockProps.game.clocks.white.starttime);

    const component = mount(<PlayerClock {...mockProps} />);
    Promise.resolve(component).then(() => {
      const clock = component.find("[aria-label='clock']");
      timer.tick(10 * 1000);

      expect(clock.text()).to.equal("00:14:50");
    });
  });

  it("Should wait 10 seconds in US mode when the game is on", () => {
    const mockProps = getGameMock({
      isGameOn: true,
      delaytype: "us",
    });

    const timer = Sinon.useFakeTimers(mockProps.game.clocks.white.starttime);

    const component = mount(<PlayerClock {...mockProps} />);
    Promise.resolve(component).then(() => {
      const clock = component.find("[aria-label='clock']");
      timer.tick(10 * 1000);

      expect(clock.text()).to.equal("00:15:00");
    });
  });
});
