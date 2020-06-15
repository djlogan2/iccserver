import React from "react";

const Spare = props => {
  const mouseDown = e => {
    let pieceEl = e.target.children[0];
    let color = pieceEl.getAttribute("datacolor");
    let role = pieceEl.getAttribute("datarole");
    props.onDropStart({ role: role, color: color }, e);
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
            <div onMouseDown={mouseDown}>
              <piece draggable="true" className="trash" />
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
