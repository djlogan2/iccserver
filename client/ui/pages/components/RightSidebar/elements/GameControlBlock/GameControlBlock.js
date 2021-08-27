import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { get } from "lodash";
import { compose } from "redux";

import { Logger } from "../../../../../../../lib/client/Logger";
import { translate } from "../../../../../HOCs/translate";
import { withTracker } from "meteor/react-meteor-data";
import { mongoCss } from "../../../../../../../imports/api/client/collections";
import injectSheet from "react-jss";
import { dynamicStyles } from "./dynamicStyles";

const log = new Logger("client/GameControlBlock");

let handleError = (error) => {
  if (error) {
    log.error(error);
  }
};

class LocationControls extends Component {
  constructor(props) {
    super(props);

    this.state = {
      cmi: 0,
    };
  }

  handleKeysPress = (event) => {
    switch (event.keyCode) {
      case 37:
        this.moveBackward();
        break;
      case 38:
        this.moveBackwardBeginning();
        break;
      case 39:
        this.moveForward();
        break;
      case 40:
        this.moveForwardEnd();
        break;
    }
  };

  componentDidMount() {
    document.addEventListener("keydown", this.handleKeysPress, false);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeysPress, false);
  }

  componentWillReceiveProps(nextProps) {
    const { game } = this.props;

    const cmi = get(nextProps, "game.variations.cmi");
    const prevCmi = get(game, "variations.cmi");

    if (cmi && cmi !== prevCmi) {
      this.setState({ cmi });
    }
  }

  moveBackwardBeginning = () => {
    const { game } = this.props;

    Meteor.call("moveToCMI", "moveToCMI", game._id, 0, handleError);
  };

  moveBackward = () => {
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
    Meteor.call("moveToCMI", "moveToCMI", game._id, cmi, handleError);
  };

  detectMoveListFill = () => {
    const { game } = this.props;

    return game?.variations?.movelist.length === 1;
  };

  render() {
    const { flip, translate, classes } = this.props;

    const disabled = this.detectMoveListFill();

    return (
      <div className={classes.locationControls}>
        <button
          id="move-backward-beginning"
          title={translate("moveBackwardBeginning")}
          onClick={this.moveBackwardBeginning}
          className={classes.locationControlItem}
          disabled={disabled}
        >
          <img
            src="images/navigation-start.svg"
            alt={translate("moveBackwardBeginning")}
            className={classes.locationControlsItemImage}
          />
        </button>
        <button
          id="move-backward"
          title={translate("moveBackward")}
          onClick={this.moveBackward}
          className={classes.locationControlItem}
          disabled={disabled}
        >
          <img
            src="images/navigation-back.svg"
            alt={translate("moveBackward")}
            className={classes.locationControlsItemImage}
          />
        </button>
        <button
          id="move-forward"
          title={translate("moveForward")}
          onClick={this.moveForward}
          className={classes.locationControlItem}
          disabled={disabled}
        >
          <img
            src="images/navigation-next.svg"
            alt={translate("moveForward")}
            className={classes.locationControlsItemImage}
          />
        </button>
        <button
          id="move-forward-end"
          title={translate("moveForwardEnd")}
          onClick={this.moveForwardEnd}
          className={classes.locationControlItem}
          disabled={disabled}
        >
          <img
            src="images/navigation-end.svg"
            alt={translate("moveForwardEnd")}
            className={classes.locationControlsItemImage}
          />
        </button>
        <button
          id="flip-button"
          title={translate("flip")}
          onClick={flip}
          className={classes.locationControlItem}
        >
          <img
            src="images/navigation-flip.svg"
            alt={translate("flip")}
            className={classes.locationControlsItemImage}
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
    const { translate, classes } = this.props;

    return (
      <div className={classes.actionControls}>
        <button
          id="take-back"
          title={translate("takeBack")}
          onClick={this.handleTakeback}
          className={classes.actionControlsItem}
        >
          <img
            src="images/navigation-takeback.svg"
            alt={translate("takeBack")}
            className={classes.locationControlsItemImage}
          />
        </button>
        <button
          id="resign"
          title={translate("resign")}
          onClick={this.handleResign}
          className={classes.actionControlsItem}
        >
          <img
            src="images/navigation-resign.svg"
            alt={translate("resign")}
            className={classes.locationControlsItemImage}
          />
        </button>
        <button
          id="draw"
          title={translate("draw")}
          onClick={this.handleDraw}
          className={classes.actionControlsItem}
        >
          <img
            src="images/navigation-draw.svg"
            alt={translate("draw")}
            className={classes.locationControlsItemImage}
          />
        </button>
        <button
          id="adjourn"
          title={translate("adjourn")}
          onClick={this.handleAdjorn}
          className={classes.actionControlsItem}
        >
          <img
            src="images/navigation-adjourn.svg"
            alt={translate("adjourn")}
            className={classes.locationControlsItemImage}
          />
        </button>
        <button
          id="abort"
          title={translate("abort")}
          onClick={this.handleAbort}
          className={classes.actionControlsItem}
        >
          <img
            src="images/navigation-abort.svg"
            alt={translate("abort")}
            className={classes.locationControlsItemImage}
          />
        </button>
      </div>
    );
  }
}

const EnhacnedActionControls = translate("Common.rightBarTop")(ActionControls);
const EnhancedLocationControls = translate("Common.rightBarTop")(LocationControls);

const GameControlBlock = compose(
  withTracker(() => {
    return {
      css: mongoCss.findOne(),
    };
  }),
  injectSheet(dynamicStyles)
)(({ game, flip, classes }) => {
  return (
    <div className={classes.container}>
      <EnhancedLocationControls game={game} flip={flip} classes={classes} />
      <EnhacnedActionControls game={game} classes={classes} />
    </div>
  );
});

const ExamineGameControlBlock = compose(
  withTracker(() => {
    return {
      css: mongoCss.findOne(),
    };
  }),
  injectSheet(dynamicStyles)
)(({ game, flip, classes }) => {
  return (
    <div className={classes.container}>
      <EnhancedLocationControls game={game} flip={flip} classes={classes} />
    </div>
  );
});

export { GameControlBlock, ExamineGameControlBlock };
