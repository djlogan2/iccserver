import React, { Component, Fragment } from "react";
import { Input, Button } from "antd";

export default ({ value, onChange, onMessage }) => (
  <Fragment>
    <Input value={value} onChange={onChange} placeholder="Your message" />
    <Button onClick={onMessage}>Send</Button>
  </Fragment>
);
