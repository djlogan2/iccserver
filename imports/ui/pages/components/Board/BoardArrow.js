import React from 'react';
import newid from '../../../../../lib/client/newid';

/**
 * @param props The properties
 * @param props.size = size of the side
 * @param props.from
 * @param props.from.x
 * @param props.from.y
 * @param props.to
 * @param props.to.x
 * @param props.to.y
 * @param props.arrow
 * @param props.arrow.lineWidth
 * @param props.arrow.color
 */
export default class BoardArrow extends React.Component {
	constructor(props) {
		super(props);
		this._canvasId = newid();
	}

	componentDidMount() {
		this.componentDidUpdate();
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		const fromx = this.props.from.x;
		const fromy = this.props.from.y;
		const tox = this.props.to.x;
		const toy = this.props.to.y;
		//variables to be used when creating the arrow
		var c = document.getElementById(this._canvasId);
		var ctx = c.getContext('2d');
		var headlen = 10;

		ctx.clearRect(0, 0, c.clientWidth, c.clientHeight);

		var angle = Math.atan2(toy - fromy, tox - fromx);

		//starting a new path from the head of the arrow to one of the sides of the point
		//ctx.beginPath();
		//ctx.strokeStyle = "red";
		//ctx.lineWidth = 5;
		//ctx.rect(0, 0, c.clientWidth, c.clientHeight);
		//ctx.stroke();

		//starting path of the arrow from the start square to the end square and drawing the stroke
		ctx.beginPath();
		ctx.strokeStyle = this.props.arrow.color;
		ctx.lineWidth = this.props.arrow.lineWidth;
		ctx.moveTo(fromx, fromy);
		ctx.lineTo(tox, toy);
		ctx.stroke();

		ctx.beginPath();
		ctx.strokeStyle = this.props.arrow.color;
		ctx.lineWidth = this.props.arrow.lineWidth;
		ctx.moveTo(tox, toy);
		ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 7), toy - headlen * Math.sin(angle - Math.PI / 7));

		//path from the side point of the arrow, to the other side point
		ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 7), toy - headlen * Math.sin(angle + Math.PI / 7));

		//path from the side point back to the tip of the arrow, and then again to the opposite side point
		ctx.lineTo(tox, toy);
		ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 7), toy - headlen * Math.sin(angle - Math.PI / 7));

		ctx.stroke();
		ctx.fillStyle = this.props.arrow.color;
		ctx.fill();
	}

	render() {
		const fromx = Math.min(this.props.from.x, this.props.to.x);
		const fromy = Math.min(this.props.from.y, this.props.to.y);
		const width = Math.abs(this.props.to.x - this.props.from.x);
		const height = Math.abs(this.props.to.y - this.props.from.y);
		return (
			<canvas
				id={this._canvasId}
				style={{
					position: 'absolute',
					left: 0,
					top: 0,
					pointerEvents: 'none',
					zIndex: 3,
					width: this.props.size,
					height: this.props.size
				}}
				width={this.props.size}
				height={this.props.size}
			/>
		);
	}
}
