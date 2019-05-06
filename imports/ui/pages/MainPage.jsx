import React, { Component } from 'react';
import { withHistory, Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Leftsidebar from './Leftsidebar';
import Rightsidebar from './Rightsidebar';
import './css/chessbord';
import './css/leftsidebar';
import './css/rightsidebar';
import Game from '../pages/components/game'

export default class MainPage extends Component {
  constructor(props){
    super(props);
    this.state = {
      username: '',
      visible: false  
    };
    this.toggleMenu = this.toggleMenu.bind(this);
  }

  toggleMenu() {
    
    this.setState({visible: !this.state.visible})
}


  render(){
    let currentUser = this.props.currentUser;
    let userDataAvailable = (currentUser !== undefined);
    let loggedIn = (currentUser && userDataAvailable);
    return (
  <div className="main">

<header className="header chess-header">
          <nav className="navbar navbar-toggleable-md navbar-light pt-0 pb-0 ">
          
                  <div className="pull-right top-right-menu-icons-group">

                    <div className="top-menu-list">
                       <img src="images/share-icon.png" alt="" />
                    </div>

                    <div className="top-menu-list">
                        <img src="images/play-icon-white.png" alt="" />
                    </div>

                    <div className="top-menu-list">
                      <img src="images/notification-icon.png" alt="" />
                    </div>

                    <div className="top-menu-list">
                      <img src="images/setting-icon-white.png" alt="" />
                    </div>
                  </div>
          
        </nav>
      </header>

      <div className="row">
            <div className="col-sm-2 left-col">
              
      <aside>
          <div className={ this.state.visible ? "sidebar left device-menu fliph" : "sidebar left device-menu"}>
            <div className="pull-left image">
                <img src="../../../images/logo-white-lg.png" />
            </div>
              <div className="float-right menu-close-icon">
                  <a onClick={this.toggleMenu} href="#" className="button-left"><span className="fa fa-fw fa-bars "></span></a>
                 
              </div>
                <Leftsidebar/>
            </div>
    </aside>

            </div>
        <div className="col-sm-5 col-md-8 col-lg-5 board-section">
          <Game/>
        </div>
        <div className="col-sm-4 col-md-4 col-lg-4 right-section">
          <Rightsidebar/>
        </div>
      </div>
   </div> 
      
    );
  }
}

MainPage.propTypes = {
  username: PropTypes.string
}
