import React, { Component } from "react";
import { Button, Card, Input, Upload, notification, Modal } from "antd";
import { compose } from "redux";
import { FS } from "meteor/cfs:base-package";

import { translate } from "../../../HOCs/translate";
import { EMAIL_PROPERTY, USERNAME_PROPERTY } from "../../../../constants/systemConstants";
import injectSheet from "react-jss";
import { dynamicUserProfileStyles } from "./dynamicUserProfileStyles";
import { withTracker } from "meteor/react-meteor-data";
import { mongoCss } from "../../../../../imports/api/client/collections";
import { Meteor } from "meteor/meteor";
import MugshotCollection from "../../../../../imports/collections/mugshot";

const getBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

class ProfileDetailsCard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: "",
      email: "",
      previewVisible: false,
      previewImage: "",
      previewTitle: "",
      fileList: [],
    };

    this.fileInput = React.createRef();
  }

  handleInputChange = (property) => (event) => {
    this.setState({ [property]: event.target.value });
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { fileList } = this.state;

    if ((!prevState.fileList.length && fileList.length) || prevState.fileList[0] !== fileList[0]) {
      const msFile = new FS.File(fileList[0]);
      msFile.creatorId = Meteor.userId();
      msFile.validated = false;
      MugshotCollection.insert(msFile, function (err, fileObj) {
        if (!err) {
          console.log(fileObj);
          // Meteor.call("validatemugshot", "mi1", fileObj._id);
        } else {
          // alert("Upload mugshot error: " + err);
        }
      });
    }
  }

  handleUpdate = () => {
    const { translate } = this.props;
    const { username, email } = this.state;

    if (username) {
      Meteor.call("updateCurrentUsername", "update_current_username", username, (err) => {
        if (!err) {
          notification.open({
            message: translate("notifications.usernameChanged"),
            description: null,
            duration: 5,
          });
        }
      });
    }

    if (email && /^([a-zA-Z0-9_\-.+]+)@([a-zA-Z0-9_-]+).([a-zA-Z0-9_\-.]+)$/g.test(email)) {
      Meteor.call("updateCurrentEmail", "update_current_email", email, (err) => {
        if (!err) {
          notification.open({
            message: translate("notifications.emailChanged"),
            description: null,
            duration: 5,
          });
        }
      });
    }
  };

  handleCancel = () => this.setState({ previewVisible: false });

  handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }

    this.setState({
      previewImage: file.url || file.preview,
      previewVisible: true,
      previewTitle: file.name || file.url.substring(file.url.lastIndexOf("/") + 1),
    });
  };

  handleChange = ({ fileList }) => this.setState({ fileList });

  render() {
    const { translate, classes } = this.props;
    const { fileList, previewVisible, previewImage, previewTitle } = this.state;

    const currentUser = Meteor.user();

    return (
      <Card title={translate("cardTitle")} className={classes.card} bodyStyle={{ height: " 100%" }}>
        <div className={classes.mainDiv}>
          <div id="avatar-change-div" className={classes.avatarChangeDiv}>
            <Upload
              listType="picture-card"
              fileList={fileList}
              onPreview={this.handlePreview}
              onChange={this.handleChange}
            >
              {fileList.length >= 1 ? null : (
                <Button type="primary">{translate("uploadNewAvatar")}</Button>
              )}
            </Upload>
            <Modal
              visible={previewVisible}
              title={previewTitle}
              footer={null}
              onCancel={this.handleCancel}
            >
              <img alt={previewTitle} style={{ width: "100%" }} src={previewImage} />
            </Modal>
          </div>
          <div className={classes.changeUsernameDiv}>
            <div className={classes.formUsernameDiv}>
              <Input
                placeholder={translate("username")}
                defaultValue={currentUser.username}
                onChange={this.handleInputChange(USERNAME_PROPERTY)}
              />
              <Input
                placeholder={translate("email")}
                defaultValue={currentUser.emails[0].address}
                onChange={this.handleInputChange(EMAIL_PROPERTY)}
              />
              <Button type="primary" onClick={this.handleUpdate}>
                {translate("update")}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }
}

export default compose(
  withTracker(() => {
    return {
      css: mongoCss.findOne(),
    };
  }),
  translate("Profile.ProfileDetailsCard"),
  injectSheet(dynamicUserProfileStyles)
)(ProfileDetailsCard);
