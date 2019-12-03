import React from "react";
export default class SeekGameComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectValue: "Radish"
    };
  }
  handleDropdown(e) {
    alert(e.target.value);
    this.setState({ selectValue: e.target.value });
  }
  render() {
    return (
      <div>
        <div style={this.props.cssmanager.tabSeparator()} />
        <div style={this.props.cssmanager.matchUserScroll()}>
          <div style={{ width: "100%", marginBottom: "15px", float: "left" }}>
            <div style={{ width: "50%", float: "left" }}>
              <label style={{ fontWeight: "300", paddingRight: "10px" }}>Time Controll</label>
              <span style={{ paddingRight: "10px" }}>
                <select onChange={() => this.handleDropdown.bind(this)}>
                  <option value="10">10</option>
                  <option value="15">15</option>
                  <option value="20">20</option>
                  <option value="25">25</option>
                  <option value="30">30</option>
                </select>
              </span>
              <label style={{ fontWeight: "300", paddingRight: "10px" }}>Minute</label>
            </div>
            <div style={{ width: "50%", float: "left" }}>
              <span style={{ paddingRight: "10px" }}>
                <select onChange={() => this.handleDropdown.bind(this)}>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
              </span>
              <label style={{ fontWeight: "300", paddingRight: "10px" }}>Seconds per move</label>
            </div>
          </div>
          <div style={{ width: "100%", marginBottom: "15px", float: "left" }}>
            <div style={{ width: "50%", float: "left" }}>
              <label style={{ fontWeight: "300", paddingRight: "10px" }}>Type of Game</label>
              <span style={{ paddingRight: "10px" }}>
                <select
                  value={this.state.selectValue}
                  onChange={() => this.handleDropdown.bind(this)}
                >
                  <option value="chess">Chess</option>
                  <option value="king">KingHills</option>
                  <option value="rapid">Rapid</option>
                </select>
              </span>
            </div>
            <div style={{ width: "50%", float: "left" }}>
              <span style={{ paddingRight: "10px" }}>
                <input type="checkbox" value="Rated" />
                <label style={{ fontWeight: "300", paddingRight: "10px" }}>Rated</label>
              </span>
            </div>
          </div>
          <div style={{ width: "100%", marginBottom: "15px", float: "left" }}>
            <div style={{ width: "100%", float: "left" }}>
              <label style={{ fontWeight: "300", paddingRight: "10px" }}>Pick a color</label>
              <input type="radio" name="color" value="white" key={1} />
              <label
                style={{
                  fontWeight: "300",
                  paddingRight: "10px",
                  paddingLeft: "5px",
                  verticalAlign: "top"
                }}
              >
                white
              </label>
              <input type="radio" name="color" value="Black" key={2} />
              <label
                style={{
                  fontWeight: "300",
                  paddingRight: "10px",
                  paddingLeft: "5px",
                  verticalAlign: "top"
                }}
              >
                Black
              </label>
              <input type="radio" name="color" value="Random" key={3} />
              <label
                style={{
                  fontWeight: "300",
                  paddingRight: "10px",
                  paddingLeft: "5px",
                  verticalAlign: "top"
                }}
              >
                Random
              </label>
            </div>
          </div>
          <div style={{ width: "100%", marginBottom: "15px", float: "left" }}>
            <div style={{ textAlign: "center" }}>
              <button
                style={{
                  backgroundColor: "#1565c0",
                  textAlign: "center",
                  padding: "10px 20px",
                  border: "none",
                  color: "#FFF",
                  borderRadius: "5px"
                }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
