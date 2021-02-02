import React, { Fragment } from "react";
import { Button, Input } from "antd";
import { translate } from "../../../HOCs/translate";

export default translate("Community.ChatInput")(
  ({ value, onChange, onMessage, translate, disabled }) => {
    const handleSubmit = e => {
      e.preventDefault();
      this.input.focus();
      onMessage();
    };
    const handleChange = e => {
      e.preventDefault();
      onChange(e.target.value);
    };

    return (
      <Fragment>
        <form className="chat-input" onSubmit={handleSubmit}>
          <Input
            disabled={disabled}
            ref={el => (this.input = el)}
            value={value}
            onChange={handleChange}
            placeholder={translate("yourMessage")}
          />
          <Button htmlType="submit">{translate("send")}</Button>
        </form>
      </Fragment>
    );
  }
);
