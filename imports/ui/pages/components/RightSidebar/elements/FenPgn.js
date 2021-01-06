import React, { Component } from "react";
import { Button, Input, notification } from "antd";
import { Meteor } from "meteor/meteor";
import { get } from "lodash";

import { translate } from "../../../../HOCs/translate";

import { Logger } from "../../../../../../lib/client/Logger";
import { ImportedPgnFiles } from "../../../../../../lib/client/importpgnfiles";
import { exportGameObjectToPGN } from "../../../../../../lib/exportpgn";

const log = new Logger("client/FenPgn_js");

const { TextArea } = Input;

class FenPgn extends Component {
  constructor(props) {
    super(props);

    this.state = {
      pgn: ""
    };
  }

  componentDidMount() {
    this.loadPgn();
  }

  componentDidUpdate(prevProps, prevState) {
    const { game } = this.props;

    if (prevProps.game.variations.movelist.length !== game.variations.movelist.length) {
      this.loadPgn();
    }
  }

  handlePgnLoaded = () => {
    const { translate } = this.props;

    notification.open({
      message: translate("pgnSuccessfullyUploaded")
    });
  };

  loadPgn = () => {
    const { game } = this.props;

    const pgn = exportGameObjectToPGN(game);
    this.setState({ pgn: pgn.pgn });
  };

  handleFenChange = e => {
    const { game } = this.props;
    const newFen = get(e, "target.value");

    Meteor.call("loadFen", "loadFen", game._id, newFen, err => {
      if (err) {
        log.error(err.reason);
      }
    });
  };

  handlePgnChange = e => {
    const { game } = this.props;
    const pgn = get(e, "target.value");

    if (pgn && pgn.length) {
      Meteor.call("importPGNIntoExaminedGame", "ipieg", game._id, pgn, err => {
        if (err) {
          log.error(err.reason);
        }
      });
    }
  };

  changeFilehandler = event => {
    const { onPgnUpload } = this.props;
    const file = get(event, "target.files[0]");

    if (!!file) {
      ImportedPgnFiles.insert({
        file,
        meta: {
          creatorId: Meteor.userId()
        },
        transport: "http",
        onUploaded: (err, fileRef) => {
          if (err) {
            console.error(err);
          }

          onPgnUpload(fileRef);
          this.handlePgnLoaded();
        },
        streams: "dynamic",
        chunkSize: "dynamic"
      });
    }
  };

  render() {
    const { translate, game, onImportedGames } = this.props;
    const { pgn } = this.state;

    return (
      <div className="fen-png">
        <div className="fen-png__content">
          <label>{translate("fen")}</label>
          <Input
            value={game.fen}
            onChange={this.handleFenChange}
            placeholder={translate("yourMessage")}
          />
          <label>{translate("pgn")}</label>
          <TextArea
            row={4}
            value={pgn}
            onChange={this.handlePgnChange}
            placeholder="1. f3 d6 2. e4 Nf6 3. Nh3 Nxe4"
          />
        </div>
        <div className="fen-pgn__bottom">
          <a href={"export/pgn/game/" + game._id}>
            <Button className="fen-pgn__button" type="primary">
              {translate("pgnExport")}
            </Button>
          </a>
          <Button className="fen-pgn__button" type="primary" onClick={onImportedGames}>
            {translate("importedGames")}
          </Button>
          <label
            htmlFor="files"
            className="ant-btn fen-pgn__button ant-btn-primary pgn-import-label"
          >
            <i>
              <img
                src="images/pgn-import-icon.png"
                alt="pgn-import-icon"
                className="pgn-import-icon"
              />
            </i>
            {translate("pgnImport")}
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

export default translate("Examine.FenPgn")(FenPgn);
