import React from "react";
import { Modal } from "antd";
import { withRouter } from "react-router";
import { Meteor } from "meteor/meteor";
import i18n from "meteor/universe:i18n";

const GameListModal = ({ gameList, isImported, history, ...rest }) => {
  const getLang = () => {
    return (
      (navigator.languages && navigator.languages[0]) ||
      navigator.language ||
      navigator.browserLanguage ||
      navigator.userLanguage ||
      "en-US"
    );
  };

  const translate = i18n.createTranslator("Common.gameListModal", getLang());

  const handleSetExaminMode = id => {
    Meteor.call("examineGame", "ExaminedGame", id, isImported);
  };

  const formatGameList = games => {
    return games.map(gameItem => {
      let result;

      let isUserWhite = gameItem.white.id === Meteor.userId();
      let isUserBlack = gameItem.black.id === Meteor.userId();

      switch (gameItem.result) {
        case "0-1":
          result = isUserBlack ? translate("resultWon") : translate("resultLost");
          break;
        case "1-0":
          result = isUserWhite ? translate("resultWon") : translate("resultLost");
          break;
        case "1/2-1/2":
          result = translate("resultDrawn");
          break;
        default:
          result = translate("resultUnknown");
          break;
      }

      return {
        id: gameItem._id,
        name: "3 minut arina",
        white: gameItem.white.name.replace(/"/g, ""),
        black: gameItem.black.name.replace(/"/g, ""),
        result: result,
        time: null, //time,
        date: gameItem.startTime,
        is_imported: games.is_imported
      };
    });
  };

  const formattedGameList = formatGameList(gameList).sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });

  const style = {
    background: "#ffffff"
  };

  return (
    <Modal
      title={translate("myGames")}
      visable={true}
      onCancel={rest.onClose}
      footer={null}
      {...rest}
    >
      <div style={style}>
        {formattedGameList.length ? (
          <div style={{ maxHeight: "350px", overflowY: "auto", width: "100%", display: "block" }}>
            <table
              className="gamehistory"
              style={{ width: "100%", textAlign: "center", border: "1px solid #f1f1f1" }}
            >
              <thead>
                <tr>
                  <th style={{ textAlign: "center", background: "#f1f1f1", padding: "5px 5px" }}>
                    {translate("players")}
                  </th>
                  <th style={{ textAlign: "center", background: "#f1f1f1", padding: "5px 5px" }}>
                    {translate("result")}
                  </th>
                  <th style={{ textAlign: "center", background: "#f1f1f1", padding: "5px 5px" }}>
                    {translate("date")}
                  </th>
                  <th style={{ textAlign: "center", background: "#f1f1f1", padding: "5px 5px" }}>
                    {translate("pgn")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {formattedGameList.map((game, index) => (
                  <tr key={index} style={{ cursor: "pointer" }}>
                    <td
                      style={{ padding: "5px 5px" }}
                      onClick={() => {
                        handleSetExaminMode(game.id);
                        rest.onClose();
                      }}
                    >
                      {game.white}-vs-{game.black}
                    </td>
                    <td style={{ padding: "5px 5px" }}>{game.result}</td>
                    <td style={{ padding: "5px 5px" }}>{game.time}</td>

                    <td style={{ padding: "5px 5px" }}>
                      <a href={"export/pgn/history/" + game.id} className="pgnbtn">
                        <img
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
          <div style={{ maxHeight: "350px", overflowY: "auto", width: "350px" }}>
            {translate("noDataFound")}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default withRouter(GameListModal);
