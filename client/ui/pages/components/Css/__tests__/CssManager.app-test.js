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
});
