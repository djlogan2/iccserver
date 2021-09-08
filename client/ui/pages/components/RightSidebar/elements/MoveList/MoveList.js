import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { get } from "lodash";

import { Logger } from "../../../../../../../lib/client/Logger";
import { buildPgnFromMovelist } from "../../../../../../../lib/exportpgn";
import { gameStatusPlaying } from "../../../../../../constants/gameConstants";

const log = new Logger("client/MoveList_js");

export default class MoveList extends Component {
  constructor(props) {
    super(props);

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
    const { game, moveToCMI } = this.props;

    console.log(132);
    if (game?.status === gameStatusPlaying) {
      moveToCMI(cmi);

      console.log(43432);
      return;
    }

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
        game.variations.cmi,
        cssManager
      );
    }

    return (
      <div style={{ background: "#EFF0F3", overflow: "auto", height: "100%" }}>
        <div style={{ ...cssManager.gameMoveList() }}>{moveListString}</div>
      </div>
    );
  }
}
