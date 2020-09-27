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
  constructor() {
    super();
    this.state = {
      cmi: 0
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.game.variations.cmi !== this.props.game.variations.cmi) {
      this.setState({ cmi: nextProps.game.variations.cmi });
    }
  }

  moveBackwordBeginning = () => {
    let { cmi } = this.props.game.variations;
    for (let i = 0; i < cmi; i++) {
      Meteor.call("moveBackward", "MoveBackward", this.props.gameId, 1, handleError);
    }
  };

  moveBackword = () => {
    Meteor.call("moveBackward", "MoveBackward", this.props.gameId, 1, handleError);
  };

  moveForward = () => {
    let ind = this.state.cmi + 1;
    let variationIndex = 0;
    if (this.props.game.variations.movelist[ind]) {
      variationIndex = this.props.game.variations.movelist[ind].idc;
    }

    Meteor.call("moveForward", "moveForward", this.props.gameId, 1, variationIndex, handleError);
  };

  moveForwardEnd = () => {
    let { movelist } = this.props.game.variations;

    let slicemoves = movelist.slice(this.state.cmi + 1, movelist.length);
    for (let i = 0; i <= slicemoves.length; i++) {
      Meteor.call("moveForward", "moveForward", this.props.gameId, 1, 0, handleError);
    }
  };

  render() {
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
        <button
          onClick={this.props.flip}
          className="location-controls__item location-controls__item--flip"
        />
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
    Meteor.call("requestTakeback", "requestTakeback", this.props.gameId, 1, handleError);
  };

  handleResign = () => {
    // resignGame
    Meteor.call("resignGame", "resignGame", this.props.gameId, handleError);
  };
  handleDraw = () => {
    Meteor.call("requestToDraw", "requestToDraw", this.props.gameId, handleError);
  };
  handleAdjorn = () => {
    Meteor.call("requestToAdjourn", "requestToAdjourn", this.props.gameId, handleError);
  };
  handleAbort = () => {
    Meteor.call("requestToAbort", "requestToAbort", this.props.gameId, handleError);
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

const GameControlBlock = ({ gameId, game, flip }) => {
  return (
    <div className="game-control-block">
      <LocationControls gameId={gameId} game={game} flip={flip} />
      <ActionControls gameId={gameId} />
    </div>
  );
};

const ExamineGameControlBlock = ({ gameId, game, flip }) => {
  return (
    <div className="game-control-block">
      <LocationControls gameId={gameId} game={game} flip={flip} />
    </div>
  );
};

export { GameControlBlock, ExamineGameControlBlock };
