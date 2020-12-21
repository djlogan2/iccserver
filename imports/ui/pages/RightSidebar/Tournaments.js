import React, { Component } from "react";

export default class Tournaments extends Component {
  render() {
    const { lists, cssManager } = this.props;

    return (
      <div style={cssManager.tournamentContent()}>
        {lists.map((list, index) => {
          return (
            <div key={index} style={cssManager.challengeContent()}>
              <button style={cssManager.buttonStyle("tournamentButton")}>
                <span style={cssManager.spanStyle()}>
                  <img src={list.src} alt="" />
                </span>
                <span style={cssManager.spanStyle("name")}>{list.name}</span>
                <span style={cssManager.spanStyle("status")}>{list.status}</span>
                <span style={cssManager.spanStyle()}>
                  {list.count}
                  <img
                    src={cssManager.buttonBackgroundImage("tournamentUserIcon")}
                    alt="user-icon"
                  />
                </span>
              </button>
            </div>
          );
        })}
      </div>
    );
  }
}
