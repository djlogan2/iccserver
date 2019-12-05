import React from "react";
import { Meteor } from "meteor/meteor";
import i18n from "meteor/universe:i18n";
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
      minute: 15,
      inc: 0,
      color: "random"
    };
  }
  removeUser() {
    this.setState({
      user: null,
      wild_number: 0,
      type: "standard",
      rated: false,
      is_adjourned: false,
      minute: 10,
      inc: 0,
      color: "random"
    });
  }

  handleChangeMinute = minute => {
    this.setState({ minute: minute });
  };
  handleChangeSecond = inc => {
    this.setState({ inc: inc });
  };
  handleChangeGameType = type => {
    this.setState({ type: type });
  };
  handleChangeColor = color => {
    this.setState({ color: color });
  };
  handleRatedChange = rate => {
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
      this.state.minute,
      this.state.inc,
      this.state.rated,
      color,
      null,
      null,
      true
    );
  }

  getLang() {
    return (
      (navigator.languages && navigator.languages[0]) ||
      navigator.language ||
      navigator.browserLanguage ||
      navigator.userLanguage ||
      "en-US"
    );
  }

  render() {
    return (
      <div>
        <div style={this.props.cssmanager.tabSeparator()} />
        <div style={this.props.cssmanager.matchUserScroll()}>
          <GameForm
            cssmanager={this.props.cssmanager}
            handleChangeMinute={this.handleChangeMinute}
            handleChangeSecond={this.handleChangeSecond}
            handleChangeGameType={this.handleChangeGameType}
            handleChangeColor={this.handleChangeColor}
            handleRatedChange={this.handleRatedChange}
            handleSubmit={this.handleMatchSubmit.bind(this)}
            type={this.state.type}
            rated={this.state.rated}
            minute={this.state.minute}
            inc={this.state.inc}
            color={this.state.color}
          />
        </div>
      </div>
    );
  }
}
