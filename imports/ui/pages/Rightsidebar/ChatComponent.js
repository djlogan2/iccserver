import React, { Component } from 'react'

export default class ChatComponent extends Component {
    render() {
        return (
            <div>

                <div className="chat-content">
                    <div className="user-1">
                        <h6>NEW GAME</h6>
                        <p><a href="#">jack833</a> (639) vs. <a href="#">York-Duvenhage</a> (657) (10 min)
                            win +85 / draw +4 / lose -77
                            <a href="#">Try Focus Mode</a>
                        </p>
                    </div>
                    <div className="user-2">
                        <h6>GAME ABORTED</h6>
                        <p><a href="#">jack833</a> (639) vs. <a href="#">York-Duvenhage</a> (657) (10 min rated)
                        Game has been aborted by the server</p>
                    </div>
                </div>
                <div className="chat-input-box">
                    <input type="text" placeholder="Message..." />
                    <button className="send-btn" type="send"></button>
                </div>
            </div>
        )
    }
}