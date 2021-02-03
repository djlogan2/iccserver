import React, { Component } from "react";
import { Button } from "antd";
import { translate } from "../../../HOCs/translate";
import {
  oneMinuteSeekOptions,
  threeMinutesSeekOptions,
  fiveMinutesSeekOptions,
  tenMinutesSeekOptions,
  twentyMinutesSeekOptions,
  twentyFiveMinutesSeekOptions
} from "../../../../constants/gameConstants";

class PlayOptionButtons extends Component {
  render() {
    const { translate, handlePlayWithFriend, handlePlayComputer, handlePlaySeek } = this.props;

    return (
      <div className="play-block">
        <div className="play-block__top">
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
          <Button onClick={handlePlayComputer} className="play-block__btn-big" block>
            {translate("playWithComputer")}
          </Button>
        </div>
      </div>
    );
  }
}

export default translate("Play.PlayBlock")(PlayOptionButtons);
