import React, { Component } from "react";

const TOTAL_MINUTES = 60;
export default class BlackPlayerClock extends Component {
  constructor(props) {
    super(props);
    this.state = {
      time: props.ClockData1.Timer,
      isActive: props.ClockData1.IsActive
    };
  }
  componentWillReceiveProps(prevProps, prevState) {
    if (this.props.ClockData1.IsActive === true) {
      clearInterval(this.intervalId);
      this.intervalId = setInterval(() => {
        const { time } = this.state;
        if (time > 0) {
          this.setState({
            time: time - 1
          });
        }
      }, 1000);
    } else {
      clearInterval(this.intervalId);
    }
  }

  render() {
    const { time } = this.state;

    let minutes =
      "" + Math.floor((time % (TOTAL_MINUTES * TOTAL_MINUTES)) / TOTAL_MINUTES);
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
        style={{ width: cv * 2, display: "inline-block", verticalAlign: "top" }}
      >
        <div style={this.props.cssmanager.clock(time)}>
          {minutes}:{seconds}
        </div>
      </div>
    );
  }
}
