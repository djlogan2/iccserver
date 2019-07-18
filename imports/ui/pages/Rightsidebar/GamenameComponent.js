
import React, { Component } from 'react';

export default class GamenameComponent extends Component {
    /*
        This Component display turnament Name using Props 
        it load When game Load or create Game By player   
    
    */



    render() {
        return (
            <div className="game-top-header">
                <img src="images/circle-compass-icon.png" alt="" />
                <span>1/2  -  1/2    US-ch Open 2019</span>
                <div className="pull-right">
                    <GameShareComponent />
                    <GameSheetDeownloadComponent />
                    <GameAnalisysComponent />
                </div>
            </div>
        )
    }
}
/**
 * Gameshared Component : Player can share the game to invite new players.
 * GameSheet Download Component : Player can download PGN For feture uses.
 * GameAnalisys Component : Player can Analyisys its Game using Stockfish 
 * 
 */
const GameShareComponent = () => (<a href="#"><img src="images/share-icon-gray.png" alt="" /></a>);

const GameSheetDeownloadComponent = () => (<a href="#"><img src="images/download-icon-gray.png" alt="" /></a>);

const GameAnalisysComponent = () => (<a href="#"><img src="images/live-analisys-icon.png" alt="" /></a>);
