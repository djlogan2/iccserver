import React, { Component } from "react";
import { getMilliseconds } from "../../../../lib/client/timestamp";
import {
  colorBlackUpper,
  colorWhiteLetter,
  colorWhiteUpper,
  gameStatusPlaying,
} from "../../../constants/gameConstants";
import { Logger } from "../../../../lib/client/Logger";
import { TimePicker } from "antd";
import moment from "moment";
import { noop } from "lodash";

const log = new Logger("client/Player_js");

export default class PlayerClock extends Component {
  constructor(props) {
    super(props);

    this.interval = null;
    const now = getMilliseconds();

    const { game, color } = props;

    const start = game && game.clocks ? game.clocks[color].starttime || now : 0;
    const current = game && game.clocks ? game.clocks[color].current - now + start : 0;

    this.state = {
      current,
      mark: now,
      running: false,
      game_current: current,
      isEditing: false,
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
    const { game, color } = props;

    if (!game) return {};
    const running = game.status === gameStatusPlaying && game.tomove === color;
    const now = running ? getMilliseconds() : 0;
    let pcurrent;

    if (game.status === gameStatusPlaying) {
      const iod = game.clocks[color].inc_or_delay;
      const start = running ? game.clocks[color].starttime : 0;
      pcurrent = Math.ceil((game.clocks[color].current - now + start) / 1000) * 1000;

      if (game.tomove === color && pcurrent !== game.clocks[color].initial * 60 * 1000) {
        pcurrent += iod * 1000;
      }
    } else {
      pcurrent = PlayerClock.timeAfterMove(game.variations, game.tomove === color);
    }

    if (!pcurrent && !!game.clocks) pcurrent = game.clocks[color].initial * 60 * 1000;

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
    if (this.interval) {
      Meteor.clearInterval(this.interval);
      this.interval = null;
    }
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    if (this.interval && !nextState.running) {
      Meteor.clearInterval(this.interval);
      this.interval = null;
    }
    return true;
  }

  componentDidUpdate() {
    const { game, color } = this.props;
    const { running } = this.state;

    if (!running || this.interval) {
      return;
    }

    const iod = game.clocks[color].inc_or_delay;
    const type = game.clocks[color].delaytype;

    if (type === "us" || type === "bronstein") {
      this.interval = Meteor.setTimeout(() => {

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

  handleChange = (time) => {
    const timePicked = moment(time).valueOf();
    const today = moment().startOf("day").valueOf();

    const current = timePicked - today;
    this.handleUpdate(current);
    this.setState({
      current,
    });
  };

  onEditOpen = () => {
    this.setState((state) => ({
      isEditing: true,
    }));
  };

  onEditClose = () => {
    this.setState((state) => ({
      isEditing: false,
    }));
  };

  getColorByLetter = (letter) => {
    return letter === colorWhiteLetter ? colorWhiteUpper : colorBlackUpper;
  };

  handleUpdate = (current) => {
    const { game, color } = this.props;

    if (game?._id) {
      const tagColor = this.getColorByLetter(color[0]);
      const data = {
        [`${tagColor}Time`]: `${current}`,
        [`${tagColor}Initial`]: `${current / 60 / 1000}`,
      };

      Meteor.call("setTags", "set_tag", game._id, data, (err) => {
        if (err) {
          log.error(err);
        } else {
          this.onEditClose();
        }
      });
    }
  };

  calculateTimeLeftAndStyles = ({ current, running, side, currentTurn, color, isGameOn }) => {
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
      if (running && this.lowTime && Date.now() - this.lowTime.date > 500) {
        this.lowTime = {
          color: this.lowTime.color === "#ff0000" ? "#810000" : "#ff0000",
          date: Date.now(),
        };
      } else if (running && !this.lowTime) {
        this.lowTime = { color: "#ff0000", date: Date.now() };
      }
      ms = "." + ms.toString().substr(0, 1);
    }

    if (!running) this.lowTime = null;

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
      paddingLeft: "5px",
      paddingRight: "5px",
      background: this.lowTime
        ? this.lowTime.color
        : currentTurn === color[0]
        ? "#1890ff"
        : "#333333",
      fontWeight: "700",
      transition: this.lowTime && "0.3s",
      position: "absolute",
      boxShadow: this.lowTime && `0px 0px 5px 5px ${this.lowTime.color}`,
      cursor: isGameOn ? "" : "pointer",
    };

    return {
      clockstyle,
      neg,
      hour,
      minute,
      second,
      ms,
    };
  };

  render() {
    const { game, side, color, currentTurn, isGameOn } = this.props;
    const { current, running, isEditing } = this.state;
    if (!game) {
      return null;
    }

    const { clockstyle, neg, hour, minute, second, ms } = this.calculateTimeLeftAndStyles({
      color,
      currentTurn,
      current,
      running,
      side,
      isGameOn,
    });

    const defaultValue = moment(current).add(moment().startOf("day").valueOf()).format("HH:mm:ss");

    return (
      <div
        style={{
          display: "inline-block",
          position: "relative",
          marginTop: "8px",
        }}
      >
        {!isEditing ? (
          <div style={clockstyle} onClick={!isGameOn ? this.onEditOpen : noop}>
            {neg}
            {hour}:{minute}:{second}
            {ms}
          </div>
        ) : (
          <TimePicker
            onChange={this.handleChange}
            defaultValue={moment(defaultValue, "HH:mm:ss")}
            showNow={false}
            onOpenChange={(isOpen) => {
              if (!isOpen) {
                this.onEditClose();
              }
            }}
          />
        )}
      </div>
    );
  }
}
