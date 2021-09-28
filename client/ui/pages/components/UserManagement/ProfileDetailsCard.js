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
      isUserNameChange: false,
      isEmailChange: false,
      isLoading: false,
    };
  }

  checkRole(roleName) {
    return Meteor.roleAssignment
      .find()
      .fetch()
      .some((roleItem) => roleItem.role._id === roleName);
  }

  componentDidMount() {
    const currentUser = Meteor.user();
    this.setState({
      username: currentUser.username,
      email: currentUser?.emails[0]?.address || "",
      isEmailChange: this.checkRole("change_email"),
      isUserNameChange: this.checkRole("change_username"),
    });
  }

  handleInputChange = (property) => (event) => {
    this.setState({ [property]: event.target.value });
  };
  getClientMessage = (id) => {
    return ClientMessagesCollection.findOne({ client_identifier: id });
  };

  notify = (messages) => {
    const { translate } = this.props;
    notification.open({
      message: messages.map((msg) => translate(msg)).join(", "),
      description: null,
      duration: 5,
    });
  };

  handleUpdate = () => {
    const { username, email, isEmailChange, isUserNameChange } = this.state;

    // TODO: DJL - While I love the fact that you are finally actually trying to get a client message for
    //       an action, I don't think this is going to work. Meteor.methods currently never return an error.
    //       This has actually been a long-outstanding question from me, to you. Should we modify how we
    //       return errors to the client? Should we throw MeteorError()'s, which would end up in the err
    //       field? When we can't, should we translate them or not? Is there a better way?
    //       At any rate, this isn't going to work. There is no "throw new MeteorError" in the server
    //       to trigger the existence of data in the "err" argument.

    if (isEmailChange || isUserNameChange) {
      const messages = [];
      if (isUserNameChange && !username) {
        messages.push("notifications.fillUsername");
      }
      if (
        isEmailChange &&
        (!email || !/^([a-zA-Z0-9_\-.+]+)@([a-zA-Z0-9_-]+).([a-zA-Z0-9_\-.]+)$/g.test(email))
      ) {
        messages.push(email ? "notifications.wrongEmail" : "notifications.fillEmail");
      }
      if (messages.length) {
        this.notify(messages);
        return;
      }
    }

    this.setState({
      isLoading: true,
    });

    let promises = [];
    if (isUserNameChange) {
      promises.push(
        new Promise((resolve) => {
          Meteor.call("updateCurrentUsername", "update_current_username", username, (err) => {
            if (!err) {
              const messages = this.getClientMessage("update_current_username");
              Meteor.call("acknowledge.client.message", messages._id);
              resolve(messages.message);
            } else {
              resolve(err.reason);
            }
          });
        })
      );
    }

    if (isEmailChange) {
      promises.push(
        new Promise((resolve) => {
          Meteor.call("updateCurrentEmail", "update_current_email", email, (err) => {
            if (!err) {
              const messages = this.getClientMessage("update_current_email");
              Meteor.call("acknowledge.client.message", messages._id);
              resolve(messages.message);
            } else {
              resolve(err.reason);
            }
          });
        })
      );
    }

    Promise.all(promises)
      .then((value) => {
        this.notify(value);
      })
      .finally(() => {
        this.setState({
          isLoading: false,
        });
      });
  };

  render() {
    const { translate, classes } = this.props;
    const { username, email, isUserNameChange, isEmailChange, isLoading } = this.state;
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
                disabled={!isUserNameChange}
                onChange={this.handleInputChange(USERNAME_PROPERTY)}
              />
              <Input
                disabled={!isEmailChange}
                placeholder={translate("email")}
                value={email}
                onChange={this.handleInputChange(EMAIL_PROPERTY)}
              />
              {(isUserNameChange || isEmailChange) && (
                <Button type="primary" onClick={this.handleUpdate} loading={isLoading}>
                  {translate("update")}
                </Button>
              )}
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
