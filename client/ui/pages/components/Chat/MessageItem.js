import React from "react";

export default ({ name, text }) => {
  return (
    <div className="message-item">
      <div className="message-item__name">{name}</div>
      <p className="message-item__text" style={{ wordBreak: "break-word" }}>
        {text}
      </p>
    </div>
  );
};
