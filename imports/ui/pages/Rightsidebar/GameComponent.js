import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Gamename from '../Rightsidebar/GamenameComponent';
import Takeback from '../Rightsidebar/TakebackComponent';
import Draw from '../Rightsidebar/DrawComponent';
import Resign from '../Rightsidebar/ResignComponent';
import Abort from '../Rightsidebar/AbortComponent';


import './toptabs/styles';
export default class GameComponent extends Component {


    /**
     * 
     * 
    [Black "vimal2112"]
    [Result "1-0"]
    [ECO "B00"]
    [ECOUrl "https://www.chess.com/openings/B00-Kings-Pawn-Opening-Owen-Defense"]
    [CurrentPosition "8/4kp2/2B1p2Q/p1NpP3/3P4/1p6/PP3PPP/R3K2R b KQ -"]
    [Timezone "UTC"]
    [UTCDate "2019.07.12"]
    [UTCTime "10:20:31"]
    [WhiteElo "481"]
    [BlackElo "383"]
    [TimeControl "600"]
    [Termination "cheddar48 won by resignation"]
    [StartTime "10:20:31"]
    [EndDate "2019.07.12"]
    [EndTime "10:28:47"]
    [Link "https://www.chess.com/live/game/3857131651"]
    
    1. e4 {[%clk 0:09:54.8]} 1... b6 {[%clk 0:09:57.9]} (1... a6) 2. Nf3 {[%clk
    0:09:50.4]} 2... a6 {[%clk 0:09:51.8]} 3. Nd4 {[%clk 0:09:48.3]} 3... Nc6 {[%clk
    0:09:47.5]} 4. c3 {[%clk 0:09:43.7]} 4... Nxd4 {[%clk 0:09:40.7]} 5. cxd4 {[%clk
    0:09:40.9]} 5... Bb7 {[%clk 0:09:32]} 6. Qf3 {[%clk 0:09:33.1]} 6... Nf6 {[%clk
    0:09:24.3]} 7. d3 {[%clk 0:09:06.6]} 7... Bxe4 {[%clk 0:09:09.9]} 8. dxe4 {[%clk
    0:09:04.5]} 8... d5 {[%clk 0:08:51.4]} 9. e5 {[%clk 0:08:59.7]} 9... Ng8 {[%clk
    0:08:43.2]} 10. Bd3 {[%clk 0:08:45.1]} 10... Nh6 {[%clk 0:08:27.2]} 11. Bf4
    {[%clk 0:08:28.2]} 11... g5 {[%clk 0:08:11]} 12. Bxg5 {[%clk 0:08:25.3]} 12...
    Nf5 {[%clk 0:07:57]} 13. Bxf5 {[%clk 0:08:13.9]} 13... e6 {[%clk 0:07:53.1]} 14.
    Bxd8 {[%clk 0:08:05.7]} 14... Kxd8 {[%clk 0:07:48.9]} 15. Bd3 {[%clk 0:07:52.6]}
    15... Bh6 {[%clk 0:07:32.4]} 16. Qf6+ {[%clk 0:07:48.2]} 16... Ke8 {[%clk
    0:07:23.6]} 17. Qxh8+ {[%clk 0:07:43.4]} 17... Bf8 {[%clk 0:07:08.4]} 18. Qxh7
    {[%clk 0:07:40]} 18... Rd8 {[%clk 0:06:58.3]} 19. Bc2 {[%clk 0:07:23.4]} 19...
    Rd7 {[%clk 0:06:44.8]} 20. Ba4 {[%clk 0:07:21.6]} 20... c6 {[%clk 0:06:37]} 21.
    Bxc6 {[%clk 0:07:19.5]} 21... b5 {[%clk 0:06:26]} 22. Nc3 {[%clk 0:07:15]} 22...
    b4 {[%clk 0:06:11.5]} 23. Na4 {[%clk 0:07:12.4]} 23... a5 {[%clk 0:06:02.3]} 24.
    Nb6 {[%clk 0:07:11.1]} 24... b3 {[%clk 0:05:49.4]} 25. Nxd7 {[%clk 0:07:06.6]}
    25... Ke7 {[%clk 0:05:38.5]} 26. Nc5 {[%clk 0:06:58.7]} 26... Bh6 {[%clk
    0:05:24.3]} 27. Qxh6 {[%clk 0:06:55.5] Game may have
    continued...} (27. Qxh6 Kd8 28. Na6 Ke7 29. Qh8 bxa2 30. Qe8#) 1-0
    
    */


    render() {
        return (
            <div cover="../../../images/game-icon-gray.png">
                <Gamename />

                <div className="game-move-list">
                    <span>1.</span> e4 d5  <span>2.</span> exd5 b5  <span>3.</span> c3 c6  <span>4.</span> dxc6 b4  <span>5.</span> ce2 a6   <span>6.</span> d4 a7
           				 <span>7.</span> c3 b7  <span>8.</span> cxb7 xb7  <span>9.</span> f4 xd4  <span>10.</span> xd4 e5  <span>11.</span> xe5
           		 {/* <div className="bs-example">
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
                */}     <span>12</span>...bxa3 <span>13.</span>Qxa3  Qb8
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
                        <Takeback />
                        <Draw />
                        <Resign />
                        <Abort />
                    </ul>
                </div>
            </div>

        )
    }
}
