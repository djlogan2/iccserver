import React from "react";

import { SettingOutlined } from "@ant-design/icons";
import { Modal, Select, Checkbox } from "antd";
import CustomColorPicker from "../components/CustomColorPicker/CustomColorPicker";

const promotionOptions = [
  { label: "queen", value: "q" },
  { label: "rook", value: "r" },
  { label: "bishop", value: "b" },
  { label: "knight", value: "n" }
];

class PropertiesModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      raf: props.raf,
      smartMoves: props.smartMoves,
      smallSize: props.smallSize,
      showLegalMoves: props.showLegalMoves,
      promotionPieces: props.promotionPieces,
      perspective: props.perspective,
      boardColorsLight: props.boardColorsLight,
      boardColorsDark: props.boardColorsDark,
      wrapperColor: props.wrapperColor,
      filesColor: props.filesColor,
      ranksColor: props.ranksColor
    };
  }

  handleClick = () => {
    this.setState(prevState => {
      return {
        isOpen: !prevState.isOpen
      };
    });
  };

  handleCheckboxClick = property => event => {
    this.setState({ [property]: event.target.checked });
  };

  handleOk = () => {
    const { handleUpdate } = this.props;
    const { isOpen, ...rest } = this.state;

    handleUpdate(rest);

    this.setState({ isOpen: false });
  };

  render() {
    const {
      isOpen,
      raf,
      smartMoves,
      showLegalMoves,
      perspective,
      promotionPieces,
      boardColorsLight,
      boardColorsDark,
      wrapperColor,
      promotionColor,
      filesColor,
      ranksColor
    } = this.state;

    return (
      <React.Fragment>
        <SettingOutlined onClick={this.handleClick} style={{ fontSize: "54px", margin: "10px" }} />
        <Modal
          title="Properties"
          visible={isOpen}
          onOk={this.handleOk}
          onCancel={this.handleClick}
          width={900}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Checkbox
              style={{ marginLeft: 0 }}
              checked={smartMoves}
              onChange={this.handleCheckboxClick("smartMoves")}
            >
              Smart moves
            </Checkbox>
            <Checkbox
              style={{ marginLeft: 0 }}
              checked={showLegalMoves}
              onChange={this.handleCheckboxClick("showLegalMoves")}
            >
              Show legal moves
            </Checkbox>
            <span>
              {"Perspective: "}
              <Select
                placeholder="Perspective"
                defaultValue={perspective}
                onChange={value => this.setState({ perspective: value })}
              >
                <Select.Option value="white">White</Select.Option>
                <Select.Option value="black">Black</Select.Option>
              </Select>
            </span>
            <Checkbox
              style={{ marginLeft: 0 }}
              checked={raf.inside}
              onChange={event => this.setState({ raf: { ...raf, inside: event.target.checked } })}
            >
              Show coordinates inside the square
            </Checkbox>
            <span>
              {"Files: "}
              <Select
                placeholder="Files"
                defaultValue={raf.vertical}
                onChange={value => this.setState({ raf: { ...raf, vertical: value } })}
              >
                <Select.Option value="bottom">Bottom</Select.Option>
                <Select.Option value="top">Top</Select.Option>
                <Select.Option value="none">None</Select.Option>
              </Select>
            </span>
            <span>
              {"Ranks: "}
              <Select
                label="Ranks"
                placeholder="Ranks"
                defaultValue={raf.horizontal}
                onChange={value => this.setState({ raf: { ...raf, horizontal: value } })}
              >
                <Select.Option value="left">Left</Select.Option>
                <Select.Option value="right">Right</Select.Option>
                <Select.Option value="none">None</Select.Option>
              </Select>
            </span>
            <Checkbox.Group
              options={promotionOptions}
              defaultValue={promotionPieces}
              onChange={values => this.setState({ promotionPieces: values })}
            />
            <span>
              {"Board light colors: "}
              <CustomColorPicker
                color={boardColorsLight.default}
                onChange={color =>
                  this.setState({ boardColorsLight: { ...boardColorsLight, default: color.hex } })
                }
              />
              <CustomColorPicker
                color={boardColorsLight.active}
                onChange={color =>
                  this.setState({ boardColorsLight: { ...boardColorsLight, active: color.hex } })
                }
              />
            </span>
            <span>
              {"Board dark colors: "}
              <CustomColorPicker
                color={boardColorsDark.default}
                onChange={color =>
                  this.setState({ boardColorsDark: { ...boardColorsDark, default: color.hex } })
                }
              />
              <CustomColorPicker
                color={boardColorsDark.active}
                onChange={color =>
                  this.setState({ boardColorsDark: { ...boardColorsDark, active: color.hex } })
                }
              />
            </span>
            <span>
              {"Wrapper color: "}
              <CustomColorPicker
                color={wrapperColor}
                onChange={color => this.setState({ wrapperColor: color.hex })}
              />
            </span>
            <span>
              {"Promotion color: "}
              <CustomColorPicker
                color={promotionColor}
                onChange={color => this.setState({ promotionColor: color.hex })}
              />
            </span>
            <span>
              {"Files and ranks colors: "}
              <CustomColorPicker
                color={filesColor}
                onChange={color => this.setState({ filesColor: color.hex })}
              />
              <CustomColorPicker
                color={ranksColor}
                onChange={color => this.setState({ ranksColor: color.hex })}
              />
            </span>
          </div>
        </Modal>
      </React.Fragment>
    );
  }
}

export default PropertiesModal;
