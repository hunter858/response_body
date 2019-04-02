'use strict';

import React,{component} from 'react' ;
import Constants from '../../Main/Constants';
import PropTypes from 'prop-types';

import {
  TouchableHighlight,
  StyleSheet,
  Text,
  PixelRatio,
  View,
  ViewPropTypes,
} from 'react-native';


 var UNSELECT_COLOR =  'rgb(240,240,240)';
 var UNSELECT_PRESS_COLOR = 'rgb(202,202,202)';
 var SELECT_COLOR = 'rgb(17,200,172)';
 var SELECT_PRESS_COLOR = 'rgb(24,194,168)';
 var UNSELECT_TEXT_COLOR = Constants.TextColor.rgb0 ;
 var SELECT_TEXT_COLOR = 'white';


class CommonBtn extends React.Component{


    static propTypes = { 
      textStyle: Text.propTypes.style,
      style: ViewPropTypes.style,
      selectText: PropTypes.string,
      unselectText: PropTypes.string,
      onPress:PropTypes.func,
      unselectTextColor:PropTypes.string,
      selectTextColor:PropTypes.string,
      selectColor:PropTypes.string,
      selectPressColor:PropTypes.string,
      unselectColor:PropTypes.string,
      unselectPressColor:PropTypes.string,
    }

    constructor(props){
      super(props);
      this.state = {
        selected:this.props.selected?this.props.selected:false,
        enabled: this.props.enabled?this.props.enabled:true,
      };
    }


    componentWillMount() {
      
    }

    _onPress() {
      if(this.state.enabled) {
         this.setState({
            selected: !this.state.selected,
          });

         this.props.onPress(!this.state.selected, this.props.data);
      }
    }

    setDisabled(){

      this.setState({
        enabled: false,
      });
    }

    setEnabled(){
      this.setState({
        enabled: true,
      });
    }


    render(){

      var underlayColor = this.state.selected ? this.props.selectPressColor : this.props.unselectPressColor;
      var text = this.state.selected ? this.props.selectText : this.props.unselectText;
      var textColor =this.state.selected ? this.props.selectTextColor : this.props.unselectTextColor;
      var backColor = this.state.selected ? this.props.selectColor: this.props.unselectColor;

      if(!this.state.enabled) {
          backColor = 'white';
          underlayColor = 'white';
          textColor = UNSELECT_PRESS_COLOR;
      }

      var container = {alignItems:'center', justifyContent:'center',
                      backgroundColor:backColor};

      return(
        <TouchableHighlight onPress={()=>{this._onPress()}} underlayColor={underlayColor} style={[this.props.style, container]}>
                <Text style={[this.props.textStyle, {color: textColor}]}>{text}</Text>
        </TouchableHighlight>
      );
    }

}

CommonBtn.defaultProps = {

    unselectTextColor: UNSELECT_TEXT_COLOR,
    unselectColor:UNSELECT_COLOR,
    selectTextColor:SELECT_TEXT_COLOR,
    selectColor:SELECT_COLOR,
    unselectPressColor:UNSELECT_PRESS_COLOR,
    selectPressColor:SELECT_PRESS_COLOR,
    selected:false,
    enabled: true,
    textStyle:{
        fontSize: Constants.FontSize.fs25,
        opacity: 0.8,
    },
}

module.exports = CommonBtn;
