import React, { Component } from "react";
import { Modal, Button } from "antd";



// isWhiteCheckmated:
//       ClientMessagesCollection.find({ message: "White checkmated" }).fetch().length > 0,
//     isBlackCheckmated:
//       ClientMessagesCollection.find({ message: "Black checkmated" }).fetch().length > 0,
//     isWhiteStalemated:
//       ClientMessagesCollection.find({ message: "White stalemated" }).fetch().length > 0,
//     isBlackStalemated:
//       ClientMessagesCollection.find({ message: "Black stalemated" }).fetch().length > 0,
//     isWhiteForfeitsOnTime:
//       ClientMessagesCollection.find({ message: "White forfeits on time." }).fetch().length > 0,
//     isBlackForfeitsOnTime:
//       ClientMessagesCollection.find({ message: "Black forfeits on time." }).fetch().length > 0,
//     isWhiteResigns: ClientMessagesCollection.find({ message: "White resigns" }).fetch().length > 0,
//     isBlackResigns: ClientMessagesCollection.find({ message: "Black resigns" }).fetch().length > 0,
//     isGameDrawnByMutualAgreemnent:
//       ClientMessagesCollection.find({ message: "Game drawn by mutual agreement" }).fetch().length >
//       0,
//     isWhiteRunOfTimeAndNoMaterial:
//       ClientMessagesCollection.find({
//         message: "White ran out of time and Black has no material to mate"
//       }).fetch().length > 0,
//     isBlackRunOfTimeAndNoMaterial:
//       ClientMessagesCollection.find({
//         message: "Black ran out of time and White has no material to mate"
//       }).fetch().length > 0,
//     isWhiteDisconnected:
//       ClientMessagesCollection.find({ message: "White disconnected and forfeits" }).fetch().length >
//       0,
//     isBlackDisconnected:
//       ClientMessagesCollection.find({ message: "Black disconnected and forfeits" }).fetch().length >
//       0,

