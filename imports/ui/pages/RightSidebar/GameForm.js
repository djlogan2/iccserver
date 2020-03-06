import React, { Component } from "react";
import i18n from "meteor/universe:i18n";
class GameForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      error: null,
      trial: 0
    };
  }

  handleChangeMinute = event => {
    this.props.handleChangeMinute(parseInt(event.target.value));
  };
  handleChangeSecond = event => {
    this.props.handleChangeSecond(parseInt(event.target.value));
  };
  handleChangeGameType = event => {
    this.props.handleChangeGameType(event.target.value);
  };
  handleChangeColor = event => {
    this.props.handleChangeColor(event.target.value);
  };
  handleIncOrDelayTypeChange = event => {
    this.props.handleIncOrDelayTypeChange(event.target.value);
  };
  handleRatedChange = event => {
    this.props.handleRatedChange(event.target.checked);
  };
  handleMatchSubmit() {
    this.props.handleSubmit();
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
    let translator = i18n.createTranslator("Common.GameForm", this.getLang());
    let radioStyle = this.props.cssmanager.formLabelStyle("radio");
    return (
      <div>
        <div style={this.props.cssmanager.formMain()}>
          <div style={this.props.cssmanager.formMainHalf()}>
            <label style={this.props.cssmanager.formLabelStyle()}>
              {translator("timeControl")}
            </label>
            <span style={this.props.cssmanager.spanStyle("form")}>
              <select onChange={this.handleChangeMinute} value={this.props.minute}>
                <option value="10">10</option>
                <option value="15">15</option>
                <option value="20">20</option>
                <option value="25">25</option>
                <option value="30">30</option>
              </select>
            </span>
            <label style={this.props.cssmanager.formLabelStyle()}>{translator("minutes")}</label>
          </div>
          <div style={this.props.cssmanager.formMainHalf()}>
            {/*  <span style={this.props.cssmanager.spanStyle("form")}>
              <select onChange={this.handleChangeSecond} value={this.props.inc}>
                <option value="0">0</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select> 
            </span>*/}
            <input
              type="number"
              value={this.props.inc}
              style={{ width: "50px" }}
              onChange={this.handleChangeSecond}
            />
            <label style={this.props.cssmanager.formLabelStyle()}>
              {translator("secondPerMove")}
            </label>
          </div>
        </div>
        {/*
        <div style={this.props.cssmanager.formMain()}>
        <div style={{ width: "100%", float: "left" }}>
            <label style={this.props.cssmanager.formLabelStyle("first")}>
              {translator("incrementOrDelayType")}
            </label>
            <input
              type="radio"
              value="us"
              checked={this.props.incOrdelayType === "us"}
              onChange={this.handleIncOrDelayTypeChange}
            />
            <label style={radioStyle}>{translator("us")}</label>
            <input
              type="radio"
              value="inc"
              checked={this.props.incOrdelayType === "inc"}
              onChange={this.handleIncOrDelayTypeChange}
            />
            <label style={radioStyle}>{translator("inc")}</label>
            <input
              type="radio"
              value="bronstein"
              checked={this.props.incOrdelayType === "bronstein"}
              onChange={this.handleIncOrDelayTypeChange}
            />
            <label style={radioStyle}>{translator("bronstein")}</label>
          </div> 
        </div>*/}
        <div style={this.props.cssmanager.formMain()}>
          <div style={this.props.cssmanager.formMainHalf()}>
            <label style={this.props.cssmanager.formLabelStyle()}>{translator("typeOfGame")}</label>
            <span style={this.props.cssmanager.spanStyle("form")}>
              <select onChange={this.handleChangeGameType} value={this.props.type}>
                <option value="standard">Standard</option>
                <option value="chess">Chess</option>
              </select>
            </span>
          </div>
          <div style={this.props.cssmanager.formMainHalf()}>
            <span style={this.props.cssmanager.spanStyle("form")}>
              <input type="checkbox" checked={this.props.rated} onChange={this.handleRatedChange} />
              <label style={radioStyle}>{translator("rated")}</label>
            </span>
          </div>
        </div>
        <div style={{ width: "100%", float: "left" }}>
          <label style={this.props.cssmanager.formLabelStyle("first")}>
            {translator("pickAcolor")}
          </label>
          <input
            type="radio"
            value="white"
            checked={this.props.color === "white"}
            onChange={this.handleChangeColor}
          />
          <label style={radioStyle}>{translator("white")}</label>
          <input
            type="radio"
            value="black"
            checked={this.props.color === "black"}
            onChange={this.handleChangeColor}
          />
          <label style={radioStyle}>{translator("black")}</label>
          <input
            type="radio"
            value="random"
            checked={this.props.color === "random"}
            onChange={this.handleChangeColor}
          />
          <label style={radioStyle}>{translator("random")}</label>
        </div>
        <div style={this.props.cssmanager.formMain()}>
          <div style={{ textAlign: "center" }}>
            <button
              onClick={this.handleMatchSubmit.bind(this)}
              style={this.props.cssmanager.buttonStyle("formButton")}
            >
              {translator("submit")}
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default GameForm;
