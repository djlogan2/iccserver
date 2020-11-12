import React, { Component } from "react";
import { Logger } from "../../../../lib/client/Logger";
import { getMilliseconds } from "../../../../lib/client/timestamp";

// eslint-disable-next-line no-unused-vars
const log = new Logger("client/BlackPlayerClock_JS");

export default class BlackPlayerClock extends Component {
  constructor(props) {
    super(props);
    log.trace("BlackPlayerClock constructor", props);
    this.interval = "none";
    const now = getMilliseconds();
    const start =
      this.props.game && this.props.game.clocks
        ? this.props.game.clocks[this.props.color].starttime || now
        : 0;
    const current =
      this.props.game && this.props.game.clocks
        ? this.props.game.clocks[this.props.color].current - now + start
        : 0;
    this.state = {
      game_current: current,
      current: current,
      mark: now,
      running: false,
      cmi: -1,
      tomove: "x"
    };
    this.componentDidUpdate();
  }

  // TODO: So, this works, but for some reason, props.game.tomove is always
  //       the wrong user to move's color! (???) Why is that? I could change
  //       the code to accomodate this easily enough, but for some reason
  //       this seems to be called BEFORE a move is made, not after. ????
  //       If somebody deems this correct behavior, so be it, adjust.
  static timeAfterMove(variations, cmi) {
    if (cmi === undefined) cmi = variations.cmi;
    const current_move = variations.movelist[cmi];
    if (
      !current_move ||
      !("current" in current_move) ||
      !current_move.variations ||
      current_move.variations.length !== 1
    )
      return;
    const skip_move = variations.movelist[current_move.variations[0]];
    if (
      !skip_move ||
      !("current" in skip_move) ||
      !skip_move.variations ||
      skip_move.variations.length !== 1
    )
      return;
    const next_move = variations.movelist[skip_move.variations[0]];
    if (
      !next_move ||
      !("current" in next_move) ||
      !next_move.variations ||
      next_move.variations.length !== 1
    )
      return;
    return next_move.current;
  }

  static getDerivedStateFromProps(props, state) {
    const running = props.game.status === "playing" && props.game.tomove === props.color;
    const now = running ? getMilliseconds() : 0;
    let pcurrent;
    let cmi = props.game.variations ? props.game.variations.cmi || state.cmi : state.cmi;
    let tomove = props.game.tomove || state.tomove;

    if (props.game.status === "playing") {
      const start = running ? props.game.clocks[props.color].starttime : 0;
      pcurrent = props.game.clocks[props.color].current - now + start;
      // } else if (cmi !== state.cmi || tomove !== state.tomove) {
      //   if (tomove === props.color) {
      //     if (!!props.game.variations.movelist[cmi])
      //       pcurrent = props.game.variations.movelist[cmi].current;
      //   } else pcurrent = BlackPlayerClock.timeAfterMove(props.game.variations);
    }

    if (!pcurrent && !!props.game.clocks)
      pcurrent = props.game.clocks[props.color].initial * 60 * 1000;

    if (!pcurrent) pcurrent = 0;

    const returnstate = {};
    const mark = now;

    if (cmi !== state.cmi) returnstate.cmi = cmi;
    if (tomove !== state.tomove) returnstate.tomove = tomove;

    if (pcurrent !== state.game_current) {
      returnstate.current = pcurrent;
      returnstate.game_current = pcurrent;
      returnstate.mark = mark;
    }

    if (running !== state.running) {
      log.trace(
        "BlackPlayerClock " + props.color + " getDerivedStateFromProps new running: ",
        running
      );
      returnstate.running = running;
      returnstate.mark = mark;
    }

    return returnstate;
  }

  componentWillUnmount() {
    if (this.interval !== "none") {
      const result = Meteor.clearInterval(this.interval);
      log.trace(
        "BlackPlayerClock " + this.props.color + " componentWillUnmount clearing interval",
        { interval: this.interval, result: result }
      );
      this.interval = "none";
    }
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    if (this.interval !== "none" && !nextState.running) {
      const result = Meteor.clearInterval(this.interval);
      log.trace(
        "BlackPlayerClock " +
          this.props.color +
          " shouldComponentUpdate clearing interval because upcoming state is not running",
        { interval: this.interval, result: result }
      );
      this.interval = "none";
    }
    return true;
  }

  componentDidUpdate() {
    const self = this;

    if (!this.state.running || this.interval !== "none") {
      return;
    }

    log.trace("BlackPlayerClock " + this.props.color + " starting interval");
    const iod = this.props.game.clocks[this.props.color].inc_or_delay;
    const type = this.props.game.clocks[this.props.color].delaytype;

    if (type === "us" || type === "bronstein") {
      log.trace("starting clock for delay for " + this.props.color, this.state);

      self.interval = Meteor.setInterval(() => {
        Meteor.clearInterval(this.interval);
        self.setState({ mark: getMilliseconds() });
        self.interval = Meteor.setInterval(() => {
          const mark = getMilliseconds();
          const sub = mark - this.state.mark;
          const current = self.state.current - sub;
          self.setState({ current: current, mark: mark });
        }, 50);
        log.trace(this.props.color + " delay/run interval is", self.interval);
      }, iod * 1000);
      log.trace(this.props.color + " delay interval is", self.interval);
    } else {
      log.trace("starting clock for countdown for " + this.props.color, this.state);
      self.interval = Meteor.setInterval(() => {
        const mark = getMilliseconds();
        const sub = mark - self.state.mark;
        const current = self.state.current - sub;
        self.setState({ current: current, mark: mark });
      }, 50);
      log.trace(this.props.color + " interval is", self.interval);
    }
  }

  render() {
    let hour;
    let minute;
    let second;
    let ms;
    let neg = "";

    let time = this.state.current || 0;
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
