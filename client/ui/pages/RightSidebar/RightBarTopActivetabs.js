import React, { Component } from "react";
import { translate } from "../../HOCs/translate";
import Tabs from "./Tabs/Tabs";
import GameHistory from "./GameComponent";
import "./Tabs/styles";

class RightBarTopActivetabs extends Component {
  render() {
    const {
      translate,
      cssManager,
      RightBarTopData,
      flip,
      actionData,
      startGameExamine,
      gameRequest,
      examineAction,
      currentGame,
    } = this.props;

    return (
      <Tabs cssManager={cssManager}>
        <div label={translate("game")} imgsrc="images/game-icon-gray.png">
          <GameHistory
            cssManager={cssManager}
            game={RightBarTopData.MoveList}
            flip={flip}
            actionData={actionData}
            startGameExamine={startGameExamine}
            gameRequest={gameRequest}
            examineAction={examineAction}
            currentGame={currentGame}
          />
        </div>
        <div label={translate("test")}>{translate("test")}</div>
        {/* <div label={translator("play")} imgsrc="images/play-icon-gray.png">
          <CreateGame  cssManager={ cssManager} ref="create_game" />
        </div>
        <div label={translator("tournaments")} imgsrc="images/tournament-icon-gray.png">
          <TournamentsList
             cssManager={ cssManager}
            TournamentsList={RightBarTopData.TournamentList.Tournaments}
          />
        </div> */}
      </Tabs>
    );
  }
}

export default translate("Common.rightBarTop")(RightBarTopActivetabs);
