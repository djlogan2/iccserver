import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Meteor } from "meteor/meteor";
import { translate } from "../../HOCs/translate";
import { Logger } from "../../../../lib/client/Logger";
import { RESOURCE_EDITOR } from "../../../constants/resourceConstants";

const log = new Logger("client/MoveListComponent");

let handleError = error => {
  if (error) {
    log.error(error);
  }
};

class MoveListComponent extends Component {
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

  componentWillReceiveProps(nextProps) {
    const { game, gameRequest } = this.props;

    if (nextProps.game && game && nextProps.game.variations.cmi !== game.variations.cmi) {
      this.setState({ cmi: nextProps.game.variations.cmi });
    }

    if (!!gameRequest && nextProps.gameRequest !== gameRequest && gameRequest.type === "match") {
      this.setState({ gameRequest });
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
  moveForwardEnd = () => {
    let movedata = this.moves;
    let slicemoves = movedata.slice(this.currentindex + 1, movedata.length);
    for (let i = 0; i <= slicemoves.length; i++) {
      Meteor.call("moveForward", "MoveForward", this.gameId, 1, slicemoves[i].idc, err => {
        if (err) {
          debugger;
        }
      });
    }
  };

  moveAutoForward = () => {
    clearInterval(this.intervalID);

    this.setState(prevState => {
      return { toggle: !prevState.toggle };
    });

    this.intervalID = setInterval(() => {
      const { toggle } = this.state;

      let remainMove = this.cmi - this.currentindex;
      if (remainMove === 0 || !toggle) {
        clearInterval(this.intervalID);

        this.setState(prevState => {
          return { toggle: !prevState.toggle };
        });
      } else {
        this.moveForward();
      }
    }, 1000);
  };

  componentWillUnmount() {
    clearInterval(this.intervalID);
  }

  handleChange = e => {
    const { examineAction } = this.props;

    this.setState({ examinAction: e.target.value });
    examineAction(e.target.value);
  };

  requestFornewOppenent() {
    const { examineAction } = this.props;

    examineAction("newoppent");
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
    const { gameRequest } = this.state;

    let toUser;
    if (Meteor.userId() !== gameRequest.challenger_id) {
      toUser = gameRequest.challenger_id;
    } else {
      toUser = gameRequest.receiver_id;
    }

    Meteor.call(
      "addLocalMatchRequest",
      "matchRequest",
      toUser,
      gameRequest.wild_number,
      gameRequest.rating_type,
      gameRequest.rated,
      gameRequest.adjourned,
      gameRequest.challenger_time,
      gameRequest.challenger_inc_or_delay,
      gameRequest.challenger_delaytype,
      gameRequest.receiver_time,
      gameRequest.receiver_inc_or_delay,
      gameRequest.receiver_delaytype,
      gameRequest.challenger_color_request
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
    const { startGameExamine } = this.props;

    this.moveBackwordBeginning();
    startGameExamine();
  }

  addmove(move_number, variations, white_to_move, movelist, idx) {
    let string = "";

    if (!movelist[idx].variations || !movelist[idx].variations.length) {
      return string;
    }

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
    const { translate, game, cssManager } = this.props;

    let status = "none";
    if (!!game) {
      if (
        game.status === "playing" &&
        (Meteor.userId() === game.white.id || Meteor.userId() === game.black.id)
      )
        status = "playing";
      else if (!!game.examiners && game.examiners.some(ex => ex.id === Meteor.userId()))
        status = "examining";
      else if (game.observers.some(ex => ex.id === Meteor.userId())) status = "observing";
      this.message_identifier = "server:game:" + this.gameId;
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
    }

    /* TODO: movlist button display operation*/
    let displayButton = 0;
    let statuslabel = 0;

    let mbtnstyle = cssManager.gameButtonMove();
    if (status === "examining") {
      displayButton = 1;
      statuslabel = 1;
      Object.assign(mbtnstyle, { bottom: "85px", padding: "0px" });
    } else if (status === "playing") {
      statuslabel = 1;
    }

    const isPlaying = status === "playing";

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
          {!!ind && <b>{ind}</b>}
          <span style={movestyle}>{mv}</span>
        </span>
      );
    });
    let btnstyle = cssManager.buttonStyle();
    Object.assign(btnstyle, {
      background: "#f1f1f1",
      borderRadius: "5px",
      margin: "5px",
      padding: "6px 25px"
    });

    return (
      <div>
        <div style={cssManager.gameMoveList()}>{moveslist}</div>

        {displayButton ? (
          <div style={mbtnstyle} className="moveAction">
            <button style={btnstyle} onClick={this.moveBackwordBeginning}>
              <img src={cssManager.buttonBackgroundImage("fastForward")} alt="fast-forward" />
            </button>
            <button style={btnstyle} onClick={this.moveBackword}>
              <img src={cssManager.buttonBackgroundImage("prevIconGray")} alt="previous" />
            </button>
            <button style={btnstyle} onClick={this.moveForward}>
              <img src={cssManager.buttonBackgroundImage("nextIconGray")} alt="next" />
            </button>
            <button style={btnstyle} onClick={this.moveForwardEnd}>
              <img
                src={cssManager.buttonBackgroundImage("fastForwardNext")}
                alt="fast-forward-next"
              />
            </button>
            <button style={btnstyle} onClick={this.moveAutoForward}>
              {this.state.toggle ? (
                <img src={cssManager.buttonBackgroundImage("nextStop")} alt="next-single" />
              ) : (
                <img src={cssManager.buttonBackgroundImage("nextStart")} alt="next-single" />
              )}
            </button>
            <button style={btnstyle} onClick={this.props.flip}>
              <img src={cssManager.buttonBackgroundImage("flipIconGray")} alt="Flip" />
            </button>
          </div>
        ) : null}
        <div className="draw-section">
          {statuslabel ? (
            <div
              className={"gamestatus " + (status === "playing" ? "active" : "default")}
              style={cssManager.drawActionSection()}
            >
              <span>{translate(status)}</span>
            </div>
          ) : null}

          {isPlaying ? (
            <ul>
              <li style={cssManager.drawSectionList()}>
                <button style={cssManager.buttonStyle()} onClick={this._drawRequest}>
                  <img
                    src={cssManager.buttonBackgroundImage("draw")}
                    alt={translate("draw")}
                    style={cssManager.drawSectionButton()}
                  />
                  {translate("draw")}
                </button>
              </li>

              <li style={cssManager.drawSectionList()}>
                <button style={cssManager.buttonStyle()} onClick={this._resignGame}>
                  <img
                    src={cssManager.buttonBackgroundImage("resign")}
                    alt={translate("resign")}
                    style={cssManager.drawSectionButton()}
                  />
                  {translate("resign")}
                </button>
              </li>
              <li style={cssManager.drawSectionList()}>
                <span style={cssManager.spanStyle("form")}>
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
                    <option value="action">{translate("action")}</option>
                    <option value="abort">{translate("abort")}</option>
                    <option value="halfMove">{translate("takeBackMove")}</option>
                    <option value="fullMove">{translate("takeBackMoves")}</option>
                    <option value="flag">{translate("flag")}</option>
                    <option value="moretime">{translate("moretime")}</option>
                    <option value="adjourn">{translate("adjourn")}</option>
                  </select>
                </span>
              </li>
            </ul>
          ) : (
            <ul>
              <li style={cssManager.drawSectionList()}>
                <button
                  onClick={() => this.requestFornewOppenent()}
                  style={cssManager.buttonStyle()}
                >
                  <img
                    src={cssManager.buttonBackgroundImage("newOpponent")}
                    alt={translate("newOpponent")}
                    style={cssManager.drawSectionButton()}
                  />
                  {translate("newOpponent")}
                </button>
              </li>
              <li style={cssManager.drawSectionList()}>
                <button onClick={this._reMatchGame} style={cssManager.buttonStyle()}>
                  <img
                    src={cssManager.buttonBackgroundImage("rematch")}
                    alt={translate("rematch")}
                    style={cssManager.drawSectionButton()}
                  />
                  {translate("rematch")}
                </button>
              </li>
              <li>
                <Link to={RESOURCE_EDITOR}>
                  <img
                    src={cssManager.buttonBackgroundImage("editor")}
                    alt={translate("editor")}
                    style={cssManager.drawSectionButton()}
                  />
                  {translate("editor")}
                </Link>
              </li>
              <li style={cssManager.drawSectionList()}>
                <button style={cssManager.buttonStyle()} onClick={() => this._setGameToExamine()}>
                  <img
                    src={cssManager.buttonBackgroundImage("examine")}
                    alt={translate("examine")}
                    style={cssManager.drawSectionButton()}
                  />
                  {translate("examine")}
                </button>
              </li>
              <li style={cssManager.drawSectionList()}>
                <span style={cssManager.spanStyle("form")}>
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
                    <option value="action">{translate("action")}</option>
                    <option value="addgame">{translate("addGameToLibrary")}</option>
                    <option value="complain">{translate("complainAboutThisGame")}</option>
                    <option value="emailgame">{translate("emailGame")}</option>
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

export default translate("Common.MoveListComponent")(MoveListComponent);
