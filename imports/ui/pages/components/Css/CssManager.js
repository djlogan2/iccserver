import { Logger } from "../../../../../lib/client/Logger";
import { Mongo } from "meteor/mongo";

const log = new Logger("Css/CssManager_js");
const mongoCss = new Mongo.Collection("css");
/**
 * CssManager
 */

export default class CssManager {
  static _getBoardStyle() {
    log.debug("_getBoardStyle, records="); // + mongoCss.find().fetch());
    return (
      mongoCss.findOne({
        type: "board",
        name: "default-user"
      }) || {}
    );
  }
  static _getSystemStyle() {
    log.debug("_getSystemStyle, records="); // + mongoCss.find().fetch());
    return mongoCss.findOne({ type: "system" }) || {};
  }
  /**
   *
   * @param squareColor 'b' or 'w' for the color of the square
   * @param piece null, or the piece that's on the square
   * @param color null, or the color of the piece that's on the square
   * @param side The number of pixels on the side of a square
   */
  static squareStyle(squareColor, piece, color, side) {
    var style = { width: side, height: side };
    if (CssManager._getBoardStyle().square.all)
      Object.assign(style, CssManager._getBoardStyle().square.all);
    Object.assign(style, CssManager._getBoardStyle().square[squareColor]);

    if (!!piece && !!color) {
      if (CssManager._getBoardStyle().pieces.all)
        Object.assign(style, CssManager._getBoardStyle().pieces.all);
      Object.assign(style, CssManager._getBoardStyle().pieces[color][piece]);
    }

    return style;
  }

  static flags(country) {
    var style = {};
    if (CssManager.flags.all) Object.assign(style, CssManager.flags.all);
    Object.assign(style, CssManager.flags[country]);

    return style;
  }

  static tagLine() {
    var style = {};
    Object.assign(style, CssManager.tagLine.all);
    return style;
  }

  static userName() {
    var style = {};
    Object.assign(style, CssManager.userName.all);
    return style;
  }

  static clock(time) {
    var style = {};
    Object.assign(style, CssManager.clock.all);
    if (time <= 10) Object.assign(style, CssManager.clock.alert);
    return style;
  }

  //This css code for Right sidebar
  static settingIcon() {
    var style = {};
    Object.assign(style, CssManager.settingIcon.all);
    return style;
  }

  static rightTopContent() {
    var style = {};
    Object.assign(style, CssManager.rightTopContent.all);
    return style;
  }

  static rightBottomContent() {
    var style = {};
    Object.assign(style, CssManager.rightBottomContent.all);
    return style;
  }

  static buttonBackgroundImage(imageName) {
    // Object.assign(style, this._getSystemStyle().actionButtonImage.imageName);
    return CssManager.buttonBackgroundImage[imageName];
  }

  static buttonStyle(buttonName) {
    log.debug("Are we here?");
    var style = {};
    if (CssManager._getSystemStyle().button.all)
      Object.assign(style, CssManager._getSystemStyle().button.all);
    Object.assign(style, CssManager._getSystemStyle().button[buttonName]);
    return style;
  }

  static chatContent() {
    var style = {};
    Object.assign(style, CssManager.chatContent.all);
    return style;
  }

  static chatInputBox() {
    var style = {};
    Object.assign(style, CssManager.chatInputBox.all);
    return style;
  }

  static chatSendButton() {
    var style = {};
    Object.assign(style, CssManager.chatSendButton.all);
    return style;
  }

  static gameMoveList() {
    var style = {};
    Object.assign(style, CssManager.gameMoveList.all);
    return style;
  }

  static gameButtonMove() {
    var style = {};
    Object.assign(style, CssManager.gameButtonMove.all);
    return style;
  }

  static gameTopHeader() {
    var style = {};
    Object.assign(style, CssManager.gameTopHeader.all);
    return style;
  }

  //LeftSideBarComponent MenuLink li
  static showLg() {
    var style = {};
    Object.assign(style, CssManager.showLg.all);
    return style;
  }

  static pullRight() {
    var style = {};
    Object.assign(style, CssManager.pullRight.all);
    return style;
  }

  static drawSection() {
    var style = {};
    Object.assign(style, CssManager.drawSection.all);
    return style;
  }

  static drawSectionList() {
    var style = {};
    Object.assign(style, CssManager.drawSectionList.all);
    return style;
  }

  static tab() {
    var style = {};
    Object.assign(style, CssManager.tab.all);
    return style;
  }

  static tabList(tabName) {
    var style = {};
    if (CssManager.tab.all) Object.assign(style, CssManager.tabList.all);
    Object.assign(style, CssManager.tabList[tabName]);
    return style;
  }

  static tabContent() {
    var style = {};
    Object.assign(style, CssManager.tabContent.all);
    return style;
  }

  static tabListItem(tabActive) {
    var style = {};
    Object.assign(style, CssManager.tabListItem.all);
    if (tabActive) Object.assign(style, CssManager.tabListItem.active);
    return style;
  }
  static TabIcon(tabName) {
    var style = {};
    if (CssManager.TabIcon.all) Object.assign(style, CssManager.TabIcon.all);
    Object.assign(style, CssManager.TabIcon[tabName]);
    return style;
  }
  static spanStyle(spanName) {
    var style = {};
    if (CssManager._getSystemStyle().span.all)
      Object.assign(style, CssManager._getSystemStyle().span.all);
    Object.assign(style, CssManager._getSystemStyle().span[spanName]);
    return style;
  }
  static challengeContent() {
    var style = {};
    Object.assign(style, CssManager.challengeContent.all);
    return style;
  }
  static competitionsListItem() {
    var style = {};
    Object.assign(style, CssManager.competitionsListItem.all);
    return style;
  }
  static tournamentContent() {
    var style = {};
    Object.assign(style, CssManager.tournamentContent.all);
    return style;
  }

  //
  // TODO: There is no point in having canvas as a database item. Just put it directly into the component.
  //
  static squareCanvasStyle(side) {
    return {
      position: "absolute",
      top: 0,
      left: 0,
      zIndex: 2
    };
  }

  /**
   *
   * @param which Position of the text
   * @param color Color of the square
   */
  static internalRankAndFileStyle(which, color) {
    const style = {}; // width: side, height: side };

    if (CssManager._getBoardStyle().internal_rank_and_file.all)
      Object.assign(
        style,
        CssManager._getBoardStyle().internal_rank_and_file.all
      );

    Object.assign(
      style,
      CssManager._getBoardStyle().internal_rank_and_file.color[color]
    );
    Object.assign(
      style,
      CssManager._getBoardStyle().internal_rank_and_file.position[which]
    );

    return style;
  }

  /**
   *
   * @param side The number of pixels on the side of a square
   */
  static externalRankAndFileStyle(side) {
    const style = { width: side, height: side };

    if (CssManager._getBoardStyle().external_rank_and_file.all)
      Object.assign(
        style,
        CssManager._getBoardStyle().external_rank_and_file.all
      );

    return style;
  }
}
