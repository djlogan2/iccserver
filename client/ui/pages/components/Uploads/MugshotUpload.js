import React from "react";
import { Meteor } from "meteor/meteor";
import { FS } from "meteor/cfs:base-package";
import MugshotCollection from "../../../../../imports/collections/mugshot";

export default class MugshotUpload extends React.Component {
  constructor(props) {
    super(props);

    this.fileInput = React.createRef();
  }

  uploadFile = (file) => {
    const msFile = new FS.File(file);
    msFile.creatorId = Meteor.userId();
    msFile.validated = false;
    MugshotCollection.insert(msFile, function (err, fileObj) {
      if (!err) {
        console.log(fileObj, "uploaded, hey!");
        // Meteor.call("validatemugshot", "mi1", fileObj._id);
      } else {
        alert("Upload mugshot error: " + err);
      }
    });
  };

  handleSubmit = (event) => {
    event.preventDefault();
    this.uploadFile(this.fileInput.current.files[0]);
  };

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          Upload file:
          <input type="file" ref={this.fileInput} />
        </label>
        <br />
        <button type="submit">Submit</button>
      </form>
    );
  }
}
