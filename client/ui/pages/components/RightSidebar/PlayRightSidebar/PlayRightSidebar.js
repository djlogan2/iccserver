import { Tabs } from "antd";
import { get } from "lodash";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import React, { Component } from "react";
import { compose } from "redux";
import { mongoCss } from "../../../../../../imports/api/client/collections";
import { gameComputerId, gameStatusPlaying } from "../../../../../constants/gameConstants";
import { translate } from "../../../../HOCs/translate";
import { withDynamicStyles } from "../../../../HOCs/withDynamicStyles";
import KibitzChatApp from "../../Chat/KibitzChatApp/KibitzChatApp";
import PersonalChatApp from "../../Chat/PersonalChatApp/PersonalChatApp";
import PlayBlock from "../PlayBlock/PlayBlock";

const { TabPane } = Tabs;

class PlayRightSidebar extends Component {
  renderBottom = () => {
    const { game, translate, classes } = this.props;

    const isPlaying = this.isPlaying();

    if (isPlaying) {
      const whiteId = get(game, "white.id");
      const blackId = get(game, "black.id");

      const isBotPlay = this.isBotPlay();

      const isPlayersWhite = Meteor.userId() === whiteId;

      return (
        <Tabs className={classes.bottom} defaultActiveKey="1" size="small" type="card">
          <TabPane tab={translate("bottomTabs.chatTab")} key="chat">
            <PersonalChatApp disabled={isBotPlay} opponentId={isPlayersWhite ? blackId : whiteId} />
          </TabPane>
          <TabPane tab={translate("bottomTabs.kibitzTab")} key="kibitz">
            <KibitzChatApp disabled={isBotPlay} isKibitz={true} gameId={game._id} />
          </TabPane>
        </Tabs>
      );
    }
  };

  isBotPlay = () => {
    const { game } = this.props;

    const whiteId = get(game, "white.id");
    const blackId = get(game, "black.id");

    return whiteId === gameComputerId || blackId === gameComputerId;
  };

  isPlaying = () => {
    const { game } = this.props;

    return (
      game &&
      game.status === gameStatusPlaying &&
      (Meteor.userId() === game.white.id || Meteor.userId() === game.black.id)
    );
  };

  render() {
    const {
      game,
      classes,
      onBotPlay,
      onSeekPlay,
      onChooseFriend,
      cssManager,
      moveList,
      flip,
      moveBackward,
      moveForward,
      moveBackwardBeginning,
      moveForwardEnd,
      moveToCMI,
    } = this.props;

    return (
      <div className={classes.main}>
        <div className={classes.flexDiv}>
          <PlayBlock
            moveBackward={moveBackward}
            moveForward={moveForward}
            moveBackwardBeginning={moveBackwardBeginning}
            moveForwardEnd={moveForwardEnd}
            moveToCMI={moveToCMI}
            game={game}
            onBotPlay={onBotPlay}
            onSeekPlay={onSeekPlay}
            onChooseFriend={onChooseFriend}
            cssManager={cssManager}
            moveList={moveList}
            flip={flip}
          />
        </div>
        {game && this.renderBottom()}
      </div>
    );
  }
}

export default compose(
  translate("Play.PlayRightSidebar"),
  withTracker(() => {
    return {
      css: mongoCss.findOne(),
    };
  }),
  withDynamicStyles("css.playRightSideBarCss")
)(PlayRightSidebar);
