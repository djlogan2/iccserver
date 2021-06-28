import React from "react";
import { SketchPicker } from "react-color";

class CustomColorPicker extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isOpen: false,
    };
  }

  handleOpen = () => {
    this.setState({ isOpen: true });
  };

  handleClose = () => {
    this.setState({ isOpen: false });
  };

  render() {
    const { color, onChange } = this.props;
    const { isOpen } = this.state;

    return (
      <div>
        <div
          id="open-scetch-picker"
          style={{
            padding: "5px",
            background: "#fff",
            borderRadius: "1px",
            boxShadow: "0 0 0 1px rgba(0,0,0,.1)",
            display: "inline-block",
            cursor: "pointer",
          }}
          onClick={this.handleOpen}
        >
          <div
            style={{ width: "36px", height: "14px", borderRadius: "2px", backgroundColor: color }}
          />
        </div>
        {isOpen ? (
          <div style={{ position: "absolute", zIndex: "2" }}>
            <div
              id="close-scetch-picker"
              style={{
                position: "fixed",
                top: "0px",
                right: "0px",
                bottom: "0px",
                left: "0px",
              }}
              onClick={this.handleClose}
            />
            <SketchPicker color={color} onChange={(color) => onChange(color)} />
          </div>
        ) : null}
      </div>
    );
  }
}

export default CustomColorPicker;
