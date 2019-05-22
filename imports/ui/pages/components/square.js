import React from 'react';
import '../css/chessbord';


export default function Square(props) {

  return (

    <button className={props.shade}
      onClick={props.onClick}
      style={props.style}>
      {props.children}
    </button>

  );

}
