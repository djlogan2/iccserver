import React from "react";
import { Spin, Space, Col } from "antd";

import AppWrapper from "./AppWrapper/AppWrapper";

export default ({ isPure }) => {
  if (isPure) {
    return (
      <AppWrapper>
        <Col span={24} className="loading__sidebar">
          <Space size="middle">
            <Spin size="large" />
          </Space>
        </Col>
      </AppWrapper>
    );
  }
  return (
    <AppWrapper>
      <Col span={14} className="loading__main">
        <Spin size="large" />
      </Col>
      <Col span={10} className="loading__sidebar">
        <Space size="middle">
          <Spin size="large" />
        </Space>
      </Col>
    </AppWrapper>
  );
};
