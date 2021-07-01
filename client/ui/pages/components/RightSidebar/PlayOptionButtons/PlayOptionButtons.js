import React, { Component } from "react";
import { Button } from "antd";
import { compose } from "redux";
import { translate } from "../../../../HOCs/translate";
import {
  oneMinuteSeekOptions,
  threeMinutesSeekOptions,
  fiveMinutesSeekOptions,
  tenMinutesSeekOptions,
  twentyMinutesSeekOptions,
  twentyFiveMinutesSeekOptions, fifteenMinutesSeekOptions
} from "../../../../../constants/gameConstants";
import { withTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import {
  ROLE_PLAY_RATED_GAMES,
  ROLE_PLAY_UNRATED_GAMES,
} from "../../../../../constants/rolesConstants";
import { mongoCss } from "../../../../../../imports/api/client/collections";
import injectSheet from "react-jss";
import { dynamicStyles } from "./dynamicStyles";

class PlayOptionButtons extends Component {
  render() {
    const {
      classes,
      translate,
      handlePlayWithFriend,
      handlePlayComputer,
      handlePlaySeek,
      currentRoles,
    } = this.props;

    const roles = currentRoles.map((role) => role.role._id);
    const isRatedGames = roles.includes(ROLE_PLAY_RATED_GAMES);
    const isUnratedGames = roles.includes(ROLE_PLAY_UNRATED_GAMES);

    return (
      <div className={classes.container}>
        <div className={isRatedGames ? classes.top : classes.topDisabled}>
          <Button
            className={classes.topButton}
            onClick={() => handlePlaySeek(oneMinuteSeekOptions)}
          >
            {translate("seekButtons.minute")}
          </Button>
          <Button
            className={classes.topButton}
            onClick={() => handlePlaySeek(threeMinutesSeekOptions)}
          >
            {translate("seekButtons.threeMinutes")}
          </Button>
          <Button
            className={classes.topButton}
            onClick={() => handlePlaySeek(fiveMinutesSeekOptions)}
          >
            {translate("seekButtons.fiveMinutes")}
          </Button>
          <Button
            className={classes.topButton}
            onClick={() => handlePlaySeek(tenMinutesSeekOptions)}
          >
            {translate("seekButtons.tenMinutes")}
          </Button>
          <Button
            className={classes.topButton}
            onClick={() => handlePlaySeek(fifteenMinutesSeekOptions)}
          >
            {translate("seekButtons.fifteenMinutes")}
          </Button>
          <Button
            className={classes.topButton}
            onClick={() => handlePlaySeek(twentyFiveMinutesSeekOptions)}
          >
            {translate("seekButtons.twentyFiveMinutes")}
          </Button>
        </div>
        <div className={classes.bottom}>
          <Button onClick={handlePlayWithFriend} className={classes.buttonBig} block>
            {translate("playWithFriend")}
          </Button>
          <Button
            onClick={handlePlayComputer}
            className={isUnratedGames ? classes.buttonBig : classes.buttonBigDisabled}
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
      currentRoles: Meteor.roleAssignment.find().fetch(),
      css: mongoCss.findOne(),
    };
  }),
  injectSheet(dynamicStyles),
  translate("Play.PlayBlock")
)(PlayOptionButtons);
