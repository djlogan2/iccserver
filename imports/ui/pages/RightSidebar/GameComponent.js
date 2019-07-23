import React, { Component } from 'react';
import Name from './NameComponent';
import MoveList from './MoveListComponent';
import Action from './ActionComponent';
import './Tabs/styles';
export default class GameComponent extends Component {
	render() {
		return (
			<div cover="../../../images/game-icon-gray.png">
				<Name />
				<MoveList />
				<Action />
			</div>
		);
	}
}
