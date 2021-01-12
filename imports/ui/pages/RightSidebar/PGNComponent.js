import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { get } from "lodash";

import { translate } from "../../HOCs/translate";
import { RESOURCE_EXPORT_PGN_GAME } from "../../../constants/resourceConstants";
import { ImportedGameCollection } from "../../../api/client/collections";

class PGN extends Component {
  changeFilehandler = event => {
    const { uploadPgn } = this.props;
    const file = event.target.files[0];

    if (!!file) {
      const msFile = new FS.File(file);
      msFile.creatorId = Meteor.userId();

      const confirm = ImportedGameCollection.insert(msFile, err => {
        if (err) {
          console.error("Upload PGN error: " + err);
        }
      });

      if (confirm) {
        uploadPgn();
      }
    }
  };

  render() {
    const { Gamedata, translate } = this.props;

    const id = get(Gamedata, "MoveList._id");

    return (
      <div style={{ padding: "20px" }}>
        <label className="fen-label">{translate("fen")}</label>
        <input className="form-control fen-input" />
        <label className="fen-label">{translate("pgn")}</label>
        <div>
          <a className="btn btn-primary pgn-btn" href={RESOURCE_EXPORT_PGN_GAME + id}>
            <i>
              <img src="images/pgn-export-icon.png" alt={translate("pgnExport")} />
            </i>
            {translate("pgnExport")}
          </a>
          <label htmlFor="files" className="btn btn-primary pgn-btn">
            <i>
              <img src="images/pgn-import-icon.png" alt={translate("pgnImport")} />
            </i>
            {translate("pgnImport")}
          </label>
          <input
            id="files"
            style={{ visibility: "hidden" }}
            type="file"
            onChange={e => this.changeFilehandler(e)}
          />
        </div>
      </div>
    );
  }
}

export default translate("Common.pgnActions")(PGN);
