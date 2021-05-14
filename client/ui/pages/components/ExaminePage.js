import React, { Component } from "react";
import _ from "lodash";
import PropTypes from "prop-types";
import AppWrapper from "./AppWrapper/AppWrapper";
import ExamineRightSidebar from "./RightSidebar/ExamineRightSidebar";
import "../../../../imports/css/ChessBoard";
import "../../../../imports/css/leftsidebar";
import "../../../../imports/css/RightSidebar";

import { Col } from "antd";

import MiddleBoard from "../MiddleSection/MiddleBoard";
import BoardWrapper from "./BoardWrapper";
import { colorBlackLetter, colorWhiteLetter } from "../../../constants/gameConstants";

export default class ExaminePage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      width: window.innerWidth,
      height: window.innerHeight,
      switchSides: Date.now(),
    };

    this.delayedUpdateDimensions = _.debounce(this.updateDimensions, 100);
  }

  componentDidMount() {
    this.updateDimensions();
    window.addEventListener("resize", this.delayedUpdateDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.delayedUpdateDimensions);
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
      allUsers,
      observeUser,
      unObserveUser,
      gameRequest,
      onPgnUpload,
      onImportedGames,
    } = this.props;
    const { width, height, switchSides } = this.state;

    return (
      <AppWrapper cssManager={cssManager}>
        <Col span={14}>
          <BoardWrapper>
            <MiddleBoard
              cssManager={cssManager}
              capture={capture}
              board={board}
              onDrop={onDrop}
              onDrawObject={onDrawObject}
              width={width}
              height={height}
              game={game}
              switchSides={switchSides}
              top={this.getTop()}
              playersInfo={{ black: game?.black, white: game?.white }}
            />
          </BoardWrapper>
        </Col>
        <Col span={10}>
          <ExamineRightSidebar
            game={game}
            allUsers={allUsers}
            observeUser={observeUser}
            unObserveUser={unObserveUser}
            cssManager={cssManager}
            onPgnUpload={onPgnUpload}
            gameRequest={gameRequest}
            onImportedGames={onImportedGames}
            moveList={game}
            flip={this._flipboard}
          />
        </Col>
      </AppWrapper>
    );
  }
}

ExaminePage.propTypes = {
  username: PropTypes.string,
};
