import { Button, Input } from "antd";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import React from "react";
import { compose } from "redux";
import { mongoCss } from "../../../../../imports/api/client/collections";
import { Logger } from "../../../../../lib/client/Logger";
import { translate } from "../../../HOCs/translate";
import { withDynamicStyles } from "../../../HOCs/withDynamicStyles";

const log = new Logger("client/GameCommandsBlock_js");

class GameCommandsBlock extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: "",
    };
  }

  handleClick = () => {
    const { game } = this.props;
    const { value } = this.state;

    Meteor.call("addGameMove", "addGameMove", game._id, value, (error) => {
      if (error) {
        log.error(error);
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
          onChange={(event) => this.setState({ value: event.target.value })}
          placeholder={translate("inputCommand")}
          onPressEnter={this.handleClick}
        />
        <Button onClick={this.handleClick}>{translate("send")}</Button>
      </div>
    );
  }
}

export default compose(
  withTracker(() => {
    return {
      commandsCss: mongoCss.findOne(),
    };
  }),
  withDynamicStyles("commandsCss.commandsCss"),
  translate("Common.rightBarTop")
)(GameCommandsBlock);
