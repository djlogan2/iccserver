import React, { Component } from "react";
import { Input, Button, notification } from "antd";
import { Meteor } from "meteor/meteor";

import { Logger } from "../../../../../../lib/client/Logger";
import { ImportedPgnFiles } from "../../../../../../lib/client/importpgnfiles";
import { exportGameObjectToPGN } from "../../../../../../lib/exportpgn";

const log = new Logger("client/FenPgn_js");

const { TextArea } = Input;

class FenPgn extends Component {
  constructor(props) {
    super(props);
    this.state = { pgn: "" };
  }

  componentDidMount() {
    this.loadPgn();
  }

  // componentWillReceiveProps(nextProps) {
  //   if (nextProps.game.variations.movelist.length !== this.props.game.variations.movelist.length) {
  //     this.loadPgn();
  //   }
  // }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.game.variations.movelist.length !== this.props.game.variations.movelist.length) {
      this.loadPgn();
    }
  }

  handlePgnLoaded = () => {
    notification.open({
      message: "PGN successfully loaded"
    });
  };

  loadPgn = () => {
    const pgn = exportGameObjectToPGN(this.props.game);
    this.setState({ pgn: pgn.pgn });
  };

  handleFenChange = e => {
    let newFen = e.target.value;

    Meteor.call("loadFen", "loadFen", this.props.game._id, newFen, err => {
      if (err) {
        log.error(err.reason);
      }
    });
  };

  handlePgnChange = e => {
    if (!e.target.value || !e.target.value.length) return;
    Meteor.call("importPGNIntoExaminedGame", "ipieg", this.props.game._id, e.target.value, err => {
      if (err) {
        log.error(err.reason);
      }
    });
  };

  changeFilehandler = event => {
    let file = event.target.files[0];
    let self = this;

    if (!!file) {
      ImportedPgnFiles.insert({
        file: file,
        meta: {
          creatorId: Meteor.userId()
        },
        transport: "http",
        onUploaded: (err, fileRef) => {
          debugger;
          self.props.onPgnUpload(fileRef);
          self.handlePgnLoaded();
        },
        streams: "dynamic",
        chunkSize: "dynamic"
      });
    }
  };

  render() {
    return (
      <div className="fen-png">
        <div className="fen-png__content">
          <label>FEN</label>
          <Input
            value={this.props.game.fen}
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
          <a href={"export/pgn/game/" + this.props.game._id}>
            <Button className="fen-pgn__button" type="primary">
              PGN Export
            </Button>
          </a>
          <label htmlFor="files" className="ant-btn fen-pgn__button ant-btn-primary">
            {" "}
            <i>
              <img src="images/pgn-import-icon.png" alt="pgn-import-icon" />
            </i>{" "}
            PGN Import
          </label>
          <input
            id="files"
            className="ant-btn fen-pgn__button ant-btn-primary"
            type="file"
            onChange={e => this.changeFilehandler(e)}
          />
        </div>
      </div>
    );
  }
}

export default FenPgn;
