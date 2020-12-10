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
    return <Tournaments lists={this.props.TournamentsList} cssManager={this.props.cssManager} />;
  }
}

class Tournaments extends Component {
  render() {
    let listItem = this.props.lists.map((list, index) => {
      return (
        <div key={index} style={this.props.cssManager.challengeContent()}>
          <button style={this.props.cssManager.buttonStyle("tournamentButton")}>
            <span style={this.props.cssManager.spanStyle()}>
              <img src={list.src} alt="" />
            </span>
            <span style={this.props.cssManager.spanStyle("name")}>{list.name}</span>
            <span style={this.props.cssManager.spanStyle("status")}>{list.status}</span>
            <span style={this.props.cssManager.spanStyle()}>
              {list.count}
              <img
                src={this.props.cssManager.buttonBackgroundImage("tournamentUserIcon")}
                alt="user-icon"
              />
            </span>
          </button>
        </div>
      );
    });

    return <div style={this.props.cssManager.tournamentContent()}>{listItem}</div>;
  }
}
