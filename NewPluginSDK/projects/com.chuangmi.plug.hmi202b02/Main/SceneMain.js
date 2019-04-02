'use strict';

import { Package } from "miot";
import React from "react";
import {
  AppRegistry,
  StyleSheet,
  Text,
  TouchableHighlight,
  Image,
  View,
  TextInput,
  PixelRatio,
  StatusBar,
  TouchableOpacity,
  Platform,
  DeviceEventEmitter,
} from "react-native"
import { ImageButton, TitleBarBlack,TitleBarWhite } from 'miot/ui'
import {
  APPBAR_HEIGHT,APPBAR_MARGINBOTTOM,APPBAR_MARGINTOP,isIPX ,
  ratio,NavigatorBarHeight,screenWidth,screenHeight} from './ConstDefine';

export default class SceneMain extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      requestStatus: false,
    };
  }

  componentDidMount() {
  }

  render() {
    return (
      <View style={styles.containerAll} >
        <TitleBarBlack
          onPressLeft={() => Package.exit()}
          disabled={!this.state.numValid}
        />
        <View style={styles.containerIconDemo}>
          <Image style={styles.iconDemo} source={require("../Resources/control_home.png")} />
          <Text style={styles.iconText}>开发自定义智能场景</Text>
        </View>
        <View style={styles.containerMenu}>
        </View>
      </View>
    );
  }
}

var styles = StyleSheet.create({
  containerAll: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#838383',
    marginTop: 0,
  },
  containerIconDemo: {
    flex: 1.7,
    flexDirection: 'column',
    backgroundColor: '#191919',
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  containerMenu: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    alignSelf: 'stretch',
  },
  iconDemo: {
    width: 270,
    height: 181,
    alignSelf: 'center',
  },
  iconText: {
    fontSize: 20,
    textAlign: 'center',
    color: '#ffffff',
    marginTop: 20,
    alignSelf: 'center'
  },

  textInput: {
    height: 40,
    borderWidth: 0.5,
    borderColor: '#0f0f0f',
    // flex: 1,
    fontSize: 16,
    padding: 4,
    marginTop: 20,
    marginLeft: 30,
    marginRight: 30,
    backgroundColor: '#ffffff',
  },
});
