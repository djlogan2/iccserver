import React from "react";
import { compose } from "redux";
import { withTracker } from "meteor/react-meteor-data";
import { mongoCss } from "../../../../../../imports/api/client/collections";
import injectSheet from "react-jss";
import { dynamicStyles } from "./dynamicStyles";

const MessageItem = compose(
  withTracker(() => {
    return {
      css: mongoCss.findOne(),
    };
  }),
  injectSheet(dynamicStyles)
)(({ name, text, classes }) => {
  return (
    <div className={classes.main}>
      <div className={classes.name}>{name}</div>
      <p className={classes.text}>{text}</p>
    </div>
  );
});

export default MessageItem;
