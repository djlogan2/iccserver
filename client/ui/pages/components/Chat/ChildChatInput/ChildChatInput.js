import React, { Fragment } from "react";
import { Button, Select } from "antd";
import { compose } from "redux";
import { translate } from "../../../../HOCs/translate";
import { withTracker } from "meteor/react-meteor-data";
import { mongoCss } from "../../../../../../imports/api/client/collections";
import injectSheet from "react-jss";
import { dynamicStyles } from "./dynamicStyles";

const { Option } = Select;

export default compose(
  withTracker(() => {
    return {
      css: mongoCss.findOne(),
    };
  }),
  injectSheet(dynamicStyles),
  translate("Community.ChildChatInput")
)(({ childChatTexts, selected, onChange, onMessage, translate, disabled, classes }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    this.select.focus();
    onMessage();
  };

  return (
    <Fragment>
      <form className={classes.main} onSubmit={handleSubmit}>
        <Select
          style={{ width: "100%" }}
          onChange={onChange}
          value={selected}
          disabled={disabled}
          ref={(el) => (this.select = el)}
        >
          {childChatTexts &&
            childChatTexts.map((chatItem) => (
              <Option value={chatItem._id} key={chatItem._id}>
                {chatItem.text}
              </Option>
            ))}
        </Select>
        <Button htmlType="submit">{translate("send")}</Button>
      </form>
    </Fragment>
  );
});
