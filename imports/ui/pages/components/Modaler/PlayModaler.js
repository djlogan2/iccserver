import React, { Component } from "react";
import { Modal, Button } from "antd";

export default class PlayModaler extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isModal: false,
      status: "",
      hasWon: false,
      opponentName: props.opponentName,
      userColor: props.userColor
    };
  }

  componentDidUpdate(prevProps) {
    let {
      isWhiteCheckmated,
      isBlackCheckmated,
      isWhiteStalemated,
      isBlackStalemated,
      isWhiteForfeitsOnTime,
      isBlackForfeitsOnTime,
      isWhiteResigns,
      isBlackResigns,
      isGameDrawnByMutualAgreemnent,
      isWhiteRunOfTimeAndNoMaterial,
      isBlackRunOfTimeAndNoMaterial,
      isWhiteDisconnected,
      isBlackDisconnected,
      userColor
    } = this.props;
    if (prevProps.isWhiteCheckmated !== isWhiteCheckmated && isWhiteCheckmated) {
      this.setState({
        isModal: true,
        status: "White Checkmated",
        numStatus: "0-1",
        hasWon: userColor === "black"
      });
    }
    if (prevProps.isBlackCheckmated !== isBlackCheckmated && isBlackCheckmated) {
      this.setState({
        isModal: true,
        status: "Black Checkmated",
        numStatus: "1-0",
        hasWon: userColor === "white"
      });
    }
    if (prevProps.isWhiteStalemated !== isWhiteStalemated && isWhiteStalemated) {
      this.setState({
        isModal: true,
        status: "White Stalemated",
        numStatus: "1/2 - 1/2",
        hasWon: false
      });
    }
    if (prevProps.isBlackStalemated !== isBlackStalemated && isBlackStalemated) {
      this.setState({
        isModal: true,
        status: "Black Stalemated",
        numStatus: "1/2 - 1/2",
        hasWon: false
      });
    }

    if (prevProps.isWhiteForfeitsOnTime !== isWhiteForfeitsOnTime && isWhiteForfeitsOnTime) {
      this.setState({
        isModal: true,
        status: "White forfeits on time",
        numStatus: "0-1",
        hasWon: userColor === "black"
      });
    }
    if (prevProps.isBlackForfeitsOnTime !== isBlackForfeitsOnTime && isBlackForfeitsOnTime) {
      this.setState({
        isModal: true,
        status: "Black forfeits on time",
        numStatus: "1-0",
        hasWon: userColor === "white"
      });
    }
    if (prevProps.isWhiteResigns !== isWhiteResigns && isWhiteResigns) {
      this.setState({
        isModal: true,
        status: "White resigns",
        numStatus: "0-1",
        hasWon: userColor === "black"
      });
    }
    if (prevProps.isBlackResigns !== isBlackResigns && isBlackResigns) {
      this.setState({
        isModal: true,
        status: "Black resigns",
        numStatus: "1-0",
        hasWon: userColor === "white"
      });
    }
    if (
      prevProps.isGameDrawnByMutualAgreemnent !== isGameDrawnByMutualAgreemnent &&
      isGameDrawnByMutualAgreemnent
    ) {
      this.setState({
        isModal: true,
        status: "Game drawn by mutual agreement",
        numStatus: "1/2 - 1/2",
        hasWon: false
      });
    }
    if (
      prevProps.isWhiteRunOfTimeAndNoMaterial !== isWhiteRunOfTimeAndNoMaterial &&
      isWhiteRunOfTimeAndNoMaterial
    ) {
      this.setState({
        isModal: true,
        status: "White ran out of time and Black has no material to mate",
        numStatus: "1/2 - 1/2",
        hasWon: false
      });
    }
    if (
      prevProps.isBlackRunOfTimeAndNoMaterial !== isBlackRunOfTimeAndNoMaterial &&
      isBlackRunOfTimeAndNoMaterial
    ) {
      this.setState({
        isModal: true,
        status: "Black ran out of time and White has no material to mate",
        numStatus: "1/2 - 1/2",
        hasWon: false
      });
    }
    if (prevProps.isWhiteDisconnected !== isWhiteDisconnected && isWhiteDisconnected) {
      this.setState({
        isModal: true,
        status: "White disconnected and forfeits",
        numStatus: "0-1",
        hasWon: userColor === "black"
      });
    }
    if (prevProps.isBlackDisconnected !== isBlackDisconnected && isBlackDisconnected) {
      this.setState({
        isModal: true,
        status: "Black disconnected and forfeits",
        numStatus: "1-0",
        hasWon: userColor === "white"
      });
    }

    if (
      this.props.opponentName !== undefined &&
      this.props.opponentName !== prevProps.opponentName
    ) {
      this.setState({
        opponentName: this.props.opponentName,
        userColor: this.props.userColor
      });
    }
  }

  getTitleText = () => {
    let { status, userColor, hasWon, numStatus } = this.state;
    let titleText = status;
    if (hasWon) {
      titleText = `${userColor.toUpperCase()} won! Congratulations!`;
    } else {
      if (numStatus === "1/2 - 1/2") {
        titleText = `Drawn!`;
      } else {
        titleText = `${userColor.charAt(0).toUpperCase() + userColor.slice(1)} won!`;
      }
    }
    return titleText;
  };

  getStatusText = () => {
    let { status } = this.state;
    let statusText = status;
    if (status === "White Stalemated" || status === "Black Stalemated") {
      statusText = "stalemate";
    }
    return statusText;
  };

  getNumberStatus = () => {
    let { numStatus } = this.state;
    return numStatus;
  };

  handleCancel = () => {
    this.setState({
      isModal: false,
      status: "",
      hasWon: false,
      numStatus: ""
    });
  };

  render() {
    const {
      userName,
      isWhiteCheckmated,
      isBlackCheckmated,
      isWhiteStalemated,
      isBlackStalemated
    } = this.props;

    const { isModal, status, hasWon, opponentName, userColor } = this.state;
    if (!isModal) {
      return null;
    }

    let titleText = this.getTitleText();
    let statusText = this.getStatusText();
    let numberStatus = this.getNumberStatus();

    return (
      <Modal
        title={titleText}
        visible={isModal}
        onOk={this.handleCancel}
        onCancel={this.handleCancel}
        footer={null}
      >
        <div className="play-modal">
          <div className="play-modal__main">
            <div className="play-modal__user-one">
              <img className="play-modal__user-img" src="images/player-img-top.png" alt="user" />
              <p className="play-modal__user-name">{userName}</p>
            </div>
            <div className="play-modal__main-center">
              <span className="play-modal__game-short-status">{numberStatus}</span>
              <p className="play-modal__game-status">{statusText.toUpperCase()}</p>
            </div>
            <div className="play-modal__user-two">
              <img className="play-modal__user-img" src="images/player-img-top.png" alt="user" />
              <p className="play-modal__user-name">{opponentName}</p>
            </div>
          </div>
          <div className="play-modal__btn-block">
            <Button
              type="primary"
              onClick={() => {
                this.props.onRematch(this.props.opponentId);
                this.handleCancel();
              }}
              className="play-modal__btn play-modal__btn--primary"
            >
              Rematch
            </Button>
            <Button
              onClick={() => {
                this.props.onExamine(this.props.gameId);
                this.handleCancel();
              }}
              className="play-modal__btn"
            >
              Examine
            </Button>
          </div>
        </div>
      </Modal>
    );
  }
}
