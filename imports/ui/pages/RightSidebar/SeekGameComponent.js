import React from "react";
export default class SeekGameComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      trial: 0
    };
  }

  render() {
    return (
      <div>
        <div style={{ backgroundColor: "#efefef", padding: "15px" }} />
      </div>
    );
  }
}
