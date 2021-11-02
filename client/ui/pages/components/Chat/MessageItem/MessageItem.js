import { withTracker } from "meteor/react-meteor-data";
import React from "react";
import { compose } from "redux";
import { mongoCss } from "../../../../../../imports/api/client/collections";
import { withDynamicStyles } from "../../../../HOCs/withDynamicStyles";

const MessageItem = compose(
  withTracker(() => {
    return {
      css: mongoCss.findOne(),
    };
  }),
  withDynamicStyles("css.messageItemCss")
)(({ name, text, classes }) => {
  return (
    <div className={classes.main}>
      <div className={classes.name}>{name}</div>
      <p className={classes.text}>{text}</p>
    </div>
  );
});

export default MessageItem;
