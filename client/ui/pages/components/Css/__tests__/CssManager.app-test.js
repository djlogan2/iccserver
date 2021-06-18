import chai from "chai";
import CssManager from "../CssManager";

describe("CssManager class", () => {
  const instance = new CssManager({}, {});

  it("parentPopup function", () => {
    chai.assert.deepEqual(instance.parentPopup(20), { height: 20 });
  });

  it("outerPopupMain function", () => {
    chai.assert.deepEqual(instance.outerPopupMain(), {});
  });

  it("fullWidth function", () => {
    chai.assert.deepEqual(instance.fullWidth(), {});
  });

  it("drawActionSection function", () => {
    chai.assert.deepEqual(instance.drawActionSection(), {
      height: "auto",
      width: "auto",
      alignItems: "center",
      backgroundColor: "#fff",
      fontSize: "16px",
      color: "blue",
      padding: "2px 10px",
    });
  });

  it("drawSectionButton function", () => {
    chai.assert.deepEqual(instance.drawSectionButton(), {});
  });

  it("moveListParent function", () => {
    chai.assert.deepEqual(instance.moveListParent(), {});
  });

  it("gameMoveStyle function", () => {
    chai.assert.deepEqual(instance.gameMoveStyle(), {});
  });

  it("toggleMenuHeight function", () => {
    chai.assert.deepEqual(instance.toggleMenuHeight(), {});
  });

  it("innerPopupMain function", () => {
    chai.assert.deepEqual(instance.innerPopupMain(), {});
  });

  it("squareStyle function", () => {
    chai.assert.deepEqual(instance.squareStyle("white", 30), { height: 30, width: 30 });
  });

  it("imagePiecesize function", () => {
    chai.assert.deepEqual(instance.imagePiecesize(10), { height: 10, width: 10 });
  });

  it("fSquareStyle function", () => {
    chai.assert.deepEqual(instance.fSquareStyle("white", 10), {});
  });

  it("imagePeice function", () => {
    chai.assert.deepEqual(instance.imagePeice("pawn", "white"), {});
  });

  it("flags function", () => {
    chai.assert.deepEqual(instance.flags(), {});
  });

  it("tagLine function", () => {
    chai.assert.deepEqual(instance.tagLine(), {});
  });

  it("userName function", () => {
    chai.assert.deepEqual(instance.userName(), {});
  });

  it("clock function", () => {
    chai.assert.deepEqual(instance.clock(5), {});
  });

  it("userFlag function", () => {
    chai.assert.deepEqual(instance.userFlag(10), {
      maxWidth: 10,
      height: "auto",
      marginLeft: "10px",
    });
  });

  it("userPicture function", () => {
    chai.assert.deepEqual(instance.userPicture(10), { width: 10, height: 10 });
  });

  it("clockMain function", () => {
    chai.assert.deepEqual(instance.clockMain(10), { width: 10, height: 10 });
  });

  it("settingIcon function", () => {
    chai.assert.deepEqual(instance.settingIcon(), {});
  });

  it("rightTopContent function", () => {
    chai.assert.deepEqual(instance.rightTopContent(), {});
  });

  it("rightBottomContent function", () => {
    chai.assert.deepEqual(instance.rightBottomContent(), {});
  });

  it("buttonBackgroundImage function", () => {
    chai.assert.deepEqual(instance.buttonBackgroundImage("fake_name"), {});
  });

  it("buttonStyle function", () => {
    chai.assert.deepEqual(instance.buttonStyle("fake_name"), {});
  });

  it("chatContent function", () => {
    chai.assert.deepEqual(instance.chatContent(), {});
  });

  it("inputBoxStyle function", () => {
    chai.assert.deepEqual(instance.inputBoxStyle("fake_name"), {});
  });

  it("chatSendButton function", () => {
    chai.assert.deepEqual(instance.chatSendButton(), {});
  });

  it("gameMoveList function", () => {
    chai.assert.deepEqual(instance.gameMoveList(), {});
  });

  it("gameButtonMove function", () => {
    chai.assert.deepEqual(instance.gameButtonMove(), {});
  });

  it("gameTopHeader function", () => {
    chai.assert.deepEqual(instance.gameTopHeader(), {});
  });

  it("showLg function", () => {
    chai.assert.deepEqual(instance.showLg(), {});
  });

  it("pullRight function", () => {
    chai.assert.deepEqual(instance.pullRight(), {});
  });

  it("drawSection function", () => {
    chai.assert.deepEqual(instance.drawSection(), {});
  });

  it("drawSectionList function", () => {
    chai.assert.deepEqual(instance.drawSectionList(), {});
  });

  it("tab function", () => {
    chai.assert.deepEqual(instance.tab(), {});
  });

  it("tabList function", () => {
    chai.assert.deepEqual(instance.tabList("fake_name"), {});
  });

  it("tabContent function", () => {
    chai.assert.deepEqual(instance.tabContent(), {});
  });

  it("tabSeparator function", () => {
    chai.assert.deepEqual(instance.tabSeparator(), {});
  });

  it("subTabHeader function", () => {
    chai.assert.deepEqual(instance.subTabHeader(), {});
  });

  it("matchUserScroll function", () => {
    chai.assert.deepEqual(instance.matchUserScroll(), {});
  });

  it("matchUserButton function", () => {
    chai.assert.deepEqual(instance.matchUserButton(), {});
  });

  it("tabListItem function", () => {
    chai.assert.deepEqual(instance.tabListItem(), { cursor: "pointer" });
  });

  it("tabListItem function", () => {
    chai.assert.deepEqual(instance.tabListItem("Game"), { cursor: "pointer" });
  });

  it("tabListItem function", () => {
    chai.assert.deepEqual(instance.tabListItem("FEN/PGN", "Examiner"), {
      cursor: "pointer",
      fontSize: "12px",
      whiteSpace: "nowrap",
      padding: "8px 4px",
    });
  });

  it("tabListItem function", () => {
    chai.assert.deepEqual(instance.tabListItem("Room Chat", "Examiner"), {
      cursor: "pointer",
      fontSize: "12px",
      whiteSpace: "nowrap",
      padding: "8px 4px",
    });
  });

  it("tabListItem function", () => {
    chai.assert.deepEqual(instance.tabListItem("Examiner", "Examiner"), {
      cursor: "pointer",
      fontSize: "12px",
      whiteSpace: "nowrap",
      padding: "8px 4px",
    });
  });

  it("tabListItem function", () => {
    chai.assert.deepEqual(instance.tabListItem("Follow Coach", "Examiner"), {
      cursor: "pointer",
      fontSize: "12px",
      whiteSpace: "nowrap",
      padding: "8px 4px",
    });
  });

  it("tabListItem function", () => {
    chai.assert.deepEqual(instance.tabListItem("Game Library", "Examiner"), {
      cursor: "pointer",
      fontSize: "12px",
      whiteSpace: "nowrap",
      padding: "8px 4px",
    });
  });

  it("tabListItem function", () => {
    chai.assert.deepEqual(instance.tabListItem("Game History", "Examiner"), {
      cursor: "pointer",
      fontSize: "12px",
      whiteSpace: "nowrap",
      padding: "8px 4px",
    });
  });

  it("tabListItem function", () => {
    chai.assert.deepEqual(instance.tabListItem("Adjourned Game", "Examiner"), {
      cursor: "pointer",
      fontSize: "12px",
      whiteSpace: "nowrap",
      padding: "8px 4px",
    });
  });

  it("formMain function", () => {
    chai.assert.deepEqual(instance.formMain(), {});
  });

  it("formMainHalf function", () => {
    chai.assert.deepEqual(instance.formMainHalf(), {});
  });

  it("formLabelStyle function", () => {
    chai.assert.deepEqual(instance.formLabelStyle("fake_name"), {});
  });

  it("TabIcon function", () => {
    chai.assert.deepEqual(instance.TabIcon("fake_name"), {});
  });

  it("spanStyle function", () => {
    chai.assert.deepEqual(instance.spanStyle("fake_name"), {});
  });

  it("challengeContent function", () => {
    chai.assert.deepEqual(instance.challengeContent(), {});
  });

  it("competitionsListItem function", () => {
    chai.assert.deepEqual(instance.competitionsListItem(), {});
  });

  it("tournamentContent function", () => {
    chai.assert.deepEqual(instance.tournamentContent(), {});
  });

  it("squareCanvasStyle function", () => {
    chai.assert.deepEqual(instance.squareCanvasStyle(10), {
      position: "absolute",
      top: 0,
      left: 0,
      zIndex: 2,
    });
  });

  it("ribbonMoveList function", () => {
    chai.assert.deepEqual(instance.ribbonMoveList(), {});
  });

  it("internalRankAndFileStyle function", () => {
    chai.assert.deepEqual(instance.internalRankAndFileStyle("which", "color"), {});
  });

  it("externalFileStyle function", () => {
    chai.assert.deepEqual(instance.externalFileStyle(10), { width: 10, height: 2 });
  });

  it("externalRankStyle function", () => {
    chai.assert.deepEqual(instance.externalRankStyle(10), { width: 2, height: 10 });
  });
});
