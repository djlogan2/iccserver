import { TimePicker } from "antd";
import { noop } from "lodash";
import moment from "moment";
import React, { Component } from "react";

const DEFAULT_TIME_FORMAT = "HH:mm:ss";
const TIME_SECOND = 1000;
const INTERVAL_TIME = 50;

export default class PlayerClock extends Component {
  constructor(props) {
    super(props);

    const { game, color, isGameOn } = this.props;
    let current = game.clocks[color].initial * 60 * 1000;
    if (isGameOn) {
      current = game.clocks[color].current;
    }

    this.state = {
      current,
      isEditing: false,
    };
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
    const { game, color, isGameOn } = props;

    let pcurrent;

    if (!isGameOn) {
      pcurrent = PlayerClock.timeAfterMove(game.variations, game.tomove === color);
    }

    const returnstate = {
      current: pcurrent || state.current,
    };

    return returnstate;
  }

  componentWillUnmount() {
    Meteor.clearInterval(this.interval);
  }

  componentDidMount() {
    this.onClockStart();
  }

  componentDidUpdate(prevProps) {
    const { game, color, isMyTurn, isGameOn } = this.props;
    const clock = game.clocks[color];

    if (isGameOn && !isMyTurn && !clock.starttime && clock.current !== this.state.current) {
      this.setState({
        current: game.clocks[color].initial * 60 * 1000,
      });
    }

    this.onClockStart();
  }

  onClockStart = () => {
    const { game, color, isMyTurn, isGameOn } = this.props;

    if ((this.interval && !isMyTurn) || !isGameOn) {
      Meteor.clearInterval(this.interval);
      this.interval = null;
      return;
    }

    if (!isMyTurn || this.interval || !isGameOn) {
      return;
    }

    const iod = game.clocks[color].inc_or_delay;
    const type = game.clocks[color].delaytype;

    const secondsPassed = (Date.now() - game.clocks[color].starttime) / TIME_SECOND;

    const delay = iod - secondsPassed;

    const params = {
      game,
      color,
    };

    if (["us", "bronstein"].includes(type)) {
      params.iod = iod;
    }

    if (type === "us" && delay > 0) {
      this.interval = Meteor.setInterval(() => {
        Meteor.clearInterval(this.interval);
        this.setTimer(params);
      }, delay * TIME_SECOND);
    } else {
      this.setTimer(params);
    }
  };

  setTimer = ({ game, color, iod }) => {
    this.interval = Meteor.setInterval(() => {
      const MilliSecondsPassed = Date.now() - game.clocks[color].starttime;
      let current = game.clocks[color].current - MilliSecondsPassed;

      if (iod) {
        current += iod * TIME_SECOND;
      }

      this.setState({ current });
    }, INTERVAL_TIME);
  };

  handleChange = (time) => {
    const timePicked = moment(time).valueOf();
    const today = moment().startOf("day").valueOf();

    const current = timePicked - today;
    const { tagColor, handleUpdate } = this.props;

    const data = {
      [`${tagColor}Time`]: `${current}`,
      [`${tagColor}Initial`]: `${current / 60 / TIME_SECOND}`,
    };

    handleUpdate(data, () => {
      this.setState({
        current,
        isEditing: false,
      });
    });
  };

  onEditToggle = () => {
    this.setState((state) => ({
      isEditing: !state.isEditing,
    }));
  };

  calculateTimeLeftAndStyles = ({ isMyTurn, side, isGameOn, isRunningOutOfTime }) => {
    const showWarningColor = isMyTurn && isRunningOutOfTime;

    if (showWarningColor && Date.now() - this.lowTime?.date > 500) {
      this.lowTime = {
        color: this.lowTime?.color === "#ff0000" ? "#810000" : "#ff0000",
        date: Date.now(),
      };
    } else if (!showWarningColor) {
      this.lowTime = { color: "#ff0000", date: Date.now() };
    }

    if (!isMyTurn) this.lowTime = null;

    const cv = side / 10;
    const clockstyle = {
      borderRadius: "3px",
      fontSize: cv / 3,
      color: "#fff",
      paddingLeft: "5px",
      paddingRight: "5px",
      background: showWarningColor ? this.lowTime?.color : isMyTurn ? "#1890ff" : "#333333",
      fontWeight: "700",
      transition: showWarningColor && "0.3s",
      boxShadow: showWarningColor && `0px 0px 5px 5px ${this.lowTime?.color}`,
      cursor: isGameOn ? "" : "pointer",
    };

    return clockstyle;
  };

  render() {
    const { game, side, isGameOn, isMyTurn, timerBlinkingSecs } = this.props;
    if (!game) {
      return null;
    }

    const { current, isEditing } = this.state;

    const isRunningOutOfTime = current < timerBlinkingSecs * TIME_SECOND;
    const negative = current < 0 ? "-" : "";
    const roundedCurrent = isRunningOutOfTime
      ? current
      : Math.floor(current / TIME_SECOND) * TIME_SECOND;

    const clockstyle = this.calculateTimeLeftAndStyles({
      isMyTurn,
      side,
      isGameOn,
      isRunningOutOfTime,
    });

    const defaultValue = moment(roundedCurrent > 0 ? roundedCurrent : 0)
      .add(moment().startOf("day").valueOf())
      .format(`${DEFAULT_TIME_FORMAT}${isRunningOutOfTime ? ":S" : ""}`);

    return (
      <>
        {!isEditing ? (
          <div style={clockstyle} onClick={!isGameOn ? this.onEditToggle : noop} aria-label="clock">
            {negative}
            {defaultValue}
          </div>
        ) : (
          <TimePicker
            aria-label="clock-edit"
            aria-placeholder="Select time"
            onChange={this.handleChange}
            value={moment(defaultValue, DEFAULT_TIME_FORMAT)}
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
