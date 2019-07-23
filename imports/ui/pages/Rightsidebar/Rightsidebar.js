import React, { Component } from 'react';
import RightBarTop from './RightBarTop';
import RightBarBottom from './RightBarBottom';
class RightSidebar extends Component {
	render() {
		return (
			<div>
				<div className="right-content-desktop">
					<div className="setting-icon">
						<a href="#">
							<img src="images/full-screen-icon.png" />
						</a>
					</div>
					<div className="right-top-content">
						<RightBarTop />
					</div>
					<div className="right-bottom-content">
						<RightBarBottom />
					</div>
				</div>
			</div>
		);
	}
}
export default RightSidebar;
