import React, { Component } from "react";
import { Button, Checkbox, Input, Radio } from "antd";
import { withRouter } from "react-router-dom";
import { compose } from "redux";
import { translate } from "../../../HOCs/translate";

import "./../../css/EditorRightSidebar.css";
import { RESOURCE_EXAMINE } from "../../../../constants/resourceConstants";

class EditorRightSidebar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      whiteCastling: props.whiteCastling,
      blackCastling: props.blackCastling,
    };
  }

  handleCastling = (color, value) => {
    const { onCastling } = this.props;
    const { blackCastling, whiteCastling } = this.state;

    if (color === "white") {
      this.setState({ whiteCastling: value });

      onCastling(this.convertCastling(value), this.convertCastling(blackCastling));
    } else if (color === "black") {
      this.setState({ blackCastling: value });

      onCastling(this.convertCastling(whiteCastling), this.convertCastling(value));
    }
  };

  convertCastling(castlingValue) {
    if (castlingValue.length) {
      return castlingValue.join("");
    }

    return "";
  }

  handleColor = (e) => {
    const { onColorChange } = this.props;

    onColorChange(e.target.value);
  };

  render() {
    const { color, onStartPosition, onClear, onFlip, onFen, fen, translate, history } = this.props;
    const { whiteCastling, blackCastling } = this.state;

    const whiteOptions = [
      { label: "0-0", value: "K" },
      { label: "0-0-0", value: "Q" },
    ];
    const blackOptions = [
      { label: "0-0", value: "k" },
      { label: "0-0-0", value: "q" },
    ];

    return (
      <div className="editor-right-sidebar">
        <div className="editor-right-sidebar__head">
          <Button
            className="editor-right-sidebar__back-btn"
            onClick={() => history.push(RESOURCE_EXAMINE)}
          >
            {translate("backToPlay")}
          </Button>
          <h2 className="editor-right-sidebar__title">{translate("boardSetUp")}</h2>
        </div>
        <div className="editor-right-sidebar__content">
          <div className="editor-right-sidebar__color-block">
            <Radio.Group
              className="editor-right-sidebar__select"
              initialValues="w"
              value={color}
              buttonStyle="solid"
              onChange={this.handleColor}
            >
              <Radio.Button value="w">{translate("whiteToPlay")}</Radio.Button>
              <Radio.Button value="b">{translate("blackToPlay")}</Radio.Button>
            </Radio.Group>
          </div>
          <div className="editor-right-sidebar__castling">
            <h3 className="editor-right-sidebar__name"> {translate("castling")}</h3>
            <div className="editor-right-sidebar__castling-wrap">
              <div className="editor-right-sidebar__block">
                <h3 className="editor-right-sidebar__check-name">{translate("white")}</h3>
                <Checkbox.Group
                  title={translate("whiteCastling")}
                  className="editor-right-sidebar__checkbox-list"
                  options={whiteOptions}
                  value={whiteCastling}
                  name="white"
                  onChange={(data) => this.handleCastling("white", data)}
                />
              </div>
              <div className="editor-right-sidebar__block">
                <h3 className="editor-right-sidebar__check-name">{translate("black")}</h3>
                <Checkbox.Group
                  title={translate("blackCastling")}
                  className="editor-right-sidebar__checkbox-list"
                  options={blackOptions}
                  value={blackCastling}
                  name="black"
                  onChange={(data) => this.handleCastling("black", data)}
                />
              </div>
            </div>
          </div>

          <div className="editor-right-sidebar__btn-list">
            <Button
              className="editor-right-sidebar__btn editor-right-sidebar__btn--starting-pos"
              onClick={onStartPosition}
            >
              {translate("startingPosition")}
            </Button>
            <Button
              className="editor-right-sidebar__btn editor-right-sidebar__btn--clear"
              onClick={onClear}
            >
              {translate("clearBoard")}
            </Button>
            <Button
              className="editor-right-sidebar__btn editor-right-sidebar__btn--flip"
              onClick={onFlip}
            >
              {translate("flipBoard")}
            </Button>
          </div>
          <div className="editor-right-sidebar__fen-block">
            <h3 className="editor-right-sidebar__name"> {translate("fen")}</h3>
            <Input
              onChange={(e) => onFen(e.target.value)}
              value={fen}
              placeholder={translate("insertFen")}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default compose(translate("Editor.EditorRightSidebar"), withRouter)(EditorRightSidebar);
