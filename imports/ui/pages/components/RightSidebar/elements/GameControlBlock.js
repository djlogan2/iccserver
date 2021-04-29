import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { get } from "lodash";

import { Logger } from "../../../../../../lib/client/Logger";
import { translate } from "../../../../HOCs/translate";

const log = new Logger("client/GameControlBlock");

let handleError = error => {
  if (error) {
    log.error(error);
  }
};

class LocationControls extends Component {
  constructor(props) {
    super(props);

    this.state = {
      cmi: 0
    };
  }

  componentWillReceiveProps(nextProps) {
    const { game } = this.props;

    const cmi = get(nextProps, "game.variations.cmi");
    const prevCmi = get(game, "variations.cmi");

    if (cmi && cmi !== prevCmi) {
      this.setState({ cmi });
    }
  }

  moveBackwordBeginning = () => {
    const { game } = this.props;

    Meteor.call("moveToCMI", "moveToCMI", game._id, 0);
  };

  moveBackword = () => {
    const { game } = this.props;

    Meteor.call("moveBackward", "MoveBackward", game._id, 1, handleError);
  };

  moveForward = () => {
    const { game } = this.props;

    // TODO: This is stupid, AND not even right. Like "end of game", there is no FORWARD
    //       in a tree! You have to PICK which node!
    //       As if that weren't enough, this.state.cmi + 1 is not even remotely correct.
    //       It's just going to pick some random move in a complicated tree, and literally
    //       break, as the server would refuse to make an illegal move!
    //       I removed the broken code. This really needs to be made to work correctly.
    // let ind = this.state.cmi + 1;
    // let variationIndex = 0;
    // if (this.props.game.variations.movelist[ind]) {
    //   variationIndex = this.props.game.variations.movelist[ind].idc;
    // }
    Meteor.call("moveForward", "moveForward", game._id, 1, 0, handleError);
  };

  moveForwardEnd = () => {
    const { game } = this.props;
    let { cmi } = this.state;

    // TODO: FYI, this is stupid. There is no path to "end of game" in a tree.
    //       You have to actually PICK which final node to traverse to.
    while (
      !!game.variations.movelist[cmi].variations &&
      !!game.variations.movelist[cmi].variations.length
    )
      cmi = game.variations.movelist[cmi].variations[0];
    Meteor.call("moveToCMI", "moveToCMI", game._id, cmi);
  };

  detectMoveListFill = () => {
    const { game } = this.props;
    console.log(game?.variations);

    return game?.variations?.movelist.length === 1;
  };

  render() {
    const { flip, translate } = this.props;

    const disabled = this.detectMoveListFill();

    return (
      <div className="location-controls">
        <button
          title={translate("moveBackwardBeginning")}
          onClick={this.moveBackwordBeginning}
          className="location-controls__item"
          disabled={disabled}
        >
          <img
            src="images/navigation-start.svg"
            alt={translate("moveBackwardBeginning")}
            className="location-controls__item__image"
          />
        </button>
        <button
          title={translate("moveBackward")}
          onClick={this.moveBackword}
          className="location-controls__item"
          disabled={disabled}
        >
          <img
            src="images/navigation-back.svg"
            alt={translate("moveBackward")}
            className="location-controls__item__image"
          />
        </button>
        <button
          title={translate("moveForward")}
          onClick={this.moveForward}
          className="location-controls__item"
          disabled={disabled}
        >
          <img
            src="images/navigation-next.svg"
            alt={translate("moveForward")}
            className="location-controls__item__image"
          />
        </button>
        <button
          title={translate("moveForwardEnd")}
          onClick={this.moveForwardEnd}
          className="location-controls__item"
          disabled={disabled}
        >
          <img
            src="images/navigation-end.svg"
            alt={translate("moveForwardEnd")}
            className="location-controls__item__image"
          />
        </button>
        <button title={translate("flip")} onClick={flip} className="location-controls__item">
          <img
            src="images/navigation-flip.svg"
            alt={translate("flip")}
            className="location-controls__item__image"
          />
        </button>
      </div>
    );
  }
}

class ActionControls extends Component {
  handleTakeback = () => {
    const { game } = this.props;

    Meteor.call("requestTakeback", "requestTakeback", game._id, 1, handleError);
  };

  handleResign = () => {
    const { game } = this.props;
    // resignGame
    Meteor.call("resignGame", "resignGame", game._id, handleError);
  };

  handleDraw = () => {
    const { game } = this.props;

    Meteor.call("requestToDraw", "requestToDraw", game._id, handleError);
  };

  handleAdjorn = () => {
    const { game } = this.props;

    Meteor.call("requestToAdjourn", "requestToAdjourn", game._id, handleError);
  };

  handleAbort = () => {
    const { game } = this.props;

    Meteor.call("requestToAbort", "requestToAbort", game._id, handleError);
  };

  render() {
    const { translate } = this.props;

    return (
      <div className="action-controls">
        <button
          title={translate("takeBack")}
          onClick={this.handleTakeback}
          className="action-controls__item"
        >
          <img
            src="images/navigation-takeback.svg"
            alt={translate("takeBack")}
            className="location-controls__item__image"
          />
        </button>
        <button
          title={translate("resign")}
          onClick={this.handleResign}
          className="action-controls__item"
        >
          <img
            src="images/navigation-resign.svg"
            alt={translate("resign")}
            className="location-controls__item__image"
          />
        </button>
        <button
          title={translate("draw")}
          onClick={this.handleDraw}
          className="action-controls__item"
        >
          <img
            src="images/navigation-draw.svg"
            alt={translate("draw")}
            className="location-controls__item__image"
          />
        </button>
        <button
          title={translate("adjourn")}
          onClick={this.handleAdjorn}
          className="action-controls__item"
        >
          <img
            src="images/navigation-adjourn.svg"
            alt={translate("adjourn")}
            className="location-controls__item__image"
          />
        </button>
        <button
          title={translate("abort")}
          onClick={this.handleAbort}
          className="action-controls__item"
        >
          <img
            src="images/navigation-abort.svg"
            alt={translate("abort")}
            className="location-controls__item__image"
          />
        </button>
      </div>
    );
  }
}

const EnhacnedActionControls = translate("Common.rightBarTop")(ActionControls);
const EnhancedLocationControls = translate("Common.rightBarTop")(LocationControls);

const GameControlBlock = ({ game, flip }) => {
  return (
    <div className="game-control-block">
      <EnhancedLocationControls game={game} flip={flip} />
      <EnhacnedActionControls game={game} />
    </div>
  );
};

const ExamineGameControlBlock = ({ game, flip }) => {
  return (
    <div className="game-control-block">
      <EnhancedLocationControls game={game} flip={flip} />
    </div>
  );
};

export { GameControlBlock, ExamineGameControlBlock };
