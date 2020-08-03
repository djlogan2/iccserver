import React, { Component } from "react";
import { Input, Button, notification } from "antd";
import { Meteor } from "meteor/meteor";

import { Logger } from "../../../../../../lib/client/Logger";
import { ImportedPgnFiles } from "../../../../../../lib/client/importpgnfiles";

const log = new Logger("client/FenPgn_js");

const { TextArea } = Input;

class FenPgn extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fen: props.fen,
      pgn: ""
    };
  }

  componentDidMount() {
    this.loadPgn();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.fen !== this.props.fen) {
      this.loadPgn();
      this.setState({
        fen: this.props.fen
      });
    }
  }

  handlePgnLoaded = () => {

    notification.open({
      message: "PGN successfully loaded"
    });
  };

  loadPgn = () => {
    // fetch("export/pgn/game/" + this.props.gameId, {
    //   headers: {
    //     "Content-Type": "application/json",
    //     Accept: "application/json"
    //   }
    // })
    //   .then(response => {
    //     debugger;
    //     return response.json();
    //   })
    //   .then(data => {
    //     debugger;
    //   });
    let that = this;
    Meteor.call("exportToPGN", "exportToPGN", this.props.gameId, (err, response) => {
      if (err) {
        log.error(err.reason);
      }
      that.setState({ pgn: response.pgn });
    });
  };

  handleFenChange = e => {
    let newFen = e.target.value;
    this.setState({ fen: newFen });

    Meteor.call("loadFen", "loadFen", this.props.gameId, newFen, (err, response) => {
      if (err) {
        log.error(err.reason);
      }
    });
  };

  handlePgnChange = e => {
    this.setState({ pgn: e.target.value });
  };

  changeFilehandler = event => {
    let file = event.target.files[0];
    let that = this;

    if (!!file) {

      ImportedPgnFiles.insert({
        file: file,
        meta: {
          creatorId: Meteor.userId()
        },
        transport: "http",
        onUploaded: (err, fileRef) => {
          debugger;
          that.props.onPgnUpload(fileRef);
          that.handlePgnLoaded();
          // Meteor.call("examineGame", "ExaminedGame", fileRef._id, true, err => {
          //   if (err) {
          //     log.error(err.reason);
          //   }
          // });
        },
        streams: "dynamic",
        chunkSize: "dynamic"
      });
    }
  };

  render() {
    // let pgn = buildPgn(this.props.moveList);

    return (
      <div className="fen-png">
        <div className="fen-png__content">
          <label>FEN</label>
          <Input
            value={this.state.fen}
            onChange={this.handleFenChange}
            placeholder="Your message"
          />
          <label>PGN</label>
          <TextArea
            row={4}
            value={this.state.pgn}
            onChange={this.handlePgnChange}
            placeholder="1. f3 d6 2. e4 Nf6 3. Nh3 Nxe4"
          />
        </div>
        <div className="fen-pgn__bottom">
          <a href={"export/pgn/game/" + this.props.gameId}>
            <Button className="fen-pgn__button" type="primary">
              PGN Export
            </Button>
          </a>
          <label htmlFor="files" className="ant-btn fen-pgn__button ant-btn-primary">
            {" "}
            <i>
              <img src="images/pgn-import-icon.png" />
            </i>{" "}
            PGN Import
          </label>
          <input
            id="files"
            className="ant-btn fen-pgn__button ant-btn-primary"
            // style={{ visibility: "hidden" }}
            type="file"
            onChange={e => this.changeFilehandler(e)}
          />
        </div>
      </div>
    );
  }
}

export default FenPgn;
