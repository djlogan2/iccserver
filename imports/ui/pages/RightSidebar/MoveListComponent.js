/* eslint-disable prettier/prettier */
import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Meteor } from "meteor/meteor";
import i18n from "meteor/universe:i18n";
import { Logger } from "../../../../../../lib/client/Logger";
import { object } from "prop-types";
const logger = new Logger("client/MoveListComponent");

let handleError = error => {
  if (error) {
    logger.error(error);
  }
};

export default class MoveListComponent extends Component {
  constructor(props) {
    super(props);
    this.cmi = 0;
    this.state = {
      cmi: 0,
      toggle: false,
      action: "action",
      examinAction: "action",
      gameRequest: props.gameRequest,
      isexamin: true
    };
  }
  static getLang() {
    return (
      (navigator.languages && navigator.languages[0]) ||
      navigator.language ||
      navigator.browserLanguage ||
      navigator.userLanguage ||
      "en-US"
    );
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.game.variations.cmi !== this.props.game.variations.cmi) {
      this.setState({ cmi: nextProps.game.variations.cmi });
    }
    if (!!this.props.gameRequest) {
      if (
        nextProps.gameRequest !== this.props.gameRequest &&
        this.props.gameRequest.type === "match"
      ) {
        this.setState({ gameRequest: this.props.gameRequest });
      }
    }
  }
  moveBackwordBeginning = () => {
    Meteor.call("moveBackward", "MoveBackward", this.gameId, this.currentindex, handleError);
  };
  moveBackword = () => {
    Meteor.call("moveBackward", "MoveBackward", this.gameId, 1, handleError);
  };
  moveForward = () => {
    let ind = this.currentindex + 1;
    let idc = 0;
    if (ind <= this.cmi) {
      idc = this.moves[ind].idc;
    }
    Meteor.call("moveForward", "MoveForward", this.gameId, 1, idc, handleError);
  };
  moveForwardEnd = cmi => {
    let movedata = this.moves;
    let slicemoves = movedata.slice(this.currentindex + 1, movedata.length);
    for (let i = 0; i <= slicemoves.length; i++) {
      Meteor.call("moveForward", "MoveForward", this.gameId, 1, slicemoves[i].idc, (err) => {
        if (err) {
          debugger;
        }
      });
    }
  };

  moveAutoForward = () => {
    clearInterval(this.intervalID);
    this.setState({ toggle: !this.state.toggle });
    this.intervalID = setInterval(() => {
      let remainMove = this.cmi - this.currentindex;
      if (remainMove === 0 || this.state.toggle === false) {
        clearInterval(this.intervalID);
        this.setState({ toggle: !this.state.toggle });
      } else {
        this.moveForward();
      }
    }, 1000);
  };

  componentWillUnmount() {
    clearInterval(this.intervalID);
  }
  handleChange = e => {
    this.setState({ examinAction: e.target.value });
    this.props.examineAction(e.target.value);
  };
  requestFornewOppenent() {
    this.props.examineAction("newoppent");
  }
  _takeBackAction = number => {
    Meteor.call("requestTakeback", this.message_identifier, this.gameId, number);
  };
  _drawRequest = () => {
    Meteor.call("requestToDraw", this.message_identifier, this.gameId);
  };
  _abortRequest = () => {
    Meteor.call("requestToAbort", this.message_identifier, this.gameId);
  };
  _adjournRequest = () => {
    Meteor.call("requestToAdjourn", this.message_identifier, this.gameId);
  };
  _resignGame = () => {
    Meteor.call("resignGame", this.message_identifier, this.gameId);
  };
  _reMatchGame = () => {
    let toUser;
    if (Meteor.userId() !== this.state.gameRequest.challenger_id) {
      toUser = this.state.gameRequest.challenger_id;
    } else {
      toUser = this.state.gameRequest.receiver_id;
    }
    Meteor.call(
      "addLocalMatchRequest",
      "matchRequest",
      toUser,
      this.state.gameRequest.wild_number,
      this.state.gameRequest.rating_type,
      this.state.gameRequest.rated,
      this.state.gameRequest.adjourned,
      this.state.gameRequest.challenger_time,
      this.state.gameRequest.challenger_inc_or_delay,
      this.state.gameRequest.challenger_delaytype,
      this.state.gameRequest.receiver_time,
      this.state.gameRequest.receiver_inc_or_delay,
      this.state.gameRequest.receiver_delaytype,
      this.state.gameRequest.challenger_color_request
    );
  };
  handleChangeSecond = event => {
    let action = event.target.value;
    this.setState({ action: "action" });
    switch (action) {
      case "halfMove":
        this._takeBackAction(1);
        break;
      case "fullMove":
        this._takeBackAction(2);
        break;
      case "abort":
        this._abortRequest();
        break;
      default:
    }
  };
  _setGameToExamine() {
    this.moveBackwordBeginning();
    this.props.startGameExamine();
  }

  addmove(move_number, variations, white_to_move, movelist, idx) {
    let string = "";

    if (!movelist[idx].variations || !movelist[idx].variations.length) return "";
    if (movelist[idx].variations.length > 1) {
    } else {
      string +=
        "0" +
        "*-" +
        movelist[idx].variations[0] +
        "*-" +
        movelist[movelist[idx].variations[0]].move +
        "|";
    }

    let next_move_number = move_number;
    let next_white_to_move = !white_to_move;
    if (next_white_to_move) next_move_number++;

    for (let x = 1; x < movelist[idx].variations.length; x++) {
      if ((x = movelist[idx].variations.length - 1)) {
        string +=
          x +
          "*-" +
          movelist[idx].variations[x] +
          "*-" +
          movelist[movelist[idx].variations[x]].move +
          " |";
      }
      string += this.addmove(
        next_move_number,
        false,
        next_white_to_move,
        movelist,
        movelist[idx].variations[x]
      );
    }

    if (movelist[idx].variations.length > 1) {
      this.addmove(
        next_move_number,
        movelist[idx].variations.length > 1,
        next_white_to_move,
        movelist,
        movelist[idx].variations[0]
      );
    } else {
      string +=
        " " +
        this.addmove(
          next_move_number,
          movelist[idx].variations.length > 1,
          next_white_to_move,
          movelist,
          movelist[idx].variations[0]
        );
    }
    return string;
  }
  buildPgnFromMovelist(movelist) {
    return this.addmove(1, false, true, movelist, 0);
  }

  render() {
    let translator = i18n.createTranslator("Common.MoveListComponent", MoveListComponent.getLang());
    let moves = [];
    let variation;
    let game = this.props.game;
    let status = this.props.game.status;
    if (!!game) {
      this.message_identifier = "server:game:" + this.gameId;
      this.gameId = game._id;
    }
    let string = this.buildPgnFromMovelist(game.variations.movelist);
    let chunks = string.split("|");
    chunks.splice(-1, 1);
    this.cmi = chunks.length;
    this.moves = [];
    this.moves.push({ idc: 0, idx: 0, move: "" });
    for (let i = 0; i < chunks.length; i++) {
      let ch = chunks[i].split("*-");
      this.moves.push({ idc: parseInt(ch[0]), idx: parseInt(ch[1]), move: ch[2] });
    }

    /* TODO: movlist button display operation*/
    let displayButton = 0;
    let statuslabel = 0;
    let isPlaying;

    let mbtnstyle = this.props. cssManager.gameButtonMove();
    if (this.props.currentGame === true && status === "examining") {
      displayButton = 1;
      statuslabel = 1;
      Object.assign(mbtnstyle, { bottom: "85px", padding: "0px" });
    } else if (status === "playing") {
      statuslabel = 1;
    }

    if (status === "playing") {
      isPlaying = true;
    } else {
      isPlaying = false;
    }

    /*End of code */
    let cnt = 1;
    let ind = "";
    this.currentindex = 0;
    let moveslist = this.moves.map((move, index) => {
      let mv = this.moves[index].move;
      let idx = this.moves[index].idx;
      if (index % 2 === 0) {
        ind = "";
      } else {
        ind = " " + cnt + ".";
        cnt++;
      }
      let style = { color: "black" };
      let movestyle;
      if (this.state.cmi === idx) {
        Object.assign(style, { color: "#904f4f", fontWeight: "bold", fontSize: "15px" });
        movestyle = style;
        this.currentindex = index;
      } else {
        movestyle = style;
      }

      return (
        <span key={index}>
          {ind ? <b>{ind}</b> : null}
          <span style={movestyle}> {mv}</span>
        </span>
      );
    });
    let btnstyle = {};
    btnstyle = this.props. cssManager.buttonStyle();
    Object.assign(btnstyle, {
      background: "#f1f1f1",
      borderRadius: "5px",
      margin: "5px",
      padding: "6px 25px"
    });

    return (
      <div>
        <div style={this.props. cssManager.gameMoveList()}>{moveslist}</div>

        {displayButton ? (
          <div style={mbtnstyle} className="moveAction">
            <button style={btnstyle} onClick={this.moveBackwordBeginning.bind(this)}>
              <img
                src={this.props. cssManager.buttonBackgroundImage("fastForward")}
                alt="fast-forward"
              />
            </button>
            <button style={btnstyle} onClick={this.moveBackword.bind(this)}>
              <img
                src={this.props. cssManager.buttonBackgroundImage("prevIconGray")}
                alt="previous"
              />
            </button>
            <button style={btnstyle} onClick={this.moveForward.bind(this)}>
              <img src={this.props. cssManager.buttonBackgroundImage("nextIconGray")} alt="next" />
            </button>
            <button style={btnstyle} onClick={this.moveForwardEnd.bind(this, 1)}>
              <img
                src={this.props. cssManager.buttonBackgroundImage("fastForwardNext")}
                alt="fast-forward-next"
              />
            </button>
            <button style={btnstyle} onClick={this.moveAutoForward.bind(this)}>
              {this.state.toggle ? (
                <img
                  src={this.props. cssManager.buttonBackgroundImage("nextStop")}
                  alt="next-single"
                />
              ) : (
                <img
                  src={this.props. cssManager.buttonBackgroundImage("nextStart")}
                  alt="next-single"
                />
              )}
            </button>
            <button style={btnstyle} onClick={this.props.flip}>
              <img src={this.props. cssManager.buttonBackgroundImage("flipIconGray")} alt="Flip" />
            </button>
            {/*  <button style={btnstyle}>
              <img
                src={this.props. cssManager.buttonBackgroundImage("settingIcon")}
                alt="setting-icon"
              />
            </button> */}
          </div>
        ) : null}
        <div className="draw-section">
          {statuslabel ? (
            <div
              className={"gamestatus " + (status === "playing" ? "active" : "default")}
              style={this.props. cssManager.drawActionSection()}
            >
              <span>{translator(status)}</span>
            </div>
          ) : null}

          {isPlaying ? (
            <ul>
              <li style={this.props. cssManager.drawSectionList()}>
                <button
                  style={this.props. cssManager.buttonStyle()}
                  onClick={this._drawRequest.bind(this)}
                >
                  <img
                    src={this.props. cssManager.buttonBackgroundImage("draw")}
                    alt="Draw"
                    style={this.props. cssManager.drawSectionButton()}
                  />
                  {translator("draw")}
                </button>
              </li>

              <li style={this.props. cssManager.drawSectionList()}>
                <button
                  style={this.props. cssManager.buttonStyle()}
                  onClick={this._resignGame.bind(this)}
                >
                  <img
                    src={this.props. cssManager.buttonBackgroundImage("resign")}
                    alt="Resign"
                    style={this.props. cssManager.drawSectionButton()}
                  />
                  {translator("resign")}
                </button>
              </li>
              <li style={this.props. cssManager.drawSectionList()}>
                <span style={this.props. cssManager.spanStyle("form")}>
                  <select
                    onChange={this.handleChangeSecond}
                    style={{
                      outline: "none",
                      border: "1px #9c9c9c solid",
                      padding: "6px 3px",
                      borderRadius: "5px",
                      marginTop: "7px"
                    }}
                    value={this.state.action}
                  >
                    <option value="action">Action</option>
                    <option value="abort">Abort</option>
                    <option value="halfMove">TakeBack 1 Move</option>
                    <option value="fullMove">TakeBack 2 Moves</option>
                    <option value="flag">Flag</option>
                    <option value="moretime">Moretime</option>
                    <option value="adjourn">Adjourn</option>
                  </select>
                </span>
              </li>
            </ul>
          ) : (
            <ul>
              <li style={this.props. cssManager.drawSectionList()}>
                <button
                  onClick={() => this.requestFornewOppenent()}
                  style={this.props. cssManager.buttonStyle()}
                >
                  <img
                    src={this.props. cssManager.buttonBackgroundImage("draw")}
                    alt="Draw"
                    style={this.props. cssManager.drawSectionButton()}
                  />
                  New Oppenent
                </button>
              </li>
              <li style={this.props. cssManager.drawSectionList()}>
                <button
                  onClick={this._reMatchGame.bind(this)}
                  style={this.props. cssManager.buttonStyle()}
                >
                  <img
                    src={this.props. cssManager.buttonBackgroundImage("resign")}
                    alt="Resign"
                    style={this.props. cssManager.drawSectionButton()}
                  />
                  Rematch
                </button>
              </li>
              <li>
                <Link to="/editor">
                  <img
                    src={this.props. cssManager.buttonBackgroundImage("resign")}
                    alt="Resign"
                    style={this.props. cssManager.drawSectionButton()}
                  />
                  Editor
                </Link>
              </li>
              <li style={this.props. cssManager.drawSectionList()}>
                <button
                  style={this.props. cssManager.buttonStyle()}
                  onClick={() => this._setGameToExamine()}
                >
                  <img
                    src={this.props. cssManager.buttonBackgroundImage("examine")}
                    alt="examine"
                    style={this.props. cssManager.drawSectionButton()}
                  />
                  Examine
                </button>
              </li>
              <li style={this.props. cssManager.drawSectionList()}>
                <span style={this.props. cssManager.spanStyle("form")}>
                  <select
                    style={{
                      outline: "none",
                      border: "1px #9c9c9c solid",
                      padding: "6px 3px",
                      borderRadius: "5px",
                      marginTop: "7px",
                      width: "150px"
                    }}
                    value={this.state.examinAction}
                    onChange={this.handleChange}
                  >
                    <option value="action">Action</option>
                    <option value="addgame">Add Game To Library</option>
                    <option value="complain">Complain About This Game</option>
                    <option value="emailgame">Email Game</option>
                  </select>
                </span>
              </li>
            </ul>
          )}
        </div>
      </div>
    );
  }
}
