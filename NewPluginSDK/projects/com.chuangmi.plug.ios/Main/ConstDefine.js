
'use strict';

import React from 'react';
import {
  View,
  Text,
  AppRegistry,
  TouchableHighlight,
  TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native';


const isIPX = ((Platform.OS === 'ios')&&(Dimensions.get('window').height>=1218))?(true):(false);
const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56;
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;

var ConstDefine = {
  /* navigator 高度*/
  APPBAR_HEIGHT:  APPBAR_HEIGHT,
  /* 导航头 高度*/
  NavigatorBarHeight: (isIPX==true)?(44+64):(APPBAR_HEIGHT +20),
  /* iphone X 顶部安全区域高度 */
  APPBAR_MARGINTOP: (isIPX==true)?(44):(0),
  /* iphone X 底部安全区域高度 */
  APPBAR_MARGINBOTTOM: (isIPX==true)?(34):(0),
  /* 是否是iphone X */
  isIPX:isIPX,
  /* 屏幕宽 */
  screenWidth:ScreenWidth,
  /* 屏幕高 */
  screenHeight:ScreenHeight,
  
  ratio:ScreenWidth / 375,
}

module.exports = ConstDefine;