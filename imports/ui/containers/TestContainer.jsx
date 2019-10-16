import React, { Component } from "react";
import PieceSquare from "../pages/components/Board/PieceSquare";
import RankSquare from "../pages/components/Board/RankSquare";
import FileSquare from "../pages/components/Board/FileSquare";
import Board from "../pages/components/Board/Board";
import CssManager from "../pages/components/Css/TestContainerCssManager";
import Chess from "chess.js";
import MoveListComponent from "../pages/RightSidebar/MoveListComponent";
import { Meteor } from "meteor/meteor";
import TrackerReact from "meteor/ultimatejs:tracker-react";

const css = new CssManager("developmentcss");
class TestContainer extends TrackerReact(React.Component) {
  constructor(props) {
    super(props);
    this.chess = new Chess.Chess();
    this._circle = { lineWidth: 2, color: "red" };

    this.state = {
      draw_rank_and_file: "bl",
      top: "b",
      what: this.props.match.params.what,
      from: null,
      to: null,
      subscription: {
        loggedOnUsers: Meteor.subscribe("loggedOnUsers"),
        legacyUsers: Meteor.subscribe("legacyUsers")
      }
    };
  }

  /**
   * Calculate & Update state of new dimensions
   */
  updateDimensions() {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
  }

  /**
   * Add event listener
   */
  componentDidMount() {
    this.updateDimensions();
    window.addEventListener("resize", this.updateDimensions.bind(this));
  }

  /**
   * Remove event listener
   */
  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions.bind(this));
    this.state.subscription.loggedOnUsers.stop();
    this.state.subscription.legacyUsers.stop();
  }

  render() {
    switch (this.state.what) {
      case "userlist":
        return this.renderUserList();
      case "square":
        return this.renderSquare();
      case "board":
        return this.renderBoard();
      case "movelist":
        return TestContainer.renderMoveList();
      default:
        return TestContainer.renderUnknown(this.state.what);
    }
  }

  renderUserList() {
    const localUsers = Meteor.users.find({}).fetch();
    //const legacyUsers = legacyUsersC.find({}).fetch();
    return (
      <div>
        <table>
          {localUsers.map(user => (
            <tr>
              {Object.keys(user).map(k => (
                <td>{JSON.stringify(user[k])}</td>
              ))}
            </tr>
          ))}
        </table>
      </div>
    );
  }

  static renderUnknown(what) {
    return <div>{what} is unknown</div>;
  }

  switchSides = () => {
    const newtop = this.state.top === "w" ? "b" : "w";
    this.setState({ top: newtop });
  };

  switchRAF = () => {
    this.setState({ draw_rank_and_file: this.nextRAF()[0] });
  };

  circleLineWidthChange = event => {
    this._circle.lineWidth = event.target.value;
    this.refs.board.setCircleParameters(
      this._circle.lineWidth,
      this._circle.color
    );
  };

  circleColorChange = event => {
    this._circle.color = event.target.value;
    this.refs.board.setCircleParameters(
      this._circle.lineWidth,
      this._circle.color
    );
  };

  nextRAF() {
    const values = ["tl", "tr", "bl", "br", "stl", "str", "sbl", "sbr"];
    const texts = [
      "Top left",
      "Top right",
      "Bottom left",
      "Bottom right",
      "External top left",
      "External top right",
      "External bottom left",
      "External bottom right"
    ];

    if (!this.state.draw_rank_and_file) return [values[0], texts[0]];
    let i = values.indexOf(this.state.draw_rank_and_file);
    i++;
    if (i === values.length) return [null, "No rank and file"];
    else return [values[i], texts[i]];
  }
  gameUndo = () => {};
  static renderMoveList() {
    const moveList = [
      "d4",
      ["e6", "d6"],
      "c4",
      ["b6", ["f5", ["f4", ["e3", "g5", "f3"]]]]
    ];
    return <MoveListComponent moves={moveList} />;
  }
  _pieceSquareDragStop = raf => {
    this.setState({ from: raf.from, to: raf.to });
  };
  renderBoard() {
    if (this.state.from != null && this.state.to != null) {
      this.chess.move({ from: this.state.from, to: this.state.to });
      //  this.chess.undo();
    }
    let w = this.state.width;
    let h = this.state.height;

    if (!w) w = window.innerWidth;
    if (!h) h = window.innerHeight;

    w /= 2;

    const size = Math.min(h, w);

    const newcolor = this.state.top === "w" ? "Black" : "White";
    const raf = this.nextRAF()[1];

    return (
      <div style={{ width: "100%" }}>
        <div>{this.state.draw_rank_and_file}</div>
        <div style={{ id: "board-left", float: "left", width: w, height: h }}>
          <Board
            cssmanager={css}
            board={this.chess.board()}
            draw_rank_and_file={this.state.draw_rank_and_file}
            side={size}
            top={this.state.top}
            circle={{ lineWidth: 2, color: "red" }}
            arrow={{ lineWidth: 2, color: "blue" }}
            ref="board"
            onDrop={this._pieceSquareDragStop}
          />
        </div>
        <div style={{ id: "board-right", float: "left", width: w, height: h }}>
          <button onClick={this.switchSides}>{newcolor} on top</button>
          <button onClick={this.switchRAF}>{raf}</button>
          <button onClick={this.gameUndo}>Game Undo</button>
          <p>Color on top: {this.state.top}</p>
          <p>Rank and file: {this.state.draw_rank_and_file}</p>
          <p>
            Circle width:{" "}
            <input
              id="circlewidth"
              type="number"
              name="quantity"
              min="1"
              max="50"
              onChange={this.circleLineWidthChange}
            />
          </p>
          <p>
            Circle color:{" "}
            <select id="circlecolor" onChange={this.circleColorChange}>
              <option value="red">Red</option>
              <option value="green">Green</option>
            </select>
          </p>
        </div>
      </div>
    );
  }

  renderSquare() {
    return (
      <div>
        <PieceSquare
          rank={0}
          file={0}
          color={"b"}
          piece={"q"}
          onMouseDown={() => console.log("here")}
          onMouseUp={() => console.log("here")}
          side={100}
          draw_rank_and_file={"tl"}
          circle={{ color: "red", lineWidth: 5 }}
        />
        <PieceSquare
          rank={0}
          file={1}
          color={"w"}
          piece={"q"}
          onMouseDown={() => console.log("here")}
          onMouseUp={() => console.log("here")}
          side={100}
          draw_rank_and_file={"bl"}
          circle={{ color: "green", lineWidth: 10 }}
        />
        <PieceSquare
          rank={0}
          file={2}
          onMouseDown={() => console.log("here")}
          onMouseUp={() => console.log("here")}
          draw_rank_and_file={"tr"}
          side={100}
        />
        <PieceSquare
          rank={0}
          file={3}
          onMouseDown={() => console.log("here")}
          onMouseUp={() => console.log("here")}
          side={100}
          draw_rank_and_file={"br"}
          circle={{ color: "yellow", lineWidth: 20 }}
        />
        <RankSquare
          cssmanager={this.props.cssmanager}
          rank={0}
          file={3}
          side={100}
        />
        <FileSquare
          cssmanager={this.props.cssmanager}
          rank={0}
          file={3}
          side={100}
        />
      </div>
    );
  }
}

export default TestContainer;
