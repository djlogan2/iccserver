import React, { Component } from "react";
import { Images } from "../../../lib/client/userfiles";
import { withTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { isReadySubscriptions } from "../../utils/utils";
import { Logger } from "../../../lib/client/Logger";

const logger = new Logger("client/developer4_js");
class DeveloperContainer4 extends Component {
  state = {
    // Initially, no file is selected
    selectedFile: null,
    uploaded: null,
    which: null,
    config: null
  };

  // On file select (from the pop up)
  onFileChange = (event) => {
    // Update the state
    this.setState({ selectedFile: event.target.files[0] });
  };

  // On file upload (click the upload button)
  onFileUpload = () => {
    const self = this;
    const upload = Images.insert(
      {
        file: this.state.selectedFile, //formData,
        chunkSize: "dynamic",
        meta: {
          which: this.state.which || "testme",
          config: this.state.config || "default"
        },
      },
      false
    );

    upload.on("start", function () {
      //template.currentUpload.set(this);
    });

    upload.on("end", function (error, fileObj) {
      if (error) {
        alert(`Error during upload: ${error}`);
      } else {
        alert(`File "${fileObj.name}" successfully uploaded`);
        self.setState({ uploaded: fileObj._id });
      }
      //template.currentUpload.set(false);
    });

    upload.start();
  };

  // File content to be displayed after
  // file upload is complete
  fileData = () => {
    if (this.state.selectedFile) {
      return (
        <div>
          <h2>File Details:</h2>

          <p>File Name: {this.state.selectedFile.name}</p>

          <p>File Type: {this.state.selectedFile.type}</p>

          <p>Last Modified: {this.state.selectedFile.lastModifiedDate.toDateString()}</p>
        </div>
      );
    } else {
      return (
        <div>
          <br />
          <h4>Choose before Pressing the Upload button</h4>
        </div>
      );
    }
  };

  render() {
    let link;
    if (this.props.isReady) {
      logger.debug("render isready", this.state);
      const file = Images.findOne({ _id: this.state.uploaded }); //Images.find({ _id: this.state.uploaded });
      logger.debug("   file", file);
      if (!!file) link = file.link();
      logger.debug("   link=" + link);
    }
    //const xxx = this.props.isReady ? this.props.all_files.find(f => f._id === this.state.uploaded) : null;
    return (
      <div>
        <h1>Upload files</h1>
        <h3>File Upload using React!</h3>
        <div>
          <input type="file" onChange={this.onFileChange} />
          <button onClick={this.onFileUpload}>Upload!</button>
        </div>
        {this.fileData()}
        {!!link && <img src={link} />}
      </div>
    );
  }
}

export default withTracker(() => {
  const subscriptions = {
    files: Meteor.subscribe("files.images.all"),
  };

  return {
    isReady: isReadySubscriptions(subscriptions),
    //all_files: Images.find().fetch(),
  };
})(DeveloperContainer4);
