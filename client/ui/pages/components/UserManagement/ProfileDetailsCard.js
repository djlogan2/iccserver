import React, { Component } from "react";
import { Button, Card, Input, notification } from "antd";
import { compose } from "redux";

import { translate } from "../../../HOCs/translate";
import { EMAIL_PROPERTY, USERNAME_PROPERTY } from "../../../../constants/systemConstants";
import injectSheet from "react-jss";
import { dynamicUserProfileStyles } from "./dynamicUserProfileStyles";
import { withTracker } from "meteor/react-meteor-data";
import { ClientMessagesCollection, mongoCss } from "../../../../../imports/api/client/collections";
import withClientMessages from "../../../HOCs/withClientMessages";
import { Meteor } from "meteor/meteor";

class ProfileDetailsCard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: "",
      email: "",
    };
  }

  handleInputChange = (property) => (event) => {
    this.setState({ [property]: event.target.value });
  };
  getClientMessage = (id) => {
    return ClientMessagesCollection.findOne({ client_identifier: id });
  };

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
        } else {
          notification.open({
            message: err.reason,
            description: null,
            duration: 5,
          });
        }
      });
    }

    if (email && /^([a-zA-Z0-9_\-.+]+)@([a-zA-Z0-9_-]+).([a-zA-Z0-9_\-.]+)$/g.test(email)) {
      Meteor.call("updateCurrentEmail", "update_current_email", email, (err, res) => {
        if (!err) {
          const messages = this.getClientMessage("update_current_email");
          notification.open({
            // message: translate("notifications.emailChanged"),
            message: translate(`notifications.${messages.message}`),
            description: null,
            duration: 5,
          });
        } else {
          notification.open({
            message: err.reason,
            description: null,
            duration: 5,
          });
        }
      });
    }
  };

  render() {
    const { translate, classes } = this.props;
    const currentUser = Meteor.user();

    console.log(currentUser);

    return (
      <Card title={translate("cardTitle")} className={classes.card} bodyStyle={{ height: " 100%" }}>
        <div className={classes.mainDiv}>
          <div className={classes.avatarChangeDiv}>
            <img src="images/avatar.png" alt="logo" className={classes.avatar} />
            <Button disabled type="primary">
              {translate("uploadNewAvatar")}
            </Button>
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
      userClientMessages: ClientMessagesCollection.find({
        to: Meteor.userId(),
      }).fetch(),
    };
  }),
  translate("Profile.ProfileDetailsCard"),
  injectSheet(dynamicUserProfileStyles),
  withClientMessages
)(ProfileDetailsCard);
