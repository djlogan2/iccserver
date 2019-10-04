import React, { Component } from "react";

class Events extends Component {
  render() {
    return (
      <div className="event-content">
        <label className="fen-label">FEN</label>
        <input className="form-control fen-input" />
        <label className="fen-label">PGN</label>
        <div className="">
          <a className="btn btn-primary pgn-btn" href="#">
            <i>
              <img src="images/pgn-export-icon.png" />
            </i>{" "}
            PGN Export
          </a>
          <a
            className="btn btn-primary pgn-btn"
            href="#"
            data-toggle="modal"
            data-target="#PGNImport"
          >
            <i>
              <img src="images/pgn-import-icon.png" />
            </i>{" "}
            PGN Import
          </a>
        </div>
      </div>
    );
  }
}

export default Events;
