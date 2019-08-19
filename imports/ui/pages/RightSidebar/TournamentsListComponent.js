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
    return <Tournaments lists={this.props.TournamentsList} />;
  }
}

class Tournaments extends Component {
  render() {
    let listItem = this.props.lists.map((list, index) => {
      return (
        <div key={index} style={this.props.cssmanager.challengeContent()}>
          <button style={this.props.cssmanager.buttonStyle("tournamentButton")}>
            <span style={this.props.cssmanager.spanStyle()}>
              <img src={list.src} alt="" />
            </span>
            <span style={this.props.cssmanager.spanStyle("name")}>
              {list.name}
            </span>
            <span style={this.props.cssmanager.spanStyle("status")}>
              {list.status}
            </span>
            <span style={this.props.cssmanager.spanStyle()}>
              {list.count}
              <img
                src={this.props.cssmanager.buttonBackgroundImage(
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
      <div style={this.props.cssmanager.tournamentContent()}>{listItem}</div>
    );
  }
}
