'use strict';

import React,{Component} from 'react';
import {
  View,
  Text,
  AppRegistry,
  TouchableHighlight,
  TouchableOpacity,
  Platform,
  Dimensions,
  StyleSheet,
  PixelRatio,
  StatusBar,
  ScrollView,
  Image,
  Animated,
  Easing,
  ImageBackground,
  DeviceEventEmitter,
  TouchableWithoutFeedback,
  NativeModules,
  ART,
} from 'react-native';

import {screenWidth,screenHeight} from '../ConstDefine';

const duration = 2000; // 外圈消失时间
const opacity1Arr = [0.8, 0]; // 内圈透明度变化范围
const opacity2Arr = [0.6, 0];
const opacity3Arr = [0.4, 0];
var scale1Arr,scale2Arr,scale3Arr;// 内圈，中圈，外圈

export default class PlugMainPageHMI206 extends React.Component{

  constructor(props, context) {
    super(props, context);

    this.state ={
      duration:(this.props.duration)?(this.props.duration):(2000),
      insideCirle:(this.props.insideCirle)?(this.props.insideCirle):(100),
      outsideCirle:(this.props.outsideCirle)?(this.props.outsideCirle):(260),
    }
    var Average = (this.state.outsideCirle -this.state.insideCirle)/3;

    scale1Arr = [this.state.insideCirle,this.state.insideCirle +0];
    scale2Arr = [this.state.insideCirle,this.state.insideCirle +Average];
    scale3Arr = [this.state.insideCirle,this.state.insideCirle +2*Average];

    this.scale1 = new Animated.Value(0);
    this.scale2 = new Animated.Value(0);
    this.scale3 = new Animated.Value(0);
    this.opacity1 = new Animated.Value(0);
    this.opacity2 = new Animated.Value(0);
    this.opacity3 = new Animated.Value(0);
  }

  componentWillMount(){
  }

  componentDidMount(){

    this._animate();
  }

  _renderCircle(scale, opacity) {
      return (
        <View style={{
          flex:1,
          position: 'absolute',
          alignItems: 'center',
          justifyContent: 'center',
          alignSelf:'center',
          width:this.state.insideCirle,
          height:this.state.insideCirle,
        }}>
          <Animated.Image
            style={{ width: scale, height: scale, opacity: opacity }}
            source={require('../../Resources/air_circle_cool.png')}/>
        </View>
    );
  }

  startAnimate(){

    this._animate();
  }

  stopAnimate(){

  }

  _createAnimation(val, duration) {
    return Animated.timing(
      val,
      {
        toValue: 1,
        duration,
      }
    )
  }

  _animate() {
    this.scale1.setValue(0);
    this.scale2.setValue(0);
    this.scale3.setValue(0);
    this.opacity1.setValue(0);
    this.opacity2.setValue(0);
    this.opacity3.setValue(0);
   this.Animated = Animated.parallel(
      [
        this._createAnimation(this.scale1, duration + 800),
        this._createAnimation(this.scale2, duration + 400),
        this._createAnimation(this.scale3, duration),
        this._createAnimation(this.opacity1, duration + 800),
        this._createAnimation(this.opacity2, duration + 400),
        this._createAnimation(this.opacity3, duration),
      ],
      {
        stopTogether: false,
      }
    ).start(() => this._animate());
  }

  render(){
    let scale1 = this.scale1.interpolate({
      inputRange: [0, 1],
      outputRange: scale1Arr,
    })
    let scale2 = this.scale2.interpolate({
      inputRange: [0, 1],
      outputRange: scale2Arr,
    })
    let scale3 = this.scale3.interpolate({
      inputRange: [0, 1],
      outputRange: scale3Arr,
    })
    let opacity1 = this.opacity1.interpolate({
      inputRange: [0, 1],
      outputRange: opacity1Arr,
    })
    let opacity2 = this.opacity2.interpolate({
      inputRange: [0, 1],
      outputRange: opacity2Arr,
    })
    let opacity3 = this.opacity3.interpolate({
      inputRange: [0, 1],
      outputRange: opacity3Arr,
    })
    return(
      <View style={{flex: 1,flexDirection: "column"}}>
        {this._renderCircle(scale3, opacity3)}
        {this._renderCircle(scale2, opacity2)}
        {this._renderCircle(scale1, opacity1)}
      </View>
    )
  }

}


var styles = StyleSheet.create({
  circleWrapper: {
    // top: circleTop,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: screenWidth,
    height: screenHeight,
  }
});
