/**
python packagePluginAndSign com.chuangmi.plug.ios ~/keys/private.pem ~/keys/public.cer 139183319

/Users/linbing/Desktop/创米IOS/智能插座/ios-rn-sdk-master/MiHomePluginSDK
**/
'use strict';

import React,{Component} from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    ImageBackground,
    TouchableOpacity,
    Dimensions,
    DeviceEventEmitter,
    StatusBar,
    Platform,
    PixelRatio,
    TouchableWithoutFeedback,
    ART
} from 'react-native';

import Button from '../../CommonModules/Button';
import {TitleBarBlack,TitleBarWhite} from 'miot/ui';
import {Device,DeviceEvent,Host,Package} from 'miot';
import MoreDialog from '../MoreDialog';
import MHDevice from '../MHDevice';
import {
  APPBAR_HEIGHT,APPBAR_MARGINBOTTOM,APPBAR_MARGINTOP,isIPX ,
  ratio,NavigatorBarHeight,screenWidth,screenHeight} from '../ConstDefine';


export default class MainPage extends React.Component{

  static navigationOptions = ({ navigation }) => {
    return {
    header:null
    };
  };

  constructor(props,context){
    super(props,context);
    this.state = {
      did: Device.deviceID,
      model: Device.deviceModel,
      currentState:false,
      now:new Date(),
      hourFromNow: 0,
      minuteFromNow: 0,
      recentTimer: "0 0 0 0 0",
      us_id: 0,
    };
  }



  componentWillMount() {
    // 监听设备改名通知
    var self = this;
    this._deviceNameChangedListener = DeviceEvent.deviceNameChanged.addListener((device) => {
        self.props.navigation.setParams({
            name: device.name
        });
        self.forceUpdate();
    });
    
    Device.getDeviceWifi().subscribeMessages('isOpen');
    this._deviceStatusListener = DeviceEvent.deviceReceivedMessages.addListener(
        (device, map, res) => {

          console.log('device '+JSON.stringify(device));
          console.log('map '+JSON.stringify(map));
          console.log('res '+JSON.stringify(res));
          this.getDeviceProps();
          self.callSmartHomeAPI_func();
    });
  }


  componentDidMount(){
    this.provite_func();
  }
  
  provite_func(){

    Host.storage.get('disclam_checked_flag')
    .then((value) => {

          if((value==false )||(value==null)||(value==undefined)){

            Host.ui.openPrivacyLicense("license","https://www.baidu.com","privacy","https://www.baidu.com")
            .then((res)=>{

                if(res==true){
                  Host.storage.save({'disclam_checked_flag':true});
                }else{
                  Host.storage.save({'disclam_checked_flag':false});
                }
            });

          }

    });
  }

  getDeviceProps(){
    
    var self = this;
    Device.getDeviceWifi().callMethod("get_prop", ["isOpen"])
    .then((pairs) => {
        console.log("getDevicePropertyFromMemCache:" +JSON.stringify(pairs));
        var now = new Date();
        self.setState({
            currentState: pairs.result[0],
            now: now,
        });
    })
    .catch(err => {console.log('get_prop:',+JSON.stringify(err))});
}

  callSmartHomeAPI_func(){
    //从后台获取设备的定时列表
    var TimerQuestData = {
      "did": this.state.did,
      "st_id": "8",
      "identify": this.state.did,
    }
    Service.scene.loadTimerScenes(Device.deviceID, TimerQuestData)
    .then((sceneArr) => {

      var timerArray = [];
      if(this.state.currentState){
              sceneArr.forEach((element) => {
                if(element.setting.enable_timer == '1' && element.setting.enable_timer_off == '1' && (element.setting.off_time.split(" ")[4] == "*" || ((parseInt(element.setting.off_time.split(" ")[1])*60 + parseInt(element.setting.off_time.split(" ")[0])) > (now.getHours()*60 + now.getMinutes())?(element.setting.off_time.split(" ")[4].indexOf(now.getDay())>=0?true:false):(element.setting.off_time.split(" ")[4].indexOf((now.getDay()==6?0:now.getDay()+1))>=0?true:false)))){
                  timerArray.push(element.setting.off_time.split(" ").reverse().join(" ")+":"+element.us_id);
                }
              });

      }else{
              sceneArr.forEach((element,index) => {
                if(element.setting.enable_timer == '1' && element.setting.enable_timer_on == '1' && (element.setting.on_time.split(" ")[4] == "*" || ((parseInt(element.setting.on_time.split(" ")[1])*60 + parseInt(element.setting.on_time.split(" ")[0])) > (now.getHours()*60 + now.getMinutes())?(element.setting.on_time.split(" ")[4].indexOf(now.getDay())>=0?true:false):(element.setting.on_time.split(" ")[4].indexOf((now.getDay()==6?0:now.getDay()+1))>=0?true:false)))){
                  timerArray.push(element.setting.on_time.split(" ").reverse().join(" ")+":"+element.us_id);
                }
              });
      }

      if(timerArray.length > 0){

            var recentTimer = timerArray.sort()[0];
            var us_id = recentTimer.split(":")[1];
            recentTimer = recentTimer.split(":")[0];
            var minuteFromNow = 0,
                hourFromNow = 0;
            var borrow = 0; //借位
            if(recentTimer.split(" ")[4] - now.getMinutes() >= 0){
              minuteFromNow = recentTimer.split(" ")[4] - now.getMinutes();
            }else{
              minuteFromNow = recentTimer.split(" ")[4] - now.getMinutes() + 60;
              borrow = -1;
            };
            hourFromNow = recentTimer.split(" ")[3] - now.getHours() + borrow;
            if(hourFromNow < 0){
              hourFromNow += 24;
            }
            // alert('hourFromNow:minuteFromNow=== '+hourFromNow+'  '+minuteFromNow);
            this.setState({
              recentTimer : recentTimer,
              us_id: us_id,
              minuteFromNow : minuteFromNow,
              hourFromNow : hourFromNow,
            });

      }else{
            this.setState({
              us_id: 0,
              minuteFromNow: 0,
              hourFromNow: 0,
            });
      }

    });
  }

