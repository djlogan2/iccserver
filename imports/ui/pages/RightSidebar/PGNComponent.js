import React, { Component } from "react";
import { Meteor } from "meteor/meteor";

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

    if (!!file) {
      var msFile = new FS.File(file);
      msFile.creatorId = Meteor.userId();

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
              <img src="images/pgn-export-icon.png" alt="pgn-export-icon" />
            </i>
            PGN Export
          </a>
          <label htmlFor="files" className="btn btn-primary pgn-btn">
            <i>
              <img src="images/pgn-import-icon.png" alt="pgn-import-icon" />
            </i>
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
