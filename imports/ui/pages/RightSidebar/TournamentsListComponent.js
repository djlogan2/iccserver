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
          <a herf="#/" style={this.props.CssManager.competitionsListItem()}>
            <i style={this.props.CssManager.blitzIcon()}>
              <img src={list.src} alt="" />
            </i>
            <span>{list.name}</span>
            <span>{list.status}</span>
            <span>{list.count} </span>
          </a>
        </div>
      );
    });

    return (
      <div style={this.props.CssManager.tournamentContent()}>{listItem}</div>
    );
  }
}
