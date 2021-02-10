import React from "react";
import { Button } from "antd";
import { CheckOutlined, MinusOutlined, EditOutlined } from "@ant-design/icons";
import { RESOURCE_USERS } from "../../../../constants/resourceConstants";

export const renderEmail = (text, record) => record?.emails[0]?.address;
export const renderRating = ratingType => (text, record) => record?.ratings?.[ratingType]?.rating;
export const renderStatus = status => (text, record) => record?.status?.[status];
export const renderOnline = (text, record) =>
  !!record?.status?.online ? <CheckOutlined /> : <MinusOutlined />;

export const renderButtonEdit = history => (text, record) => (
  <Button
    icon={<EditOutlined />}
    onClick={() => history.push(`${RESOURCE_USERS}/${record.username}`)}
    type="primary"
  >
    Edit
  </Button>
);