export default class PlayModaler extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isModal: false,
      status: "",
      hasWon: false,
      opponentName: props.opponentName,
      userColor: props.userColor,
      clientMessagesLength:  props.clientMessages.length
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

    let latestMessage = null;

    let clientMessages = this.props.clientMessages.filter(item => {
      return item.message.indexOf("SERVER_ERROR") === -1;
    });

    if (this.state.clientMessagesLength < this.props.clientMessages.length) {
      this.setState({clientMessagesLength:  this.props.clientMessages.length})
    } else {
      return
    }

    if (clientMessages.length > 0) {
      latestMessage = clientMessages[clientMessages.length - 1].message;
    }

    if (
      latestMessage === "White checkmated" &&
      // prevProps.isWhiteCheckmated !== isWhiteCheckmated &&
      isWhiteCheckmated
      && !this.state.isModal
    ) {
      this.setState({
        isModal: true,
        status: "White Checkmated",
        numStatus: "0-1",
        hasWon: userColor === "black"
      });
    }
    if (
      latestMessage === "Black checkmated" &&
      // prevProps.isBlackCheckmated !== isBlackCheckmated &&
      isBlackCheckmated
      && !this.state.isModal
    ) {
      this.setState({
        isModal: true,
        status: "Black Checkmated",
        numStatus: "1-0",
        hasWon: userColor === "white"
      });
    }
    if (
      latestMessage === "White stalemated" &&
      // prevProps.isWhiteStalemated !== isWhiteStalemated &&
      isWhiteStalemated
      && !this.state.isModal
    ) {
      this.setState({
        isModal: true,
        status: "White Stalemated",
        numStatus: "1/2 - 1/2",
        hasWon: false
      });
    }
    if (
      latestMessage === "Black stalemated" &&
      // prevProps.isBlackStalemated !== isBlackStalemated &&
      isBlackStalemated
      && !this.state.isModal
    ) {
      this.setState({
        isModal: true,
        status: "Black Stalemated",
        numStatus: "1/2 - 1/2",
        hasWon: false
      });
    }
    if (
      latestMessage === "White forfeits on time." &&
      // prevProps.isWhiteForfeitsOnTime !== isWhiteForfeitsOnTime &&
      isWhiteForfeitsOnTime
      && !this.state.isModal
    ) {
      this.setState({
        isModal: true,
        status: "White forfeits on time",
        numStatus: "0-1",
        hasWon: userColor === "black"
      });
    }
    if (
      latestMessage === "Black forfeits on time." &&
      // prevProps.isBlackForfeitsOnTime !== isBlackForfeitsOnTime &&
      isBlackForfeitsOnTime
      && !this.state.isModal
    ) {
      this.setState({
        isModal: true,
        status: "Black forfeits on time",
        numStatus: "1-0",
        hasWon: userColor === "white"
      });
    }
    if (
      latestMessage === "White resigns" &&
      // prevProps.isWhiteResigns !== isWhiteResigns &&
      isWhiteResigns
      && !this.state.isModal
    ) {
      this.setState({
        isModal: true,
        status: "White resigns",
        numStatus: "0-1",
        hasWon: userColor === "black"
      });
    }
    if (
      latestMessage === "Black resigns" &&
      // prevProps.isBlackResigns !== isBlackResigns &&
      isBlackResigns
      && !this.state.isModal
    ) {
      this.setState({
        isModal: true,
        status: "Black resigns",
        numStatus: "1-0",
        hasWon: userColor === "white"
      });
    }
    if (
      latestMessage === "Game drawn by mutual agreement" &&
      // prevProps.isGameDrawnByMutualAgreemnent !== isGameDrawnByMutualAgreemnent &&
      isGameDrawnByMutualAgreemnent 
      && !this.state.isModal
    ) {
      this.setState({
        isModal: true,
        status: "Game drawn by mutual agreement",
        numStatus: "1/2 - 1/2",
        hasWon: false
      });
    }
    if (
      latestMessage === "White ran out of time and Black has no material to mate" &&
      // prevProps.isWhiteRunOfTimeAndNoMaterial !== isWhiteRunOfTimeAndNoMaterial &&
      isWhiteRunOfTimeAndNoMaterial
      && !this.state.isModal
    ) {
      this.setState({
        isModal: true,
        status: "White ran out of time and Black has no material to mate",
        numStatus: "1/2 - 1/2",
        hasWon: false
      });
    }
    if (
      latestMessage === "Black ran out of time and White has no material to mate" &&
      // prevProps.isBlackRunOfTimeAndNoMaterial !== isBlackRunOfTimeAndNoMaterial &&
      isBlackRunOfTimeAndNoMaterial
      && !this.state.isModal
    ) {
      this.setState({
        isModal: true,
        status: "Black ran out of time and White has no material to mate",
        numStatus: "1/2 - 1/2",
        hasWon: false
      });
    }
    if (
      latestMessage === "White disconnected and forfeits" &&
      // prevProps.isWhiteDisconnected !== isWhiteDisconnected &&
      isWhiteDisconnected
      && !this.state.isModal
    ) {
      this.setState({
        isModal: true,
        status: "White disconnected and forfeits",
        numStatus: "0-1",
        hasWon: userColor === "black"
      });
    }
    if (
      latestMessage === "Black disconnected and forfeits" &&
      // prevProps.isBlackDisconnected !== isBlackDisconnected &&
      isBlackDisconnected
      && !this.state.isModal
    ) {
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
    let { status, hasWon, numStatus } = this.state;
    let { userColor } = this.props;
    let titleText = status;
    if (hasWon) {
      titleText = `${userColor.toUpperCase()} won! Congratulations!`;
    } else {
      if (numStatus === "1/2 - 1/2") {
        titleText = `Drawn!`;
      } else {
        let otherColor = userColor === "white" ? "black" : "white";
        titleText = `${otherColor.charAt(0).toUpperCase() + otherColor.slice(1)} won!`;
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
                this.props.onRematch(this.props.gameId);
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
