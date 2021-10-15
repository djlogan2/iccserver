import React, { Component } from "react";
import { getMilliseconds } from "../../../../lib/client/timestamp";
import { gameStatusPlaying } from "../../../constants/gameConstants";
import { CheckOutlined } from "@ant-design/icons";
import { InputNumber, Button } from "antd";
import { Logger } from "../../../../lib/client/Logger";

import {
  colorBlackUpper,
  colorWhiteLetter,
  colorWhiteUpper,
} from "../../../constants/gameConstants";
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
      const start = running ? game.clocks[color].starttime : 0;
      pcurrent = game.clocks[color].current - now + start;
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

  handleChange = (time) => {
    this.setState({
      current: time * 60 * 1000,
    });
  };

  editToggler = () => {
    this.setState((state) => ({
      isEditing: !state.isEditing,
    }));
  };

  getColorByLetter = (letter) => {
    return letter === colorWhiteLetter ? colorWhiteUpper : colorBlackUpper;
  };

  handleUpdate = () => {
    const { game, color } = this.props;
    const { current } = this.state;

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
          this.editToggler();
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
      time,
    };
  };

  render() {
    const { game, side, color, currentTurn, isGameOn } = this.props;
    const { current, running, isEditing } = this.state;
    if (!game) {
      return null;
    }

    const { clockstyle, neg, hour, minute, second, ms, time } = this.calculateTimeLeftAndStyles({
      color,
      currentTurn,
      current,
      running,
      side,
      isGameOn,
    });

    return (
      <div
        style={{
          display: "inline-block",
          position: "relative",
          marginTop: "8px",
        }}
      >
        {!isEditing ? (
          <div style={clockstyle} onClick={!isGameOn ? this.editToggler : noop}>
            {neg}
            {hour}:{minute}:{second}
            {ms}
          </div>
        ) : (
          <div style={{ display: "flex", width: "max-content" }}>
            <InputNumber
              name="challengerInitial"
              min={1}
              id="challengerInitial"
              parser={(value) => Math.round(value)}
              formatter={(value) => Math.round(value)}
              max={600}
              value={time}
              onChange={this.handleChange}
            />

            <Button
              style={{
                marginLeft: "15px",
              }}
              type="primary"
              onClick={this.handleUpdate}
              icon={<CheckOutlined />}
            />
          </div>
        )}
      </div>
    );
  }
}
