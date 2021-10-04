import React from "react";
import { Meteor } from "meteor/meteor";
import Avatar from "react-avatar-edit";
import { Button } from "antd";
import { compose } from "redux";
import { Mugshots } from "../../../../../lib/client/userfiles";
import { translate } from "../../../HOCs/translate";

class CustomAvatar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      preview: `mugshot/${Meteor.user()?.mugshot}`,
      src: null,
    };
  }

  onClose = () => {
    this.setState({ preview: `mugshot/${Meteor.user()?.mugshot}`, src: null });
  };

  onCrop = (preview) => {
    this.setState({ preview, src: preview });
  };

  handleUploadMugshot = () => {
    const { preview } = this.state;
    const upload = Mugshots.insert(
      {
        file: preview, //formData,
        chunkSize: "dynamic",
        isBase64: true,
        fileName: "mugshot.png",
      },
      false
    );

    upload.on("end", (error) => {
      if (error) {
        console.log("error: ", error);
      } else {
        this.setState({ preview: `mugshot/${Meteor.user()?.mugshot}`, src: null });
      }
    });

    upload.start();
  };

  render() {
    const { translate } = this.props;
    const { src, preview } = this.state;

    return (
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-around" }}>
          <Avatar width={390} height={295} onCrop={this.onCrop} onClose={this.onClose} src={src} />
          <img
            style={{ width: "295px", height: "295px", borderRadius: "50%" }}
            src={preview}
            alt="mugshot"
          />
        </div>
        {src && (
          <Button type="primary" onClick={this.handleUploadMugshot}>
            {translate("uploadNewAvatar")}
          </Button>
        )}
      </div>
    );
  }
}

export default compose(translate("Profile.ProfileDetailsCard"))(CustomAvatar);
