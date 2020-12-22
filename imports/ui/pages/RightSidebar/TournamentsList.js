import React, { Component } from "react";
import Tournaments from "./Tournaments";

export default class TournamentsList extends Component {
  /**
   *
   * TournamentList Load from server side which bind in List state
   * Now we bind state List when Player click it open Game view Mode
   *
   *
   * Tournament details ( Game view Mode )
   Player can able to see the Tournament details.
   */

  render() {
    const { TournamentsList, cssManager } = this.props;

    return <Tournaments lists={TournamentsList} cssManager={cssManager} />;
  }
}
