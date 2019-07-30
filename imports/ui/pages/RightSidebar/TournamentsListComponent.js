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
    let lists = [
      {
        name: "3|2 Blitz Arena",
        status: "Round 1 of 5",
        count: "15",
        src: "images/blitz-icon.png"
      },
      {
        name: "1|0 Bullet Arena",
        status: "in 4 min",
        count: "40 ",
        src: "images/rapid-icon.png"
      },
      {
        name: "15|10 Rapid Swiss ",
        status: "Round 1 of 5",
        count: "54",
        src: "images/bullet-icon.png"
      },
      {
        name: "1|0 Bullet Arena",
        status: "Round 1 of 5",
        count: "35",
        src: "images/blitz-icon.png"
      },
      {
        name: "3|2 Blitz Arena",
        status: "Round 1 of 7",
        count: "49",
        src: "images/rapid-icon.png"
      },
      {
        name: "1|0 Bullet Arena",
        status: "in 8 min",
        count: "55",
        src: "images/bullet-icon.png"
      },
      {
        name: "15|10 Rapid Swiss",
        status: "Round 1 of 3",
        count: "25",
        src: "images/blitz-icon.png"
      },
      {
        name: "15|10 Rapid Swiss ",
        status: "Round 1 of 5",
        count: "15",
        src: "images/rapid-icon.png"
      }
    ];

    return <Tournaments lists={lists} />;
  }
}

class Tournaments extends Component {
  render() {
    let listItem = this.props.lists.map((list, index) => {
      return (
        <div className="challenge-content" key={index}>
          <a herf="#" className="competitions-list-item-component">
            <i className="blitzicon">
              <img src={list.src} alt="" />
            </i>
            <span className="competitions-list-item-name">{list.name}</span>
            <span className="competitions-list-item-status">{list.status}</span>
            <span className="competitions-list-item-count">{list.count} </span>
            <i className="fa fa-user" aria-hidden="true" />
          </a>
        </div>
      );
    });

    return <div className="tournament-content">{listItem}</div>;
  }
}
