import React, { Component } from "react";

export default class CreateGameComponent extends Component {
  render() {
    return (
      <div className="play-tab-content">
        <nav>
          <div className="nav nav-tabs nav-fill" id="nav-tab" role="tablist">
            <ul>
              <li>
                <span>Time</span>
                <a
                  className="nav-item nav-link active"
                  id="nav-home-tab"
                  data-toggle="tab"
                  href="#nav-time"
                  role="tab"
                  aria-controls="nav-home"
                  aria-selected="true"
                >
                  10 min <i className="fa fa-sort-down" aria-hidden="true" />
                </a>
              </li>
              <li>
                <span>Type</span>
                <a
                  className="nav-item nav-link"
                  id="nav-profile-tab"
                  data-toggle="tab"
                  href="#nav-type"
                  role="tab"
                  aria-controls="nav-profile"
                  aria-selected="false"
                >
                  <img src="images/type-icon.png" alt="" />{" "}
                  <i className="fa fa-sort-down" aria-hidden="true" />
                </a>
              </li>
            </ul>
          </div>
        </nav>
        <div className="tab-content py-3 px-3 px-sm-0" id="nav-tabContent">
          <div
            className="tab-pane fade show active"
            id="nav-time"
            role="tabpanel"
            aria-labelledby="nav-time-tab"
          >
            <ul className="multiple-time-item">
              <li>
                <a href="#">10 min</a>
              </li>
              <li>
                <a href="#">5 min</a>
              </li>
              <li>
                <a href="#">3 min</a>
              </li>
              <li>
                <a href="#">1 min</a>
              </li>
              <li>
                <a href="#">15 | 10</a>
              </li>
              <li>
                <a href="#">3 | 2</a>
              </li>
              <li>
                <a href="#">2 | 1</a>
              </li>
              <li>
                <a href="#">More</a>
              </li>
            </ul>
          </div>
          <div
            className="tab-pane fade"
            id="nav-type"
            role="tabpanel"
            aria-labelledby="nav-type-tab"
          >
            <div className="challenge-content">
              <a href="#" className="competitions-list-item-component">
                <i className="blitzicon">
                  <img src="images/blitz-icon.png" />
                </i>
                <span className="competitions-list-item-name">
                  3|2 Blitz Arena
                </span>
                <span className="competitions-list-item-status">
                  88 mins left
                </span>
                <span className="competitions-list-item-count">70 </span>
                <i className="fa fa-user" aria-hidden="true" />
              </a>
            </div>
            <div className="challenge-content">
              <a href="#" className="competitions-list-item-component">
                <i className="blitzicon">
                  <img src="images/bullet-icon.png" />
                </i>
                <span className="competitions-list-item-name">
                  1|0 Bullet Arena
                </span>
                <span className="competitions-list-item-status">in 4 min</span>
                <span className="competitions-list-item-count">40 </span>
                <i className="fa fa-user" aria-hidden="true" />
              </a>
            </div>
            <div className="challenge-content">
              <a href="#" className="competitions-list-item-component">
                <i className="blitzicon">
                  <img src="images/rapid-icon.png" />
                </i>
                <span className="competitions-list-item-name">
                  15|10 Rapid Swiss{" "}
                </span>
                <span className="competitions-list-item-status">
                  Round 1 of 5
                </span>
                <span className="competitions-list-item-count">51 </span>
                <i className="fa fa-user" aria-hidden="true" />
              </a>
            </div>
            <div className="challenge-content">
              <a href="#" className="competitions-list-item-component">
                <i className="blitzicon">
                  <img src="images/blitz-icon.png" />
                </i>
                <span className="competitions-list-item-name">
                  3|2 Blitz Arena
                </span>
                <span className="competitions-list-item-status">
                  88 mins left
                </span>
                <span className="competitions-list-item-count">70 </span>
                <i className="fa fa-user" aria-hidden="true" />
              </a>
            </div>
            <div className="challenge-content">
              <a href="#" className="competitions-list-item-component">
                <i className="blitzicon">
                  <img src="images/blitz-icon.png" />
                </i>
                <span className="competitions-list-item-name">
                  3|2 Blitz Arena
                </span>
                <span className="competitions-list-item-status">
                  88 mins left
                </span>
                <span className="competitions-list-item-count">70 </span>
                <i className="fa fa-user" aria-hidden="true" />
              </a>
            </div>
            <div className="challenge-content">
              <a href="#" className="competitions-list-item-component">
                <i className="blitzicon">
                  <img src="images/bullet-icon.png" />
                </i>
                <span className="competitions-list-item-name">
                  1|0 Bullet Arena
                </span>
                <span className="competitions-list-item-status">in 4 min</span>
                <span className="competitions-list-item-count">40 </span>
                <i className="fa fa-user" aria-hidden="true" />
              </a>
            </div>
            <div className="challenge-content">
              <a href="#" className="competitions-list-item-component">
                <i className="blitzicon">
                  <img src="images/rapid-icon.png" />
                </i>
                <span className="competitions-list-item-name">
                  15|10 Rapid Swiss{" "}
                </span>
                <span className="competitions-list-item-status">
                  Round 1 of 5
                </span>
                <span className="competitions-list-item-count">51 </span>
                <i className="fa fa-user" aria-hidden="true" />
              </a>
            </div>
            <div className="challenge-content">
              <a href="#" className="competitions-list-item-component">
                <i className="blitzicon">
                  <img src="images/blitz-icon.png" />
                </i>
                <span className="competitions-list-item-name">
                  3|2 Blitz Arena
                </span>
                <span className="competitions-list-item-status">
                  88 mins left
                </span>
                <span className="competitions-list-item-count">70 </span>
                <i className="fa fa-user" aria-hidden="true" />
              </a>
            </div>
            <div className="challenge-content">
              <a href="#" className="competitions-list-item-component">
                <i className="blitzicon">
                  <img src="images/blitz-icon.png" />
                </i>
                <span className="competitions-list-item-name">
                  3|2 Blitz Arena
                </span>
                <span className="competitions-list-item-status">
                  88 mins left
                </span>
                <span className="competitions-list-item-count">70 </span>
                <i className="fa fa-user" aria-hidden="true" />
              </a>
            </div>
            <div className="challenge-content">
              <a href="#" className="competitions-list-item-component">
                <i className="blitzicon">
                  <img src="images/bullet-icon.png" />
                </i>
                <span className="competitions-list-item-name">
                  1|0 Bullet Arena
                </span>
                <span className="competitions-list-item-status">in 4 min</span>
                <span className="competitions-list-item-count">40 </span>
                <i className="fa fa-user" aria-hidden="true" />
              </a>
            </div>
            <div className="challenge-content">
              <a href="#" className="competitions-list-item-component">
                <i className="blitzicon">
                  <img src="images/rapid-icon.png" />
                </i>
                <span className="competitions-list-item-name">
                  15|10 Rapid Swiss{" "}
                </span>
                <span className="competitions-list-item-status">
                  Round 1 of 5
                </span>
                <span className="competitions-list-item-count">51 </span>
                <i className="fa fa-user" aria-hidden="true" />
              </a>
            </div>
            <div className="challenge-content">
              <a href="#" className="competitions-list-item-component">
                <i className="blitzicon">
                  <img src="images/blitz-icon.png" />
                </i>
                <span className="competitions-list-item-name">
                  3|2 Blitz Arena
                </span>
                <span className="competitions-list-item-status">
                  88 mins left
                </span>
                <span className="competitions-list-item-count">70 </span>
                <i className="fa fa-user" aria-hidden="true" />
              </a>
            </div>
          </div>
          <div className="play-btn-right">
            <a href="#">Play</a>
          </div>
        </div>
      </div>
    );
  }
}
