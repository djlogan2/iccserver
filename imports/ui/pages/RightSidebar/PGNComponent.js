import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { FS } from "meteor/cfs:base-package";
import "../../../../lib/client/pgnimportfilesystem.client";
const PgnImports = new FS.Collection("uploaded_pgns", {
  stores: [new FS.Store.PGNImportFileSystem()]
});


class PGN extends Component {

changeFilehandler(event){
  
  let file =event.target.files[0];
 if(!!file){
  var msFile = new FS.File(file);
  ///console.log(msFile);
  msFile.creatorId = Meteor.userId();
  //msFile.owner=Meteor.userId();

    
    PgnImports.insert(msFile, function(err, fileObj) {
    if (!err) {
      Meteor.call("process_uploaded_pgn", "mi1", fileObj._id);
    } else {
      alert("Upload PGN error: " + err);
      
    }
  });
 }
    
  
}


  render() {
    let id;
    
    let game=this.props.Gamedata.MoveList;
    if (!!game) id =game._id;
    return (
      <div style={{padding: "20px"}}>
        <label className="fen-label">FEN</label>
        <input className="form-control fen-input" />
        <label className="fen-label">PGN</label>
        <div>
          
          <a className="btn btn-primary pgn-btn" href={"export/pgn/game/" + id}>
            <i>
              <img src="images/pgn-export-icon.png" />
            </i>{" "}
            PGN Export
          </a>
          {" "}
         
            <label htmlFor ="files" className="btn btn-primary pgn-btn"> <i>
              <img src="images/pgn-import-icon.png" />
            </i>{" "}
            PGN Import</label>
      
           
            <input id="files" style={{visibility:"hidden"}} type="file" onChange={this.changeFilehandler.bind(this)} />
        </div>
      </div>
    );
  }
}

export default PGN;
