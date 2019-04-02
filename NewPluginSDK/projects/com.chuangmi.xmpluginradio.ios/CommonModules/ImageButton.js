'use strict';

import React,{component} from 'react' ;
import PropTypes from 'prop-types';
import {
  Dimensions,
  StyleSheet,
  View,
  TouchableWithoutFeedback,
  Image,
  PixelRatio,
  Text
} from 'react-native';

var propTypes = {
  source: PropTypes.oneOfType([ PropTypes.number,PropTypes.object]),
  highlightedSource: PropTypes.oneOfType([ PropTypes.number,PropTypes.object]),
  onPress: PropTypes.func,
};

export default class ImageButton extends React.Component{
  static propTypes= propTypes;

  constructor(props){
    super(props);
    this.state = {
      buttonPressed: false,
    };
  }

  _buttonPressIn() {
    this.setState({ buttonPressed: true });
  }

  _buttonPressOut() {
    this.setState({ buttonPressed: false });
  }

  _isButtonPressed() {
    return this.state.buttonPressed;
  }

  render() {
    var source = this.props.source;
    if (this._isButtonPressed() && this.props.highlightedSource) {
      source = this.props.highlightedSource;
    }
    return (
      <TouchableWithoutFeedback
        onPress={this.props.onPress}
        onPressIn={()=>{this._buttonPressIn()}}
        onPressOut={()=>{this._buttonPressOut()}}>
          <Image style={this.props.style} source={source}/>
      </TouchableWithoutFeedback>
    );
  }
}

ImageButton.defaultProps={
  image: null,
  highlightedImage: null,
  onPress: null,
};

