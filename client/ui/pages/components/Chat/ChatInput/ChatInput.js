import React, { Fragment } from "react";
import { Button, Input } from "antd";
import { compose } from "redux";
import { translate } from "../../../../HOCs/translate";
import { withTracker } from "meteor/react-meteor-data";
import { mongoCss } from "../../../../../../imports/api/client/collections";
import injectSheet from "react-jss";
import { dynamicStyles } from "./dynamicStyles";

export default compose(
  translate("Community.ChatInput"),
  withTracker(() => {
    return {
      css: mongoCss.findOne(),
    };
  }),
  injectSheet(dynamicStyles)
)(({ value, onChange, onMessage, translate, disabled, classes }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    this.input.focus();
    onMessage();
  };
  const handleChange = (e) => {
    e.preventDefault();
    onChange(e.target.value);
  };

  return (
    <Fragment>
      <form id="chat-form" className={classes.main} onSubmit={handleSubmit}>
        <Input
          id="chat-input"
          disabled={disabled}
          ref={(el) => (this.input = el)}
          value={value}
          onChange={handleChange}
          placeholder={translate("yourMessage")}
        />
        <Button id="send-message" htmlType="submit">
          {translate("send")}
        </Button>
      </form>
    </Fragment>
  );
});
