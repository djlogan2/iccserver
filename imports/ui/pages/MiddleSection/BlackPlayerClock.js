import React, { Component } from "react";
import { Logger } from "../../../../lib/client/Logger";

// eslint-disable-next-line no-unused-vars
const log = new Logger("client/BlackPlayerClock_JS");

export default class BlackPlayerClock extends Component {
  constructor(props) {
    log.trace("BlackPlayerClock constructor", props);
    super(props);
    const current =
      this.props.game && this.props.game.clocks
        ? this.props.game.clocks[this.props.color].current
        : 0;
    this.state = {
      game_current: current,
      current: current,
      mark: new Date().getTime(),
      running: false
    };
    this.componentDidUpdate();
  }

  static getDerivedStateFromProps(props, state) {
    const running = props.game.status === "playing" && props.game.tomove === props.color;
    const pcurrent = props.game.clocks ? props.game.clocks[props.color].current : 0;

    const returnstate = {};
    const mark = new Date().getTime();

    if (pcurrent !== state.game_current) {
      returnstate.current = pcurrent;
      returnstate.game_current = pcurrent;
      returnstate.mark = mark;
    }

    if (running !== state.running) {
      returnstate.running = running;
      returnstate.mark = mark;
    }

    if (!!Object.entries(returnstate).length)
      log.debug("derivedStateFromProps for " + props.color, returnstate);

    return returnstate;
  }

  componentWillUnmount() {
    log.trace("BlackPlayerClock componentWillUnmount");
    if (!!this.interval) {
      Meteor.clearInterval(this.interval);
      delete this.interval;
    }
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    if (!!this.interval && !nextState.running) {
      Meteor.clearInterval(this.interval);
      delete this.interval;
    }
    return true;
  }

  componentDidUpdate = () => {
    const self = this;

    if (!this.state.running || !!this.interval) {
      return;
    }

    const iod = this.props.game.clocks[this.props.color].inc_or_delay;
    const type = this.props.game.clocks[this.props.color].delaytype;

    if (type === "us" || type === "bronstein") {
      log.debug("starting clock for delay for " + this.props.color, this.state);
      self.interval = Meteor.setInterval(() => {
        Meteor.clearInterval(this.interval);
        self.setState({ mark: new Date().getTime() });
        self.interval = Meteor.setInterval(() => {
          const mark = new Date().getTime();
          const sub = mark - this.state.mark;
          const current = self.state.current - sub;
          self.setState({ current: current, mark: mark });
        }, 50);
      }, iod * 1000);
    } else {
      log.debug("starting clock for countdown for " + this.props.color, this.state);
      self.interval = Meteor.setInterval(() => {
        const mark = new Date().getTime();
        const sub = mark - self.state.mark;
        const current = self.state.current - sub;
        self.setState({ current: current, mark: mark });
      }, 50);
    }
  };

  render() {
    let hour;
    let minute;
    let second;
    let ms;
    let neg = "";

    let time = this.state.current;
    if (time < 0) {
      neg = "-";
      time = -time;
    }

    ms = time % 1000;
    time = (time - ms) / 1000;
    second = time % 60;
    time = (time - second) / 60;
    minute = time % 60;
    hour = (time - minute) / 60;

    if (neg === "-" || !!hour || !!minute || second >= 10) {
      ms = "";
    } else {
      ms = "." + ms.toString().substr(0, 1);
    }
    if (second < 10) second = `0${second}`;
    if (minute < 10) minute = `0${minute}`;

    let cv = this.props.side / 10;
    let clockstyle = {
      right: "0",
      paddingTop: cv / 15,
      paddingBottom: cv / 5,
      textAlign: "center",
      borderRadius: "3px",
      fontSize: cv / 3,
      color: "#fff",
      top: "5px",
      height: cv / 1.7,
      width: cv * 1.3,
      background: "#333333",
      fontWeight: "700",
      position: "absolute"
    };

    return (
      <div
        style={{
          width: this.props.side * 0.2,
          display: "inline-block",
          position: "relative",
          verticalAlign: "top",
          marginTop: "8px"
        }}
      >
        <div style={clockstyle}>
          {neg}
          {hour}:{minute}:{second}
          {ms}
        </div>
      </div>
    );
  }
}
