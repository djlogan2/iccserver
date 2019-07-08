import React, { Component } from 'react'
import PropTypes from 'prop-types'
import './toptabs/styles';
export default class GameComponent extends Component {

    render() {
        return (
            <div cover="../../../images/game-icon-gray.png">
                <div className="game-top-header">
                    <img src="images/circle-compass-icon.png" alt="" />
                    <span>1/2  -  1/2    US-ch Open 2019</span>
                    <div className="pull-right">
                        <a href="#"><img src="images/share-icon-gray.png" alt="" /></a>&nbsp; &nbsp;
						<a href="#"><img src="images/download-icon-gray.png" alt="" /></a>&nbsp; &nbsp;
						<a href="#"><img src="images/live-analisys-icon.png" alt="" /></a>
                    </div>
                </div>

                <div className="game-move-list">
                    <span>1.</span> e4 d5  <span>2.</span> exd5 b5  <span>3.</span> c3 c6  <span>4.</span> dxc6 b4  <span>5.</span> ce2 a6   <span>6.</span> d4 a7
           				 <span>7.</span> c3 b7  <span>8.</span> cxb7 xb7  <span>9.</span> f4 xd4  <span>10.</span> xd4 e5  <span>11.</span> xe5
           		 <div className="bs-example">
                        <div className="panel-group" id="accordion">
                            <div className="panel panel-default">
                                <div className="panel-heading">
                                    <h4 className="panel-title">
                                        <span>[</span> <a data-toggle="collapse" data-parent="#accordion" href="#collapseOne1" className="minus collapsed">&nbsp;</a>
                                    </h4>
                                </div>
                                <div id="collapseOne1" className="panel-collapse collapse">
                                    <div className="panel-body">
                                        12.b3 Ra7  13.Rfd1  Rb7  14.a3  bxa3
                          			    15.Rxa3  Qb8
										<span>1/2- 1/2 (39) Larsen,L(2448) - Vaclav, J (2481) </span>
                                    </div>
                                </div>
                                <span className="sign">]</span>
                            </div>
                        </div>
                    </div>
                    <span>12</span>...bxa3 <span>13.</span>Qxa3  Qb8
						<span>14.</span> Rfd1  Ra7  <span>15.</span> b3  Rb7
						<span>16.</span> Rab1 Nd4  <span>17.</span> Nxd4
        		 </div>

                <div className="game-buttons-move">
                    <a href="#"><img src="images/fast-forward-prev.png" /></a>
                    <a href="#"><img src="images/prev-icon-gray.png" /></a>
                    <a href="#"><img src="images/next-icon-gray.png" /></a>
                    <a href="#"><img src="images/fast-forward-next.png" /></a>
                    <a href="#"><img src="images/next-icon-single.png" /></a>
                    <a href="#"><img src="images/flip-icon-gray.png" /></a>
                    <a href="#"><img src="images/setting-icon.png" /></a>
                </div>
                <div className="draw-section">
                    <ul>
                        <li><a href="#" title="Takeback"><span><img src="images/take-forward-icon.png" /></span>Takeback</a></li>
                        <li><a href="#" title="Draw"><span><img src="images/draw-icon.png" /></span>Draw</a></li>
                        <li><a href="#" title="Resign"><span><img src="images/resign-icon.png" /></span>Resign</a></li>
                        <li><a href="#" title="Abort"><span><img src="images/abort-icon.png" /></span>Abort</a></li>
                    </ul>
                </div>
            </div>

        )
    }
}
