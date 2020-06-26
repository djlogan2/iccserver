import React, { Component } from "react";
import { Input, Upload, message, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { Meteor } from "meteor/meteor";

import buildPgn from "./../../../helpers/build-pgn";
// import { FS } from "meteor/cfs:base-package";
// import "../../../../lib/client/pgnimportfilesystem.client";
// const PgnImports = new FS.Collection("uploaded_pgns", {
//   stores: [new FS.Store.PGNImportFileSystem()]
// });

const { TextArea } = Input;

class FenPgn extends Component {
  constructor() {
    super();
    this.state = {
      fen: "",
      pgn: ""
    };
  }

  handleFenChange = (e) => {
    this.setState({ fen: e.target.value });
  };

  handlePgnChange = (e) => {
    this.setState({ pgn: e.target.value });
  };

  render() {

    const props = {
      name: 'file',
      action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
      headers: {
        authorization: 'authorization-text',
      },
      onChange(info) {
        if (info.file.status !== 'uploading') {
          console.log(info.file, info.fileList);
        }
        if (info.file.status === 'done') {
          message.success(`${info.file.name} file uploaded successfully`);
        } else if (info.file.status === 'error') {
          message.error(`${info.file.name} file upload failed.`);
        }
      },
    };

    let pgn = buildPgn(this.props.moveList);


    return (
      <div className="fen-png">
        <div className="fen-png__content">
          <label>Fen</label>
          <Input
            value={this.props.fen}
            onChange={this.handleFenChange}
            placeholder="Your message"
          />
          <label>Pgn</label>
          <TextArea
            row={4}
            value={pgn}
            onChange={this.handlePgnChange}
            placeholder="1. f3 d6 2. e4 Nf6 3. Nh3 Nxe4"
          />
        </div>
        <div className="fen-pgn__bottom">
          <Button className="fen-pgn__button" type="primary">
            Import FEN
          </Button>
          {/* <Button className="fen-pgn__button" type="primary">
            Import PGN
          </Button> */}
          <Upload {...props}>
            <Button  type="primary" className="fen-pgn__button">
              <UploadOutlined /> Import PGN
            </Button>
          </Upload>
        </div>
      </div>
    );
  }
}

export default FenPgn;
