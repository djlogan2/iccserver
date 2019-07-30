import React, { Component } from "react";

const MoveListComponent = () => (
  <div>
    <div className="game-move-list">
      <span>1.</span> e4 d5 <span>2.</span> exd5 b5 <span>3.</span> c3 c6{" "}
      <span>4.</span> dxc6 b4 <span>5.</span> ce2 a6 <span>6.</span> d4 a7
      <span>7.</span> c3 b7 <span>8.</span> cxb7 xb7 <span>9.</span> f4 xd4{" "}
      <span>10.</span> xd4 e5 <span>11.</span> xe5
      <span>12</span>...bxa3 <span>13.</span>Qxa3 Qb8
      <span>14.</span> Rfd1 Ra7 <span>15.</span> b3 Rb7
      <span>16.</span> Rab1 Nd4 <span>17.</span> Nxd4
    </div>

    <div className="game-buttons-move">
      {/* 
					Game History Button Component
					Different buttons such as next and previous is available for
					player to check the previous moves. this along with GameComponent */}

      <a href="#">
        <img src="images/fast-forward-prev.png" />
      </a>
      <a href="#">
        <img src="images/prev-icon-gray.png" />
      </a>
      <a href="#">
        <img src="images/next-icon-gray.png" />
      </a>
      <a href="#">
        <img src="images/fast-forward-next.png" />
      </a>
      <a href="#">
        <img src="images/next-icon-single.png" />
      </a>

      {/*
					 Game Board flip Component
					  And
					 Game Board Setting Component
					 Player can flip the position of the Board (top/bottom).
					 Player can change the game board colour, peace.
					 this along with GameComponent
 					*/}

      <a href="#">
        <img src="images/flip-icon-gray.png" />
      </a>

      <a href="#">
        <img src="images/setting-icon.png" />
      </a>
    </div>
  </div>
);
export default MoveListComponent;
