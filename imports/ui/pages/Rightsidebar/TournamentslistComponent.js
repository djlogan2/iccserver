import React, { Component } from 'react'

export default class TournamentslistComponent extends Component {

    /**
     * 
     * TournamentList Load from server side which bind in List state
     * Now we bind state List when Player click it open Game view Mode
     *  
     */



    render() {

        let lists = [
            { name: '3|2 Blitz Arena', status: 'Round 1 of 5', count: '15', src: 'images/blitz-icon.png' },
            { name: '1|0 Bullet Arena', status: 'in 4 min', count: '40 ', src: 'images/rapid-icon.png' },
            { name: '15|10 Rapid Swiss ', status: 'Round 1 of 5', count: '54', src: 'images/bullet-icon.png' },
            { name: '1|0 Bullet Arena', status: 'Round 1 of 5', count: '35', src: 'images/blitz-icon.png' },
            { name: '3|2 Blitz Arena', status: 'Round 1 of 7', count: '49', src: 'images/rapid-icon.png' },
            { name: '1|0 Bullet Arena', status: 'in 8 min', count: '55', src: 'images/bullet-icon.png' },
            { name: '15|10 Rapid Swiss', status: 'Round 1 of 3', count: '25', src: 'images/blitz-icon.png' },
            { name: '15|10 Rapid Swiss ', status: 'Round 1 of 5', count: '15', src: 'images/rapid-icon.png' },
        ];

        return (
            <Tournaments lists={lists} />
            /* 
                        <div className="challenge-content">
                            <a href="#" className="competitions-list-item-component">
                                <i className="blitzicon"><img src="images/rapid-icon.png" /></i>
                                <span className="competitions-list-item-name">15|10 Rapid Swiss </span>
                                <span className="competitions-list-item-status">Round 1 of 5</span>
                                <span className="competitions-list-item-count">51 </span>
                                <i className="fa fa-user" aria-hidden="true"></i>
                            </a>
                        </div>
                        <div className="challenge-content">
                            <a href="#" className="competitions-list-item-component">
                                <i className="blitzicon"><img src="images/blitz-icon.png" /></i>
                                <span className="competitions-list-item-name">3|2 Blitz Arena</span>
                                <span className="competitions-list-item-status">88 mins left</span>
                                <span className="competitions-list-item-count">70 </span>
                                <i className="fa fa-user" aria-hidden="true"></i>
                            </a>
                        </div>
                        <div className="challenge-content">
                            <a href="#" className="competitions-list-item-component">
                                <i className="blitzicon"><img src="images/blitz-icon.png" /></i>
                                <span className="competitions-list-item-name">3|2 Blitz Arena</span>
                                <span className="competitions-list-item-status">88 mins left</span>
                                <span className="competitions-list-item-count">70 </span>
                                <i className="fa fa-user" aria-hidden="true"></i>
                            </a>
                        </div>
                        <div className="challenge-content">
                            <a href="#" className="competitions-list-item-component">
                                <i className="blitzicon"><img src="images/bullet-icon.png" /></i>
                                <span className="competitions-list-item-name">1|0 Bullet Arena</span>
                                <span className="competitions-list-item-status">in 4 min</span>
                                <span className="competitions-list-item-count">40 </span>
                                <i className="fa fa-user" aria-hidden="true"></i>
                            </a>
                        </div>
                        <div className="challenge-content">
                            <a href="#" className="competitions-list-item-component">
                                <i className="blitzicon"><img src="images/rapid-icon.png" /></i>
                                <span className="competitions-list-item-name">15|10 Rapid Swiss </span>
                                <span className="competitions-list-item-status">Round 1 of 5</span>
                                <span className="competitions-list-item-count">51 </span>
                                <i className="fa fa-user" aria-hidden="true"></i>
                            </a>
                        </div>
                        <div className="challenge-content">
                            <a href="#" className="competitions-list-item-component">
                                <i className="blitzicon"><img src="images/blitz-icon.png" /></i>
                                <span className="competitions-list-item-name">3|2 Blitz Arena</span>
                                <span className="competitions-list-item-status">88 mins left</span>
                                <span className="competitions-list-item-count">70 </span>
                                <i className="fa fa-user" aria-hidden="true"></i>
                            </a>
                        </div>
                        <div className="challenge-content">
                            <a href="#" className="competitions-list-item-component">
                                <i className="blitzicon"><img src="images/blitz-icon.png" /></i>
                                <span className="competitions-list-item-name">3|2 Blitz Arena</span>
                                <span className="competitions-list-item-status">88 mins left</span>
                                <span className="competitions-list-item-count">70 </span>
                                <i className="fa fa-user" aria-hidden="true"></i>
                            </a>
                        </div>
                        <div className="challenge-content">
                            <a href="#" className="competitions-list-item-component">
                                <i className="blitzicon"><img src="images/bullet-icon.png" /></i>
                                <span className="competitions-list-item-name">1|0 Bullet Arena</span>
                                <span className="competitions-list-item-status">in 4 min</span>
                                <span className="competitions-list-item-count">40 </span>
                                <i className="fa fa-user" aria-hidden="true"></i>
                            </a>
                        </div>
                        <div className="challenge-content">
                            <a href="#" className="competitions-list-item-component">
                                <i className="blitzicon"><img src="images/rapid-icon.png" /></i>
                                <span className="competitions-list-item-name">15|10 Rapid Swiss </span>
                                <span className="competitions-list-item-status">Round 1 of 5</span>
                                <span className="competitions-list-item-count">51 </span>
                                <i className="fa fa-user" aria-hidden="true"></i>
                            </a>
                        </div>
                        <div className="challenge-content">
                            <a href="#" className="competitions-list-item-component">
                                <i className="blitzicon"><img src="images/blitz-icon.png" /></i>
                                <span className="competitions-list-item-name">3|2 Blitz Arena</span>
                                <span className="competitions-list-item-status">88 mins left</span>
                                <span className="competitions-list-item-count">70 </span>
                                <i className="fa fa-user" aria-hidden="true"></i>
                            </a>
                        </div>
                        </div > */
        )
    }
}


class Tournaments extends Component {

    constructor() {
        super();

    }
    render() {
        let listItem = this.props.lists.map((list, index) => {


            return (
                <div className="challenge-content" key={index}>
                    <a href="#" className="competitions-list-item-component">
                        <i className="blitzicon"><img src={list.src} /></i>
                        <span className="competitions-list-item-name">{list.name}</span>
                        <span className="competitions-list-item-status">{list.status}</span>
                        <span className="competitions-list-item-count">{list.count} </span>
                        <i className="fa fa-user" aria-hidden="true"></i>
                    </a>
                </div>
            );
        });


        return (
            <div className="tournament-content">
                {listItem}
            </div>
        );
    }
}
