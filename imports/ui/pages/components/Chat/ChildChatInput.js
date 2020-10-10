import React, { Fragment } from "react";
import { Select, Button } from "antd";
import { Logger } from "../../../../../lib/client/Logger";
const { Option } = Select;

const log = new Logger("client/ChildChatInput_js");

export default ({ child_chat_texts, selected, onChange, onMessage }) => {
  const handleSubmit = e => {
    e.preventDefault();
    this.select.focus();
    onMessage();
  };

  log.trace("ChildChatInput render?", { child_chat_texts, selected });
  return (
    <Fragment>
      <form className="chat-input" onSubmit={handleSubmit}>
        <Select
          style={{ width: "100%" }}
          onChange={onChange}
          value={selected}
          ref={el => (this.select = el)}
        >
          {child_chat_texts.map(chatItem => (
            <Option value={chatItem._id}>{chatItem.text}</Option>
          ))}
        </Select>
        <Button htmlType="submit">Send</Button>
      </form>
    </Fragment>
  );
};
