import React from 'react';
import ReactDOM from 'react-dom';
import { Meteor } from 'meteor/meteor';
//import { render } from 'react-dom';
import { renderRoutes } from '../imports/startup/client/routes.jsx';

Meteor.startup(() => {
	//  render(renderRoutes(), document.getElementById('target'));
	ReactDOM.render(renderRoutes(), document.getElementById('target'));
});