  componentWillUnmount() {
    this._deviceNameChangedListener.remove();
    this._deviceStatusListener.remove();
  }

  onOpenTimerSettingPage() {
      // 打开定时设置页面
      Host.ui.openTimerSettingPageWithVariousTypeParams("set_power", "on", "set_power", "off");
  }

  _onCountdownClick() {
    var newParams = {onMethod:"set_power", offMethod:'set_power', onParam:'on', offParam:'off'};
    Host.ui.openCountDownPage((!this.state.currentState),newParams);  
  }


  _powerOnOrOff(){
    if(this.state.currentState){
        MHDevice.setPowerOff();
    }else{
        MHDevice.setPowerOn();
    }
  }

  _onOpenPowerCostPage() {
    this.props.navigation.navigate('PowerCostPage');
  }

  render() {
    var stateTitle=this.state.currentState?"插座电源已开启":"插座电源已关闭";
    
    return (
    <View style={styles.containerAll} >
      <ImageBackground style={{flex:1,justifyContent:'center',}} source={(this.state.currentState)?require("../../Resources/plug_background_on.png"):require("../../Resources/plug_background_off.png")}>
          <View style={{marginTop:64*2,justifyContent:'center',alignItems:'center'}}>
                <Button onPress={()=>{this._powerOnOrOff()}} title={stateTitle} titleClor="#ffffff"
                  imageNormal={this.state.currentState?require('../../Resources/plug_on.png'):require('../../Resources/plug_off.png')}
                  imageWidth={629/3} imageHeight={629/3} titleSize={16}/>
                <View style={{width:screenWidth,flexDirection:'row',marginTop:90,alignItems:'center',justifyContent:'space-around'}}>
                      <Button onPress={()=>{this._powerOnOrOff()}} title="开关" titleClor="#ffffff"
                        imageNormal={require('../../Resources/power_on.png')} imageHighlight={require("../../Resources/power_pressed.png")}
                        imageWidth={163/3} imageHeight={163/3} titleSize={12}/>
                      <Button onPress={()=>{this.onOpenTimerSettingPage()}} title="定时" titleClor="#ffffff"
                        imageNormal={require('../../Resources/timer_on.png')} imageHighlight={require('../../Resources/timer_pressed.png')}
                        imageWidth={163/3} imageHeight={163/3} titleSize={12}/>
                      <Button onPress={()=>{this._onCountdownClick()}} title="倒计时" titleClor="#ffffff"
                        imageNormal={require('../../Resources/countdown_on.png')} imageHighlight={require('../../Resources/countdown_pressed.png')}
                        imageWidth={163/3} imageHeight={163/3} titleSize={12}/>
                </View>
          </View>
      </ImageBackground>
      {/* 导航头 */}
      <View style={styles.nagivationView}>
          <TitleBarWhite
              title={this.props.navigation.state["params"] ? this.props.navigation.state.params.name : Device.name}
              style={{ backgroundColor: 'transparent' }}
              onPressLeft={() => { Package.exit() }}
              onPressRight={() => {

                  if (Platform.OS == 'android') {
                    this.props.navigation.setParams({ showDialog: true });
                  } else {
                    this.props.navigation.navigate('moreMenu', { 'title': '设置' });
                  }}} 
              onPressRight2 ={()=>{
                  console.log('onPressRight2');
              }}   
              />
          <MoreDialog
              visible={typeof(this.props.navigation.state.params) === 'undefined' ? false : this.props.navigation.state.params.showDialog}
              navigation={this.props.navigation} />
      </View>

    </View>);
  }
}

var styles = StyleSheet.create({
  containerAll: {
    flex: 1,
    backgroundColor: '#ffffff',
    marginTop: 0,
  },
  nagivationView:{
    height:APPBAR_HEIGHT,
    backgroundColor:'transparent',
    position:'absolute'
  },
  background: {
    flex: 1,
    marginTop: 0,
    marginBottom: 0,
  },
  container: {
    position: 'absolute',
    top: 0,
    flex: 1,
    justifyContent: 'center',
    marginBottom: 0,
    marginTop: 0,
    backgroundColor: 'transparent',
  },
  top: {
    flex: 2,
    flexDirection: 'column',
    alignItems: 'center',
  },
  timeCircle: {
    width: 306 * ratio,
    height: 260 * ratio,
    marginTop: screenHeight < 500? 120 * ratio : 150 * ratio,
    alignItems: 'center',
  },
  pointerFrame: {
    width:256 * ratio,
    height:9.67 * ratio,
    // borderWidth: 1,
    alignSelf: 'flex-start',
    position: 'relative',
    top:150 * ratio,
    left:25 * ratio,
  },
  pointer: {
    width: 4.67 * ratio,
    height: 8.67 * ratio,
  },
  timeProgress: {
    width:240 * ratio,
    height: 201 * ratio,
    marginTop: 27 * ratio,
    alignItems: 'center',
  },
  power: {
    width: 82 * ratio,
    height: 86 * ratio,
    marginTop: 73 * ratio,
  },
  bottom: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  button: {
    width: 54 * ratio,
    height: 54 * ratio,
  },
  text: {
    fontSize: 20 * ratio,
    textAlign: 'center',
    color: '#000000',
    alignSelf: 'stretch',
    marginTop: 10 * ratio,
  },
});