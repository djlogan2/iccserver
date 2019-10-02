import React, { Component } from "react";
import FallenSoldier from "./FallenSoldier";
export default class Player extends Component {
  constructor(props) {
    super(props);

    this.state = {
      time: props.PlayerData.Timer,
      isActive: props.PlayerData.IsActive
    };
  }

  render() {
/* 
    const ph = this.props.side / 9;
    const pw = this.props.side / 9; */

    if (this.props.rank_and_file.charAt(0) === "t")
         this._fileline = "t";
    else if (this.props.rank_and_file.charAt(0) === "b")
          this._fileline = "b";
    if (this.props.rank_and_file.charAt(1) === "l")
          this._rankline = "l";
    else if (this.props.rank_and_file.charAt(1) === "r")
          this._rankline = "r";
         
          this._rank_squares =
      this._fileline === "t" || this._fileline === "b" ? 8.7 : 9;
    this._file_squares =
      this._rankline === "l" || this._rankline === "r" ? 8.7 : 9;

   
     const ph = this.props.side / this._file_squares;
     const pw = this.props.side / this._rank_squares;
    
     this._square_side = Math.min(ph, pw);
    
    let _user_side = pw / 1.2;
    return (
      <div style={{ width: pw*6, display: "inline-block", marginTop: "5px", marginBottom: "5px", }}>
        <div style={{ width:pw*3.7,display: "inline-block"}}>
        <img
          style={this.props.cssmanager.userPicture(_user_side)}
          src={`images/${this.props.PlayerData.UserPicture}`}
          alt="user"
        />
        <div style={this.props.cssmanager.tagLine()}>
          <a
            href="#/"
            target="_blank"
            style={{
              color: "#fff",
              fontSize: pw / 4,
              fontWeight: "600",
              marginRight: "15px"
            }}
          >
            {this.props.PlayerData.Name}({this.props.PlayerData.Rating})
          </a>
          <img
            style={this.props.cssmanager.userFlag(_user_side)}
            src={this.props.cssmanager.flags(this.props.PlayerData.Flag)}
            alt={this.props.PlayerData.Flag}
          />
        </div>

        </div>
        <div style={{width: pw*2, display: "inline-block"}}>
        <FallenSoldier
            cssmanager={this.props.cssmanager}
            side={pw}
            color={this.props.color}
            FallenSoldiers={this.props.FallenSoldiers}
          />
					
			  </div>        
      </div>
    );
  }
}
