import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { get } from "lodash";

import { Logger } from "../../../../../../../lib/client/Logger";
import { buildPgnFromMovelist } from "../../../../../../../lib/exportpgn";
import { gameStatusPlaying } from "../../../../../../constants/gameConstants";
import { Switch } from "antd";
import { translate } from "../../../../../HOCs/translate";

const log = new Logger("client/MoveList_js");

class MoveList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      cmi: 0,
      isTable: true,
    };
  }

  componentWillReceiveProps(nextProps) {
    const { game } = this.props;

    const prevCmi = get(game, "variations.cmi");
    const cmi = get(nextProps, "game.variations.cmi");

    if (cmi && prevCmi !== cmi) {
      this.setState({ cmi });
    }
  }

  handleClick = (cmi, game_id) => {
    const { game, moveToCMI } = this.props;
    if (game?.status === gameStatusPlaying) {
      moveToCMI(cmi);
      return;
    }

    Meteor.call("moveToCMI", "moveToCMI", game_id, cmi, (err) => {
      if (err) {
        log.error(err);
      }
    });
  };

  render() {
    const { translate, game, cssManager } = this.props;
    const { isTable } = this.state;

    const switchClick = () => {
      this.setState((state) => ({
        isTable: !state.isTable,
      }));
    };

    if (!!game) {
      this.message_identifier = "server:game:" + this.gameId;
      this.gameId = game._id;
    }

    let moveListString = "";
    if (game?.variations?.movelist?.length) {
      moveListString = buildPgnFromMovelist(
        game.variations.movelist,
        isTable ? "table" : "string",
        game._id,
        game.variations.cmi,
        cssManager,
        this.handleClick
      );
    }

    return (
      <div style={{ background: "#EFF0F3", overflow: "auto", height: "100%" }}>
        <div style={{ width: "100%", textAlign: "right" }}>
          <Switch
            checkedChildren={translate("switchTable")}
            unCheckedChildren={translate("switchString")}
            checked={isTable}
            onClick={switchClick}
          />
        </div>
        <div style={{ ...cssManager.gameMoveList() }}>{moveListString}</div>
      </div>
    );
  }
}

export default translate("Common.MoveList")(MoveList);
