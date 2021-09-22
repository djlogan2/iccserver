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

  componentDidMount() {
    const currentUser = Meteor.user();
    this.setState({ username: currentUser.username, email: currentUser.emails[0].address });
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

    // TODO: DJL - While I love the fact that you are finally actually trying to get a client message for
    //       an action, I don't think this is going to work. Meteor.methods currently never return an error.
    //       This has actually been a long-outstanding question from me, to you. Should we modify how we
    //       return errors to the client? Should we throw MeteorError()'s, which would end up in the err
    //       field? When we can't, should we translate them or not? Is there a better way?
    //       At any rate, this isn't going to work. There is no "throw new MeteorError" in the server
    //       to trigger the existence of data in the "err" argument.
    if (username) {
      Meteor.call("updateCurrentUsername", "update_current_username", username, (err) => {
        if (!err) {
          const messages = this.getClientMessage("update_current_username");
          notification.open({
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
    } else {
      notification.open({
        message: translate("notifications.fillUsername"),
        description: null,
        duration: 5,
      });
    }

    if (email && /^([a-zA-Z0-9_\-.+]+)@([a-zA-Z0-9_-]+).([a-zA-Z0-9_\-.]+)$/g.test(email)) {
      Meteor.call("updateCurrentEmail", "update_current_email", email, (err, res) => {
        if (!err) {
          const messages = this.getClientMessage("update_current_email");
          notification.open({
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
    } else {
      notification.open({
        message: email
          ? translate("notifications.wrongEmail")
          : translate("notifications.fillEmail"),
        description: null,
        duration: 5,
      });
    }
  };

  render() {
    const { translate, classes } = this.props;
    const { username, email } = this.state;
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
                value={username}
                onChange={this.handleInputChange(USERNAME_PROPERTY)}
              />
              <Input
                placeholder={translate("email")}
                value={email}
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
