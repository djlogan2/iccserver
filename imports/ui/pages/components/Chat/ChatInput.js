import React, { Component, Fragment } from "react";
import { Input, Button } from "antd";

export default ({ value, onChange, onMessage }) => {
  const handleSubmit = e => {
    e.preventDefault();
    this.input.focus();
    onMessage();
  };
  return (
    <Fragment>
      <form className="chat-input" onSubmit={handleSubmit}>
        <Input
          ref={el => (this.input = el)}
          value={value}
          onChange={onChange}
          placeholder="Your message"
        />
        <Button htmlType="submit">Send</Button>
      </form>
    </Fragment>
  );
};
