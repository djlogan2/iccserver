// import React from "react";
// import chai from "chai";
// import { mount } from "enzyme";
// import { createBrowserHistory } from "history";
// import { Router } from "react-router-dom";
// import GameListModal from "../GameListModal";
//
// describe("GameListModal component", () => {
//   const history = createBrowserHistory();
//   const mockProps = {
//     isImported: false,
//     gameList: [
//       {
//         _id: "fake_id",
//         white: { name: "white" },
//         black: { name: "black" },
//         startTime: "1232143432",
//         is_imported: false,
//         result: "0-1",
//       },
//     ],
//     onClose: () => null,
//     visible: true,
//   };
//
//   const component = mount(
//     <Router history={history}>
//       <GameListModal {...mockProps} />
//     </Router>
//   );
//
//   it("should render", () => {
//     chai.assert.isDefined(component);
//   });
// });
