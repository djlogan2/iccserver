import React, { Component } from "react";
import { getMilliseconds } from "../../../../lib/client/timestamp";
import { Logger } from "../../../../lib/client/Logger";

const log = new Logger("client/BlackPlayerClock_js");

export default class BlackPlayerClock extends Component {
  constructor(props) {
    super(props);

    this.interval = "none";
    const now = getMilliseconds();

    const { game, color } = props;

    const start = game && game.clocks ? game.clocks[color].starttime || now : 0;
    const current = game && game.clocks ? game.clocks[color].current - now + start : 0;

    this.state = {
      current,
      mark: now,
      running: false,
      game_current: current
    };

    this.componentDidUpdate();
  }

  static timeAfterMove(variations, tomove, cmi) {
    //
    // This is going to assume variation sub[0] is the correct
    // time (i.e. "main line", assuming main line is sub[0] and
    // not sub[last]. sub[last] might be more accurate.
    //
    // OK, so we are sitting (cmi is sitting) on the user NOT to move.
    //
    if (!cmi) cmi = variations.cmi;
    if (!cmi) return;

    let last_move_made = variations.movelist[cmi];
    if (!last_move_made.variations) {
      //
      // If there is no "next" move, use the clocks from the last set of moves
      //
      let prev = variations.movelist[cmi].prev;
      if (!prev) return;
      last_move_made = variations.movelist[prev];
      tomove = !tomove;
    }

    //
    // If we are doing the user waiting to move, use the current value of the
    // next node in the tree.
    //
    const upcoming_move = variations.movelist[last_move_made.variations[0]];
    if (tomove) return upcoming_move.current;

    //
    // Obviously by here we are doing the user NOT waiting to move. If there is
    // no move after the current users move, return the clocks at the beginning
    // of the last move made by this user.
    //
    if (!upcoming_move.variations || !upcoming_move.variations.length)
      return last_move_made.current;

    //
    // The "not to move" user has another move in the tree, so return the clock
    // value for this move.
    //
    const upcoming_next_move = variations.movelist[upcoming_move.variations[0]];
    return upcoming_next_move.current;
  }

  static getDerivedStateFromProps(props, state) {
    if (!props.game) return;
    const running = props.game.status === "playing" && props.game.tomove === props.color;
    const now = running ? getMilliseconds() : 0;
    let pcurrent;

    if (props.game.status === "playing") {
      const start = running ? props.game.clocks[props.color].starttime : 0;
      pcurrent = props.game.clocks[props.color].current - now + start;
    } else {
      pcurrent = BlackPlayerClock.timeAfterMove(
        props.game.variations,
        props.game.tomove === props.color
      );
    }

    if (!pcurrent && !!props.game.clocks)
      pcurrent = props.game.clocks[props.color].initial * 60 * 1000;

    if (!pcurrent) pcurrent = 0;

    const returnstate = {};
    const mark = now;

    if (pcurrent !== state.game_current) {
      returnstate.current = pcurrent;
      returnstate.game_current = pcurrent;
      returnstate.mark = mark;
    }

    if (running !== state.running) {
      returnstate.running = running;
      returnstate.mark = mark;
    }

    return returnstate;
  }

  componentWillUnmount() {
    if (this.interval !== "none") {
      Meteor.clearInterval(this.interval);
      this.interval = "none";
    }
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    if (this.interval !== "none" && !nextState.running) {
      Meteor.clearInterval(this.interval);
      this.interval = "none";
    }
    return true;
  }

  componentDidUpdate() {
    const { game, color } = this.props;
    const { running } = this.state;
    if (!running || this.interval !== "none") {
      return;
    }

    const iod = game.clocks[color].inc_or_delay;
    const type = game.clocks[color].delaytype;

    if (type === "us" || type === "bronstein") {
      this.interval = Meteor.setInterval(() => {
        Meteor.clearInterval(this.interval);

        this.setState({ mark: getMilliseconds() });
        this.interval = Meteor.setInterval(() => {
          const mark = getMilliseconds();
          const sub = mark - this.state.mark;
          const current = this.state.current - sub;
          this.setState({ current, mark });
        }, 50);
      }, iod * 1000);
    } else {
      this.interval = Meteor.setInterval(() => {
        const mark = getMilliseconds();
        const sub = mark - this.state.mark;
        const current = this.state.current - sub;
        this.setState({ current, mark });
      }, 50);
    }
  }

  render() {
    const { game, side } = this.props;
    const { current } = this.state;

    if (!game) {
      return null;
    }

    let hour;
    let minute;
    let second;
    let ms;
    let neg = "";

    let time = current || 0;
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

    let cv = side / 10;
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
          width: side * 0.2,
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
