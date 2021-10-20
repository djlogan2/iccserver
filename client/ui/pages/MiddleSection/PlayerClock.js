import { TimePicker } from "antd";
import { noop } from "lodash";
import moment from "moment";
import React, { Component } from "react";
import { gameStatusPlaying } from "../../../constants/gameConstants";

const DEFAULT_TIME_FORMAT = "HH:mm:ss";

export default class PlayerClock extends Component {
  state = {
    current: 0,
    game_current: 0,
    isEditing: false,
  };

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
    const { game, color } = props;

    if (!game) return {};
    let pcurrent;

    if (game.status === gameStatusPlaying) {
      pcurrent = state.current;
    } else {
      pcurrent = PlayerClock.timeAfterMove(game.variations, game.tomove === color);
    }

    if (!pcurrent && !!game.clocks) pcurrent = game.clocks[color].initial * 60 * 1000;

    if (!pcurrent) pcurrent = 0;

    const returnstate = {};

    if (pcurrent !== state.game_current) {
      returnstate.current = pcurrent;
      returnstate.game_current = pcurrent;
    }

    return returnstate;
  }

  componentWillUnmount() {
    Meteor.clearInterval(this.interval);
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    if (this.interval && !nextProps.isMyTurn) {
      Meteor.clearInterval(this.interval);
      this.interval = null;
    }
    return true;
  }

  componentDidUpdate() {
    const { game, color, isMyTurn } = this.props;

    if (!isMyTurn || this.interval) {
      return;
    }

    const iod = game.clocks[color].inc_or_delay;
    const type = game.clocks[color].delaytype;

    const secondsPassed = (Date.now() - game.clocks[color].starttime) / 1000;

    const delay = iod - secondsPassed;

    const params = {
      game,
      color,
    };

    if (["us", "bronstein"].includes(type)) {
      params.iod = iod;
    }

    if ((type === "us" || type === "bronstein") && delay > 0) {
      this.interval = Meteor.setInterval(() => {
        Meteor.clearInterval(this.interval);
        this.setTimer(params);
      }, delay * 1000);
    } else {
      this.setTimer(params);
    }
  }

  setTimer = ({ game, color, iod }) => {
    this.interval = Meteor.setInterval(() => {
      const MilliSecondsPassed = Date.now() - game.clocks[color].starttime;
      let current = game.clocks[color].current - MilliSecondsPassed;

      if (iod) {
        current += iod * 1000;
      }

      this.setState({ current });
    }, 50);
  };

  handleChange = (time) => {
    const timePicked = moment(time).valueOf();
    const today = moment().startOf("day").valueOf();

    const current = timePicked - today;
    const { tagColor, handleUpdate } = this.props;

    const data = {
      [`${tagColor}Time`]: `${current}`,
      [`${tagColor}Initial`]: `${current / 60 / 1000}`,
    };

    handleUpdate(data, () => {
      this.setState({
        current,
      });
    });
  };

  onEditToggle = () => {
    this.setState((state) => ({
      isEditing: !state.isEditing,
    }));
  };

  calculateTimeLeftAndStyles = ({ current, isMyTurn, side, currentTurn, color, isGameOn }) => {
    let hour;
    let minute;
    let second;
    let ms;
    let neg = "";

    const timerBlinkingSecs = Meteor.user()?.settings?.default_timer_blinking || 10;

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

    if (neg === "-" || !!hour || !!minute || second >= timerBlinkingSecs) {
      ms = "";
    } else {
      if (isMyTurn && this.lowTime && Date.now() - this.lowTime.date > 500) {
        this.lowTime = {
          color: this.lowTime.color === "#ff0000" ? "#810000" : "#ff0000",
          date: Date.now(),
        };
      } else if (isMyTurn && !this.lowTime) {
        this.lowTime = { color: "#ff0000", date: Date.now() };
      }
      ms = "." + ms.toString().substr(0, 1);
    }

    if (!isMyTurn) this.lowTime = null;

    let cv = side / 10;
    let clockstyle = {
      paddingTop: cv / 15,
      paddingBottom: cv / 5,
      textAlign: "center",
      borderRadius: "3px",
      fontSize: cv / 3,
      color: "#fff",
      height: cv / 1.7,
      paddingLeft: "5px",
      paddingRight: "5px",
      background: this.lowTime
        ? this.lowTime.color
        : currentTurn === color[0]
        ? "#1890ff"
        : "#333333",
      fontWeight: "700",
      transition: this.lowTime && "0.3s",
      boxShadow: this.lowTime && `0px 0px 5px 5px ${this.lowTime.color}`,
      cursor: isGameOn ? "" : "pointer",
    };

    return {
      clockstyle,
      neg,
      ms,
    };
  };

  render() {
    const { game, side, color, currentTurn, isGameOn, isMyTurn } = this.props;
    const { current, isEditing } = this.state;
    if (!game) {
      return null;
    }

    const { clockstyle, neg, ms } = this.calculateTimeLeftAndStyles({
      color,
      currentTurn,
      current,
      isMyTurn,
      side,
      isGameOn,
    });

    const roundedCurrent = Math.floor(current / 1000) * 1000;

    const defaultValue = moment(roundedCurrent > 0 ? roundedCurrent : 0)
      .add(moment().startOf("day").valueOf())
      .format(DEFAULT_TIME_FORMAT);

    return (
      <>
        {!isEditing ? (
          <div style={clockstyle} onClick={!isGameOn ? this.onEditToggle : noop}>
            {neg}
            {defaultValue}
            {ms}
          </div>
        ) : (
          <TimePicker
            onChange={this.handleChange}
            defaultValue={moment(defaultValue, DEFAULT_TIME_FORMAT)}
            showNow={false}
            onOpenChange={(isOpen) => {
              if (!isOpen) {
                this.onEditToggle();
              }
            }}
          />
        )}
      </>
    );
  }
}
