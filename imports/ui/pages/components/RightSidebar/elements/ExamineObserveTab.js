import React, { Component } from "react";
import { Input } from "antd";
import { AudioOutlined } from "@ant-design/icons";

const { Search } = Input;
export default class ExamineObserveTab extends Component {
  render() {
    let allGames = this.props.allGames;

    return (
      <div className="observer-tab">
        <Search
          placeholder="input search text"
          onSearch={value => console.log(value)}
          style={{ width: 200, marginRight: 20 }}
        />
        {allGames.map(item => (
          <div key={item} className="observe-list-item" style={{ marginRight: 20 }}>
            David
          </div>
        ))}
      </div>
    );
  }
}
