import React, { Component } from "react";
import { translate } from "../../HOCs/translate";

class GameForm extends Component {
  handleChangeMinute = event => {
    const { handleChangeMinute } = this.props;

    handleChangeMinute(parseInt(event.target.value));
  };
  handleChangeSecond = event => {
    const { handleChangeSecond } = this.props;

    handleChangeSecond(parseInt(event.target.value));
  };
  handleChangeGameType = event => {
    const { handleChangeGameType } = this.props;

    handleChangeGameType(event.target.value);
  };
  handleChangeColor = event => {
    const { handleChangeColor } = this.props;

    handleChangeColor(event.target.value);
  };
  handleIncOrDelayTypeChange = event => {
    const { handleIncOrDelayTypeChange } = this.props;

    handleIncOrDelayTypeChange(event.target.value);
  };
  handleRatedChange = event => {
    const { handleRatedChange } = this.props;

    handleRatedChange(event.target.checked);
  };

  handleMatchSubmit() {
    const { handleSubmit } = this.props;

    handleSubmit();
  }

  render() {
    const { translate, cssManager, minute, inc, type, rated, color } = this.props;

    //TODO: fix styles usage. This is awful
    let radioStyle = cssManager.formLabelStyle("radio");
    let formlabel = cssManager.formLabelStyle();
    let minuteStyle = {};

    Object.assign(formlabel, { display: "block" });
    let selectorStyle = {
      width: "40%",
      height: "26px",
      border: "1px solid #1565c0",
      padding: "2px 6px"
    };
    let formMainStyle = cssManager.formMain();

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
          <div style={cssManager.formMainHalf()}>
            <label style={formlabel}>{translate("timeControl")}</label>
            <span style={cssManager.spanStyle("form")}>
              <select onChange={this.handleChangeMinute} value={minute} style={selectorStyle}>
                <option value="10">10</option>
                <option value="15">15</option>
                <option value="20">20</option>
                <option value="25">25</option>
                <option value="30">30</option>
              </select>
            </span>
            <span style={minuteStyle}>{translate("minutes")}</span>
          </div>
          <div style={cssManager.formMainHalf()}>
            <label style={formlabel}>{translate("secondPerMove")}</label>
            <input
              type="number"
              value={inc}
              style={selectorStyle}
              onChange={this.handleChangeSecond}
            />
          </div>
          <div style={{ display: "block", content: "inherit", clear: "both" }} />
        </div>
        <div style={formMainStyle}>
          <div style={cssManager.formMainHalf()}>
            <label style={formlabel}>{translate("typeOfGame")}</label>
            <span style={cssManager.spanStyle("form")}>
              <select onChange={this.handleChangeGameType} value={type} style={selectorStyle}>
                <option value="standard">Standard</option>
                <option value="chess">Chess</option>
              </select>
            </span>
          </div>

          <div style={cssManager.formMainHalf()}>
            <span style={cssManager.spanStyle("form")}>
              <input type="checkbox" checked={rated} onChange={this.handleRatedChange} />
              <label style={radioStyle}>{translate("rated")}</label>
            </span>
          </div>
          <div style={{ display: "block", content: "inherit", clear: "both" }} />
        </div>
        <div style={{ width: "100%", float: "left", marginBottom: "10px", padding: "3px 5px" }}>
          <span>{translate("pickAcolor")}</span>&nbsp;&nbsp;
          <input
            type="radio"
            value="white"
            checked={color === "white"}
            onChange={this.handleChangeColor}
          />
          <label style={radioStyle}>{translate("white")}</label>&nbsp;&nbsp;
          <input
            type="radio"
            value="black"
            checked={color === "black"}
            onChange={this.handleChangeColor}
          />
          <label style={radioStyle}>{translate("black")}</label>&nbsp;&nbsp;
          <input
            type="radio"
            value="random"
            checked={color === "random"}
            onChange={this.handleChangeColor}
          />
          <label style={radioStyle}>{translate("random")}</label>
        </div>
        <div style={cssManager.formMain()}>
          <div style={{ textAlign: "center" }}>
            <button
              onClick={this.handleMatchSubmit.bind(this)}
              style={cssManager.buttonStyle("formButton")}
            >
              {translate("submit")}
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default translate("Common.GameForm")(GameForm);
