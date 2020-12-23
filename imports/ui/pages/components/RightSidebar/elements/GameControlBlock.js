import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { Logger } from "../../../../../../lib/client/Logger";

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

    if (nextProps.game.variations.cmi !== game.variations.cmi) {
      this.setState({ cmi: nextProps.game.variations.cmi });
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

  render() {
    const { flip } = this.props;

    return (
      <div className="location-controls">
        <button
          onClick={this.moveBackwordBeginning}
          className="location-controls__item location-controls__item--backward"
        />
        <button
          onClick={this.moveBackword}
          className="location-controls__item location-controls__item--back"
        />
        <button
          onClick={this.moveForward}
          className="location-controls__item location-controls__item--next"
        />
        <button
          onClick={this.moveForwardEnd}
          className="location-controls__item location-controls__item--end"
        />
        <button onClick={flip} className="location-controls__item location-controls__item--flip" />
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
    return (
      <div className="action-controls">
        <button
          title="takeback"
          onClick={this.handleTakeback}
          className="action-controls__item action-controls__item--takeback"
        />
        <button
          title="resign"
          onClick={this.handleResign}
          className="action-controls__item action-controls__item--resign"
        />
        <button
          title="draw"
          onClick={this.handleDraw}
          className="action-controls__item action-controls__item--draw"
        />
        <button
          title="adjourn"
          onClick={this.handleAdjorn}
          className="action-controls__item action-controls__item--adjourn"
        />
        <button
          title="abort"
          onClick={this.handleAbort}
          className="action-controls__item action-controls__item--abort"
        />
      </div>
    );
  }
}

const GameControlBlock = ({ game, flip }) => {
  return (
    <div className="game-control-block">
      <LocationControls game={game} flip={flip} />
      <ActionControls game={game} />
    </div>
  );
};

const ExamineGameControlBlock = ({ game, flip }) => {
  return (
    <div className="game-control-block">
      <LocationControls game={game} flip={flip} />
    </div>
  );
};

export { GameControlBlock, ExamineGameControlBlock };
