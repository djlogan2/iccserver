import React, { Component } from "react";

const TOTAL_MINUTES = 60;
export default class ClockComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      time: props.ClockData.time,
      isActive: props.ClockData.isActive
    };
  }

  componentDidMount() {
    const { isActive } = this.state;
    if (isActive === true) {
      this.intervalId = setInterval(() => {
        const { time } = this.state;
        if (time > 0) {
          this.setState({
            time: time - 1
          });
        }
      }, 1000);
    }
  }
  componentWillUnmount() {
    clearInterval(this.intervalId);
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
    return (
      <div className="clock-top">
        <div style={this.props.CssManager.clock(time)}>
          {minutes}:{seconds}
        </div>
      </div>
    );
  }
}
