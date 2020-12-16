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
    Meteor.call("moveForward", "moveForward", this.props.game._id, 1, 0, handleError);
  };

  moveForwardEnd = () => {
    // TODO: FYI, this is stupid. There is no path to "end of game" in a tree.
    //       You have to actually PICK which final node to traverse to.
    let cmi = this.state.cmi;
    while (
      !!this.props.game.variations.movelist[cmi].variations &&
      !!this.props.game.variations.movelist[cmi].variations.length
    )
      cmi = this.props.game.variations.movelist[cmi].variations[0];
    Meteor.call("moveToCMI", "moveToCMI", this.props.game._id, cmi);
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
  constructor() {
    super();
    this.state = {};
  }

  handleTakeback = () => {
    Meteor.call("requestTakeback", "requestTakeback", this.props.game._id, 1, handleError);
  };

  handleResign = () => {
    // resignGame
    Meteor.call("resignGame", "resignGame", this.props.game._id, handleError);
  };
  handleDraw = () => {
    Meteor.call("requestToDraw", "requestToDraw", this.props.game._id, handleError);
  };
  handleAdjorn = () => {
    Meteor.call("requestToAdjourn", "requestToAdjourn", this.props.game._id, handleError);
  };
  handleAbort = () => {
    Meteor.call("requestToAbort", "requestToAbort", this.props.game._id, handleError);
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
