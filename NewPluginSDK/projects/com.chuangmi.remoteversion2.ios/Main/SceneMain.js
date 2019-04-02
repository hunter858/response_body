'use strict';
import React ,{Component}from "react";
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
import { Package, Device,DeviceProperties, Service,DeviceEvent,Host} from "miot";

export default class SceneMain extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
    header:
        <View>
        <TitleBarBlack

            title={navigation.state["params"] ? navigation.state.params.name : Device.name}
            style={{ backgroundColor: 'transparent' }}
            onPressLeft={() => { Package.exit() }}
            onPressRight={() => {

                if (Platform.OS == 'android') {
                    navigation.setParams({ showDialog: true });
                } else {
                    navigation.navigate('moreMenu', { 'title': '设置' });
                }}} 
            onPressRight2 ={()=>{
                console.log('onPressRight2');
                Host.file.screenShot('share.png').then((res)=>{

                    Host.ui.openShareListBar('小米智能家庭', '小米智能家庭', { uri: res },'');
                 });
            }}   
            />
        </View>
    };
  };
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
