import React, { Component } from "react";
import MoveList from "../MoveList/MoveList";
import { get } from "lodash";
import { gameStatusPlaying } from "../../../../../../constants/gameConstants";
import { translate } from "../../../../../HOCs/translate";

class GameHistory extends Component {
  isTimeControllDifferent = () => {
    const { game } = this.props;
    const whiteClock = get(game, "clocks.white");
    const blackClock = get(game, "clocks.black");

    return !(
      whiteClock &&
      blackClock &&
      whiteClock.initial === blackClock.initial &&
      whiteClock.inc_or_delay === blackClock.inc_or_delay &&
      whiteClock.delaytype === blackClock.delaytype
    );
  };

  render() {
    const { cssManager, game, gameRequest, moveToCMI, translate } = this.props;

    const isDifferent = this.isTimeControllDifferent();
    let ecospan;
    if (game?.variations?.movelist?.[game.variations.cmi]?.eco) {
      const eco = game.variations.movelist[game.variations.cmi].eco;
      ecospan =
        eco?.name === "NO_ECO" ? (
          ""
        ) : (
          <span>
            {eco.name};{eco.code};
          </span>
        );
    }

    return (
      <div style={{ flex: 1, overflow: "auto" }}>
        {game?.status === gameStatusPlaying && (
          <span>
            {isDifferent &&
              translate("white_time_control", {
                initial: get(game, "clocks.white.initial"),
                inc_or_delay: get(game, "clocks.white.inc_or_delay"),
                delay_type: get(game, "clocks.white.delaytype"),
              })}
            {isDifferent &&
              translate("black_time_control", {
                initial: get(game, "clocks.black.initial"),
                inc_or_delay: get(game, "clocks.black.inc_or_delay"),
                delay_type: get(game, "clocks.black.delaytype"),
              })}
            {!isDifferent &&
              translate("time_control", {
                initial: get(game, "clocks.white.initial"),
                inc_or_delay: get(game, "clocks.white.inc_or_delay"),
                delay_type: get(game, "clocks.white.delaytype"),
              })}
            {translate("game_type", { game_type: game?.rating_type })}
            {translate(game?.rated ? "rated" : "unrated")}
            {ecospan}
          </span>
        )}
        <MoveList
          cssManager={cssManager}
          game={game}
          gameRequest={gameRequest}
          moveToCMI={moveToCMI}
        />
      </div>
    );
  }
}

export default translate("Common.move_list")(GameHistory);
