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
    let radioStyle = this.props. cssManager.formLabelStyle("radio");
    let formlabel = this.props. cssManager.formLabelStyle();
    let minuteStyle = {};
    Object.assign(formlabel, { display: "block" });
    let selectorStyle = {
      width: "40%",
      height: "26px",
      border: "1px solid #1565c0",
      padding: "2px 6px"
    };
    let inputredio = {};
    let formMainStyle = this.props. cssManager.formMain();

    Object.assign(formMainStyle, {
      marginBottom: "10px",
      float: "left",
      paddingBottom: "10px",
      borderBottom: "1px solid #eee",
      paddingLeft: "0.70rem",
      paddingRight: "0.70rem"
    });

    return (
      <div style={{ display: "inline-block" }}>
        <div style={formMainStyle}>
          <div style={this.props. cssManager.formMainHalf()}>
            <label style={formlabel}>{translator("timeControl")}</label>
            <span style={this.props. cssManager.spanStyle("form")}>
              <select
                onChange={this.handleChangeMinute}
                value={this.props.minute}
                style={selectorStyle}
              >
                <option value="10">10</option>
                <option value="15">15</option>
                <option value="20">20</option>
                <option value="25">25</option>
                <option value="30">30</option>
              </select>
            </span>
            <span style={minuteStyle}>{translator("minutes")}</span>
          </div>
          <div style={this.props. cssManager.formMainHalf()}>
            {/*  <span style={this.props. cssManager.spanStyle("form")}>
              <select onChange={this.handleChangeSecond} value={this.props.inc}>
                <option value="0">0</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
            </span>*/}
            <label style={formlabel}>{translator("secondPerMove")}</label>
            <input
              type="number"
              value={this.props.inc}
              style={selectorStyle}
              onChange={this.handleChangeSecond}
            />
          </div>
          <div style={{ display: "block", content: "inherit", clear: "both" }} />
        </div>
        {/*
        <div style={this.props. cssManager.formMain()}>
        <div style={{ width: "100%", float: "left" }}>
            <label style={this.props. cssManager.formLabelStyle("first")}>
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
        <div style={formMainStyle}>
          <div style={this.props. cssManager.formMainHalf()}>
            <label style={formlabel}>{translator("typeOfGame")}</label>
            <span style={this.props. cssManager.spanStyle("form")}>
              <select
                onChange={this.handleChangeGameType}
                value={this.props.type}
                style={selectorStyle}
              >
                <option value="standard">Standard</option>
                <option value="chess">Chess</option>
              </select>
            </span>
          </div>

          <div style={this.props. cssManager.formMainHalf()}>
            <span style={this.props. cssManager.spanStyle("form")}>
              <input type="checkbox" checked={this.props.rated} onChange={this.handleRatedChange} />
              <label style={radioStyle}>{translator("rated")}</label>
            </span>
          </div>
          <div style={{ display: "block", content: "inherit", clear: "both" }} />
        </div>
        <div style={{ width: "100%", float: "left", marginBottom: "10px", padding: "3px 5px" }}>
          <span>{translator("pickAcolor")}</span>&nbsp;&nbsp;
          <input
            type="radio"
            value="white"
            checked={this.props.color === "white"}
            onChange={this.handleChangeColor}
            style={inputredio}
          />
          <label style={radioStyle}>{translator("white")}</label>&nbsp;&nbsp;
          <input
            type="radio"
            value="black"
            checked={this.props.color === "black"}
            onChange={this.handleChangeColor}
            style={inputredio}
          />
          <label style={radioStyle}>{translator("black")}</label>&nbsp;&nbsp;
          <input
            type="radio"
            value="random"
            checked={this.props.color === "random"}
            onChange={this.handleChangeColor}
            style={inputredio}
          />
          <label style={radioStyle}>{translator("random")}</label>
        </div>
        <div style={this.props. cssManager.formMain()}>
          <div style={{ textAlign: "center" }}>
            <button
              onClick={this.handleMatchSubmit.bind(this)}
              style={this.props. cssManager.buttonStyle("formButton")}
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
