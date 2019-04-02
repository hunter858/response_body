'use strict';

import React,{component} from 'react' ;
import PropTypes from 'prop-types';

import {
  Text,
  View,
} from 'react-native';



class Label extends React.Component{

  static propTypes = {text : PropTypes.string}

  setNativeProps(nativeProps) {
      this._root.setNativeProps(nativeProps);
  }

  render(){
      return (
          <View ref={component => this._root = component} {...this.props} style={[{justifyContent:'center', alignItems:'center'},this.props.style]}>
            <Text style={this.props.textStyle} numberOfLines={1}>{this.props.text}</Text>
          </View>
      );
   }

}


module.exports = Label;