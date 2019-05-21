import React, { Component } from 'react';
import RightbarTop from './RightbarTop';
import RightbarBottom from './RightbarBottom';

class Rightsidebar extends Component {
  render() {

    return (
      <div>






<div className="ipad-right-section">
				
				<div className="board-player-top">
					<img className="user-pic" src="images/player-img-top.png" alt="" title="" />
					
					<div className="board-player-userTagline">
					<div className="user-tagline-component">
					<a href="#" target="_blank" className="user-tagline-username">Jack256 (633)</a> 
					 <i><img src="images/user-flag.png" alt="" /></i>
					</div> 
					<div className="captured-pieces board-pieces-component">
					
					</div>
					
					<div className="clock-top">
					10:00
					</div>
					
					</div>
					
					
				
				</div>
				
				
				
				<div className="ipad-scrore-right">
				<b>1.</b> e4 d5  <b>2.</b> exd5 b5  <b>3.</b> c3 c6  <b>4.</b> dxc6 b4  
<b>5.</b> ce2 a6  <b>6.</b> d4 a7  <b>7.</b> c3 b7  <b>8.</b> cxb7 xb7
<b>9.</b> f4 xd4  <b>10.</b> xd4 e5  <b>11.</b> xe5 


<div className="bs-example">
    <div className="panel-group" id="accordion">
        <div className="panel panel-default">
            <div className="panel-heading">
                <h4 className="panel-title">
                    [ <a data-toggle="collapse" data-parent="#accordion" href="#collapseOne" className="minus collapsed">&nbsp;</a> 
                </h4>
            </div>
            <div id="collapseOne" className="panel-collapse collapse">
                <div className="panel-body">
					12.b3 Ra7  13.Rfd1  Rb7  14.a3  bxa3  
15.Rxa3  Qb8 <span>1/2- 1/2 (39) Larsen,L(2448) - Vaclav, J (2481) </span>		
                </div>
				
            </div>]
			
        </div>
        
       
    </div>
	
</div>
<span>12</span>...bxa3  <span>13.</span>Qxa3  Qb8  <span>14.</span> Rfd1  Ra7  <span>15.</span> b3  Rb7  <span>16.</span> Rab1  
Nd4  <span>17.</span> Nxd4 		

				</div>
				
				
				<div className="board-player-bottom">
					<img className="user-pic" src="images/player-img-bottom.png" alt="" title="" />
					
					<div className="board-player-userTagline">
					<div className="user-tagline-component">
					<a href="#" target="_blank" className="user-tagline-username">John256 (210)</a> <i><img src="images/user-flag.png" alt="" /></i>
					</div> 
					<div className="captured-pieces board-pieces-component">
					
					</div>
					
					<div className="clock-bottom active">
					10:00
					</div>
					
					</div>
					
					
					</div>
				
			
			<div className="move-list-buttons">
				<div className="move-list-item">
					<a href="#"><img src="images/more-icon.png" /></a>
				</div>
				<div className="move-list-item">
					<a href="#"><img src="images/chat-icon-gray.png" /></a>
				</div>
				<div className="move-list-item">
					<a href="#"><img src="images/flip-icon.png" /></a>
				</div>
				<div className="move-list-item">
					<a href="#"><img src="images/prev-icon.png" /></a>
				</div>
				
				<div className="move-list-item">
					<a href="#"><img src="images/next-icon.png" /></a>
				</div>
			</div>
			
			
			</div>

<div className="right-content-desktop">
<div className="setting-icon"><a href="#"><img src="images/full-screen-icon.png" /></a></div>
		<div className="right-top-content">
        	<RightbarTop  />
		</div>
		<div className="right-bottom-content">
		<RightbarBottom/>
      </div>
</div>      
	  </div>
    );
  }
}

export default Rightsidebar;