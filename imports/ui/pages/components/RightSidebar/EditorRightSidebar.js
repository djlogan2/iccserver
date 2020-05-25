import React, { Component } from "react";
import { Checkbox, Radio, Input, Icon, List, Col, Row, Modal, Button, Avatar } from "antd";

import "./../../css/EditorRightSidebar.css";

const EditorRightSidebar = (props) => {
  const radioStyle = {
    display: "block",
    height: "30px",
    lineHeight: "30px"
  };

  const options = [{ label: "0-0", value: "0-0" }, { label: "0-0-0", value: "0-0-0" }];
  const handleFen = (e) => {
    props.onFen(e.target.value);
  }
  const handleColor = (e) => {
    props.onColorChange(e.target.value);
  }
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
            value={props.orientation}
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
                options={options}
                onChange={() => {}}
              />
            </div>
            <div className="editor-right-sidebar__block">
              <h3 className="editor-right-sidebar__check-name">Black</h3>
              <Checkbox.Group
                className="editor-right-sidebar__checkbox-list"
                options={options}
                onChange={() => {}}
              />
            </div>
          </div>
        </div>

        <div className="editor-right-sidebar__btn-list">
          <Button className="editor-right-sidebar__btn" onClick={props.onStartPosition}>Starting position</Button>
          <Button className="editor-right-sidebar__btn" onClick={props.onClear}>Clear board</Button>
          <Button className="editor-right-sidebar__btn" onClick={props.onFlip}>Flip board</Button>
        </div>
        <div className="editor-right-sidebar__fen-block">
          <h3 className="editor-right-sidebar__name">FEN</h3>
          <Input onChange={handleFen} value={props.fen} placeholder="Insert FEN here" />
        </div>
      </div>
    </div>
  );
};

export default EditorRightSidebar;
