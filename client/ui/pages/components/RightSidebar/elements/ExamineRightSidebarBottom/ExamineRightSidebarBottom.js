import React, { Component } from "react";
import { compose } from "redux";
import KibitzChatApp from "../../../Chat/KibitzChatApp/KibitzChatApp";
import FenPgn from "../FenPgn/FenPgn";
import { Tabs } from "antd";
import { translate } from "../../../../../HOCs/translate";
import { withTracker } from "meteor/react-meteor-data";
import { mongoCss } from "../../../../../../../imports/api/client/collections";
import injectSheet from "react-jss";
import { dynamicStyles } from "./dynamicStyles";

const { TabPane } = Tabs;

class ExamineRightSidebarBottom extends Component {
  render() {
    const { game, onPgnUpload, translate, onImportedGames, classes } = this.props;

    return (
      <Tabs className={classes.container} defaultActiveKey="1" size="small" type="card">
        <TabPane tab={translate("tabs.chat")} key="chat">
          <KibitzChatApp isKibitz={true} gameId={game._id} />
        </TabPane>
        <TabPane tab={translate("tabs.fenPgn")} key="fen-png">
          <FenPgn game={game} onPgnUpload={onPgnUpload} onImportedGames={onImportedGames} />
        </TabPane>
        <TabPane tab={translate("tabs.games")} key="games">
          <div className={classes.game}>{translate("workInProgress")}</div>
        </TabPane>
      </Tabs>
    );
  }
}

export default compose(
  withTracker(() => {
    return {
      css: mongoCss.findOne(),
    };
  }),
  injectSheet(dynamicStyles),
  translate("Examine.ExamineRightSidebarBottom")
)(ExamineRightSidebarBottom);
