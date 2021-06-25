import { get } from "lodash";

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
   * @param height
   */
  parentPopup(height) {
    const style = { height };
    Object.assign(style, this._systemStyle?.parentDivPopupMainPage);
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
    //Object.assign(style, this._systemStyle.drawActionSection);
    return {
      height: "auto",
      width: "auto",
      alignItems: "center",
      backgroundColor: "#fff",
      fontSize: "16px",
      color: "blue",
      padding: "2px 10px",
    };
  }
  drawSectionButton() {
    var style = {};
    Object.assign(style, this._systemStyle?.drawSectionButton);
    return style;
  }
  moveListParent() {
    var style = {};
    Object.assign(style, this._systemStyle?.moveListParent);
    return style;
  }
  gameMoveStyle() {
    var style = {};
    Object.assign(style, this._systemStyle?.gameMoveStyle);
    return style;
  }
  toggleMenuHeight() {
    var style = {};
    Object.assign(style, this._systemStyle?.toggleMenuHeight);
    return style;
  }
  innerPopupMain() {
    var style = {};
    Object.assign(style, this._systemStyle?.innerPopupMainPage);
    return style;
  }
  squareStyle(squareColor, side) {
    var style = { width: side, height: side };
    if (this._boardStyle?.square?.all) Object.assign(style, this._boardStyle.square.all);
    Object.assign(style, get(this._boardStyle, `square.${squareColor}`));
    return style;
  }
  imagePiecesize(side) {
    return { width: side, height: side };
  }
  fSquareStyle(squareColor, piece) {
    /*if (this._boardStyle.fsquare.all) Object.assign(style, this._boardStyle.fsquare.all);
    Object.assign(style, this._boardStyle.fsquare[squareColor]); */
    if (!!piece && !!squareColor) {
      return get(this._boardStyle, `fallendpieces.${squareColor}.${piece}`, {});
    }
  }

  imagePeice(piece, color) {
    var style = {};
    if (piece && color) {
      style = get(this._boardStyle, `pieces.${color}.${piece}`, {});
    }

    return style;
  }
  flags(country) {
    var style;
    style = get(this._boardStyle, `flags.${country}`, {});
    return style;
  }

  tagLine() {
    var style = {};
    Object.assign(style, this._boardStyle?.tagLine?.all);
    return style;
  }

  userName() {
    var style = {};
    Object.assign(style, this._boardStyle?.userName?.all);
    return style;
  }

  clock(time) {
    var style = {};
    Object.assign(style, this._boardStyle?.clock?.all);
    if (time <= 10) Object.assign(style, this._boardStyle?.clock?.alert);
    return style;
  }
  userFlag(side) {
    var style = { maxWidth: side, height: "auto", marginLeft: "10px" };
    Object.assign(style, this._boardStyle?.userFlag?.all);
    return style;
  }
  userPicture(side) {
    var style = { width: side, height: side };
    Object.assign(style, this._boardStyle?.userPicture?.all);
    return style;
  }
  clockMain(side) {
    var style = { width: side, height: side };
    Object.assign(style, this._boardStyle?.clockMain?.all);
    return style;
  }

  //This css code for Right sidebar
  settingIcon() {
    var style = {};
    Object.assign(style, this._systemStyle?.settingIcon?.all);
    return style;
  }
  rightTopContent() {
    var style = {};
    Object.assign(style, this._systemStyle?.rightTopContent?.all);
    return style;
  }
  rightBottomContent() {
    var style = {};
    Object.assign(style, this._systemStyle?.rightBottomContent?.all);
    return style;
  }

  buttonBackgroundImage(imageName) {
    return get(this._systemStyle, `buttonBackgroundImage.${imageName}`, {});
  }

  buttonStyle(buttonName) {
    var style = {};
    if (this._systemStyle?.button?.all) Object.assign(style, this._systemStyle.button.all);
    Object.assign(style, get(this._systemStyle, `button.${buttonName}`));
    return style;
  }

  chatContent() {
    var style = {};
    Object.assign(style, this._systemStyle?.chatContent?.all);
    return style;
  }
  inputBoxStyle(inputBoxName) {
    var style = {};
    if (this._systemStyle?.InputBox?.all) Object.assign(style, this._systemStyle.InputBox.all);
    Object.assign(style, get(this._systemStyle, `InputBox.${inputBoxName}`, {}));
    return style;
  }
  chatSendButton() {
    var style = {};
    Object.assign(style, this._systemStyle?.chatSendButton?.all);
    return style;
  }
  gameMoveList() {
    var style = {};
    Object.assign(style, this._systemStyle?.gameMoveList?.all);
    return style;
  }
  gameButtonMove() {
    var style = {};
    Object.assign(style, this._systemStyle?.gameButtonMove?.all);
    return style;
  }
  gameTopHeader() {
    var style = {};
    Object.assign(style, this._systemStyle?.gameTopHeader?.all);
    return style;
  }
  //LeftSideBarComponent MenuLink li
  showLg() {
    var style = {};
    Object.assign(style, this._systemStyle?.showLg?.all);
    return style;
  }
  pullRight() {
    var style = {};
    Object.assign(style, this._systemStyle?.pullRight?.all);
    return style;
  }
  drawSection() {
    var style = {};
    Object.assign(style, this._systemStyle?.drawSection?.all);
    return style;
  }
  drawSectionList() {
    var style = {};
    Object.assign(style, this._systemStyle?.drawSectionList?.all);
    return style;
  }
  tab() {
    var style = {};
    Object.assign(style, this._systemStyle?.tab?.all);
    return style;
  }
  tabList(tabName) {
    var style = {};
    if (this._systemStyle?.tab?.all) Object.assign(style, this._systemStyle.tabList.all);
    Object.assign(style, get(this._systemStyle, `tabList.${tabName}`, {}));
    return style;
  }
  tabContent() {
    var style = {};
    Object.assign(style, this._systemStyle?.tabContent?.all);
    return style;
  }
  tabSeparator() {
    var style = {};
    Object.assign(style, this._systemStyle?.tabSeparator?.all);
    return style;
  }
  subTabHeader() {
    var style = {};
    Object.assign(style, this._systemStyle?.subTabHeader?.all);
    return style;
  }
  matchUserScroll() {
    var style = {};
    Object.assign(style, this._systemStyle?.matchUserScroll?.all);
    return style;
  }
  matchUserButton() {
    var style = {};
    Object.assign(style, this._systemStyle?.matchUserButton?.all);
    return style;
  }
  tabListItem(tabActive, liName) {
    if (
      !!tabActive &&
      (tabActive === "Game" ||
        tabActive === "Play" ||
        tabActive === "Tournaments" ||
        tabActive === "Quick Pairing" ||
        tabActive === "Seek a Game" ||
        tabActive === "Match User")
    ) {
      const style = { cursor: "pointer" };
      Object.assign(style, this._systemStyle?.tabListItem1?.all);
      return style;
    } else {
      const style = { cursor: "pointer" };
      if (!!tabActive) {
        if (tabActive === "FEN/PGN") tabActive = "PGN";
        if (tabActive === "Room Chat") tabActive = "RoomChat";
        if (tabActive === "Examiner") tabActive = "Examiner";
        if (tabActive === "Follow Coach") tabActive = "FollowCoach";
        if (tabActive === "Game Library") tabActive = "GameLibrary";
        if (tabActive === "Game History") tabActive = "GameHistory";
        if (tabActive === "Adjourned Game") tabActive = "AdjournedGame";

        Object.assign(style, get(this._systemStyle, `tabListItem.${tabActive}`, {}));
      }
      Object.assign(style, this._systemStyle?.tabListItem?.all);
      if (
        liName === "FEN/PGN" ||
        liName === "Examiner" ||
        liName === "Follow Coach" ||
        liName === "Game Library" ||
        liName === "Adjourned Game" ||
        liName === "Game History"
      )
        Object.assign(style, { fontSize: "12px", whiteSpace: "nowrap", padding: "8px 4px" });

      return style;
    }
  }
  /**This style for gameseek and match Request user form */
  formMain() {
    var style = {};
    Object.assign(style, this._systemStyle?.formMain?.all);
    return style;
  }
  formMainHalf() {
    var style = {};
    Object.assign(style, this._systemStyle?.formMainHalf?.all);
    return style;
  }
  formLabelStyle(labelname) {
    var style = {};
    if (this._systemStyle?.formLabelStyle?.all)
      Object.assign(style, this._systemStyle.formLabelStyle.all);
    Object.assign(style, get(this._systemStyle, `formLabelStyle${labelname}`, {}));
    return style;
  }

  /**Endform style */

  TabIcon(tabName) {
    var style = {};
    if (this._systemStyle?.TabIcon?.all) Object.assign(style, this._systemStyle.TabIcon.all);
    Object.assign(style, get(this._systemStyle, `TabIcon.${tabName}`, {}));
    return style;
  }
  spanStyle(spanName) {
    var style = {};
    if (this._systemStyle?.span?.all) Object.assign(style, this._systemStyle.span.all);
    Object.assign(style, get(this._systemStyle, `span.${spanName}`, {}));
    return style;
  }
  challengeContent() {
    var style = {};
    Object.assign(style, this._systemStyle?.challengeContent?.all);
    return style;
  }
  competitionsListItem() {
    var style = {};
    Object.assign(style, this._systemStyle?.competitionsListItem?.all);
    return style;
  }
  tournamentContent() {
    var style = {};
    Object.assign(style, this._systemStyle?.tournamentContent?.all);
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
      zIndex: 2,
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
  internalRankAndFileStyle(which, color) {
    const style = {}; // width: side, height: side };

    if (this._boardStyle?.internal_rank_and_file?.all)
      Object.assign(style, this._boardStyle.internal_rank_and_file.all);

    Object.assign(style, get(this._boardStyle, `internal_rank_and_file.color.${color}`, {}));
    Object.assign(style, get(this._boardStyle, `internal_rank_and_file.position.${which}`, {}));

    return style;
  }

  /**
   *
   * @param side
   */

  externalFileStyle(side) {
    const style = { width: side, height: side / 5 };

    if (this._boardStyle?.external_file?.all)
      Object.assign(style, this._boardStyle.external_file.all);

    return style;
  }
  externalRankStyle(side) {
    const style = { width: side / 5, height: side };

    if (this._boardStyle?.external_rank?.all)
      Object.assign(style, this._boardStyle.external_rank.all);

    return style;
  }
}
