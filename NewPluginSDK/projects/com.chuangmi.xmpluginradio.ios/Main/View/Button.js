'use strict';

import React,{component} from 'react' ;

import {
 TouchableOpacity,
  View,
} from 'react-native';

class Button extends React.Component{
  
  constructor(props){
    super(props)
  }

  render(){
    return ( 
    <TouchableOpacity {...this.props}>
      {this.props.children}
    </TouchableOpacity>);
  }
};

module.exports = Button;
