import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import React from "react";
import { Logger } from "../../../../lib/client/Logger";
const log = new Logger("client/CreateGameComponent_js");
// TODO: What do we do when a user is logged on local AND legacy? They currently show up twice, as in localuser and legacyuser(L).
//   I would assume we want to remove them from one of the lists...
// TODO: Do users that are not logged on to legacy see legacy users? I think not, but at the moment, everyone will.
export default class CreateGameComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      trial: 0
    };
  }

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
      </div>
    );
  }
}
