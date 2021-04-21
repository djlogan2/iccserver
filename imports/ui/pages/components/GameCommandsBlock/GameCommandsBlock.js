import React from "react";
import { Button, Input } from "antd";
import { withTracker } from "meteor/react-meteor-data";
import injectSheet from "react-jss";
import { compose } from "redux";
import { translate } from "../../../HOCs/translate";

import { mongoCss } from "../../../../api/client/collections";
import { dynamicStyles } from "./styles";
import { Meteor } from "meteor/meteor";

class GameCommandsBlock extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: ""
    };
  }

  handleClick = () => {
    const { game } = this.props;
    const { value } = this.state;

    Meteor.call("addGameMove", "addGameMove", game._id, value, error => {
      if (error) {
        console.error(error);
      } else {
        this.setState({ value: "" });
      }
    });
  };

  render() {
    const { classes, translate } = this.props;
    const { value } = this.state;

    return (
      <div className={classes.mainDiv}>
        <Input
          value={value}
          onChange={event => this.setState({ value: event.target.value })}
          placeholder={translate("inputCommand")}
        />
        <Button onClick={this.handleClick}>{translate("send")}</Button>
      </div>
    );
  }
}

export default compose(
  withTracker(() => {
    return {
      commandsCss: mongoCss.findOne()
    };
  }),
  injectSheet(dynamicStyles),
  translate("Common.rightBarTop")
)(GameCommandsBlock);
