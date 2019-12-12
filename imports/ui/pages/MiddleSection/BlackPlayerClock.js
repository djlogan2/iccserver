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
      initial: 0
    };
  }

  componentDidUpdate(prevProps, prevState) {
    /*  log.debug("This props Black", this.props.ClockData);
    log.debug("This prevProps Black", prevProps.ClockData);
  */
    if (prevState.isactive !== this.state.isactive) {
      if (this.state.isactive) {
        this.intervalId = setInterval(() => {
          //log.debug("Black inside setinterval: ", this.state.time);
          const { time } = this.state;
          if (time > 0) {
            this.setState({
              time: time - 1
            });
          }
        }, 1000);
      } else clearInterval(this.intervalId);
    }
  }
  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.ClockData.isactive !== prevState.isactive) {
      return { isactive: nextProps.ClockData.isactive };
    } else return null;
  }
  render() {
    const { time } = this.state;

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
          {/* <div style={this.props.cssmanager.clock(time)}> */}
          {minutes}:{seconds}
        </div>
      </div>
    );
  }
}
