import React from "react";

class Leftsidebar extends React.Component {
  render() {
    return (
      <ul className="list-sidebar bg-defoult list-unstyled components desktop">
        <li className="show-sm">
          <a href="#">
            <img src="images/home-icon-white.png" /> <span>Home</span>
          </a>
        </li>

        <li className="show-sm">
          <a href="#">
            <img src="images/learning-icon-white.png" />
            <span>Learn</span>
          </a>
        </li>

        <li className="show-sm">
          <a href="#">
            <img src="images/connect-icon-white.png" />
            <span>Connect</span>
          </a>
        </li>
        <li className="show-sm">
          <a href="#">
            <img src="images/examine-icon-white.png" />
            <span>Examine</span>
          </a>
        </li>
        <li className="show-sm">
          <a href="#">
            <img src="images/history-icon-white.png" />
            <span>History</span>
          </a>
        </li>
        <li className="show-sm">
          <a href="#">
            <img src="images/event-icon-white.png" />
            <span>Events</span>
          </a>
        </li>
        <li className="show-sm">
          <a href="#">
            <img src="images/friends-icon-mob.png" />
            <span>Friends</span>
          </a>
        </li>
        <li className="show-sm">
          <a href="#">
            <img src="images/top-player-icon-white.png" />
            <span>Top Players</span>
          </a>
        </li>
        <li className="show-sm">
          <a href="onClick={this.click}>">
            <img src="images/login-icon-white.png" />
            <span>Log in</span>
          </a>
        </li>
        <li className="show-sm">
          <a href="#">
            <img src="images/signup-icon-white.png" />
            <span>Sign up</span>
          </a>
        </li>
        <li className="show-sm">
          <a href="#">
            <img src="images/help-icon-white.png" />
            <span>Help</span>
          </a>
        </li>
        <li className="show-lg">
          <a href="#">
            <img src="../../../images/play-icon-white.png" /> <span>Play</span>
          </a>
        </li>
        <li className="show-lg">
          <a href="#">
            <img src="../../../images/learning-icon-white.png" />
            <span>Learn</span>
          </a>
        </li>
        <li className="show-lg">
          <a href="#">
            <img src="../../../images/connect-icon-white.png" />
            <span>Connect</span>
          </a>
        </li>
        <li className="show-lg">
          <a href="#">
            <img src="../../../images/examine-icon-white.png" />
            <span>Examine</span>
          </a>
        </li>
        <li className="show-lg">
          <a href="#">
            <img src="../../../images/top-player-icon-white.png" />
            <span>Top Players</span>
          </a>
        </li>
        <li className="show-lg">
          <a href="#">
            <img src="../../../images/login-icon-white.png" />
            <span>Log in</span>
          </a>
        </li>
        <li className="show-lg">
          <a href="#">
            <img src="../../../images/signup-icon-white.png" />
            <span>Sign up</span>
          </a>
        </li>
        <li className="show-lg">
          <a href="#">
            <img src="../../../images/help-icon-white.png" />
            <span>Help</span>
          </a>
        </li>
      </ul>
    );
  }
}

export default Leftsidebar;
