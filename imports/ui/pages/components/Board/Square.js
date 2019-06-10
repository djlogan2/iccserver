import React from "react";

/**
 * @param props.rank The rank of the square being drawn
 * @param props.file The file of the square being drawn
 * @param props.side The number of pixels on a side
 */
export default class Square extends React.Component {
  constructor(props) {
    super(props);

    this._style_obj = {
      width: this.props.side + "px",
      height: this.props.side + "px",
      float: "right"
    };

    const file = this.props.file || 0;
    const rank = this.props.rank || 0;

    this._raf = String.fromCharCode("a".charCodeAt(0) + file) + (rank + 1);
  }
}
