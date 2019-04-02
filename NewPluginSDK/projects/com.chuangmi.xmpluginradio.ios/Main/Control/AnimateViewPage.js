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
  Button,
  ART,
} from 'react-native';


import { TitleBarBlack,TitleBarWhite,ProgressDialog,LoadingDialog} from 'miot/ui';
import MoreDialog from '../MoreDialog';
import { Package, Device, Service,DeviceEvent,Host} from "miot";
import {
APPBAR_HEIGHT,APPBAR_MARGINBOTTOM,APPBAR_MARGINTOP,isIPX ,
ratio,NavigatorBarHeight,screenWidth,screenHeight} from '../ConstDefine';
import AnimateView from './AnimateView'


export default class AnimateViewPage extends React.Component{

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
        <MoreDialog
            visible={typeof navigation.state.params === 'undefined' ? false : navigation.state.params.showDialog}
            navigation={navigation} />
        </View>
    };
  };

  constructor(props, context) {
    super(props, context);
    this.state={
        visLoading:false,
        progress:0,
        visProgress:false,
    }
  }

  componentWillMount(){
  }

  componentDidMount(){


  }

  onPressButton1(){
    this.setState({visLoading:true});
  }
  onPressButton2(){
    this.setState({visProgress:true});
  }

  



  render(){
    
    return(
      <View style={{flex: 1,
        backgroundColor:'#000000',
        flexDirection:'column',
        // justifyContent:'center',
        // alignSelf:'center',
        // alignItems:'center'
      }}>
      <View style={{marginTop:NavigatorBarHeight,height:100,width:screenWidth,backgroundColor:'#ffff00'}}>
            <ProgressDialog message={'message'}
                    title={'加载中...'}
                    max={100}
                    cancelable={false}
                    progress={this.state.progress}
                    onDismiss={() => {
                        console.log('onDismiss');
                        this.setState({visProgress: false});
                    }}
                    visible={this.state.visProgress}/>
            <LoadingDialog 
                title="标题"
                message='瓦哈哈哈哈哈哈哈哈哈哈哈哈哈'
                cancelable={false}
                timeout={3000}
                onDismiss={() => {
                    console.log('onDismiss');
                    this.setState({visLoading: false});
                }}
                visible={this.state.visLoading}/>
      </View>
      <View style={{marginTop:NavigatorBarHeight,height:100,width:screenWidth,backgroundColor:'#ffff00'}}>
            <Button title ="111111" style={{width:100,height:20,backgroundColor:'#0fff'}} onPress={()=>{this.onPressButton1()}}/>
            <Button title ="2222222" style={{width:100,height:20,backgroundColor:'#0fff'}} onPress={()=>{this.onPressButton2()}}/>
      </View>


      
      <AnimateView style={{width:100,height:100}}
        duration={1200}
        insideCirle={150}
        outsideCirle={300}>
        
      </AnimateView>
      </View>
    )
  }

}


var styles = StyleSheet.create({
  containerAll: {
      flex: 1,
      flexDirection: 'column',
      width: window.width,
      height: window.height
  },
  background: {
      flex: 1,
      marginTop: 0,
      marginBottom: 0
  },
  navBarText: {
      fontSize: 16,
      marginVertical: 10,
  },
  navBarTitleText: {
      color: '#373E4D',
      fontWeight: '500',
      fontSize: 15,
      marginVertical: 13,
  },
  circleWrapper: {
    // top: 0,
    flex:1,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf:'center',
    width: screenWidth,
    height: screenWidth,
    // backgroundColor:'rgb(233,233,233)'


    // top: circleTop,
    // position: 'absolute',
    // alignItems: 'center',
    // justifyContent: 'center',
    // width: screenWidth,
    // height: screenHeight,
  }
});
