import React, { Component } from "react";
import Tabs from "./Tabs/Tabs";
import SeekGame from "./SeekGameComponent";
import QuickPairing from "./QuickPairingGameComponent";
import MatchUser from "./MatchUserComponent";
import { translate } from "../../HOCs/translate";
import "./Tabs/styles";

class RightBarToptabs extends Component {
  render() {
    const { translate, cssManager, gameRequest } = this.props;

    return (
      <Tabs cssManager={cssManager}>
        <div label={translate("quikpairing")}>
          <QuickPairing cssManager={cssManager} />
        </div>

        <div label={translate("seekgame")}>
          <SeekGame cssManager={cssManager} />
        </div>

        <div label={translate("matchuser")}>
          <MatchUser cssManager={cssManager} gameRequest={gameRequest} />
        </div>
      </Tabs>
    );
  }
}

export default translate("Common.rightBarTop")(RightBarToptabs);