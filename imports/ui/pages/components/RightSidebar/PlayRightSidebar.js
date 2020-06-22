import React, { Component } from "react";
import { Tabs, Button } from "antd";
const { TabPane } = Tabs;

const PlayBlock = () => {
  return (
    <div className="play-block">
      <div className="play-block__top">
        <Button type="primary">3 min</Button>
        <Button type="primary">5 min</Button>
        <Button type="primary">10 min</Button>
        <Button type="primary">3 min</Button>
        <Button type="primary">5 min</Button>
        <Button type="primary">10 min</Button>
      </div>
      <div className="play-block__bottom">
        <Button className="play-block__btn-big" block>
          Create a game
        </Button>
        <Button className="play-block__btn-big" block>
          Play with a friend
        </Button>
        <Button className="play-block__btn-big" block>
          Play with the computer
        </Button>
      </div>
    </div>
  );
};

export default class ExamineRightSidebarBottom extends Component {
  constructor(props) {
    super();
  }

  componentWillReceiveProps(nextProps) {}

  render() {
    return (
      <Tabs className="examine-right-sidebar" defaultActiveKey="1" size="small" type="card">
        <TabPane tab={"Play"} key="play">
          <PlayBlock />
        </TabPane>

        <TabPane tab="observe" key="observe">
          observe
        </TabPane>
      </Tabs>
    );
  }
}
