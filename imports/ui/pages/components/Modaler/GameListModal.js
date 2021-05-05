import React from "react";
import { Modal } from "antd";
import { withRouter } from "react-router";
import { Meteor } from "meteor/meteor";
import { Table } from "antd";
import injectSheet from "react-jss";
import { compose } from "redux";
import { translate } from "../../../HOCs/translate";
import ExportPgnButton from "../Button/ExportPgnButton";
import { get } from "lodash";

import "./GameListModal.css";
import { RESOURCE_EXAMINE } from "../../../../constants/resourceConstants";

const styles = {
  table: {
    width: "100%",
    textAlign: "center",
    border: "1px solid #f1f1f1",
  },
  backgroundDiv: {
    background: "#ffffff",
  },
  tableDiv: {
    overflowY: "auto",
    width: "100%",
    display: "block",
  },
  noDataDiv: {
    maxHeight: "350px",
    overflowY: "auto",
    width: "350px",
  },
};

const GameListModal = ({ gameList, isImported, history, onClose, classes, translate, visible }) => {
  const handleSetExaminMode = (id) => {
    Meteor.call("examineGame", "ExaminedGame", id, isImported);

    const pathName = get(history, "location.pathname");

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
      date: gameItem.startTime,
      is_imported: games.is_imported,
      result: getResultOfGameItem(gameItem),
    }));
  };

  const formattedGameList = formatGameList(gameList).sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });

  return visible ? ( //TODO strange issue, need some actions to resolve
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
                onClick: () => {
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
              <Table.Column title={translate("date")} dataIndex="time" key="time" />
              <Table.Column
                title={translate("pgn")}
                dataIndex="pgn"
                key="pgn"
                render={(text, record) => (
                  <ExportPgnButton id={record.id} src={"images/pgnicon.png"} />
                )}
              />
            </Table>
          </div>
        ) : (
          <div className={classes.noDataDiv}>{translate("noDataFound")}</div>
        )}
      </div>
    </Modal>
  ) : null;
};

export default compose(
  withRouter,
  injectSheet(styles),
  translate("Common.gameListModal")
)(GameListModal);
