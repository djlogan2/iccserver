import { Modal, Table } from "antd";
import date from "date-and-time";
import { get } from "lodash";
import { Meteor } from "meteor/meteor";
import React from "react";
import { withRouter } from "react-router-dom";
import { compose } from "redux";
import { RESOURCE_EXAMINE } from "../../../../constants/resourceConstants";
import { MY_GAMES_MODAL_OPENED } from "../../../../constants/systemConstants";
import { translate } from "../../../HOCs/translate";
import { withDynamicStyles } from "../../../HOCs/withDynamicStyles";
import ExportPgnButton from "../Button/ExportPgnButton";
import "./GameListModal.css";
import { withTracker } from "meteor/react-meteor-data";
import { mongoCss } from "../../../../../imports/api/client/collections";

const GameListModal = ({
  gameList,
  isImported,
  history,
  onClose,
  classes,
  translate,
  visible,
  allowDownload,
}) => {
  const handleSetExaminMode = (id) => {
    Meteor.call("examineGame", "ExaminedGame", id, isImported);

    const pathName = get(history, "location.pathname");

    localStorage.setItem(MY_GAMES_MODAL_OPENED, true);
    if (pathName !== RESOURCE_EXAMINE) {
      history.push(RESOURCE_EXAMINE);
    }
  };

  const getResultOfGameItem = (gameItem) => {
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

  const formatGameList = (games) => {
    return games.map((gameItem) => ({
      id: gameItem._id,
      key: gameItem._id,
      white: gameItem.white.name.replace(/"/g, ""),
      black: gameItem.black.name.replace(/"/g, ""),
      time: null, //time,
      date: gameItem?.startTime ? date.format(gameItem.startTime, "YYYY-MM-DD HH:mm:ss") : "",
      is_imported: games.is_imported,
      result: getResultOfGameItem(gameItem),
    }));
  };

  const formattedGameList = formatGameList(gameList).sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });

  return (
    <Modal
      title={translate("myGames")}
      width={1000}
      onCancel={onClose}
      footer={null}
      visible={visible}
    >
      <div className={classes.backgroundDiv}>
        {formattedGameList.length ? (
          <div className={classes.tableDiv}>
            <Table
              className={classes.table}
              dataSource={formattedGameList}
              pagination={{ position: ["none", "bottomRight"] }}
              onRow={(row) => ({
                onClick: (event) => {
                  if (event.target.tagName === "IMG") return;

                  handleSetExaminMode(row.id);
                  onClose();
                },
              })}
            >
              <Table.Column
                title={translate("players")}
                key="players"
                render={(text, record) =>
                  translate("playersColumn", {
                    white: record.white,
                    black: record.black,
                  })
                }
              />
              <Table.Column title={translate("result")} dataIndex="result" key="result" />
              {!isImported && (
                <Table.Column title={translate("date")} dataIndex="date" key="time" />
              )}
              {allowDownload && (
                <Table.Column
                  title={translate("pgn")}
                  dataIndex="pgn"
                  key="pgn"
                  render={(text, record) => (
                    <ExportPgnButton id={record.id} src={"images/pgnicon.png"} />
                  )}
                />
              )}
            </Table>
          </div>
        ) : (
          <div className={classes.noDataDiv}>{translate("noDataFound")}</div>
        )}
      </div>
    </Modal>
  );
};

export default compose(
  withRouter,
  withTracker(() => {
    return {
      css: mongoCss.findOne(),
    };
  }),
  withDynamicStyles("css.gameListModalCss"),
  translate("Common.gameListModal")
)(GameListModal);
