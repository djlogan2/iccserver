import React from "react";
export default class FallenSoldier extends React.Component {
  render() {
    let soldiers = this.props.FallenSoldiers;
  
let items=[];
    for (var k in soldiers) {
      if(soldiers[k]!==0){
         items.push(
        <FallenSoldierSquare
        key={k}
        piece={k}
        color={this.props.color}
        cssmanager={this.props.cssmanager}
        side={this.props.side}
        count={soldiers[k]}
      />
        );
      }
    }
  
    return items;
  }
}

class FallenSoldierSquare extends React.Component {
  render() {
    console.log("props",this.props);
    const h = this.props.side/2;
    const w = this.props.side/2;
   
    let count=this.props.count;
   
    if(count > 1){
          count = count-1;
          count = '+'.concat(count);
    }else{
      count=null;
    }
    this._square_side = Math.min(h, w);
    const squareStyle = this.props.cssmanager.fSquareStyle(
      this.props.color,
      this.props.piece,
      this._square_side
    );

    //return <div style={squareStyle} ></div>;
    return <div style={{ display: "inline-block"}}><div style={squareStyle}> <span style={{
      background:"#1565c0",
      borderRadius:"50px",
      height:"18px",
      width:"18px",
      fontSize:"11px",
      padding:"2px",
      color:"#fff",
      marginLeft:"13px",
      border:"#fff solid 1px"
    }}>{count}</span></div></div>
  }
}
