import React, { Component } from "react";
import { Modal, Button } from "antd";

export default class PlayModaler extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isModal: false,
      status: null,
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
      userColor
    } = this.props;
    if (prevProps.isWhiteCheckmated !== isWhiteCheckmated && isWhiteCheckmated) {
      this.setState({
        isModal: true,
        status: "White Checkmated",
        hasWon: userColor === "white"
      });
    }
    if (prevProps.isBlackCheckmated !== isBlackCheckmated && isBlackCheckmated) {
      this.setState({
        isModal: true,
        status: "Black Checkmated",
        hasWon: userColor === "black"
      });
    }
    if (prevProps.isWhiteStalemated !== isWhiteStalemated && isWhiteStalemated) {
      this.setState({
        isModal: true,
        status: "White Stalemated",
        hasWon: false
      });
    }
    if (prevProps.isBlackStalemated !== isBlackStalemated && isBlackStalemated) {
      this.setState({
        isModal: true,
        status: "Black Stalemated",
        hasWon: false
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
    let { status, userColor, hasWon } = this.state;
    let titleText = status;
    if (hasWon) {
      titleText = `${userColor.toUpperCase()} won! Congratulations!`;
    }
    return titleText;
  };

  getStatusText = () => {
    let { status } = this.state;
    let statusText = "checkmate";
    if (status === "White Stalemated" || status === "Black Stalemated") {
      statusText = "stalemate";
    }
    return statusText;
  };

  handleCancel = () => {
    this.setState({
      isModal: false,
      status: null,
      hasWon: false
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

    return (
      <Modal
        title={titleText}
        visible={isModal}
        onOk={this.handleCancel}
        onCancel={this.handleCancel}
      >
        <div className="play-modal">
          <div className="play-modal__main">
            <div className="play-modal__user-one">
              <p className="play-modal__user-name">{userName}</p>
            </div>
            <div className="play-modal__user-two">
              <p className="play-modal__game-status">{statusText.toUpperCase()}</p>
            </div>
            <div className="play-modal__user-two">
              <p className="play-modal__user-name">{opponentName}</p>
            </div>
          </div>
          <div className="play-modal__btn-block">
            <Button
              onClick={() => {
                this.props.onRematch(userName);
              }}
              className="play-modal__btn"
            >
              Rematch
            </Button>
          </div>
        </div>
      </Modal>
    );
  }
}
