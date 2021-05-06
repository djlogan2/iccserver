import React from "react";
import { Meteor } from "meteor/meteor";
import GameForm from "./GameForm";

export default class SeekGameComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      trial: 0,
      user: null,
      wild_number: 0,
      type: "standard",
      rated: true,
      is_adjourned: false,
      time: 14,
      inc: 1,
      incOrdelayType: "inc",
      color: "random",
    };
  }
  removeUser() {
    this.setState({
      user: null,
      wild_number: 0,
      type: "standard",
      rated: false,
      is_adjourned: false,
      time: 14,
      inc: 1,
      incOrdelayType: "inc",
      color: "random",
    });
  }

  handleChangeMinute = (minute) => {
    this.setState({ time: minute });
  };
  handleChangeSecond = (inc) => {
    this.setState({ inc: inc });
  };
  handleChangeGameType = (type) => {
    this.setState({ type: type });
  };
  handleIncOrDelayTypeChange = (incOrDelay) => {
    this.setState({ incOrdelayType: incOrDelay });
  };
  handleChangeColor = (color) => {
    this.setState({ color: color });
  };
  handleRatedChange = (rate) => {
    this.setState({ rated: rate });
  };

  handleMatchSubmit() {
    let color = this.state.color === "random" ? null : this.state.color;
    /**TODO minrating and maxrating and formula not mention in form so we pass as it if any changes we will make */

    Meteor.call(
      "createLocalGameSeek",
      "seekRequest",
      this.state.wild_number,
      this.state.type,
      this.state.time,
      this.state.inc,
      this.state.incOrdelayType,
      this.state.rated,
      color,
      null,
      null,
      true
    );
  }

  render() {
    return (
      <div>
        <div style={this.props.cssManager.tabSeparator()} />
        <div style={this.props.cssManager.matchUserScroll()}>
          <GameForm
            cssManager={this.props.cssManager}
            handleChangeMinute={this.handleChangeMinute}
            handleChangeSecond={this.handleChangeSecond}
            handleChangeGameType={this.handleChangeGameType}
            handleChangeColor={this.handleChangeColor}
            handleRatedChange={this.handleRatedChange}
            handleIncOrDelayTypeChange={this.handleIncOrDelayTypeChange}
            handleSubmit={this.handleMatchSubmit.bind(this)}
            type={this.state.type}
            rated={this.state.rated}
            minute={this.state.time}
            inc={this.state.inc}
            incOrdelayType={this.state.incOrdelayType}
            color={this.state.color}
          />
        </div>
      </div>
    );
  }
}
