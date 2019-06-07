import React from "react";
import Tabs from "./toptabs/Tabs";
import "./bottomtabs/styles";

const RightbarBottom = () => (
  <div>
    <Tabs>
      <div label="Chat" className="chat">
        <div className="chat-content">
          <div className="user-1">
            <h6>NEW GAME</h6>
            <p>
              <a href="#">jack833</a> (639) vs. <a href="#">York-Duvenhage</a>{" "}
              (657) (10 min) win +85 / draw +4 / lose -77
              <a href="#">Try Focus Mode</a>
            </p>
          </div>

          <div className="user-2">
            <h6>GAME ABORTED</h6>
            <p>
              <a href="#">jack833</a> (639) vs. <a href="#">York-Duvenhage</a>{" "}
              (657) (10 min rated) Game has been aborted by the server
            </p>
          </div>
        </div>

        <div className="chat-input-box">
          <input type="text" placeholder="Message..." />
          <button className="send-btn" type="send" />
        </div>
      </div>

      <div label="Events" className="play">
        <h3>Events</h3>
        <p>
          orem ipsum dolor sit amet, consectetur adipisicing elit. Eius quos
          aliquam consequuntur, esse provident impedit minima porro!
        </p>
      </div>
      <div label="Friends" className="tournament">
        <h3>Friends</h3>
        <p>
          orem ipsum dolor sit amet, consectetur adipisicing elit. Eius quos
          aliquam consequuntur, esse provident impedit minima porro!
        </p>
      </div>
      <div label="History" className="tournament">
        <h3>History</h3>
        <p>
          orem ipsum dolor sit amet, consectetur adipisicing elit. Eius quos
          aliquam consequuntur, esse provident impedit minima porro!
        </p>
      </div>
    </Tabs>
  </div>
);
export default RightbarBottom;
