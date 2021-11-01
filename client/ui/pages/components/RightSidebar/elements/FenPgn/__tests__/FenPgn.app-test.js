// TODO fix it

// import React from "react";
// import chai from "chai";
// import { mount } from "enzyme";
// import FenPgn from "../FenPgn";
// import sinon from "sinon";
// import { Meteor } from "meteor/meteor";
// import { ImportedPgnFiles } from "../../../../../../../../lib/client/importpgnfiles";

// describe("FenPgn component", () => {
//   const currentUser = {
//     username: "test",
//     email: "test@test.com",
//     _id: "fake_owner_id",
//     status: { game: "none" },
//   };

//   beforeEach(() => {
//     sinon.stub(Meteor, "user");
//     Meteor.user.returns(currentUser);

//     sinon.stub(Meteor, "userId");
//     Meteor.userId.returns(currentUser._id);

//     sinon.replace(Meteor, "call", (methodName, ...args) => {
//       if (methodName === "loadFen") {
//         args[3]("fake_error");
//       }

//       if (methodName === "importPGNIntoExaminedGame") {
//         args[3]("fake_error");
//       }
//     });

//     sinon.replace(ImportedPgnFiles, "insert", ({ onUploaded }) => {
//       onUploaded("fake_error", "file_ref");
//     });
//   });

//   afterEach(() => {
//     Meteor.user.restore();
//     Meteor.userId.restore();

//     sinon.restore();
//   });

//   const mockProps = {
//     game: {
//       _id: "KenXNazmbxTtG4Q6f",
//       actions: [],
//       analysis: [
//         {
//           id: "fXrs7jxXgc4GrHiJz",
//           username: "IMCY.21.8_EmilyK",
//         },
//       ],
//       arrows: [],
//       black: {
//         name: "Mr black",
//         rating: 1600,
//       },
//       circles: [],
//       computer_variations: [],
//       examiners: [
//         {
//           id: "fXrs7jxXgc4GrHiJz",
//           username: "IMCY.21.8_EmilyK",
//         },
//       ],
//       fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
//       isolation_group: "cty",
//       observers: [
//         {
//           id: "fXrs7jxXgc4GrHiJz",
//           username: "IMCY.21.8_EmilyK",
//         },
//       ],
//       owner: "fXrs7jxXgc4GrHiJz",
//       result: "*",
//       startTime: new Date(),
//       status: "examining",
//       tomove: "white",
//       variations: {
//         cmi: 0,
//         movelist: [{}],
//         ecocodes: [],
//       },
//       white: {
//         name: "Mr white",
//         rating: 1600,
//       },
//       wild: 0,
//     },
//     onImportedGames: () => null,
//     onPgnUpload: () => null,
//   };

//   it("should render", () => {
//     const component = mount(<FenPgn {...mockProps} />);

//     Promise.resolve(component).then(() => {
//       chai.assert.isDefined(component);

//       const inputFile = component.find("input#files");
//       inputFile.simulate("change", { target: { files: ["path_to_file"] } });

//       const inputFen = component.find("Input#fen-input");
//       inputFen.simulate("change", { target: { value: "" } });
//     });
//   });
// });
