import React, { Component } from "react";
import { Checkbox, Radio, Input, Icon, List, Col, Row, Modal, Button, Avatar } from "antd";

import "./../../css/EditorRightSidebar.css";

class EditorRightSidebar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fen: props.fen,
      whiteCastling: props.whiteCastling,
      blackCastling: props.blackCastling
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.fen !== this.props.fen) {
      this.setState({ fen: this.props.fen });
    }
    if (prevProps.whiteCastling !== this.props.whiteCastling) {
      this.setState({ whiteCastling: this.props.whiteCastling });
    }
    if (prevProps.blackCastling !== this.props.blackCastling) {
      this.setState({ blackCastling: this.props.blackCastling });
    }
  }

  handleFen = e => {
    let that = this;
    let { value } = e.target;
    this.setState({ fen: value }, () => {
      that.props.onFen(value);
    });
  };

  handleCastling = (color, value) => {
    if (color === "white") {
      this.setState({ whiteCastling: value });
      this.props.onCastling(
        this.convertCastling(value),
        this.convertCastling(this.state.blackCastling)
      );
    } else if (color === "black") {
      this.setState({ blackCastling: value });
      this.props.onCastling(
        this.convertCastling(this.state.whiteCastling),
        this.convertCastling(value)
      );
    }
  };

  convertCastling(castlingValue) {
    if (castlingValue.length > 1) {
      return castlingValue.join("")
    } else if (castlingValue.length === 1) {
      return castlingValue.join("")
    }
    return "";
  }

  render() {
    const radioStyle = {
      display: "block",
      height: "30px",
      lineHeight: "30px"
    };
    const whiteOptions = [{ label: "0-0", value: "K" }, { label: "0-0-0", value: "Q" }];
    const blackOptions = [{ label: "0-0", value: "k" }, { label: "0-0-0", value: "q" }];
    const handleColor = e => {
      this.props.onColorChange(e.target.value);
    };
    return (
      <div className="editor-right-sidebar">
        <div className="editor-right-sidebar__head">
          <Button className="editor-right-sidebar__back-btn">Back to Play</Button>
          <h2 className="editor-right-sidebar__title">Board set up</h2>
        </div>
        <div className="editor-right-sidebar__content">
          <div className="editor-right-sidebar__color-block">
            <Radio.Group
              className="editor-right-sidebar__select"
              defaultValue="white"
              value={this.props.orientation}
              buttonStyle="solid"
              onChange={handleColor}
            >
              <Radio.Button value="white">White to play</Radio.Button>
              <Radio.Button value="black">Black to play</Radio.Button>
            </Radio.Group>
          </div>

          <div className="editor-right-sidebar__castling">
            <h3 className="editor-right-sidebar__name">Castling</h3>
            <div className="editor-right-sidebar__castling-wrap">
              <div className="editor-right-sidebar__block">
                <h3 className="editor-right-sidebar__check-name">White</h3>
                <Checkbox.Group
                  className="editor-right-sidebar__checkbox-list"
                  options={whiteOptions}
                  value={this.state.whiteCastling}
                  name="white"
                  onChange={data => this.handleCastling("white", data)}
                />
              </div>
              <div className="editor-right-sidebar__block">
                <h3 className="editor-right-sidebar__check-name">Black</h3>
                <Checkbox.Group
                  className="editor-right-sidebar__checkbox-list"
                  options={blackOptions}
                  value={this.state.blackCastling}
                  name="black"
                  onChange={data => this.handleCastling("black", data)}
                />
              </div>
            </div>
          </div>

          <div className="editor-right-sidebar__btn-list">
            <Button className="editor-right-sidebar__btn" onClick={this.props.onStartPosition}>
              Starting position
            </Button>
            <Button className="editor-right-sidebar__btn" onClick={this.props.onClear}>
              Clear board
            </Button>
            <Button className="editor-right-sidebar__btn" onClick={this.props.onFlip}>
              Flip board
            </Button>
          </div>
          <div className="editor-right-sidebar__fen-block">
            <h3 className="editor-right-sidebar__name">FEN</h3>
            <Input onChange={this.handleFen} value={this.state.fen} placeholder="Insert FEN here" />
          </div>
        </div>
      </div>
    );
  }
}

export default EditorRightSidebar;
