import React from "react";

export default class FileUpload extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.fileInput = React.createRef();
  }

  uploadFile() {}

  handleSubmit(event) {
    event.preventDefault();
    //alert(`Selected file - ${this.fileInput.current.files[0].name}`);
    this.uploadFile(this.fileInput.current.files[0]);
  }

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
