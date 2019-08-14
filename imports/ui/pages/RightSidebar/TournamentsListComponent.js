import React, { Component } from "react";
import CssManager from "../../pages/components/Css/CssManager";

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
      />
    );
  }
}

class Tournaments extends Component {
  render() {
    let listItem = this.props.lists.map((list, index) => {
      return (
        <div key={index} style={CssManager.challengeContent()}>
          <button style={CssManager.buttonStyle("tournamentButton")}>
            <span style={CssManager.spanStyle()}>
              <img src={list.src} alt="" />
            </span>
            <span style={CssManager.spanStyle("name")}>
              {list.name}
            </span>
            <span style={CssManager.spanStyle("status")}>
              {list.status}
            </span>
            <span style={CssManager.spanStyle()}>
              {list.count}
              <img
                src={CssManager.buttonBackgroundImage(
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
      <div style={CssManager.tournamentContent()}>{listItem}</div>
    );
  }
}
