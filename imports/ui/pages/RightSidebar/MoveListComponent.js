import React, { Component } from "react";
import CssManager from "../../pages/components/Css/CssManager";

export default class MoveListComponent extends Component {
  constructor(props) {
    super(props);

    this.Moves = [];
  }
  componentWillReceiveProps(nextProps) {
    let move = nextProps.Moves;
    this.Moves.push(move);
  }
  render() {
    return (
      <div>
        <div style={CssManager.gameMoveList()}>
          {this.Moves}
          1. e4 d5 2. exd5 b5 3. c3 c6 4. dxc6 b4 5. ce2 a6 6. d4 a7 7. c3 b7 8.
          cxb7 xb7 9. f4 xd4 10. xd4 e5 11. xe5 12. e4 d5 13. exd5 b5 14. c3 c6
          15. dxc6 b4 5. ce2 a6 6. d4 a7 7. c3 b7 8. cxb7 xb7 9. f4 xd4 10. xd4
          e5 11. xe5
        </div>

        <div style={CssManager.gameButtonMove()}>
          {/* 
					Game History Button Component
					Different buttons such as next and previous is available for
					player to check the previous moves. this along with GameComponent */}

          <button style={CssManager.buttonStyle()}>
            <img
              src={CssManager.buttonBackgroundImage("fastForward")}
              alt="fast-forward"
            />
          </button>
          <button style={CssManager.buttonStyle()}>
            <img
              src={CssManager.buttonBackgroundImage("prevIconGray")}
              alt="previous"
            />
          </button>
          <button style={CssManager.buttonStyle()}>
            <img
              src={CssManager.buttonBackgroundImage("nextIconGray")}
              alt="next"
            />
          </button>
          <button style={CssManager.buttonStyle()}>
            <img
              src={CssManager.buttonBackgroundImage(
                "fastForwardNext"
              )}
              alt="fast-forward-next"
            />
          </button>
          <button style={CssManager.buttonStyle()}>
            <img
              src={CssManager.buttonBackgroundImage(
                "nextIconSingle"
              )}
              alt="next-single"
            />
          </button>
          {/*
					 Game Board flip Component
					  And
					 Game Board Setting Component
					 Player can flip the position of the Board (top/bottom).
					 Player can change the game board colour, peace.
					 this along with GameComponent
 					*/}
          <button style={CssManager.buttonStyle()}>
            <img
              src={CssManager.buttonBackgroundImage("flipIconGray")}
              alt="Flip"
            />
          </button>
          <button style={CssManager.buttonStyle()}>
            <img
              src={CssManager.buttonBackgroundImage("settingIcon")}
              alt="setting-icon"
            />
          </button>
        </div>
      </div>
    );
  }
}
