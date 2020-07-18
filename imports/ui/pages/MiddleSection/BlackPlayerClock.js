import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { Logger } from "../../../../lib/client/Logger";
let log = new Logger("server/BlackPlayerClock_JS");
export default class BlackPlayerClock extends Component {
  constructor(props) {
    super(props);
    this.state = {
      initial: 0
    };
  }
  getTime(game_record, color) {
    if (color !== game_record.tomove) return game_record.clocks[color].current;
    const timediff = new Date().getTime() - game_record.clocks[color].starttime;
    if (
      game_record.clocks[color].delaytype === "us" &&
      (game_record.clocks[color].delay | 0) * 1000 <= timediff
    ) {
      return game_record.clocks[color].current;
    } else {
      return game_record.clocks[color].current - timediff;
    }
  }
  render() {
    let time;
    let minute = 0;
    let second = 0;
    let millisecond;
    if (!!this.props.game && this.props.game.status === "playing") {
      time = this.getTime(this.props.game, this.props.color);
      millisecond = time;
      let hh = Math.floor(millisecond / 1000 / 60 / 60);
      millisecond -= hh * 1000 * 60 * 60;
      minute = Math.floor(millisecond / 1000 / 60);
      millisecond -= minute * 1000 * 60;
      second = Math.floor(millisecond / 1000);
      millisecond -= second * 1000;
      millisecond = millisecond / 100;
    }
    if (minute < 10) {
      minute = `0${minute}`;
    }
    if (second < 10) {
      second = `0${second}`;
    }
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
          {/* <div style={this.props. cssManager.clock(time)}> */}
          {minute}:{second}
        </div>
      </div>
    );
  }
}
