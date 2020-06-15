import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { FS } from "meteor/cfs:base-package";
import "../../../../lib/client/pgnimportfilesystem.client";
const PgnImports = new FS.Collection("uploaded_pgns", {
  stores: [new FS.Store.PGNImportFileSystem()]
});

class PGN extends Component {
  constructor(props) {
    super(props);
    this.state = {
      msg: null
    };
    this.changeFilehandler = this.changeFilehandler.bind(this);
  }
  changeFilehandler(event) {
    let file = event.target.files[0];

    let upload = false;
    if (!!file) {
      var msFile = new FS.File(file);
      ///console.log(msFile);
      msFile.creatorId = Meteor.userId();
      //msFile.owner=Meteor.userId();

      let confirm = PgnImports.insert(msFile, function(err, fileObj) {
        if (err) {
          alert("Upload PGN error: " + err);
        }
      });
      if (confirm) {
        this.props.uploadPgn();
      }
    }
  }

  render() {
    let id;

    let game = this.props.Gamedata.MoveList;
    if (!!game) id = game._id;
    return (
      <div style={{ padding: "20px" }}>
        <p>{this.state.msg}</p>
        <label className="fen-label">FEN</label>
        <input className="form-control fen-input" />
        <label className="fen-label">PGN</label>
        <div>
          <a className="btn btn-primary pgn-btn" href={"export/pgn/game/" + id}>
            <i>
              <img src="images/pgn-export-icon.png" />
            </i>{" "}
            PGN Export
          </a>{" "}
          <label htmlFor="files" className="btn btn-primary pgn-btn">
            {" "}
            <i>
              <img src="images/pgn-import-icon.png" />
            </i>{" "}
            PGN Import
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

export default PGN;
