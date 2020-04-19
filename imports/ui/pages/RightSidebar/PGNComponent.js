import React, { Component } from "react";

class PGN extends Component {
  render() {
    let id;
    
    let game=this.props.Gamedata.MoveList;
    if (!!game) id =game._id;
    return (
      <div style={{padding: "20px"}}>
        <label className="fen-label">FEN</label>
        <input className="form-control fen-input" />
        <label className="fen-label">PGN</label>
        <div className="">
          
          <a className="btn btn-primary pgn-btn" href={"export/pgn/game/" + id}>
            <i>
              <img src="images/pgn-export-icon.png" />
            </i>{" "}
            PGN Export
          </a>
          {" "}
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

export default PGN;
