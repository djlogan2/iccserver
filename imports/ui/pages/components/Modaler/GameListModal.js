import { Modal } from "antd";
import moment from "moment";
import { Meteor } from "meteor/meteor";

export default ({ gameList, isImported = false, ...rest }) => {
  const handleSetExaminMode = (id, is_imported) => {
    Meteor.call("examineGame", "ExaminedGame", id, isImported, (error, response) => {
      if (error) {
        this.setState({ modalShow: false });
      } else {
        this.setState({ examineGame: true, activeTab: 3, modalShow: false });
      }
    });

    // this.props.removeGameHistory();
  };

  const formatGameList = games => {
    // let result;
    // let gameList = [];

    return games.map(gameItem => {
      let isUserWhite = gameItem.white.id === Meteor.userId();
      let hasWhiteWon = gameItem.result === "1-0";
      let isUserBlack = gameItem.black.id === Meteor.userId();
      let hasBlackWon = gameItem.result === "0-1";

      let isCurrentUserWinner = (isUserWhite && hasWhiteWon) || (isUserBlack && hasBlackWon);
      let gameResult = isCurrentUserWinner ? "Won" : "Loss";

      // time = `${gameItem.startTime.getDate()}.${gameItem.startTime.getFullYear()}`;
      //time = moment(gameItem.startTime).format("DD.MM.YYYY");

      return {
        id: gameItem._id,
        name: "3 minut arina",
        white: gameItem.white.name.replace(/"/g, ""),
        black: gameItem.black.name.replace(/"/g, ""),
        result: gameResult,
        time: null, //time,
        date: gameItem.startTime,
        is_imported: games.is_imported
      };
    });
  };

  const formattedGameList = formatGameList(gameList).sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });

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
                  {!isImported && (
                    <th style={{ textAlign: "center", background: "#f1f1f1", padding: "5px 5px" }}>
                      PGN
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {formattedGameList.map((game, index) => (
                  <tr key={index} style={{ cursor: "pointer" }}>
                    <td
                      style={{ padding: "5px 5px" }}
                      onClick={() => {
                        handleSetExaminMode(game.id, isImported);
                        rest.onClose();
                      }}
                    >
                      {game.white}-vs-{game.black}
                    </td>
                    <td style={{ padding: "5px 5px" }}>{game.result}</td>
                    <td style={{ padding: "5px 5px" }}>{game.time}</td>

                    {!isImported && (
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
                    )}
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
