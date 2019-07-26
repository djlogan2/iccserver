import React, { Component } from 'react';


export default class Players extends Component {
                 constructor(props) {
                   super(props);
                 }
                 
                 render() {
                   return (
                      <div
                       style={this.props.CssManager.tagline()}
                      >
                       <a
                         href="#"
                         target="_blank"
                         style={this.props.CssManager.username()}
                       >
                         {this.props.playerInfo} ({this.props.rating})
                       </a>
                       <i style={this.props.CssManager.flags("us")} />
                     </div>
                   );
                 }
               }
