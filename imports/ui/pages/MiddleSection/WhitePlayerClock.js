import React, { Component } from "react";
import { Logger } from "../../../../lib/client/Logger";
const TOTAL_MINUTES = 60;
let log = new Logger("server/WhitePlayerClock_JS");
export default class WhitePlayerClock extends Component {
  constructor(props) {
    super(props);
    this.state = {
      time: Math.floor(props.ClockData.current / 1000),
      isActive: props.ClockData.isactive
    };
  }
  componentDidUpdate(prevProps, prevState) {
    //log.debug("white", this.props.ClockData);
    if (this.props.ClockData.isactive === true) {
      clearInterval(this.intervalId);
      this.intervalId = setInterval(() => {
        //log.debug("white inside setinterval: ", this.state.time);
        const { time } = this.state;
        //  console.log("state current time for white: " + time);
        if (time > 0) {
          this.setState({
            time: time - 1
          });
        }
      }, 1000);
    } else {
      //    console.log("NOT ACTIVE WHITE");
      clearInterval(this.intervalId);
    }
  }
  // componentWillReceiveProps() {
  //   this.setState({
  //     time: this.props.ClockData.current
  //   });
  // }
  render() {
    const { time } = this.state.time;
    let minutes = "" + Math.floor((time % (TOTAL_MINUTES * TOTAL_MINUTES)) / TOTAL_MINUTES);
    let seconds = "" + Math.floor(time % TOTAL_MINUTES);

    if (isNaN(minutes) || isNaN(seconds)) {
      return null;
    }

    if (minutes.length === 1) {
      minutes = `0${minutes}`;
    }
    if (seconds.length === 1) {
      seconds = `0${seconds}`;
    }
    let cv = this.props.side / 9;
    return (
      <div
        style={{
          width: cv * 2,
          display: "inline-block",
          position: "relative",
          verticalAlign: "top",
          marginTop: "8px"
        }}
      >
        <div
          style={{
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
          }}
        >
          {minutes}:{seconds}
        </div>
      </div>
    );
  }
}
