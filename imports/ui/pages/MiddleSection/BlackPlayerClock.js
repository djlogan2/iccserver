import React, { Component } from "react";
import { Logger } from "../../../../lib/client/Logger";
const TOTAL_MINUTES = 60;
let log = new Logger("server/BlackPlayerClock_JS");
export default class BlackPlayerClock extends Component {
  constructor(props) {
    super(props);
    this.state = {
      time: Math.floor(props.ClockData.current / 1000),
      isActive: props.ClockData.isactive,
      initial: 0,
      mseconds: 9
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.isactive !== this.state.isactive) {
      if (this.state.isactive) {
        this.intervalId = setInterval(() => {
          const { mseconds, time } = this.state;

          if (mseconds > 0) {
            this.setState(({ mseconds }) => ({
              mseconds: mseconds - 1
            }));
          }
          if (mseconds === 0) {
            if (time === 0 && mseconds === 0) {
              clearInterval(this.myInterval);
            } else {
              this.setState(({ time }) => ({
                time: time - 1,
                mseconds: 9
              }));
            }
          }
        }, 100);
      } else clearInterval(this.intervalId);
    }
  }
  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.ClockData.current !== prevState.initial) {
      let time = Math.floor(nextProps.ClockData.current / 1000);
      return { time: time, initial: nextProps.ClockData.current };
    }
    if (nextProps.ClockData.isactive !== prevState.isactive) {
      return { isactive: nextProps.ClockData.isactive };
    } else return null;
  }
  render() {
    const { time } = this.state;

    let minutes = "" + Math.floor((time % (TOTAL_MINUTES * TOTAL_MINUTES)) / TOTAL_MINUTES);
    let seconds = "" + Math.floor(time % TOTAL_MINUTES);
    let mseconds = null;
    let cv = this.props.side / 9;
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
    if (
      Math.floor(time % TOTAL_MINUTES) < 10 &&
      Math.floor((time % (TOTAL_MINUTES * TOTAL_MINUTES)) / TOTAL_MINUTES) === 0
    ) {
      mseconds = `:${this.state.mseconds}`;
      Object.assign(clockstyle, { color: "#fb0404" });
    }

    if (isNaN(minutes) || isNaN(seconds)) {
      return null;
    }

    if (minutes.length === 1) {
      minutes = `0${minutes}`;
    }
    if (seconds.length === 1) {
      seconds = `0${seconds}`;
    }

    return (
      <div
        style={{
          width: this.props.side * 0.25,
          display: "inline-block",
          position: "relative",
          verticalAlign: "top",
          marginTop: "8px"
        }}
      >
        <div style={clockstyle}>
          {/* <div style={this.props.cssmanager.clock(time)}> */}
          {minutes}:{seconds}
          {mseconds}
        </div>
      </div>
    );
  }
}
