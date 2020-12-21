import React, { Fragment } from "react";
import { Select, Button } from "antd";
import { translate } from "../../../HOCs/translate";

const { Option } = Select;

export default translate("Community.ChildChatInput")(
  ({ childChatTexts, selected, onChange, onMessage, translate }) => {
    const handleSubmit = e => {
      e.preventDefault();
      this.select.focus();
      onMessage();
    };

    return (
      <Fragment>
        <form className="chat-input" onSubmit={handleSubmit}>
          <Select
            style={{ width: "100%" }}
            onChange={onChange}
            value={selected}
            ref={el => (this.select = el)}
          >
            {childChatTexts.map(chatItem => (
              <Option value={chatItem._id}>{chatItem.text}</Option>
            ))}
          </Select>
          <Button htmlType="submit">{translate("Send")}</Button>
        </form>
      </Fragment>
    );
  }
);
