import { Logger } from "../../../../../lib/client/Logger";
const log = new Logger("Css/CssManager_js");
/**
 * CssManager
 */

export default class CssManager {
  constructor(systemStyle, boardStyle) {
    this._systemStyle = systemStyle;
    this._boardStyle = boardStyle;
  }
  /**
   *
   * @param squareColor 'b' or 'w' for the color of the square
   * @param piece null, or the piece that's on the square
   * @param color null, or the color of the piece that's on the square
   * @param side The number of pixels on the side of a square
   */
  parentPopup(height, width) {
    var style = { width: width, height: height };
    Object.assign(style, this._systemStyle.parentDivPopupMainPage);
    return style;
  }
  outerPopupMain() {
    var style = {};
    Object.assign(style, this._systemStyle.outerPopupMainPage);
    return style;
  }
  fullWidth() {
    var style = {};
    Object.assign(style, this._systemStyle.fullWidth);
    return style;
  }
  drawActionSection() {
    var style = {};
    Object.assign(style, this._systemStyle.drawActionSection);
    return style;
  }
  drawSectionButton() {
    var style = {};
    Object.assign(style, this._systemStyle.drawSectionButton);
    return style;
  }
  moveListParent() {
    var style = {};
    Object.assign(style, this._systemStyle.moveListParent);
    return style;
  }
  gameMoveStyle() {
    var style = {};
    Object.assign(style, this._systemStyle.gameMoveStyle);
    return style;
  }
  toggleMenuHeight() {
    var style = {};
    Object.assign(style, this._systemStyle.toggleMenuHeight);
    return style;
  }
  innerPopupMain() {
    var style = {};
    Object.assign(style, this._systemStyle.innerPopupMainPage);
    return style;
  }
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
    /*
    var style = {};
    if (this._boardStyle.flags.all)
      Object.assign(style, this._boardStyle.flags.all);
    Object.assign(style, this._boardStyle.flags[country]);
    return style;*/
    var style;
    if (this._boardStyle.flags.all) style = this._boardStyle.flags.all;
    style = this._boardStyle.flags[country];
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
  userFlag(side) {
    var style = { maxWidth: side, height: "auto" };
    Object.assign(style, this._boardStyle.userFlag.all);
    return style;
  }
  userPicture(side) {
    var style = { width: side, height: side };
    Object.assign(style, this._boardStyle.userPicture.all);
    return style;
  }
  clockMain(side) {
    var style = { width: side, height: side };
    Object.assign(style, this._boardStyle.clockMain.all);
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
  inputBoxStyle(inputBoxName) {
    var style = {};
    if (this._systemStyle.InputBox.all)
      Object.assign(style, this._systemStyle.InputBox.all);
    Object.assign(style, this._systemStyle.InputBox[inputBoxName]);
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
  tabListItem(tabActive, hover) {
    var style = {};
    Object.assign(style, this._systemStyle.tabListItem.all);
    if (tabActive) {
      Object.assign(style, this._systemStyle.tabListItem[tabActive]);
      //  Object.assign(style, this._systemStyle.tabListItem.active);
    }
    if (hover) {
      Object.assign(style, this._systemStyle.tabListItem[hover]);
    }
    if (!hover) Object.assign(style, this._systemStyle.tabListItem.all);
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

  ribbonMoveList() {
    return {};
  }
  /**
   *
   * @param which Position of the text
   * @param color Color of the square
   */
  internalRankAndFileStyle(which, color, side) {
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
   * @param which Position of the text
   * @param color Color of the square
   */
  externalRankAndFileStyle(side) {
    const style = { width: side, height: side };

    if (this._boardStyle.external_rank_and_file.all)
      Object.assign(style, this._boardStyle.external_rank_and_file.all);

    return style;
  }
}
