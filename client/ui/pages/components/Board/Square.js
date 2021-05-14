import React from "react";

/**
 * @param props.rank The rank of the square being drawn
 * @param props.file The file of the square being drawn
 */
export default class Square extends React.Component {
  constructor(props) {
    super(props);

    const file = this.props.file || 0;
    const rank = this.props.rank || 0;

    this._raf = String.fromCharCode("a".charCodeAt(0) + file) + (rank + 1);
    this._squarecolor = rank % 2 === file % 2 ? "b" : "w";
  }
}
