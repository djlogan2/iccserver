import React from "react";
import "../css/chessbord";

/**
 * @param props React properties
 * @param props.board_class classname of the board square css entry, without the light or dark designation
 * @param props.rank The rank of the square being drawn
 * @param props.file The file of the square being drawn
 * @param props.color The color of the piece or null if no piece
 * @param props.piece The piece on the square, or null if no piece
 * @param props.draw_rank_and_file 'true' if we want to label the square (i.e. 'a4'.) null or any non-true otherwise
 * @param props.onMouseDown The method to call if we push the mouse
 * @param props.onMouseUp The method to call if we release the mouse
 * @param props.side The number of pixels on a side
 * @param props.circle The color of the circle, or null
 */
export default function Square(props) {
  let _class = props.board_class + "-";
  let _text = props.board_class + "-squaretext";

  if (props.piece) _class += props.color + props.piece + "-";

  _class += (props.rank & 1) === (props.file & 1) ? "dark" : "light";

  const style_obj = {
    width: props.side + "px",
    height: props.side + "px"
  };

  //
  // TODO: Figure out how to get the square text (i.e. 'a4') in one of the corners with a good fond and color. This is controlled by the "draw_rank_and_file" boolean
  // TODO: Can we, and should we, disable drawing of text in mobile devices? If so, how?
  // TODO: This guy probably should draw his own circles, yes?
  // TODO: Do the circle
  //
  return (
    <button
      style={style_obj}
      className={_class}
      onMouseDown={props.onMouseDown}
      onMouseUp={props.onMouseUp}
    />
  );
}
