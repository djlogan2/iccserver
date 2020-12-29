import React from "react";
import { get } from "lodash";

const Spare = ({ onDropStart }) => {
  const mouseDown = e => {
    const pieceEl = get(e, "target.children[0]");

    const color = pieceEl.getAttribute("datacolor");
    const role = pieceEl.getAttribute("datarole");

    onDropStart({ role, color }, e);
  };
  return (
    <div className="spare merida">
      <div className="cg-wrap">
        <div className="spare__wrap">
          <div className="no-square selected-square">
            <div onMouseDown={mouseDown}>
              <piece className="black king" datacolor="black" datarole="king" />
            </div>
          </div>
          <div className="no-square">
            <div onMouseDown={mouseDown}>
              <piece className="black queen" datacolor="black" datarole="queen" />
            </div>
          </div>
          <div className="no-square">
            <div onMouseDown={mouseDown}>
              <piece className="black rook" datacolor="black" datarole="rook" />
            </div>
          </div>
          <div className="no-square">
            <div onMouseDown={mouseDown}>
              <piece className="black bishop" datacolor="black" datarole="bishop" />
            </div>
          </div>
          <div className="no-square">
            <div onMouseDown={mouseDown}>
              <piece className="black knight" datacolor="black" datarole="knight" />
            </div>
          </div>
          <div className="no-square">
            <div onMouseDown={mouseDown}>
              <piece className="black pawn" datacolor="black" datarole="pawn" />
            </div>
          </div>
          <div className="no-square trash">
            <div>
              <piece draggable="false" className="xxtrash" />
            </div>
          </div>
          <div className="no-square selected-square">
            <div onMouseDown={mouseDown}>
              <piece className="white king" datacolor="white" datarole="king" />
            </div>
          </div>
          <div className="no-square">
            <div onMouseDown={mouseDown}>
              <piece className="white queen" datacolor="white" datarole="queen" />
            </div>
          </div>
          <div className="no-square">
            <div onMouseDown={mouseDown}>
              <piece className="white rook" datacolor="white" datarole="rook" />
            </div>
          </div>
          <div className="no-square">
            <div onMouseDown={mouseDown}>
              <piece className="white bishop" datacolor="white" datarole="bishop" />
            </div>
          </div>
          <div className="no-square">
            <div onMouseDown={mouseDown}>
              <piece className="white knight" datacolor="white" datarole="knight" />
            </div>
          </div>
          <div className="no-square">
            <div onMouseDown={mouseDown}>
              <piece className="white pawn" datacolor="white" datarole="pawn" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Spare;
