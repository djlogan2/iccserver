import React, { Component } from "react";
import { Modal } from "antd";
import { withRouter } from "react-router";
import MenuLinks from "./MenuLinks";
import { Meteor } from "meteor/meteor";

import {
  ClientMessagesCollection,
  Game,
  ImportedGameCollection,
  GameHistoryCollection,
  GameRequestCollection,
  mongoCss,
  mongoUser
} from "../../../../api/client/collections";

const MyGameModal = ({gameList, ...rest}) => {


  const handleSetExaminMode = (id, is_imported) => {
    Meteor.call("examineGame", "ExaminedGame", id, false, (error, response) => {
      if (error) {
        log.debug(error);
        console.log(error);
        this.setState({ modalShow: false });
      } else {
        this.setState({ examineGame: true, activeTab: 3, modalShow: false });
      }
    });

    // this.props.removeGameHistory();
  }

  const formatGameList = (games) => {
    // let result;
    // let gameList = [];


    return games.map((gameItem) => {
      let isUserWhite = gameItem.white.id === Meteor.userId();
      let hasWhiteWon = gameItem.result === "1-0";
      let isUserBlack = gameItem.black.id === Meteor.userId();
      let hasBlackWon = gameItem.result === "0-1";

      let isCurrentUserWinner = (isUserWhite && hasWhiteWon) || (isUserBlack && hasBlackWon);
      let gameResult = isCurrentUserWinner ? "Won" : "Loss";

      time = `${gameItem.startTime.getDate()}.${gameItem.startTime.getFullYear()}`;

      return {
        id: gameItem._id,
        name: "3 minut arina",
        white: gameItem.white.name.replace(/"/g, ""),
        black: gameItem.black.name.replace(/"/g, ""),
        result: gameResult,
        time: time,
        is_imported: games.is_imported
      }
    });
    // if (!!games && games.length > 0) {
    //   for (let i = 0; i < games.length; i++) {

    //     let time = "Fix me"; // TODO: This line is crashing (!!games[i].startTime)?games[i].startTime.toDateString():(games[i].tags.Time).replace(/"/g, '')

    //     // console.log();
    //     gameList.push({
    //       id: games[i]._id,
    //       name: "3 minut arina",
    //       white: games[i].white.name.replace(/"/g, ""),
    //       black: games[i].black.name.replace(/"/g, ""),
    //       result: result,
    //       time: time,
    //       is_imported: games.is_imported
    //     });
    //   }
    // }
    // return gameList;
  }

  const formattedGameList = formatGameList(gameList);

  let style = {
    background: "#ffffff"
  };


  return (
    <Modal
      title="My Games"
      // visible={this.state.visible}
      visable={true}
      // onOk={this.handleOk}
      onCancel={rest.onClose}
      footer={null}
      {...rest}
    >
      <div style={style}>
        {formattedGameList.length > 0 ? (
          <div style={{ maxHeight: "350px", overflowY: "auto", width: "100%", display: "block" }}>
            <table
              className="gamehistory"
              style={{ width: "100%", textAlign: "center", border: "1px solid #f1f1f1" }}
            >
              <thead>
                <tr>
                  <th style={{ textAlign: "center", background: "#f1f1f1", padding: "5px 5px" }}>
                    Players
                  </th>
                  <th style={{ textAlign: "center", background: "#f1f1f1", padding: "5px 5px" }}>
                    Result
                  </th>
                  <th style={{ textAlign: "center", background: "#f1f1f1", padding: "5px 5px" }}>
                    Date
                  </th>
                  <th style={{ textAlign: "center", background: "#f1f1f1", padding: "5px 5px" }}>
                    PGN
                  </th>
                </tr>
              </thead>
              <tbody>
                {formattedGameList.map((game, index) => (
                  <tr key={index} style={{ cursor: "pointer" }}>
                    <td
                      style={{ padding: "5px 5px" }}
                      onClick={() => { handleSetExaminMode(game.id, game.is_imported)}}
                    >
                      {game.white}-vs-{game.black}
                    </td>
                    <td style={{ padding: "5px 5px" }}>{game.result}</td>
                    <td style={{ padding: "5px 5px" }}>{game.time}</td>
                    <td style={{ padding: "5px 5px" }}>
                      <a href={"export/pgn/history/" + game.id} className="pgnbtn">
                        <img
                          // src={this.props.cssManager.buttonBackgroundImage("pgnIcon")}
                          src="images/pgnicon.png"
                          style={{ width: "25px", height: "25px" }}
                          alt="PgnDownload"
                        />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ maxHeight: "350px", overflowY: "auto", width: "350px" }}>No Data Found</div>
        )}
      </div>
    </Modal>
  );
};

class LeftSidebar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      gameList: [],
      isMyGamesModal: false
    };
    this.toggleMenu = this.toggleMenu.bind(this);
  }

  toggleMenu() {
    this.setState({ visible: !this.state.visible });
  }

  handleCommunity = () => {
    // this.props.gameHistory("mygame");
    // const data = this.context;
    // data.toggleModal(true);
    this.props.history.push("/community");
  };

  handleUploadpgn = () => {
    // this.props.gameHistory("uploadpgn");
    // const data = this.context;
    // data.toggleModal(true);
    this.props.history.push("/upload-pgn");
  };

  handlePlay = () => {
    // this.props.examineAction("play");
    this.props.history.push("/play");
  };

  handleMyGames = () => {
    let gameList = this.loadGameList();

    this.setState({
      isMyGamesModal: true,
      gameList: gameList
    });
  };

  loadGameList(data) {
    // if (data === "mygame") {
    const gameList = GameHistoryCollection.find({
      $or: [{ "white.id": Meteor.userId() }, { "black.id": Meteor.userId() }]
    }).fetch();
    return gameList;
    // } else if (data === "uploadpgn") {
    //   const importedGame = ImportedGameCollection.find({}).fetch();
    //   importedGame.is_imported = true;
    //   this.setState({ GameHistory: importedGame });
    // }
  }



  handleExamine = () => {
    this.props.history.push("/examine");
    // Meteor.call(
    //   "startLocalExaminedGame",
    //   "startlocalExaminedGame",
    //   "Mr white",
    //   "Mr black",
    //   0,
    //   (error, response) => {
    //     if (response) {
    //       this.props.history.push('/examine');
    //       // this.props.examineAction(action);
    //     }
    //   }
    // );
  };

  handleLogout = () => {
    Meteor.logout(err => {
      if (err) {
      } else {
        window.location.href = "/login";
      }
    });
  };

  handleMyGamesClose = () => {
    this.setState({isMyGamesModal: false})
  }

  render() {
    return (
      <div
        className={
          this.state.visible ? "sidebar left device-menu fliph" : "sidebar left device-menu"
        }
      >
        <MyGameModal visible={this.state.isMyGamesModal} gameList={this.state.gameList} onClose={this.handleMyGamesClose} />
        <div className="sidebar__logo" />
        <button className="sidebar__burger-btn" onClick={this.toggleMenu} />


        <MenuLinks
          onCommunity={this.handleCommunity}
          onUploadpgn={this.handleUploadpgn}
          onPlay={this.handlePlay}
          onExamine={this.handleExamine}
          onLogout={this.handleLogout}
          onMyGames={this.handleMyGames}
          history={this.props.history}
          gameHistory={this.props.gameHistory}
          examineAction={this.props.examineAction}
        />
      </div>
    );
  }
}
export default withRouter(LeftSidebar);
