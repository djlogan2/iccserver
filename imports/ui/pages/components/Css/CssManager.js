import { Meteor } from "meteor/meteor";
import { Logger } from "../../../../../lib/client/Logger";
import { Tracker } from "meteor/tracker";
import { Mongo } from "meteor/mongo";

const log = new Logger("Css/CssManager_js");
const mongoCss = new Mongo.Collection("css");
/**
 * CssManager
 */

export default class CssManager {
  constructor(css) {
    const us = this;

    // Meteor.call("userCss", css, function(error, result) {
    //   if (error) log.error(error);
    //   //us.css = result || developmentcss;
    // });

    Tracker.autorun(function() {
      Meteor.subscribe("css");
    });

    us._boardStyle = mongoCss.findOne("user");
    us._systemStyle = mongoCss.findOne("system");
  }

  /**
   *
   * @param squareColor 'b' or 'w' for the color of the square
   * @param piece null, or the piece that's on the square
   * @param color null, or the color of the piece that's on the square
   * @param side The number of pixels on the side of a square
   */
  squareStyle(squareColor, piece, color, side) {
    var style = { width: side, height: side };
    if (this._boardStyle.square.all)
      Object.assign(style, this._boardStyle.square.all);
    Object.assign(style, this._boardStyle.square[squareColor]);

    if (!!piece && !!color) {
      if (this._boardStyle.pieces.all)
        Object.assign(style, this._boardStyle.pieces.all);
      Object.assign(style, this._boardStyle.pieces[color][piece]);
    }

    return style;
  }
  flags(country) {
    var style = {};
    if (this._boardStyle.flags.all)
      Object.assign(style, this._boardStyle.flags.all);
    Object.assign(style, this._boardStyle.flags[country]);

    return style;
  }

  tagLine() {
    var style = {};
    Object.assign(style, this._boardStyle.tagLine.all);
    return style;
  }
  userName() {
    var style = {};
    Object.assign(style, this._boardStyle.userName.all);
    return style;
  }

  clock(time) {
    var style = {};
    Object.assign(style, this._boardStyle.clock.all);
    if (time <= 10) Object.assign(style, this._boardStyle.clock.alert);
    return style;
  }
  //This css code for Right sidebar
  settingIcon() {
    var style = {};
    Object.assign(style, this._systemStyle.settingIcon.all);
    return style;
  }
  rightTopContent() {
    var style = {};
    Object.assign(style, this._systemStyle.rightTopContent.all);
    return style;
  }
  rightBottomContent() {
    var style = {};
    Object.assign(style, this._systemStyle.rightBottomContent.all);
    return style;
  }

  buttonBackgroundImage(imageName) {
    // Object.assign(style, this._systemStyle.actionButtonImage.imageName);
    var style = this._systemStyle.buttonBackgroundImage[imageName];
    return style;
  }

  buttonStyle(buttonName) {
    var style = {};
    if (this._systemStyle.button.all)
      Object.assign(style, this._systemStyle.button.all);
    Object.assign(style, this._systemStyle.button[buttonName]);
    return style;
  }

  chatContent() {
    var style = {};
    Object.assign(style, this._systemStyle.chatContent.all);
    return style;
  }
  chatInputBox() {
    var style = {};
    Object.assign(style, this._systemStyle.chatInputBox.all);
    return style;
  }
  chatSendButton() {
    var style = {};
    Object.assign(style, this._systemStyle.chatSendButton.all);
    return style;
  }
  gameMoveList() {
    var style = {};
    Object.assign(style, this._systemStyle.gameMoveList.all);
    return style;
  }
  gameButtonMove() {
    var style = {};
    Object.assign(style, this._systemStyle.gameButtonMove.all);
    return style;
  }
  gameTopHeader() {
    var style = {};
    Object.assign(style, this._systemStyle.gameTopHeader.all);
    return style;
  }
  //LeftSideBarComponent MenuLink li
  showLg() {
    var style = {};
    Object.assign(style, this._systemStyle.showLg.all);
    return style;
  }
  pullRight() {
    var style = {};
    Object.assign(style, this._systemStyle.pullRight.all);
    return style;
  }
  drawSection() {
    var style = {};
    Object.assign(style, this._systemStyle.drawSection.all);
    return style;
  }
  drawSectionList() {
    var style = {};
    Object.assign(style, this._systemStyle.drawSectionList.all);
    return style;
  }
  tab() {
    var style = {};
    Object.assign(style, this._systemStyle.tab.all);
    return style;
  }
  tabList(tabName) {
    var style = {};
    if (this._systemStyle.tab.all)
      Object.assign(style, this._systemStyle.tabList.all);
    Object.assign(style, this._systemStyle.tabList[tabName]);
    return style;
  }
  tabContent() {
    var style = {};
    Object.assign(style, this._systemStyle.tabContent.all);
    return style;
  }

  tabListItem(tabActive) {
    var style = {};
    Object.assign(style, this._systemStyle.tabListItem.all);
    if (tabActive) Object.assign(style, this._systemStyle.tabListItem.active);
    return style;
  }
  TabIcon(tabName) {
    var style = {};
    if (this._systemStyle.TabIcon.all)
      Object.assign(style, this._systemStyle.TabIcon.all);
    Object.assign(style, this._systemStyle.TabIcon[tabName]);
    return style;
  }
  spanStyle(spanName) {
    var style = {};
    if (this._systemStyle.span.all)
      Object.assign(style, this._systemStyle.span.all);
    Object.assign(style, this._systemStyle.span[spanName]);
    return style;
  }
  challengeContent() {
    var style = {};
    Object.assign(style, this._systemStyle.challengeContent.all);
    return style;
  }
  competitionsListItem() {
    var style = {};
    Object.assign(style, this._systemStyle.competitionsListItem.all);
    return style;
  }
  tournamentContent() {
    var style = {};
    Object.assign(style, this._systemStyle.tournamentContent.all);
    return style;
  }

  //
  // TODO: There is no point in having canvas as a database item. Just put it directly into the component.
  //
  squareCanvasStyle(side) {
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
  internalRankAndFileStyle(which, color) {
    const style = {}; // width: side, height: side };

    if (this._boardStyle.internal_rank_and_file.all)
      Object.assign(style, this._boardStyle.internal_rank_and_file.all);

    Object.assign(style, this._boardStyle.internal_rank_and_file.color[color]);
    Object.assign(
      style,
      this._boardStyle.internal_rank_and_file.position[which]
    );

    return style;
  }

  /**
   *
   * @param side The number of pixels on the side of a square
   */
  externalRankAndFileStyle(side) {
    const style = { width: side, height: side };

    if (this._boardStyle.external_rank_and_file.all)
      Object.assign(style, this._boardStyle.external_rank_and_file.all);

    return style;
  }
}
