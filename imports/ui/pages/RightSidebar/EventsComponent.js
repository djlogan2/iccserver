import React, { Component } from "react";
import { translate } from "../../HOCs/translate";

class Events extends Component {
  render() {
    const { translate } = this.props;

    return (
      <div className="event-content">
        <label className="fen-label">{translate("fen")}</label>
        <input className="form-control fen-input" />
        <label className="fen-label">{translate("pgn")}</label>
        <div className="">
          <a className="btn btn-primary pgn-btn" href="#">
            <i>
              <img src="images/pgn-export-icon.png" alt="pgn-export-icon" />
            </i>
            {translate("pgnExport")}
          </a>
          <a
            className="btn btn-primary pgn-btn"
            href="#"
            data-toggle="modal"
            data-target="#PGNImport"
          >
            <i>
              <img src="images/pgn-import-icon.png" alt="pgn-import-icon" />
            </i>
            {translate("pgnImport")}
          </a>
        </div>
      </div>
    );
  }
}

export default translate("Common.Events")(Events);
