import React, { Component } from "react";
import { Button, Checkbox, Input, Radio } from "antd";
import { withRouter } from "react-router-dom";
import { withTracker } from "meteor/react-meteor-data";
import { compose } from "redux";
import injectSheet from "react-jss";
import classNames from "classnames";

import { translate } from "../../../../HOCs/translate";
import { RESOURCE_EXAMINE } from "../../../../../constants/resourceConstants";
import { mongoCss } from "../../../../../../imports/api/client/collections";
import { dynamicStyles } from "./dynamicStyles";
import {
  blackCastlingOptions,
  colorBlack,
  colorBlackLetter,
  colorWhite,
  colorWhiteLetter,
  whiteCastlingOptions
} from "../../../../../constants/gameConstants";

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

    if (color === colorWhite) {
      this.setState({ whiteCastling: value });

      onCastling(this.convertCastling(value), this.convertCastling(blackCastling));
    } else if (color === colorBlack) {
      this.setState({ blackCastling: value });

      onCastling(this.convertCastling(whiteCastling), this.convertCastling(value));
    }
  };

  convertCastling = (castlingValue) => {
    if (castlingValue.length) {
      return castlingValue.join("");
    }

    return "";
  };

  handleColor = (e) => {
    const { onColorChange } = this.props;

    onColorChange(e.target.value);
  };

  render() {
    const {
      color,
      onStartPosition,
      onClear,
      onFlip,
      onFen,
      fen,
      translate,
      history,
      classes,
    } = this.props;
    const { whiteCastling, blackCastling } = this.state;

    return (
      <div className={classes.main}>
        <div className={classes.head}>
          <Button
            id="back-to-play"
            className={classes.backButton}
            onClick={() => history.push(RESOURCE_EXAMINE)}
          >
            {translate("backToPlay")}
          </Button>
          <h2 className={classes.title}>{translate("boardSetUp")}</h2>
        </div>
        <div className={classes.content}>
          <div className={classes.colorBlock}>
            <Radio.Group
              id="change-color-radio"
              initialValues={colorWhiteLetter}
              value={color}
              onChange={this.handleColor}
            >
              <Radio.Button disabled={color === colorWhite} value={colorWhiteLetter}>{translate("whiteToPlay")}</Radio.Button>
              <Radio.Button disabled={color === colorBlack} value={colorBlackLetter}>{translate("blackToPlay")}</Radio.Button>
            </Radio.Group>
          </div>
          <div className={classes.castling}>
            <h3 className={classes.name}> {translate("castling")}</h3>
            <div className={classes.castlingWrap}>
              <div className={classes.block}>
                <h3 className={classes.checkName}>{translate("white")}</h3>
                <Checkbox.Group
                  title={translate("whiteCastling")}
                  options={whiteCastlingOptions}
                  value={whiteCastling}
                  name={colorWhite}
                  onChange={(data) => this.handleCastling(colorWhite, data)}
                />
              </div>
              <div className={classes.block}>
                <h3 className={classes.checkName}>{translate("black")}</h3>
                <Checkbox.Group
                  title={translate("blackCastling")}
                  options={blackCastlingOptions}
                  value={blackCastling}
                  name={colorBlack}
                  onChange={(data) => this.handleCastling(colorBlack, data)}
                />
              </div>
            </div>
          </div>

          <div className={classes.buttonList}>
            <Button
              className={classNames(classes.button, classes.buttonStartingPos)}
              onClick={onStartPosition}
            >
              {translate("startingPosition")}
            </Button>
            <Button className={classNames(classes.button, classes.buttonClear)} onClick={onClear}>
              {translate("clearBoard")}
            </Button>
            <Button className={classNames(classes.button, classes.buttonFlip)} onClick={onFlip}>
              {translate("flipBoard")}
            </Button>
          </div>
          <div className={classes.fenBlock}>
            <h3 className={classes.name}> {translate("fen")}</h3>
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

export default compose(
  withTracker(() => {
    return {
      css: mongoCss.findOne(),
    };
  }),
  injectSheet(dynamicStyles),
  translate("Editor.EditorRightSidebar"),
  withRouter
)(EditorRightSidebar);
