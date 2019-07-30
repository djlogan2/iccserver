import React, { Component } from "react";

class ActionComponent extends Component {
  render() {
    return (
      <div className="draw-section">
        <ul>
          {/* 
		Take back request Component
		Player can request to take back the last move to the
		opponent Player. 
		*/}
          <li>
            <button
              title="TakeBack"
              style={this.props.CssManager.actionButtonImage("takeback")}
            >
              <img src="images/fast-forward-prev.png" alt="fast-forward" />
              TakeBack
            </button>
          </li>
          {/* 
		Draw request Component
		Player can draw arrow and circle on the board.
		*/}
          <li>
            <button
              title="Draw"
              style={this.props.CssManager.actionButtonImage("draw")}
            >
              <img src="images/draw-icon.png" alt="draw" />
              Draw
            </button>
          </li>
          {/*
							Resign Component
							Players can resign the game.
							*/}

          <li>
            <button
              title="Resign"
              style={this.props.CssManager.actionButtonImage("resign")}
            >
              <img src="images/resign-icon.png" alt="resign" />
              Resign
            </button>
          </li>
          {/* 
						Game abort Component
						Players can abort the game. */}
          <li>
            <button
              title="Abort"
              style={this.props.CssManager.actionButtonImage("abort")}
            >
              <img src="images/abort-icon.png" alt="abort" />
              Abort
            </button>
          </li>
        </ul>
      </div>
    );
  }
}
export default ActionComponent;
