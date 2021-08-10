import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { get } from "lodash";

import { Logger } from "../../../../../../../lib/client/Logger";
import { buildPgnFromMovelist } from "../../../../../../../lib/exportpgn";

const log = new Logger("client/MoveList_js");

export default class MoveList extends Component {
  constructor(props) {
    super(props);

    this.cmi = 0;
    this.moveListRow = [];

    this.state = {
      cmi: 0,
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

  handleClick = (cmi) => {
    const { game } = this.props;

    Meteor.call("moveToCMI", "moveToCMI", game._id, cmi, (err) => {
      if (err) {
        log.error(err);
      }
    });
  };

  render() {
    const { game, cssManager } = this.props;

    if (!!game) {
      this.message_identifier = "server:game:" + this.gameId;
      this.gameId = game._id;
    }

    let moveListString = "";
    if (game?.variations?.movelist?.length) {
      moveListString = buildPgnFromMovelist(
        game.variations.movelist,
        true,
        game._id,
        game.variations.cmi
      );
    }

    const btnstyle = cssManager.buttonStyle();
    Object.assign(btnstyle, {
      background: "#f1f1f1",
      borderRadius: "5px",
      margin: "5px",
      padding: "6px 25px",
    });

    return (
      <div style={{ background: "#EFF0F3" }}>
        <div style={cssManager.gameMoveList()}>{moveListString}</div>
      </div>
    );
  }
}