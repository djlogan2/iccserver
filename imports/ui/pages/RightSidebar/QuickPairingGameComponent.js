import React from "react";
export default class QuickPairingGameComponent extends React.Component {
  constructor(props) {
    super(props);

    this.buttons = [
      {
        label: "10 Min"
      },
      {
        label: "5 Min"
      },
      {
        label: "3 Min"
      },
      {
        label: "1 Min"
      },
      {
        label: "15 | 10"
      },
      {
        label: "3 | 2"
      },

      {
        label: "2 | 1"
      },

      {
        label: "More"
      }
    ];
  }
  handleClick = minut => {
    alert(minut);
  };
  render() {
    let content = [];
    this.buttons.forEach((btn, index) => {
      content.push(
        <button
          key={index}
          style={{
            backgroundColor: "#1565c0",
            textAlign: "center",
            padding: "7px 10px",
            border: "none",
            color: "#FFF",
            borderRadius: "5px"
          }}
        >
          {btn.label}
        </button>
      );
    });

    return (
      <div>
        <div style={this.props.cssManager.tabSeparator()} />
        <div style={this.props.cssManager.matchUserScroll()}>
          <div style={{ width: "100%", float: "left", marginBottom: "20px" }}>
            <button
              style={{
                backgroundColor: "#1565c0",
                width: "21%",
                margin: "2%",
                textAlign: "center",
                padding: "7px 10px",
                border: "none",
                color: "#FFF",
                borderRadius: "5px"
              }}
            >
              5 Min
            </button>
            <button
              style={{
                backgroundColor: "#1565c0",
                width: "21%",
                margin: "2%",
                textAlign: "center",
                padding: "7px 10px",
                border: "none",
                color: "#FFF",
                borderRadius: "5px"
              }}
            >
              10 Min
            </button>
            <button
              style={{
                backgroundColor: "#1565c0",
                width: "21%",
                margin: "2%",
                textAlign: "center",
                padding: "7px 10px",
                border: "none",
                color: "#FFF",
                borderRadius: "5px"
              }}
            >
              3 Min
            </button>
            <button
              style={{
                backgroundColor: "#1565c0",
                width: "21%",
                margin: "2%",
                textAlign: "center",
                padding: "7px 10px",
                border: "none",
                color: "#FFF",
                borderRadius: "5px"
              }}
            >
              1 Min
            </button>
          </div>
          <div style={{ width: "100%", float: "left", marginBottom: "20px" }}>
            <button
              style={{
                backgroundColor: "#1565c0",
                width: "21%",
                margin: "2%",
                textAlign: "center",
                padding: "7px 10px",
                border: "none",
                color: "#FFF",
                borderRadius: "5px"
              }}
            >
              15|10 Min
            </button>
            <button
              style={{
                backgroundColor: "#1565c0",
                width: "21%",
                margin: "2%",
                textAlign: "center",
                padding: "7px 10px",
                border: "none",
                color: "#FFF",
                borderRadius: "5px"
              }}
            >
              3|2 Min
            </button>
            <button
              style={{
                backgroundColor: "#1565c0",
                width: "21%",
                margin: "2%",
                textAlign: "center",
                padding: "7px 10px",
                border: "none",
                color: "#FFF",
                borderRadius: "5px"
              }}
            >
              2|1 Min
            </button>
            <button
              style={{
                backgroundColor: "#1565c0",
                width: "21%",
                margin: "2%",
                textAlign: "center",
                padding: "7px 10px",
                border: "none",
                color: "#FFF",
                borderRadius: "5px"
              }}
            >
              More
            </button>
          </div>
        </div>
      </div>
    );
  }
}
