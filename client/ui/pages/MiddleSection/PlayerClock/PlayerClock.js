import { TimePicker } from "antd";
import { noop } from "lodash";
import moment from "moment";
import React, { Component } from "react";
import { withTracker } from "meteor/react-meteor-data";
import { compose } from "redux";
import { mongoCss } from "../../../../../imports/api/client/collections";
import classNames from "classnames";
import { withDynamicStyles } from "../../../HOCs/withDynamicStyles";
import { gameStatusPlaying } from "../../../../constants/gameConstants";
import PropTypes from "prop-types";

const DEFAULT_TIME_FORMAT = "HH:mm:ss";
const TIME_SECOND = 1000;
const INTERVAL_TIME = 5;

class PlayerClock extends Component {
  constructor(props) {
    super(props);

    const { game, color, isGameFinished, isMyTurn } = this.props;
    const isGameOn = game.status === gameStatusPlaying;
    let current = game.clocks[color].initial * 60 * 1000;
    if (isGameOn || isGameFinished) {
      current = game.clocks[color].current;
    }
    if (isGameFinished && isMyTurn) {
      current = Math.max(game.clocks[color].starttime + game.clocks[color].current - new Date().getTime(), 0);
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
    const { game, color } = props;
    const isGameOn = game.status === gameStatusPlaying;

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
    const { game, color, isMyTurn } = this.props;
    const isGameOn = game.status === gameStatusPlaying;

    const clock = game.clocks[color];

    if (isGameOn && !isMyTurn && !clock.starttime && clock.current !== this.state.current) {
      this.setState({
        current: game.clocks[color].initial * 60 * 1000,
      });
    }

    this.onClockStart();
  }

  onClockStart = () => {
    const { game, color, isMyTurn } = this.props;
    const isGameOn = game.status === gameStatusPlaying;

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

  render() {
    const { game, timerBlinkingSecs, classes, isMyTurn, isGameFinished } = this.props;
    const isGameOn = game.status === gameStatusPlaying;

    const { current, isEditing } = this.state;

    const isRunningOutOfTime = current < timerBlinkingSecs * TIME_SECOND;
    const negative = current < 0 ? "-" : "";
    const roundedCurrent = isRunningOutOfTime
      ? current
      : Math.floor(current / TIME_SECOND) * TIME_SECOND;
    const showWarningColor = isMyTurn && isRunningOutOfTime;
    const classesToInject = showWarningColor
      ? classes.lowTime
      : isMyTurn
      ? classes.myTurn
      : classes.notMyTurn;

    const defaultValue = moment(roundedCurrent > 0 ? roundedCurrent : 0)
      .add(moment().startOf("day").valueOf())
      .format(`${DEFAULT_TIME_FORMAT}${isRunningOutOfTime ? ":S" : ""}`);

    return (
      <>
        {!isEditing ? (
          <div
            className={classNames(classes.regular, !isGameOn && classes.pointer, classesToInject)}
            onClick={!isGameOn ? this.onEditToggle : noop}
            aria-label="clock"
          >
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
            allowClear={false}
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

export default compose(
  withTracker(() => ({
    css: mongoCss.findOne(),
  })),
  withDynamicStyles("css.playerClockCss")
)(PlayerClock);

PlayerClock.propTypes = {
  color: PropTypes.oneOf(["white", "black"]),
  tagColor: PropTypes.oneOf(["White", "Black"]),
  timerBlinkingSecs: PropTypes.number,
  handleUpdate: PropTypes.func,
  isMyTurn: PropTypes.bool,
  game: PropTypes.object,
};
