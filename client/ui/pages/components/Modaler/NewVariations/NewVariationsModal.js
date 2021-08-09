import React from "react";
import { Button, Modal } from "antd";
import {
  INSERT_PROPERTY,
  NEW_MAIN_LINE_PROPERTY,
  NEW_VARIATION_PROPERTY,
  OVERWRITE_PROPERTY
} from "../../../../../constants/systemConstants";

class NewVariationsModal extends React.Component {
  render() {
    const { visible, handleClick } = this.props;
    return (
      <Modal visible={visible} title={null} footer={null} closable={false}>
        <Button onClick={() => handleClick(NEW_VARIATION_PROPERTY)} block>
          New variation
        </Button>
        <Button onClick={() => handleClick(NEW_MAIN_LINE_PROPERTY)} block>
          New main line
        </Button>
        <Button onClick={() => handleClick(OVERWRITE_PROPERTY)} block>
          Overwrite
        </Button>
        <Button onClick={() => handleClick(INSERT_PROPERTY)} block>
          Insert
        </Button>
      </Modal>
    );
  }
}

export default NewVariationsModal;
