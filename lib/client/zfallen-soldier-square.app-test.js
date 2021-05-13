import {Meteor} from 'meteor/meteor';
import React from 'react';
import chai from 'chai';
import {mount, shallow, configure, render} from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import FallenSoldierSquare from "../../client/ui/pages/MiddleSection/FallenSoldierSquare";
//const FallenSoldier = lazy(() => import("./FallenSoldierSquare"));

configure({adapter: new Adapter()});
//   describe('WizardComponent', ()=> {
//     let props = {side: 100, cssManager: {fSquareStyle(color, piece) {return "img:x"}}, color: "x", piece: "x"}
//     it('CLIENT: should render Fallen Soldier Square', async () => {
//           const wrapper = mount(<FallenSoldierSquare {...props}/>);
//           chai.assert.isDefined(wrapper);
//           chai.assert.equal(wrapper.find("img").prop("src"), "img:y");
//           console.log(wrapper.debug())
//         });
//   });
