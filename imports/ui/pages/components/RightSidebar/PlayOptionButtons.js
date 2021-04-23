import React, { Component } from "react";
import { Button } from "antd";
import { compose } from "redux";
import { translate } from "../../../HOCs/translate";
import {
  oneMinuteSeekOptions,
  threeMinutesSeekOptions,
  fiveMinutesSeekOptions,
  tenMinutesSeekOptions,
  twentyMinutesSeekOptions,
  twentyFiveMinutesSeekOptions
} from "../../../../constants/gameConstants";
import { withTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import {
  ROLE_PLAY_RATED_GAMES,
  ROLE_PLAY_UNRATED_GAMES
} from "../../../../constants/rolesConstants";

class PlayOptionButtons extends Component {
  render() {
    const {
      translate,
      handlePlayWithFriend,
      handlePlayComputer,
      handlePlaySeek,
      currentRoles
    } = this.props;

    const roles = currentRoles.map(role => role.role._id);
    const isRatedGames = roles.includes(ROLE_PLAY_RATED_GAMES);
    const isUnratedGames = roles.includes(ROLE_PLAY_UNRATED_GAMES);

    return (
      <div className="play-block">
        <div className={isRatedGames ? "play-block__top" : "play-block__top__disabled"}>
          <Button
            className="play-block__top__button"
            onClick={() => handlePlaySeek(oneMinuteSeekOptions)}
          >
            {translate("seekButtons.minute")}
          </Button>
          <Button
            className="play-block__top__button"
            onClick={() => handlePlaySeek(threeMinutesSeekOptions)}
          >
            {translate("seekButtons.threeMinutes")}
          </Button>
          <Button
            className="play-block__top__button"
            onClick={() => handlePlaySeek(fiveMinutesSeekOptions)}
          >
            {translate("seekButtons.fiveMinutes")}
          </Button>
          <Button
            className="play-block__top__button"
            onClick={() => handlePlaySeek(tenMinutesSeekOptions)}
          >
            {translate("seekButtons.tenMinutes")}
          </Button>
          <Button
            className="play-block__top__button"
            onClick={() => handlePlaySeek(twentyMinutesSeekOptions)}
          >
            {translate("seekButtons.twentyMinutes")}
          </Button>
          <Button
            className="play-block__top__button"
            onClick={() => handlePlaySeek(twentyFiveMinutesSeekOptions)}
          >
            {translate("seekButtons.twentyFiveMinutes")}
          </Button>
        </div>
        <div className="play-block__bottom">
          <Button onClick={handlePlayWithFriend} className="play-block__btn-big" block>
            {translate("playWithFriend")}
          </Button>
          <Button
            onClick={handlePlayComputer}
            className={isUnratedGames ? "play-block__btn-big" : "play-block__btn-big__disabled"}
            block
          >
            {translate("playWithComputer")}
          </Button>
        </div>
      </div>
    );
  }
}

export default compose(
  withTracker(() => {
    return {
      currentRoles: Meteor.roleAssignment.find().fetch()
    };
  }),
  translate("Play.PlayBlock")
)(PlayOptionButtons);
