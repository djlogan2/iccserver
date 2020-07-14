import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { Tabs, Button } from "antd";

const { TabPane } = Tabs;

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
    Meteor.call("moveBackward", "MoveBackward", this.props.gameId, this.currentindex, err => {
      if (err) {
        debugger;
      }
    });
  };
  moveBackword = () => {
    Meteor.call("moveBackward", "MoveBackward", this.props.gameId, 1, err => {
      if (err) {
        debugger;
      }
    });
  };

  moveForward = () => {
    let ind = this.currentindex + 1;
    let idc = 0;
    if (ind <= this.cmi) {
      idc = this.moves[ind].idc;
    }
    Meteor.call("moveForward", "MoveForward", this.props.gameId, 1, idc, err => {
      if (err) {
        debugger;
      }
    });
  };

  moveForwardEnd = cmi => {
    let movedata = this.props.game.moves;
    let slicemoves = movedata.slice(this.currentindex + 1, movedata.length);
    for (let i = 0; i <= slicemoves.length; i++) {
      console.log(slicemoves[i].idc);
      Meteor.call("moveForward", "MoveForward", this.props.gameId, 1, slicemoves[i].idc, err => {
        if (err) {
          debugger;
        }
      });
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

  handleResign = () => {
    // resignGame
    Meteor.call("resignGame", "resignGame", this.props.gameId, err => {
      if (err) {
        debugger;
      }
    });
  };
  handleDraw = () => {
    Meteor.call("requestToDraw", "requestToDraw", this.props.gameId, err => {
      if (err) {
        debugger;
      }
    });
  };
  handleAdjorn = () => {
    Meteor.call("requestToAdjourn", "requestToAdjourn", this.props.gameId, err => {
      if (err) {
        debugger;
      }
    });
  };
  handleAbort = () => {
    Meteor.call("requestToAbort", "requestToAbort", this.props.gameId, err => {
      if (err) {
        debugger;
      }
    });
  };

  render() {
    return (
      <div className="action-controls">
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

export default GameControlBlock;
