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
import { timeAfterMove } from "../../../utils/utils";

const log = new Logger("client/Player_js");

export default class PlayerClock extends Component {
  constructor(props) {
    super(props);

    this.interval = null;
    const now = getMilliseconds();

    const { game, color } = props;

    const start = game && game.clocks ? game.clocks[color].starttime || now : 0;
    const current =
      game && game.clocks ? Math.ceil((game.clocks[color].current - now + start) / 1000) * 1000 : 0;

    this.state = {
      current,
      running: false,
      game_current: current,
      isEditing: false,
    };
  }

  static getDerivedStateFromProps(props, state) {
    const { game, color } = props;

    if (!game) return {};
    const running = game.status === gameStatusPlaying && game.tomove === color;
    let pcurrent;

    if (game.status === gameStatusPlaying) {
      pcurrent = state.current;
    } else {
      pcurrent = timeAfterMove(game.variations, game.tomove === color);
    }

    if (!pcurrent && !!game.clocks) pcurrent = game.clocks[color].initial * 60 * 1000;

    if (!pcurrent) pcurrent = 0;

    const returnstate = {};

    if (pcurrent !== state.game_current) {
      returnstate.current = pcurrent;
      returnstate.game_current = pcurrent;
    }

    if (running !== state.running) {
      returnstate.running = running;
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

    const secondsPassed = Math.floor((Date.now() - game.clocks[color].starttime) / 1000);
    const delay = iod - secondsPassed;

    if ((type === "us" || type === "bronstein") && delay > 0) {
      Meteor.setTimeout(() => {
        this.setTimer({ game, color, iod, MilliSecondsPassed: secondsPassed * 1000 });
      }, delay * 1000);
    } else {
      this.setTimer({ game, color });
    }
  }

  setTimer = ({ game, color, iod, MilliSecondsPassed }) => {
    this.interval = Meteor.setInterval(() => {
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
      ms,
    };
  };

  render() {
    const { game, side, color, currentTurn, isGameOn } = this.props;
    const { current, running, isEditing } = this.state;
    if (!game) {
      return null;
    }

    const { clockstyle, neg, ms } = this.calculateTimeLeftAndStyles({
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
          position: "relative",
          marginTop: "8px",
        }}
      >
        {!isEditing ? (
          <div style={clockstyle} onClick={!isGameOn ? this.onEditOpen : noop}>
            {neg}
            {defaultValue}
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
