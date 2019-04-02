'use strict';
import React,{component} from 'react' ;
import {
  Image,
  Text,
  TouchableWithoutFeedback,
} from 'react-native';


class TouchableBtn extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            _pressing: false,
        }
    }

    _onPressIn() {

        this.setState({_pressing:true,});
    }

    _onPressOut() {
        this.setState({_pressing: false,});
    }

    setNativeProps(nativeProps) {
        this._root.setNativeProps(nativeProps);
    }

    render() {
        var imgSource ;
        if(this.state._pressing) {
        imgSource = this.props.pressInSource;

        } else {
        imgSource = this.props.pressOutSource;
        }
        return (
            <TouchableWithoutFeedback backgroundColor={'red'} onPressIn={()=>{this._onPressIn()}} onPressOut={()=>{this._onPressOut()}} onPress={this.props.onPress}>
                <Image  ref={component => this._root = component}  source={imgSource}  style={this.props.imgStyle}  resizeMode={this.props.resizeMode}>
                </Image>
            </TouchableWithoutFeedback>
        );
    }
}

module.exports = TouchableBtn;
