// import React from "react";
// import chai from "chai";
// import sinon from "sinon";
// import { mount } from "enzyme";
// import { GameRequestCollection, mongoCss } from "../../../../../../imports/api/client/collections";
// import { createBrowserHistory } from "history";
// import { Router } from "react-router-dom";
// import GameRequestModal from "../../Modaler/GameRequest/GameRequestModal";
// import LeftSidebar from "../../LeftSidebar/LeftSidebar";
// import AppWrapper from "../AppWrapper";
// import StubCollections from "meteor/hwillson:stub-collections";
// import { Factory } from "meteor/dburles:factory";
//
// describe.only("AppWrapper component", () => {
//   const history = createBrowserHistory();
//
//   beforeEach(() => {
//     StubCollections.stub([mongoCss, GameRequestCollection]);
//     sinon.stub(Meteor, "subscribe").returns({ subscriptionId: 0, ready: () => true });
//   });
//   afterEach(() => {
//     StubCollections.restore();
//     Meteor.subscribe.restore();
//   });
//
//   it.only("should render", () => {
//     Factory.define("css", mongoCss, cssRecord);
//     const test1 = Factory.create("css");
//     // Factory.define("game_requests", GameRequestCollection, {
//     //   _id: "matchrequest",
//     //   type: "match",
//     //   isolation_group: "public",
//     //   wild: 0,
//     //   rating_type: "standard",
//     //   time: 15,
//     //   inc_or_delay: 15,
//     //   delaytype: "inc",
//     //   rated: true,
//     //   matchingusers: "me",
//     // });
//     // const test2 = Factory.create("game_requests");
//     Tracker.flush();
//     const component = mount(
//       <Router history={history}>
//         <AppWrapper />
//       </Router>
//     );
//     // const grm = component.find(GameRequestModal);
//     const ls = component.find(LeftSidebar);
//     // chai.assert.equal(grm.length, 1);
//   });
//
//   const cssRecord = {
//     _id: "KgADJ67QkYzPDe8tS",
//     actionsCss: {
//       type: "actions",
//       main: {
//         marginBottom: "10px",
//         display: "flex",
//         flexDirection: "row",
//         flexWrap: "wrap",
//         width: "100%",
//       },
//       link: {
//         marginLeft: "10px",
//         marginRight: "10px",
//       },
//       element: {
//         width: "calc(50% - 15px)",
//       },
//     },
//     appWrapperCss: {
//       type: "appWrapper",
//       appWrapper: {
//         display: "flex",
//         height: "100vh",
//         minHeight: "50rem",
//         overflow: "hidden",
//       },
//       appWrapperRow: {
//         height: "100%",
//         overflow: "auto",
//         flexGrow: 1,
//       },
//     },
//     boardWrapperCss: {
//       type: "boardWrapper",
//       container: {
//         display: "flex",
//         justifyContent: "center",
//         alignItems: "center",
//         minHeight: "100vh",
//         background: "#292929",
//       },
//     },
//     challengeNotificationCss: {
//       type: "challengeNotification",
//       mainDiv: {
//         display: "flex",
//       },
//       imageAvatar: {
//         width: "3.2rem",
//         height: "3.2rem",
//         borderRadius: "50%",
//         overflow: "hidden",
//         background: "grey",
//         marginRight: "8px",
//         marginTop: "6px",
//       },
//       detailsDiv: {
//         color: "#8C8C8C",
//       },
//       actionsDiv: {
//         textAlign: "right",
//       },
//       declineButton: {
//         border: "0px",
//         color: "#E39335",
//         fontWeight: 500,
//         fontSize: "14px",
//         textTransform: "uppercase",
//       },
//       acceptButton: {
//         border: "0px",
//         color: "#1565C0",
//         fontWeight: 500,
//         fontSize: "14px",
//         textTransform: "uppercase",
//       },
//       divTitle: {
//         fontWeight: 500,
//         fontSize: "16px",
//         color: "#5b6785",
//       },
//       cancelSeekButton: {
//         backgroundColor: "#1565C0",
//         color: "#ffffff",
//       },
//       seekSearchDiv: {
//         display: "flex",
//         justifyContent: "space-between",
//       },
//       gameSeekSearchingDiv: {
//         marginTop: "0.5rem",
//       },
//     },
//     chatAppCss: {
//       type: "chatApp",
//       main: {
//         display: "flex",
//         flexGrow: 1,
//         height: "100%",
//         flexDirection: "column",
//       },
//       listWrap: {
//         display: "flex",
//         height: "calc(100% - 4.8rem)",
//         overflow: "auto",
//       },
//       messageList: {
//         padding: ".8rem 2.4rem",
//       },
//       inputBar: {
//         display: "flex",
//         flexShrink: 0,
//         padding: ".8rem 2.4rem",
//         height: "4.8rem",
//         borderTop: "1px solid  #EFF0F3",
//       },
//     },
//     chatInputCss: {
//       type: "chatInput",
//       main: {
//         display: "flex",
//         flexDirection: "row",
//         flexGrow: 1,
//       },
//     },
//     childChatInputCss: {
//       type: "chatInput",
//       main: {
//         display: "flex",
//         flexDirection: "row",
//         flexGrow: 1,
//       },
//     },
//     commandsCss: {
//       type: "commands",
//       mainDiv: {
//         display: "flex",
//         flexDirection: "row",
//         width: "95%",
//         marginLeft: "2.5%",
//         marginTop: "10px",
//         marginBottom: "10px",
//       },
//     },
//     communityBlockCss: {
//       type: "communityBlock",
//       roomBlock: {
//         paddingBottom: "1.6rem",
//         borderBottom: "1px solid #e5e5e7",
//       },
//       roomBlockHead: {
//         display: "flex",
//         flexDirection: "row",
//         justifyContent: "space-between",
//         alignItems: "center",
//         padding: "0.8rem 2.2rem",
//       },
//       roomBlockTitle: {
//         fontFamily: "Roboto",
//         fontStyle: "normal",
//         fontWeight: "500",
//         fontSize: "16px",
//         lineHeight: "19px",
//         margin: 0,
//       },
//       roomBlockList: {
//         padding: 0,
//         listStyle: "none",
//       },
//       roomBlockListItem: {
//         padding: "0.8rem 2.2rem",
//         fontFamily: "Roboto",
//         fontStyle: "normal",
//         fontWeight: "normal",
//         fontSize: "16px",
//         lineHeight: "19px",
//         cursor: "pointer",
//       },
//       roomBlockListItemActive: {
//         background: "rgba(91, 103, 133, 0.07)",
//         color: "#1565c0",
//         fontWeight: "bold",
//       },
//       roomBlockCreateButton: {
//         position: "relative",
//         top: "15px",
//         width: "80%",
//         left: "10%",
//       },
//       roomBlockPlus: {
//         border: "none",
//         background: "none",
//         fontSize: "2rem",
//         lineHeight: "2rem",
//         justifyContent: "center",
//         alignItems: "center",
//         paddingRight: 0,
//         paddingLeft: 0,
//         "&:hover": {
//           outline: "1px solid rgba(0, 0, 0, .3) !important",
//           backgroundColor: "transparent",
//           color: "#000000",
//         },
//       },
//     },
//     communityCss: {
//       type: "community",
//       sidebar: {
//         width: "29.1rem",
//         background: "rgba(91, 103, 133, 0.05)",
//         borderRight: "1px solid #e5e5e7",
//       },
//       messenger: {
//         display: "flex",
//         flexGrow: 1,
//         maxWidth: "calc(100% - 291px)",
//       },
//       messengerWithRightMenu: {
//         maxWidth: "calc(100% - 505px)",
//       },
//       rightBlock: {
//         width: "21.4rem",
//         background: "rgba(91, 103, 133, 0.05)",
//         borderLeft: "1px solid #e5e5e7",
//         maxWidth: "214px",
//       },
//     },
//     communityRightBlockCss: {
//       type: "communityRightBlock",
//       roomBlock: {
//         paddingBottom: "1.6rem",
//         borderBottom: "1px solid #e5e5e7",
//       },
//       roomBlockHead: {
//         display: "flex",
//         flexDirection: "row",
//         justifyContent: "space-between",
//         alignItems: "center",
//         padding: "0.8rem 2.2rem",
//       },
//       roomBlockTitle: {
//         fontFamily: "Roboto",
//         fontStyle: "normal",
//         fontWeight: "500",
//         fontSize: "16px",
//         lineHeight: "19px",
//         margin: 0,
//       },
//       roomBlockList: {
//         padding: 0,
//         listStyle: "none",
//       },
//       roomBlockListItem: {
//         padding: "0.8rem 2.2rem",
//         fontFamily: "Roboto",
//         fontStyle: "normal",
//         fontWeight: "normal",
//         fontSize: "16px",
//         lineHeight: "19px",
//         cursor: "pointer",
//       },
//       roomBlockListItemActive: {
//         background: "rgba(91, 103, 133, 0.07)",
//         color: "#1565c0",
//         fontWeight: "bold",
//       },
//       roomBlockCreateButton: {
//         position: "relative",
//         top: "15px",
//         width: "80%",
//         left: "10%",
//       },
//     },
//     cssKey: "default",
//     editorCss: {
//       type: "editor",
//       main: {
//         overflow: "hidden",
//         height: "100%",
//       },
//       rightSideBarWrapper: {
//         display: "flex",
//         flexDirection: "row",
//         height: "100%",
//       },
//     },
//     editorRightSidebarCss: {
//       type: "editorRightSidebar",
//       main: {
//         display: "flex",
//         flexGrow: 1,
//         flexDirection: "column",
//         background: "white",
//         height: "100%",
//       },
//       head: {
//         display: "flex",
//         flexDirection: "row",
//         alignItems: "center",
//         padding: "8px 23px",
//       },
//       backButton: {
//         background: "#1565C0",
//         borderRadius: "8px",
//         fontFamily:
//           "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
//         fontStyle: "normal",
//         fontWeight: 500,
//         fontSize: "12px",
//         lineHeight: "14px",
//         color: "#fff",
//       },
//       title: {
//         fontFamily:
//           "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
//         fontStyle: "normal",
//         fontWeight: 500,
//         fontSize: "16px",
//         lineHeight: "19px",
//         color: "#1565C0",
//         margin: 0,
//         padding: 0,
//         marginLeft: "16px",
//       },
//       content: {
//         display: "flex",
//         flexDirection: "column",
//         flexGrow: 1,
//         padding: "35px 23px",
//         borderTop: "1px solid #EFF0F3",
//       },
//       colorBlock: {
//         display: "flex",
//       },
//       castling: {
//         marginTop: "40px",
//       },
//       name: {
//         fontFamily:
//           "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
//         fontStyle: "normal",
//         fontWeight: 500,
//         fontSize: "16px",
//         lineHeight: "19px",
//         color: "#4F4F4F",
//         margin: 0,
//         padding: 0,
//         marginBottom: "4px",
//       },
//       castlingWrap: {
//         display: "flex",
//         flexDirection: "row",
//         marginTop: "16px",
//       },
//       block: {
//         display: "flex",
//         flexDirection: "row",
//         width: "50%",
//       },
//       checkName: {
//         paddingRight: "11px",
//         fontSize: "16px",
//         fontWeight: 400,
//         lineHeight: "19px",
//         fontFamily:
//           "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
//       },
//       buttonList: {
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "flex-start",
//         marginTop: "85px",
//       },
//       button: {
//         display: "flex",
//         alignItems: "flex-start",
//         marginBottom: "25px",
//         paddingLeft: "30px",
//         border: "none",
//       },
//       buttonStartingPos: {
//         background: "url('images/starting-position.svg')",
//         backgroundRepeat: "no-repeat",
//         backgroundPosition: "left center",
//         "&:active": {
//           background: "url('images/starting-position.svg')",
//           backgroundRepeat: "no-repeat",
//           backgroundPosition: "left center",
//         },
//         "&:hover": {
//           background: "url('images/starting-position.svg')",
//           backgroundRepeat: "no-repeat",
//           backgroundPosition: "left center",
//         },
//         "&:focus": {
//           background: "url('images/starting-position.svg')",
//           backgroundRepeat: "no-repeat",
//           backgroundPosition: "left center",
//         },
//       },
//       buttonClear: {
//         background: "url('images/clear.svg')",
//         backgroundRepeat: "no-repeat",
//         backgroundPosition: "left center",
//         "&:active": {
//           background: "url('images/clear.svg')",
//           backgroundRepeat: "no-repeat",
//           backgroundPosition: "left center",
//         },
//         "&:hover": {
//           background: "url('images/clear.svg')",
//           backgroundRepeat: "no-repeat",
//           backgroundPosition: "left center",
//         },
//         "&:focus": {
//           background: "url('images/clear.svg')",
//           backgroundRepeat: "no-repeat",
//           backgroundPosition: "left center",
//         },
//       },
//       buttonFlip: {
//         background: "url('images/flip.svg')",
//         backgroundRepeat: "no-repeat",
//         backgroundPosition: "left center",
//         "&:active": {
//           background: "url('images/flip.svg')",
//           backgroundRepeat: "no-repeat",
//           backgroundPosition: "left center",
//         },
//         "&:hover": {
//           background: "url('images/flip.svg')",
//           backgroundRepeat: "no-repeat",
//           backgroundPosition: "left center",
//         },
//         "&:focus": {
//           background: "url('images/flip.svg')",
//           backgroundRepeat: "no-repeat",
//           backgroundPosition: "left center",
//         },
//       },
//       fenBlock: {
//         display: "flex",
//         flexDirection: "column",
//         marginTop: "auto",
//       },
//     },
//     examineObserveTabCss: {
//       type: "examineObserveTab",
//       container: {
//         padding: "0.8rem 2.4rem",
//       },
//       observeSearch: {
//         display: "flex",
//         flexDirection: "row",
//         justifyContent: "space-between",
//         alignItems: "center",
//       },
//     },
//     examineObserverTabBlockCss: {
//       type: "examineObserverTabBlock",
//       container: {
//         display: "flex",
//         flexDirection: "column",
//       },
//       head: {
//         display: "flex",
//         flexDirection: "row",
//         justifyContent: "space-between",
//         alignItems: "center",
//       },
//       name: {
//         display: "flex",
//         alignItems: "center",
//       },
//       nameImg: {
//         display: "flex",
//         background: "grey",
//         width: "3.6rem",
//         height: "3.6rem",
//         borderRadius: "50%",
//         marginRight: "1rem",
//       },
//       nameTitle: {
//         padding: 0,
//         margin: 0,
//         fontFamily: "Roboto, sans-serif",
//         fontStyle: "normal",
//         fontWeight: 500,
//         fontSize: "1.6rem",
//         lineHeight: "1.9rem",
//       },
//       list: {
//         padding: 0,
//         margin: 0,
//       },
//       ownerListItem: {
//         padding: ".8rem 0",
//         margin: 0,
//         borderBottom: "1px solid rgba(91, 103, 133, 0.5)",
//         listStyle: "none",
//         fontFamily: "Roboto, sans-serif",
//         fontStyle: "normal",
//         fontWeight: "normal",
//         fontSize: "1.6rem",
//         lineHeight: "1.9rem",
//         color: "#000000",
//         textTransform: "capitalize",
//       },
//       observerListItem: {
//         display: "flex",
//         padding: ".8rem 0",
//         margin: 0,
//         borderBottom: "1px solid rgba(91, 103, 133, 0.5)",
//         listStyle: "none",
//         fontFamily: "Roboto, sans-serif",
//         fontStyle: "normal",
//         fontWeight: "normal",
//         fontSize: "16px",
//         lineHeight: "19px",
//       },
//     },
//     examineOwnerTabBlockCss: {
//       type: "examineOwnerTabBlock",
//       container: {
//         padding: "0.8rem 2.4rem",
//       },
//       head: {
//         display: "flex",
//         flexDirection: "row",
//         justifyContent: "space-between",
//         alignItems: "center",
//       },
//       list: {
//         padding: 0,
//         margin: 0,
//       },
//       listItem: {
//         padding: ".8rem 0",
//         margin: 0,
//         borderBottom: "1px solid rgba(91, 103, 133, 0.5)",
//         listStyle: "none",
//         fontFamily: "Roboto, sans-serif",
//         fontStyle: "normal",
//         fontWeight: "normal",
//         fontSize: "1.6rem",
//         lineHeight: "1.9rem",
//         color: "#000000",
//         textTransform: "capitalize",
//       },
//       movePiecesButton: {
//         background: "url(images/move-icon.svg)",
//         backgroundRepeat: "no-repeat",
//         backgroundPosition: "center",
//         border: 0,
//         height: "2rem",
//         width: "3rem",
//         outline: "none",
//       },
//       movePiecesButtonActive: {
//         background: "url(images/move-icon-active.svg)",
//         backgroundRepeat: "no-repeat",
//         backgroundPosition: "center",
//         border: 0,
//         height: "2rem",
//         width: "3rem",
//       },
//     },
//     examineRightSidebarBottomCss: {
//       type: "examineRightSidebarBottom",
//       container: {
//         display: "flex",
//         flexDirection: "column",
//         height: "50vh",
//       },
//       game: {
//         display: "flex",
//         justifyContent: "center",
//       },
//     },
//     examineRightSidebarCss: {
//       type: "examineRightSidebar",
//       main: {
//         height: "100%",
//         background: "#fff",
//         display: "flex",
//         flexDirection: "column",
//       },
//     },
//     examineSidebarTopCss: {
//       type: "examineSidebarTop",
//       main: {
//         height: "calc(50vh - 10px)",
//         marginBottom: "10px !important",
//       },
//       tabPlane: {
//         height: "100%",
//       },
//       renderMoveWrapper: {
//         height: "calc(100% - 50px)",
//         display: "flex",
//         flexDirection: "column",
//         marginTop: "10px",
//       },
//       renderMove: {
//         display: "flex",
//         flexDirection: "column",
//         flexGrow: "1",
//       },
//     },
//     fenPgnCss: {
//       type: "fenPgn",
//       main: {
//         padding: "0 2.4rem",
//         height: "calc(100% - 10px)",
//         display: "flex",
//         flexDirection: "column",
//         justifyContent: "space-between",
//       },
//       content: {
//         flex: 1,
//         display: "flex",
//         flexDirection: "column",
//       },
//       bottom: {
//         marginTop: "1.9rem",
//       },
//       button: {
//         background: "#1565C0",
//         border: "none",
//         marginRight: "1.8rem",
//       },
//     },
//     gameControlBlockCss: {
//       type: "gameControlBlock",
//       container: {
//         display: "flex",
//         flexDirection: "row",
//         justifyContent: "space-between",
//         width: "100%",
//         borderTop: "1px solid #EFF0F3",
//         padding: "0 1rem",
//       },
//       actionControlsItem: {
//         display: "flex",
//         border: "none",
//         backgroundColor: "#fff",
//         height: "4rem",
//         width: "4rem",
//         cursor: "pointer",
//       },
//       locationControlsItemImage: {
//         maxWidth: "100%",
//         maxHeight: "100%",
//         display: "block",
//         margin: "auto auto",
//       },
//       locationControlItem: {
//         display: "flex",
//         border: "none",
//         backgroundColor: "#fff",
//         height: "4rem",
//         width: "4rem",
//         cursor: "pointer",
//       },
//       locationControls: {
//         display: "flex",
//       },
//       actionControls: {
//         display: "flex",
//       },
//     },
//     homeCss: {
//       type: "home",
//       image: {
//         width: "95%",
//         height: "auto",
//         margin: "2.5% 2.5% auto 2.5%",
//       },
//     },
//     leftSideBarCss: {
//       type: "leftSideBar",
//       main: {
//         display: "flex",
//         flexDirection: "column",
//         flexShrink: 0,
//         width: "170px",
//         zIndex: 999,
//         height: "100%",
//         minHeight: "100vh",
//         backgroundColor: "#1565c0",
//         transition: "all 0.5s ease-in-out",
//         position: "relative",
//       },
//       sidebarUserImg: {
//         width: "3.2rem",
//         height: "3.2rem",
//         borderRadius: "50%",
//         overflow: "hidden",
//         background: "grey",
//       },
//       sidebarUserImgFliphed: {
//         width: "2.2rem",
//         height: "2.2rem",
//         borderRadius: "50%",
//         overflow: "hidden",
//         background: "grey",
//         position: "relative",
//         right: "3px",
//       },
//       sidebarUsername: {
//         color: "#fff",
//         textAlign: "left !important",
//         paddingLeft: "1rem",
//         maxWidth: "75px",
//         overflow: "hidden",
//         display: "inline-block",
//         verticalAlign: "middle",
//         textOverflow: "ellipsis",
//       },
//       sidebarUsernameNone: {
//         color: "#fff",
//         textAlign: "left !important",
//         paddingLeft: "1rem",
//         maxWidth: "100px",
//         overflow: "hidden",
//         display: "inline-block",
//         verticalAlign: "middle",
//         textOverflow: "ellipsis",
//       },
//       statusLabel: {
//         color: "#ffffff",
//         background: "#4F4F4F",
//         padding: "2px 4px",
//         borderRadius: "4px",
//         float: "right",
//         position: "relative",
//         top: "0.3rem",
//       },
//       mainDiv: {
//         display: "flex",
//         flexDirection: "column",
//         flexShrink: 0,
//         width: "170px",
//         zIndex: 999,
//         height: "100%",
//         minHeight: "100vh",
//         backgroundColor: "#1565c0",
//         transition: "all 0.5s ease-in-out",
//         position: "relative",
//       },
//       imageLogo: {
//         display: "flex",
//         flexShrink: 0,
//         marginLeft: "1rem",
//         width: "11rem",
//         height: "4rem",
//         marginTop: "1rem",
//         marginBottom: "1rem",
//       },
//       fliphImageLogo: {
//         width: "4rem",
//         marginLeft: "0.5rem",
//       },
//       burgerButton: {
//         background: "url('images/menu-button-of-three-lines.svg') no-repeat",
//         backgroundPosition: "center",
//         backgroundSize: "contain",
//         border: "none",
//         outline: "none",
//         flex: "1 1 0%",
//         textAlign: "center",
//         position: "absolute",
//         right: "1rem",
//         top: "1.6rem",
//         width: "2.6rem",
//         height: "3rem",
//         overflow: "hidden",
//         zIndex: 99,
//         "&:focus": {
//           outline: "1px solid rgba(0, 0, 0, .3) !important",
//         },
//       },
//       fliphBurgerButton: {
//         top: "5rem",
//         right: "1.3rem",
//       },
//       sidebarUser: {
//         padding: "0.8rem",
//         background: "rgba(10, 10, 10, 0.1)",
//         borderRadius: ".5rem",
//         width: "calc(100% - 2rem)",
//         marginLeft: "1rem",
//         cursor: "pointer",
//       },
//       fliphSidebarUser: {
//         marginTop: "6rem",
//       },
//       sidebar: {
//         display: "flex",
//         flexDirection: "column",
//         flexShrink: 0,
//         width: "170px",
//         zIndex: 999,
//         height: "100%",
//         minHeight: "100vh",
//         backgroundColor: "#1565c0",
//         transition: "all 0.5s ease-in-out",
//         position: "relative",
//       },
//       fliphSidebar: {
//         width: "52px",
//         transition: "all 0.5s ease-in-out",
//         overflow: "hidden",
//         zIndex: 999,
//         height: "100vh",
//         display: "flex",
//         flexDirection: "column",
//         flexShrink: 0,
//         minHeight: "100vh",
//         backgroundColor: "#1565c0",
//         position: "relative",
//       },
//     },
//     loginPageCss: {
//       type: "loginPage",
//       modalShow: {
//         display: "block",
//         position: "fixed",
//         zIndex: 9999,
//         top: 0,
//         left: 0,
//         right: 0,
//         bottom: 0,
//         overflow: "hidden",
//         outline: 0,
//       },
//       modalDialog: {
//         position: "relative",
//         width: "auto",
//         margin: "10px",
//       },
//       modalContent: {
//         position: "relative",
//         backgroundColor: "#fff",
//         backgroundClip: "padding-box",
//         border: "1px solid rgba(0,0,0,.2)",
//         borderRadius: "6px",
//         outline: 0,
//         boxShadow: "0 3px 9px rgba(0,0,0,.5)",
//       },
//       modalHeader: {
//         padding: "15px",
//         borderBottom: "1px solid #e5e5e5",
//       },
//       modalBody: {
//         position: "relative",
//         padding: "15px",
//       },
//       modalFooter: {
//         padding: "15px",
//         textAlign: "right",
//         borderTop: 0,
//       },
//       textCenter: {
//         textAlign: "center",
//       },
//       centerBlock: {
//         display: "block",
//         marginRight: "auto",
//         marginLeft: "auto",
//       },
//       formGroup: {
//         marginBottom: "15px",
//       },
//     },
//     menuLinksCss: {
//       type: "menuLinks",
//       menuLinks: {
//         display: "flex",
//         flexDirection: "column",
//         justifyContent: "space-between",
//         flexGrow: 1,
//         marginTop: "46px",
//       },
//       topMenuLinks: {
//         display: "flex",
//         flexDirection: "column",
//         flex: 1,
//         justifyContent: "space-between",
//       },
//       menuLinkItem: {
//         display: "flex",
//         marginBottom: "14px",
//         width: "100%",
//       },
//       menuItemText: {
//         width: "100%",
//       },
//       acitve: {
//         backgroundColor: "#2a9bdc",
//       },
//       rowStyle: {
//         paddingLeft: 0,
//         listStyle: "none",
//         marginTop: 0,
//         marginBottom: "1em",
//       },
//     },
//     messageItemCss: {
//       type: "messageItem",
//       main: {
//         display: "flex",
//       },
//       name: {
//         marginRight: ".8rem",
//         color: "#1565C0",
//       },
//       text: {
//         wordBreak: "break-word",
//       },
//     },
//     messengerCss: {
//       type: "messenger",
//       main: {
//         display: "flex",
//         flexGrow: 1,
//         height: "100vh",
//         minHeight: "100%",
//         flexDirection: "column",
//       },
//       head: {
//         display: "flex",
//         padding: "2.4rem 2.5rem",
//         borderBottom: "1px solid #e5e5e7",
//       },
//       name: {
//         display: "flex",
//         fontFamily: "Roboto",
//         fontStyle: "normal",
//         fontWeight: 500,
//         fontSize: "1.6rem",
//         lineHeight: "1.9rem",
//         margin: 0,
//       },
//       listWrap: {
//         display: "block",
//         alignItems: "flex-end",
//         height: "calc(100% - 4.8rem)",
//         overflow: "auto",
//       },
//       messageList: {
//         display: "flex",
//         flexDirection: "column",
//         padding: "0.8rem 2.4rem",
//       },
//       inputBar: {
//         display: "flex",
//         flexShrink: 0,
//         padding: ".8rem 2.4rem",
//         height: "4.8rem",
//         borderTop: "1px solid  #EFF0F3",
//       },
//     },
//     mugshotCss: {
//       type: "mugshot",
//       trailColor: "#000000",
//       strokeColor: "#FFFFFF",
//     },
//     notFoundCss: {
//       type: "notFound",
//       container: {
//         display: "flex",
//         justifyContent: "center",
//         alignItems: "center",
//         flexDirection: "column",
//       },
//     },
//     observeBlockCss: {
//       type: "observeBlock",
//       container: {
//         display: "flex",
//         justifyContent: "center",
//       },
//     },
//     playChooseBotCss: {
//       type: "playChooseBot",
//       main: {
//         padding: "0.8rem 2.4rem",
//       },
//       head: {
//         display: "flex",
//         flexDirection: "row",
//         justifyContent: "space-between",
//         alignItems: "center",
//       },
//       nameTitle: {
//         padding: 0,
//         margin: 0,
//         fontFamily: "Roboto, sans-serif",
//         fontStyle: "normal",
//         fontWeight: 500,
//         fontSize: "1.6rem",
//         lineHeight: "1.9rem",
//       },
//       startGameButton: {
//         marginRight: "5px",
//       },
//       incDelayWrap: {
//         display: "flex",
//         marginTop: "2rem",
//         marginRight: "2rem",
//         marginBottom: 0,
//       },
//       incDelayItem: {
//         flex: 0.5,
//       },
//     },
//     playFriendOptionsCss: {
//       type: "playFriendOptions",
//       main: {
//         padding: "0.8rem 2.4rem",
//       },
//       head: {
//         display: "flex",
//         flexDirection: "row",
//         justifyContent: "space-between",
//         alignItems: "center",
//       },
//       nameTitle: {
//         padding: 0,
//         margin: 0,
//         fontFamily: "Roboto, sans-serif",
//         fontStyle: "normal",
//         fontWeight: 500,
//         fontSize: "1.6rem",
//         lineHeight: "1.9rem",
//       },
//       incDelayWrap: {
//         display: "flex",
//         marginTop: "2rem",
//         marginRight: "2rem",
//         marginBottom: 0,
//       },
//       incDelayItem: {
//         flex: 0.5,
//       },
//     },
//     playModalCss: {
//       type: "playModal",
//       main: {
//         display: "flex",
//         flexDirection: "row",
//         justifyContent: "center",
//         alignItems: "center",
//         height: "12.5rem",
//       },
//       userOne: {
//         textAlign: "center",
//       },
//       userTwo: {
//         textAlign: "center",
//       },
//       userImg: {
//         width: "3.6rem",
//         height: "3.6rem",
//         borderRadius: "50%",
//         marginBottom: ".8rem",
//       },
//       username: {
//         maxWidth: "150px",
//       },
//       mainCenter: {
//         padding: "0 6rem",
//         textAlign: "center",
//       },
//       buttonBlock: {
//         display: "flex",
//         justifyContent: "center",
//       },
//       buttonPrimary: {
//         background: "#1565C0",
//       },
//     },
//     playNotificationsCss: {
//       type: "playNotifications",
//       notification: {
//         height: "85px",
//         backgroundColor: "#800000",
//         color: "#fff",
//       },
//       titleText: {
//         width: "auto",
//         marginRight: "6px",
//         fontSize: "18px",
//         color: "#fff",
//       },
//       titleIcon: {
//         width: "18px",
//         marginRight: "10px",
//         marginBottom: "5px",
//       },
//       descriptionButton: {
//         backgroundColor: "transparent",
//         border: "0px",
//       },
//       checkedIcon: {
//         width: "18px",
//       },
//       closeIcon: {
//         width: "15px",
//         marginBottom: "5px",
//       },
//       mainDiv: {
//         display: "flex",
//         width: "100%",
//         flexDirection: "row",
//         color: "#fff",
//         justifyContent: "space-between",
//       },
//     },
//     playOptionButtonsCss: {
//       type: "playOptionButtons",
//       container: {
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         justifyContent: "space-around",
//         minHeight: "88vh",
//       },
//       top: {
//         display: "grid",
//         gridTemplateColumns: "1fr 1fr 1fr",
//         width: "60rem",
//         height: "10rem",
//         maxWidth: "90%",
//         columnGap: "2.4rem",
//         rowGap: "2.4rem",
//       },
//       topDisabled: {
//         display: "none",
//         width: "60rem",
//         height: "10rem",
//         maxWidth: "90%",
//       },
//       topButton: {
//         color: "#ffffff",
//         height: "100%",
//         background: "#1565C0",
//         borderRadius: "6px",
//       },
//       bottom: {
//         display: "flex",
//         flexDirection: "column",
//         width: "60rem",
//         maxWidth: "90%",
//       },
//       buttonBig: {
//         padding: "2.4rem",
//         height: "auto",
//         background: "#EFF0F3",
//         marginTop: "2.4rem",
//         fontSize: "18px",
//         fontWeight: 500,
//         borderRadius: "8px",
//       },
//       buttonBigDisabled: {
//         display: "none",
//         padding: "2.4rem",
//         height: "auto",
//         background: "#EFF0F3",
//         marginTop: "2.4rem",
//         fontSize: "18px",
//         fontWeight: 500,
//         borderRadius: "8px",
//       },
//     },
//     playRightSideBarCss: {
//       type: "playRightSideBar",
//       main: {
//         display: "flex",
//         flexDirection: "column",
//         height: "100vh",
//       },
//       flexDiv: {
//         flex: 1,
//       },
//       bottom: {
//         display: "flex",
//         flexDirection: "column",
//         height: "50vh",
//         flexShrink: 0,
//       },
//     },
//     playWithFriendCss: {
//       type: "playWithFriend",
//       main: {
//         padding: "0.8rem 2.4rem",
//       },
//       head: {
//         display: "flex",
//         flexDirection: "row",
//         justifyContent: "space-between",
//         alignItems: "center",
//       },
//       nameTitle: {
//         padding: 0,
//         margin: 0,
//         fontFamily: "Roboto, sans-serif",
//         fontStyle: "normal",
//         fontWeight: 500,
//         fontSize: "1.6rem",
//         lineHeight: "1.9rem",
//       },
//       header: {
//         padding: 0,
//         margin: 0,
//         fontFamily: "Roboto, sans-serif",
//         fontStyle: "normal",
//         fontWeight: 500,
//         fontSize: "1.6rem",
//         lineHeight: "1.9rem",
//         color: "#8C8C8C",
//       },
//       list: {
//         padding: 0,
//         margin: 0,
//       },
//       listItem: {
//         display: "flex",
//         justifyContent: "space-between",
//         alignItems: "center",
//         padding: "0.8rem 0",
//         margin: 0,
//         borderBottom: "1px solid rgba(91, 103, 133, 0.5)",
//         listStyle: "none",
//         fontFamily: "Roboto, sans-serif",
//         fontStyle: "normal",
//         fontWeight: "normal",
//         fontSize: "16px",
//         lineHeight: "19px",
//       },
//     },
//     primaryButtonCss: {
//       type: "primaryButton",
//       button: {
//         backgroundColor: "#1565c0",
//       },
//     },
//     profileCss: {
//       type: "profile",
//       card: {
//         position: "relative",
//         top: "2rem",
//         left: "2rem",
//         width: "calc(100% - 4rem)",
//         height: "48%",
//       },
//       bodyStyle: {
//         height: " 100%",
//       },
//       mainDiv: {
//         display: "flex",
//         height: "100%",
//         width: "100%",
//         flexDirection: "column",
//         alignItems: "center",
//       },
//       changePasswordDiv: {
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         width: "25%",
//         height: "40%",
//         justifyContent: "space-around",
//       },
//       formUsernameDiv: {
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         width: "25%",
//         height: "45%",
//         justifyContent: "space-around",
//       },
//       changeUsernameDiv: {
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         justifyContent: "space-around",
//         height: "100%",
//         width: "100%",
//       },
//       errorTitle: {
//         color: "#bc0000",
//       },
//       avatarChangeDiv: {
//         display: "flex",
//         flexDirection: "column",
//         width: "50%",
//         height: "70%",
//         alignItems: "center",
//         justifyContent: "space-around",
//       },
//       avatar: {
//         width: "min(15vh, 15vw)",
//         height: "min(15vh, 15vw)",
//         borderRadius: "50%",
//         overflow: "hidden",
//         background: "grey",
//       },
//     },
//     signupPageCss: {
//       type: "signupPage",
//       modalShow: {
//         display: "block",
//         position: "fixed",
//         zIndex: 9999,
//         top: 0,
//         left: 0,
//         right: 0,
//         bottom: 0,
//         overflow: "hidden",
//         outline: 0,
//       },
//       modalDialog: {
//         position: "relative",
//       },
//       modalContent: {
//         position: "relative",
//         backgroundColor: "#fff",
//         backgroundClip: "padding-box",
//         border: "1px solid rgba(0,0,0,.2)",
//         borderRadius: "6px",
//         outline: 0,
//         boxShadow: "0 3px 9px rgba(0,0,0,.5)",
//       },
//       modalHeader: {
//         padding: "15px",
//         borderBottom: "1px solid #e5e5e5",
//       },
//       modalBody: {
//         position: "relative",
//         padding: "15px",
//       },
//       modalFooter: {
//         padding: "15px",
//         textAlign: "right",
//         borderTop: 0,
//       },
//       textCenter: {
//         textAlign: "center",
//       },
//       centerBlock: {
//         display: "block",
//         marginRight: "auto",
//         marginLeft: "auto",
//       },
//       formGroup: {
//         marginBottom: "15px",
//       },
//     },
//     systemCss: {
//       type: "system",
//       settingIcon: {
//         all: {
//           position: "absolute",
//           left: "-40px",
//           top: "10px",
//         },
//       },
//       rightTopContent: {
//         all: {
//           height: "55vh",
//         },
//       },
//       rightBottomContent: {
//         all: {
//           height: "45vh",
//         },
//       },
//       fullWidth: {
//         width: "100%",
//       },
//       drawActionSection: {
//         height: "auto",
//         width: "auto",
//         alignItems: "center",
//         backgroundColor: "red",
//         fontSize: "16px",
//         color: "blue",
//         padding: "2px 10px",
//       },
//       drawSectionButton: {
//         margin: "0 auto",
//         display: "block",
//         paddingBottom: "5px",
//       },
//       moveListParent: {
//         backgroundColor: "#00BFFF",
//         margin: "5px",
//         height: "auto",
//         width: "50px",
//         display: "inline-block",
//       },
//       gameMoveStyle: {
//         color: "#808080",
//         fontWeight: "450",
//       },
//       toggleMenuHeight: {
//         height: "30px",
//       },
//       parentDivPopupMainPage: {
//         float: "left",
//       },
//       outerPopupMainPage: {
//         width: "350px",
//         height: "auto",
//         borderRadius: "3px",
//         background: "#b7bdc5",
//         position: "fixed",
//         zIndex: "99",
//         left: "0",
//         right: "25%",
//         margin: "0 auto",
//         top: "27%",
//         padding: "20px",
//         textAlign: "center",
//         border: "3px solid ",
//         borderColor: "#242f35",
//       },
//       innerPopupMainPage: {
//         backgroundColor: "#1565c0",
//         border: "none",
//         color: "white",
//         padding: "7px 20px",
//         textAign: "center",
//         textDecoration: "none",
//         display: "inline-block",
//         fontSize: "12px",
//         borderRadius: "5px",
//         margin: "0px 6px 0 0",
//       },
//       buttonBackgroundImage: {
//         takeBack: "images/take-forward-icon.png",
//         draw: "images/draw-icon.png",
//         resign: "images/resign-icon.png",
//         action: "images/action-icon.png",
//         abort: "images/abort-icon.png",
//         gameShare: "images/share-icon-gray.png",
//         gameDownload: "images/download-icon-gray.png",
//         gameAnalysis: "images/live-analisys-icon.png",
//         circleCompass: "images/circle-compass-icon.png",
//         fastForward: "images/fast-forward-prev.png",
//         prevIconGray: "images/prev-icon-gray.png",
//         nextIconGray: "images/next-icon-gray.png",
//         fastForwardNext: "images/fast-forward-next.png",
//         nextStart: "images/next-icon-single.png",
//         nextStop: "images/next-icon-single-stop.png",
//         flipIconGray: "images/flip-icon-gray.png",
//         settingIcon: "images/setting-icon.png",
//         fullScreen: "images/full-screen-icon.png",
//         tournamentUserIcon: "images/user-icon.png",
//         chatSendButton: "images/send-btn.png",
//         toggleMenu: "images/menu-button-of-three-lines.svg",
//         deleteSign: "images/delete-sign.png",
//         examine: "images/examine-icon.png",
//         infoIcon: "images/info-icon.png",
//         pgnIcon: "images/pgnicon.png",
//         checkedIcon: "images/checked.png",
//         closeIcon: "images/close.png",
//         logoWhite: "images/logo-white-lg.png",
//         homeImage: "images/home-page/home-top.jpg",
//       },
//       button: {
//         all: {
//           background: "none",
//           border: "none",
//           outline: "none",
//           WebkitFlex: "1",
//           MsFlex: "1",
//           flex: "1",
//         },
//         tournamentButton: {
//           borderBottom: "1px solid #e8e7e6",
//           display: "flex",
//           flexWrap: "nowrap",
//           alignItems: "center",
//           justifyContent: "left",
//           minHeight: "40px",
//           maxHeight: "40px",
//           cursor: "pointer",
//           width: "100%",
//           color: "#a7a6a2 !important",
//         },
//         toggleOpen: {
//           textAlign: "center",
//           position: "absolute",
//           left: "130px",
//           top: "16px",
//           width: "26px",
//           overflow: "hidden",
//           zIndex: "99",
//         },
//         toggleClose: {
//           textAlign: "center",
//           position: "absolute",
//           left: "10px",
//           top: "56px",
//           width: "26px",
//           overflow: "hidden",
//           zIndex: "99",
//         },
//         middleBoard: {
//           flex: "0",
//           textAlign: "center",
//           right: "0px",
//           margin: "10px 5px 0px 0px",
//           position: "absolute",
//           top: "0px",
//           zIndex: "99",
//         },
//         formButton: {
//           backgroundColor: "#1565c0",
//           textAlign: "center",
//           padding: "10px 20px",
//           border: "none",
//           color: "#FFF",
//           borderRadius: "5px",
//         },
//       },
//       chatContent: {
//         all: {
//           padding: "20px 15px",
//           maxHeight: "230px",
//           overflowY: "scroll",
//           minHeight: "230px",
//         },
//       },
//       InputBox: {
//         all: {},
//         chat: {
//           position: "absolute",
//           padding: "0px 10px 10px 10px",
//           borderTop: "#ccc solid 1px !important",
//           maxWidth: "100%",
//           width: "100%",
//           bottom: "0px",
//           background: "#fff",
//         },
//       },
//       gameMoveList: {
//         all: {
//           display: "inline-block",
//           width: "100%",
//           padding: "5px",
//         },
//       },
//       gameButtonMove: {
//         all: {
//           background: "#f1f1f1",
//           textAlign: "center",
//           padding: "8px 0",
//           width: "100%",
//           bottom: "0px",
//           zIndex: "999",
//           display: "flex",
//           flexWrap: "nowrap",
//           position: "absolute",
//           alignItems: "center",
//         },
//       },
//       gameTopHeader: {
//         all: {
//           backgroundColor: "#efefef",
//           display: "inline-block",
//           width: "100%",
//           padding: "5px 5px",
//         },
//       },
//       showLg: {
//         all: {
//           display: "block",
//         },
//       },
//       tab: {
//         all: {
//           height: "100%",
//           position: "relative",
//         },
//       },
//       tabList: {
//         all: {
//           listStyle: "none",
//           marginBottom: "-1px",
//           padding: "0rem 0rem",
//           width: "100%",
//           display: "flex",
//           flexWrap: "wrap",
//           alignItems: "center",
//         },
//         bottom: {
//           background: "#1565c0",
//           paddingTop: "8px",
//           color: "#fff",
//           alignItems: "flex-end",
//         },
//       },
//       tabListItem: {
//         all: {
//           border: "solid #ccc",
//           borderWidth: "0px 0px 0px 0px",
//           fontSize: "14px",
//           textAlign: "center",
//           WebkitFlex: "1",
//           flex: "1",
//           padding: "8px 0",
//         },
//         Chat: {
//           backgroundColor: "#fff",
//           borderTop: "0px #1565c0 solid",
//           borderTopLeftRadius: "6px",
//           borderTopRightRadius: "6px",
//           color: "#1565c0",
//         },
//         Events: {
//           backgroundColor: "#fff",
//           borderTop: "0px #1565c0 solid",
//           borderTopLeftRadius: "6px",
//           borderTopRightRadius: "6px",
//           color: "#1565c0",
//         },
//         RoomChat: {
//           backgroundColor: "#fff",
//           borderTop: "0px #1565c0 solid",
//           borderTopLeftRadius: "6px",
//           borderTopRightRadius: "6px",
//           color: "#1565c0",
//         },
//         PGN: {
//           backgroundColor: "#fff",
//           borderTop: "0px #1565c0 solid",
//           borderTopLeftRadius: "6px",
//           borderTopRightRadius: "6px",
//           color: "#1565c0",
//         },
//         Observers: {
//           backgroundColor: "#fff",
//           borderTop: "0px #1565c0 solid",
//           borderTopLeftRadius: "6px",
//           borderTopRightRadius: "6px",
//           color: "#1565c0",
//         },
//         Examiner: {
//           backgroundColor: "#fff",
//           borderTop: "0px #1565c0 solid",
//           borderTopLeftRadius: "6px",
//           borderTopRightRadius: "6px",
//           color: "#1565c0",
//         },
//         FollowCoach: {
//           backgroundColor: "#fff",
//           borderTop: "0px #1565c0 solid",
//           borderTopLeftRadius: "6px",
//           borderTopRightRadius: "6px",
//           color: "#1565c0",
//         },
//         GameLibrary: {
//           backgroundColor: "#fff",
//           borderTop: "0px #1565c0 solid",
//           borderTopLeftRadius: "6px",
//           borderTopRightRadius: "6px",
//           color: "#1565c0",
//         },
//         GameHistory: {
//           backgroundColor: "#fff",
//           borderTop: "0px #1565c0 solid",
//           borderTopLeftRadius: "6px",
//           borderTopRightRadius: "6px",
//           color: "#1565c0",
//         },
//         AdjournedGame: {
//           backgroundColor: "#fff",
//           borderTop: "0px #1565c0 solid",
//           borderTopLeftRadius: "6px",
//           borderTopRightRadius: "6px",
//           color: "#1565c0",
//         },
//       },
//       tabListItem1: {
//         all: {
//           color: " #495057",
//           background: "#efefef",
//           borderColor: " #1565c0",
//           borderTop: " 2px #1565c0 solid",
//           fontSize: "18px",
//           textAlign: "center",
//           WebkitFlex: "1",
//           flex: "1",
//           padding: "8px 0",
//         },
//       },
//       tabContent: {
//         all: {
//           padding: "0px",
//         },
//       },
//       tabSeparator: {
//         all: {
//           backgroundColor: "#efefef",
//           padding: "15px",
//         },
//       },
//       subTabHeader: {
//         all: {
//           border: "#ccc 1px solid",
//           borderTop: "0px",
//         },
//       },
//       matchUserScroll: {
//         all: {
//           padding: "20px",
//           overflowX: "hidden",
//           height: "45vh",
//           overflowY: "scroll",
//         },
//       },
//       matchUserButton: {
//         all: {
//           backgroundColor: "transparent",
//           width: "100%",
//           display: "block",
//           height: "auto",
//           margin: "0",
//           borderRadius: "0px",
//           color: "#000",
//           textAlign: "left",
//           border: "0px",
//           borderBottom: "#ccc 1px solid",
//           padding: "8px 15px",
//           fontSize: "14px",
//           fontWeight: "bold",
//         },
//       },
//       TabIcon: {
//         all: {
//           marginRight: "10px",
//         },
//         bottom: {
//           margin: "0 auto",
//           display: "block",
//         },
//       },
//       span: {
//         all: {
//           WebkitFlex: "1",
//           flex: "1",
//           textAlign: "left",
//         },
//         name: {
//           flex: "3",
//         },
//         status: {
//           flex: "2",
//         },
//         count: {
//           width: "30px",
//           textAlign: "right",
//           marginRight: "15px",
//         },
//         form: {
//           paddingRight: "9px",
//         },
//       },
//       challengeContent: {
//         all: {
//           borderRadius: " 0 0 3px 3px",
//           background: "#fff",
//           marginTop: "0px",
//           padding: "0 15px",
//         },
//       },
//       competitionsListItem: {
//         all: {
//           display: "flex",
//           justifyContent: "center",
//           alignItems: "center",
//           minHeight: "40px",
//           maxHeight: "40px",
//           cursor: "pointer",
//           borderBottom: "1px solid #e8e7e6",
//           color: "#a7a6a2!important",
//           width: "100%",
//         },
//       },
//       tournamentContent: {
//         all: {
//           maxHeight: "290px",
//           overflowY: "auto",
//         },
//       },
//       pullRight: {
//         all: {
//           float: "right",
//         },
//       },
//       drawSection: {
//         all: {
//           width: "auto",
//           textAlign: "left",
//           padding: "8px 0",
//           flex: "auto",
//         },
//       },
//       drawSectionList: {
//         all: {
//           display: "inline-block",
//           listStyle: "none",
//           marginRight: "5px",
//         },
//       },
//       formMain: {
//         all: {
//           width: "100%",
//           marginBottom: "15px",
//           float: "left",
//         },
//       },
//       formMainHalf: {
//         all: {
//           width: "50%",
//           float: "left",
//         },
//       },
//       formLabelStyle: {
//         all: {
//           fontWeight: "300",
//           paddingRight: "9px",
//           marginLeft: "0px",
//         },
//         first: {
//           marginLeft: "0px",
//         },
//         radio: {
//           verticalAlign: "top",
//           marginLeft: "5px",
//         },
//       },
//     },
//     userCss: {
//       name: "default-user",
//       type: "board",
//       tagLine: {
//         all: {
//           display: "inline-block",
//           marginTop: "10px",
//           marginLeft: "10px",
//         },
//       },
//       userName: {
//         all: {
//           color: "#fff",
//           fontSize: "18px",
//           fontWeight: "600",
//           marginRight: "15px",
//         },
//       },
//       flags: {
//         all: "images/user-flag.png",
//         in: "images/india.png",
//         us: "images/user-flag.png",
//       },
//       clock: {
//         all: {
//           right: "0",
//           lineHeight: "30px",
//           padding: "3px 20px",
//           textAlign: "center",
//           borderRadius: "3px",
//           fontSize: "19px",
//           color: "#fff",
//           top: "5px",
//           height: "36px",
//           width: "93px",
//           background: "#333333",
//           fontWeight: "700",
//           position: "absolute",
//         },
//         alert: {
//           color: "red",
//         },
//       },
//       userFlag: {
//         all: {},
//       },
//       userPicture: {
//         all: {
//           display: "inline-block",
//         },
//       },
//       clockMain: {
//         all: {},
//       },
//       square: {
//         all: {},
//         w: {
//           backgroundColor: "#fff",
//         },
//         b: {
//           backgroundColor: "#1565c0",
//         },
//       },
//       external_rank: {
//         all: {
//           float: "left",
//           position: "relative",
//           color: "white",
//         },
//       },
//       external_file: {
//         all: {
//           float: "left",
//           position: "relative",
//           color: "white",
//         },
//       },
//       internal_rank_and_file: {
//         all: {
//           position: "absolute",
//           zIndex: 3,
//         },
//         color: {
//           w: {
//             color: "red",
//           },
//           b: {
//             color: "white",
//           },
//         },
//         position: {
//           tl: {
//             top: 0,
//             left: 0,
//           },
//           tr: {
//             top: 0,
//             right: 0,
//             textAlign: "right",
//           },
//           bl: {
//             bottom: 0,
//             left: 0,
//           },
//           br: {
//             bottom: 0,
//             right: 0,
//             textAlign: "right",
//           },
//         },
//       },
//       pieces: {
//         w: {
//           r: "https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg",
//           b: "https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg",
//           n: "https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg",
//           q: "https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg",
//           k: "https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg",
//           p: "https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg",
//         },
//         b: {
//           r: "https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg",
//           b: "https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg",
//           n: "https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg",
//           q: "https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg",
//           k: "https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg",
//           p: "https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg",
//         },
//       },
//       fallendpieces: {
//         all: {},
//         w: {
//           r: "images/fallenpieces/wR.png",
//           b: "images/fallenpieces/wB.png",
//           n: "images/fallenpieces/wN.png",
//           q: "images/fallenpieces/wQ.png",
//           k: "images/fallenpieces/wK.png",
//           p: "images/fallenpieces/wP.png",
//         },
//         b: {
//           r: "images/fallenpieces/bR.png",
//           b: "images/fallenpieces/bB.png",
//           n: "images/fallenpieces/bN.png",
//           q: "images/fallenpieces/bQ.png",
//           k: "images/fallenpieces/bK.png",
//           p: "images/fallenpieces/bP.png",
//         },
//       },
//     },
//     userManagementCss: {
//       type: "userManagement",
//       listMainDiv: {
//         marginTop: "2rem",
//         marginLeft: "2rem",
//         width: "calc(100% - 4rem)",
//         height: "calc(100% - 4rem)",
//         borderRadius: "10px",
//         border: "1px #EDEDED solid",
//       },
//       listTable: {
//         width: "100%",
//         height: "100%",
//       },
//       editMainDiv: {
//         marginTop: "2rem",
//         marginLeft: "2rem",
//         width: "calc(100% - 4rem)",
//         height: "calc(100% - 4rem",
//         borderRadius: "10px",
//         border: "1px #EDEDED solid",
//         display: "flex",
//         flexDirection: "column",
//       },
//       editCard: {
//         width: "calc(100% - 4rem)",
//         height: "calc(50% - 4rem)",
//         marginTop: "2rem",
//         marginLeft: "2rem",
//       },
//       editMainCardDiv: {
//         width: "50%",
//         height: "90%",
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         justifyContent: "space-around",
//       },
//       errorTitle: {
//         color: "#bc0000",
//       },
//     },
//   };
// });
