import React, { Component } from "react";
export default class TournamentsListComponent extends Component {
  /**
     * 
     * TournamentList Load from server side which bind in List state
     * Now we bind state List when Player click it open Game view Mode
     *  
     * 
     * Tournament details ( Game view Mode )
       Player can able to see the Tournament details.
     */

  render() {
    return (
      <Tournaments
        lists={this.props.TournamentsList}
        CssManager={this.props.CssManager}
      />
    );
  }
}

class Tournaments extends Component {
  render() {
    let listItem = this.props.lists.map((list, index) => {
      return (
        <div key={index} style={this.props.CssManager.challengeContent()}>
          <button style={this.props.CssManager.buttonStyle("tournamentButton")}>
            <span style={this.props.CssManager.spanStyle()}>
              <img src={list.src} alt="" />
            </span>
            <span style={this.props.CssManager.spanStyle("name")}>
              {list.name}
            </span>
            <span style={this.props.CssManager.spanStyle("status")}>
              {list.status}
            </span>
            <span style={this.props.CssManager.spanStyle()}>
              {list.count}
              <img
                src={this.props.CssManager.buttonBackgroundImage(
                  "tournamentUserIcon"
                )}
                alt="user-icon"
              />
            </span>
          </button>
        </div>
      );
    });

    return (
      <div style={this.props.CssManager.tournamentContent()}>{listItem}</div>
    );
  }
}
