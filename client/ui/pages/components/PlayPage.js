import React, { Component } from "react";
import AppWrapper from "./AppWrapper/AppWrapper";
import PlayRightSidebar from "./RightSidebar/PlayRightSidebar/PlayRightSidebar";
import "../../../../imports/css/leftsidebar.css";

import { Col } from "antd";

import MiddleBoard from "../MiddleSection/MiddleBoard";
import BoardWrapper from "./BoardWrapper/BoardWrapper";
import { colorBlackLetter, colorWhiteLetter } from "../../../constants/gameConstants";

export default class PlayPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      width: window.innerWidth,
      height: window.innerHeight,
      switchSides: Date.now(),
    };
  }

  componentDidMount() {
    this.updateDimensions();
    window.addEventListener("resize", this.updateDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions);
  }

  updateDimensions = () => {
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  };

  _flipboard = () => {
    this.setState({ switchSides: Date.now() });
  };

  getTop = () => {
    const { game } = this.props;

    return game?.white?.id === Meteor.userId() ? colorBlackLetter : colorWhiteLetter;
  };

  render() {
    const {
      board,
      game,
      cssManager,
      capture,
      onDrop,
      onDrawObject,
      onRemoveCircle,
      onChooseFriend,
      onBotPlay,
      onSeekPlay,
    } = this.props;
    const { width, height, switchSides } = this.state;

    return (
      <AppWrapper cssManager={cssManager}>
        <Col span={14}>
          <BoardWrapper>
            <MiddleBoard
              cssManager={cssManager}
              playersInfo={{ black: game?.black, white: game?.white }}
              switchSides={switchSides}
              capture={capture}
              board={board}
              onDrop={onDrop}
              onDrawObject={onDrawObject}
              onRemoveCircle={onRemoveCircle}
              top={this.getTop()}
              width={width}
              height={height}
              game={game}
            />
          </BoardWrapper>
        </Col>
        <Col span={10}>
          <PlayRightSidebar
            game={game}
            onChooseFriend={onChooseFriend}
            onBotPlay={onBotPlay}
            onSeekPlay={onSeekPlay}
            cssManager={cssManager}
            flip={this._flipboard}
            moveList={game || {}}
          />
        </Col>
      </AppWrapper>
    );
  }
}
