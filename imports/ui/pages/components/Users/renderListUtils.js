import React from "react";
import { Button } from "antd";
import CheckOutlined from "@ant-design/icons/CheckOutlined";
import MinusOutlined from "@ant-design/icons/MinusOutlined";
import EditOutlined from "@ant-design/icons/EditOutlined";
import { RESOURCE_USERS } from "../../../../constants/resourceConstants";

export const renderEmail = (text, record) => record?.emails[0]?.address;
export const renderRating = ratingType => (text, record) => record?.ratings?.[ratingType]?.rating;
export const renderStatus = status => (text, record) => record?.status?.[status];
export const renderOnline = (text, record) =>
  !!record?.status?.online ? <CheckOutlined /> : <MinusOutlined />;

export const renderButtonEdit = (history, translate) => (text, record) => (
  <Button
    style={{ backgroundColor: "#4F4F4F", color: "#FFFFFF" }}
    icon={<EditOutlined />}
    onClick={() => history.push(`${RESOURCE_USERS}/${record.username}`)}
  >
    {translate("edit")}
  </Button>
);
