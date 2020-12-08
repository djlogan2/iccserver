import React from "react";
import { Modal } from "antd";
import { withRouter } from "react-router";
import { Meteor } from "meteor/meteor";
import i18n from "meteor/universe:i18n";
import { Table } from "antd";

const GameListModal = ({ gameList, isImported, history, onClose, ...rest }) => {
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

  const getResultOfGameItem = gameItem => {
    const isUserWhite = gameItem.white.id === Meteor.userId();
    const isUserBlack = gameItem.black.id === Meteor.userId();

    switch (gameItem.result) {
      case "0-1":
        return isUserBlack ? translate("resultWon") : translate("resultLost");
      case "1-0":
        return isUserWhite ? translate("resultWon") : translate("resultLost");
      case "1/2-1/2":
        return translate("resultDrawn");
      default:
        return translate("resultUnknown");
    }
  };

  const formatGameList = games => {
    return games.map(gameItem => ({
      id: gameItem._id,
      name: "3 minut arina",
      white: gameItem.white.name.replace(/"/g, ""),
      black: gameItem.black.name.replace(/"/g, ""),
      time: null, //time,
      date: gameItem.startTime,
      is_imported: games.is_imported,
      result: getResultOfGameItem(gameItem)
    }));
  };

  const formattedGameList = formatGameList(gameList).sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });

  const style = {
    background: "#ffffff"
  };

  return (
    <Modal title={translate("myGames")} width={1000} onCancel={onClose} footer={null} {...rest}>
      <div style={style}>
        {formattedGameList.length ? (
          <div style={{ overflowY: "auto", width: "100%", display: "block" }}>
            <Table
              className="gamehistory"
              style={{
                width: "100%",
                textAlign: "center",
                border: "1px solid #f1f1f1"
              }}
              dataSource={formattedGameList}
              pagination={{ position: ["none", "bottomRight"] }}
              onRow={row => ({
                onClick: () => {
                  handleSetExaminMode(row.id);
                  onClose();
                }
              })}
            >
              <Table.Column
                title={translate("players")}
                key="players"
                render={(text, record) =>
                  translate("playersColumn", {
                    white: record.white,
                    black: record.black
                  })
                }
              />
              <Table.Column title={translate("result")} dataIndex="result" key="result" />
              <Table.Column title={translate("date")} dataIndex="time" key="time" />
              <Table.Column
                title={translate("pgn")}
                dataIndex="pgn"
                key="pgn"
                render={(text, record) => (
                  <a href={"export/pgn/history/" + record.id} className="pgnbtn">
                    <img
                      src="images/pgnicon.png"
                      style={{ width: "25px", height: "25px" }}
                      alt="PgnDownload"
                    />
                  </a>
                )}
              />
            </Table>
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
