
'use strict';

import React,{component} from 'react' ;
import {
  StyleSheet,
  Text,
  View,
  PixelRatio,
  TouchableWithoutFeedback,
  DeviceEventEmitter,
  ImageBackground,
  TouchableHighlight,
} from 'react-native';

import {
  APPBAR_HEIGHT,APPBAR_MARGINBOTTOM,APPBAR_MARGINTOP,isIPX ,
  ratio,NavigatorBarHeight,screenWidth,screenHeight} from '../ConstDefine';
import {withNavigation} from 'react-navigation';

var subscription;
class MainTopNotice extends React.Component{

  _onPress(){
    
    this.props.navigation.navigate('ClockSetting', {
      title:'音乐闹钟',
    });
  }

  render(){
    return (
      <View style={styles.constains} >
        <TouchableWithoutFeedback style={styles.constains1} onPress={()=>{this._onPress()}}>
          <View style={styles.constains1} >
            <ImageBackground style={styles.image} source={require('../../Resources/home_light_icon.png')}></ImageBackground>
            <Text style={styles.text}>提示:点击我可进入设置特色闹钟哦!</Text>
          </View>
      </TouchableWithoutFeedback>
        <TouchableHighlight  underlayColor={'#efc174'} style={styles.close} onPress={this.props.close}>
            <ImageBackground style={styles.image1} source={require('../../Resources/home_top_close.png')}></ImageBackground>
        </TouchableHighlight>
      </View>
    );

  }
}

var styles = StyleSheet.create({
  constains:{
    alignItems:'center',
    width:screenWidth,
    height:41,
    backgroundColor:'#efc174',
    flexDirection:'row',
  },
  constains1:{
    alignItems:'center',
    width:screenWidth-30,
    height:41,
    backgroundColor:'#efc174',
    flexDirection:'row',
  },
  image:{
    marginLeft:12,
    width:20,
    height:20,
  },
  image1:{
    width:8,
    height:8,
    marginLeft:37,
  },
  text:{
    marginLeft:12,
    fontSize:12,
    color:'rgba(255,255,255,0.9)',
  },
  close:{
    width:60,
    height:41,
    right:0,
    justifyContent:'center',
    position:'absolute',
  }
});

export default withNavigation(MainTopNotice);
