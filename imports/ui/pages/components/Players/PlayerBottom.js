import React, { Component } from "react";

export default class PlayerBottom extends Component {
  static gametimeUpdate(rec) {
    let themillis = "";
    if (rec.color === "w") {
      themillis = rec.millis;

      let millis = themillis % 1000;
      let seconds = parseInt((themillis - millis) / 1000);
      let minutes = parseInt(seconds / 60);
      seconds -= minutes * 60;
      let hours = parseInt(minutes / 60);
      minutes -= hours * 60;

      let timestring = "";
      if (hours) timestring = hours + ":";
      if (hours || minutes) {
        if (minutes < 10) timestring += "0";
        timestring += minutes + ":";
      } else timestring += "0:";

      if (seconds < 10) timestring += "0";

      timestring += seconds;
      if (seconds < 15 && !minutes && !hours)
        timestring += "." + millis.toString().substr(0, 1);
      return timestring;
    }
  }

  render() {
    let propsTime = this.props.gameClockInfo;
    let whiteBlayerTime = PlayerBottom.gametimeUpdate(propsTime);
    return (
      <div>
        <div>
          <div className="board-player-bottom">
            <img
              className="user-pic"
              src="images/player-img-bottom.png"
              alt=""
              title=""
            />
            <div className="board-player-userTagline">
              <div className="user-tagline-component">
                <a href="#" target="_blank" className="user-tagline-username">
                  {this.props.playerInfo["name"]} (
                  {this.props.playerInfo["rating"]})
                </a>{" "}
                <i>
                  <img src="images/user-flag.png" alt="" />
                </i>
              </div>
              <div className="captured-pieces">
                <img src="images/small-picB-1.png"/>{" "}
                <img src="images/small-picB-2.png"/>
              </div>
              <div className="clock-bottom active">{whiteBlayerTime}</div>
            </div>
          </div>
          <div className="move-list-buttons ipad-768">
            <div className="move-list-item">
              <a href="#">
                <img src="images/more-icon.png" />
              </a>
            </div>
            <div className="move-list-item">
              <a href="#">
                <img src="images/chat-icon-gray.png" />
              </a>
            </div>
            <div className="move-list-item">
              <a href="#">
                <img src="images/flip-icon.png" />
              </a>
            </div>
            <div className="move-list-item">
              <a href="#">
                <img src="images/prev-icon.png" />
              </a>
            </div>
            <div className="move-list-item hidden-xs">
              <a href="#">
                <img src="images/prev-icon-single.png" />
              </a>
            </div>
            <div className="move-list-item hidden-xs">
              <a href="#">
                <img src="images/next-icon-single.png" />
              </a>
            </div>
            <div className="move-list-item">
              <a href="#">
                <img src="images/next-icon.png" />
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
