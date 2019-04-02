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


import { ImageButton,TitleBarBlack,TitleBarWhite} from 'miot/ui';
import {LocalizedStrings , getString} from '../MHLocalizableString';
import { Package, Device,DeviceProperties, Service,DeviceEvent,Host} from "miot";
import MoreDialog from '../MoreDialog';
import {
APPBAR_HEIGHT,APPBAR_MARGINBOTTOM,APPBAR_MARGINTOP,isIPX ,
ratio,NavigatorBarHeight,screenWidth,screenHeight} from '../ConstDefine';
const {Group, Path, Shape, Surface} = ART;
import Button from '../../CommonModules/Button';
var projectModel = require('../../project.json');

let powerScaleValue=0;
let isShowAlert=false;
var powerClickable=true;


var PowerImage={
  on:require('../../Resources/center_icon_power_on_h205.png'),
  off:require('../../Resources/center_icon_power_off_h205.png'),
}


export default class PlugMainPageHMI205 extends React.Component{

  static navigationOptions = ({ navigation }) => {
    return {
    header:null
    };
};

  constructor(props, context) {
        super(props, context);
        this.state =  {
            did: Device.deviceID,
            model: Device.deviceModel,
            currentState: true,
            usbCurrentState: true,
            plug_hourFromNow: 0,
            plug_minuteFromNow: 0,
            plug_recentTimer: "0 0 0 0 0",
            usb_hourFromNow: 0,
            usb_minuteFromNow: 0,
            usb_recentTimer: "0 0 0 0 0",
            currentPower: '--',
            temperature: 0,
            wifi_led:true,
            scValue:new Animated.Value(1.0),
            opValue:new Animated.Value(0.0),
            scValue2:new Animated.Value(1.0),
            opValue2:new Animated.Value(0.0),
            scValue3:new Animated.Value(1.0),
            opValue3:new Animated.Value(0.0)
        };
    }

    componentWillMount () {
        // 监听设备改名通知
        this._deviceNameChangedListener = DeviceEvent.deviceNameChanged.addListener((device) => {
          this.props.navigation.setParams({
              name: device.name
          });
          this.forceUpdate();
        });
        this.powerloading=Animated.parallel([
            Animated.timing(this.state.scValue,{
                easing: Easing.linear,
                toValue: 1.2,
                duration: 800
            }),
            Animated.timing(this.state.opValue,{
                easing: Easing.linear,
                toValue: 0,
                duration: 800
            }),
        ]);
        this.powerloading2=Animated.parallel([
            Animated.timing(this.state.scValue2,{
                easing: Easing.linear,
                toValue: 1.2,
                duration: 800,

            }),
            Animated.timing(this.state.opValue2,{
                easing: Easing.linear,
                toValue: 0,
                duration: 800,
            }),
        ]);
        this.powerloading3=Animated.parallel([
            Animated.timing(this.state.scValue3,{
                easing: Easing.linear,
                toValue: 1.2,
                duration: 800,
            }),
            Animated.timing(this.state.opValue3,{
                easing: Easing.linear,
                toValue: 0,
                duration: 800,
            })
        ]);
    }

    getBJDate() {
        var localdate = new Date();
        var tmpHours = localdate.getHours();

        //算得时区
        var time_zone = -localdate.getTimezoneOffset() / 60;
        //少于0的是西区 西区应该用时区绝对值加京八区 重新设置时间（西区时间比东区时间早 所以加时区间隔）
        if (time_zone < 0) {
            time_zone = Math.abs(time_zone) + 8;
            localdate.setHours(tmpHours + time_zone);
        } else {
            //大于0的是东区  东区时间直接跟京八区相减
            time_zone -= 8;
            localdate.setHours(tmpHours - time_zone);
        }
        return localdate;
    }

    componentDidMount () {
        // 可以在这里注册监听设备状态6s轮询的通知，监听前需要用registerDeviceStatusProps方法来指定轮询哪些设备属性，将会调用RPC的getProps方法与设备通信获取相应属性值

        var self = this;
        Device.getDeviceWifi().subscribeMessages("prop.on","prop.usb_on","prop.temperature");
        this._deviceStatusListener = DeviceEvent.deviceReceivedMessages.addListener(
            (device, map, resArray) => {
              var now = this.getBJDate();
              self._getProp();
              self.getSmartHomeApi();
        });
        this._getProp();
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


    getSmartHomeApi(){

        //从后台获取设备的定时列表
        var TimerQuestData = {
          "did": this.state.did,
          "st_id": "8",
          "identify": this.state.did,
        };
  
  
        Service.scene.loadScenes(TimerQuestData).then((response) => {
  
            console.log("mytest:/scene/list "+JSON.stringify(response));
            var plugTimerArray = [];
            var usbTimerArray = [];
            var now = new Date();
  
            response.forEach(element => {
  
                  if (element.setting.on_method == "set_power" && element.setting.off_method == "set_power") {
                      if (this.state.currentState) {
                          if (element.setting.enable_timer == '1' && element.setting.enable_timer_off == '1' && (element.setting.off_time.split(" ")[4] == "*" || ((parseInt(element.setting.off_time.split(" ")[1])*60 + parseInt(element.setting.off_time.split(" ")[0])) > (now.getHours()*60 + now.getMinutes())?(element.setting.off_time.split(" ")[4].indexOf(now.getDay())>=0?true:false):(element.setting.off_time.split(" ")[4].indexOf((now.getDay()==6?0:now.getDay()+1))>=0?true:false)))) {
  
                              if((parseInt(element.setting.off_time.split(" ")[1])*60 + parseInt(element.setting.off_time.split(" ")[0])) > (now.getHours()*60 + now.getMinutes())){
                                  plugTimerArray.push("0 0 0 "+element.setting.off_time.split(" ")[1]+" "+element.setting.off_time.split(" ")[0]+" "+element.setting.enable_timer_on+" "+element.us_id);
                              }else{
                                  plugTimerArray.push("1 0 0 "+element.setting.off_time.split(" ")[1]+" "+element.setting.off_time.split(" ")[0]+" "+element.setting.enable_timer_on+" "+element.us_id);
                              }
                          }
                      } else {
                          if (element.setting.enable_timer == '1' && element.setting.enable_timer_on == '1' && (element.setting.on_time.split(" ")[4] == "*" || ((parseInt(element.setting.on_time.split(" ")[1])*60 + parseInt(element.setting.on_time.split(" ")[0])) > (now.getHours()*60 + now.getMinutes())?(element.setting.on_time.split(" ")[4].indexOf(now.getDay())>=0?true:false):(element.setting.on_time.split(" ")[4].indexOf((now.getDay()==6?0:now.getDay()+1))>=0?true:false)))) {
                              if((parseInt(element.setting.on_time.split(" ")[1])*60 + parseInt(element.setting.on_time.split(" ")[0])) > (now.getHours()*60 + now.getMinutes())){
                                  plugTimerArray.push("0 0 0 "+element.setting.on_time.split(" ")[1]+" "+element.setting.on_time.split(" ")[0]+" "+element.setting.enable_timer_off+" "+element.us_id);
                              }else{
                                  plugTimerArray.push("1 0 0 "+element.setting.on_time.split(" ")[1]+" "+element.setting.on_time.split(" ")[0]+" "+element.setting.enable_timer_off+" "+element.us_id);
                              }
                          }
                      }
                  } 
                  else if (element.setting.on_method == "set_usb_on" && element.setting.off_method == "set_usb_off") {
                      if (this.state.usbCurrentState) {
                          if (element.setting.enable_timer == '1' && element.setting.enable_timer_off == '1' && (element.setting.off_time.split(" ")[4] == "*" || ((parseInt(element.setting.off_time.split(" ")[1])*60 + parseInt(element.setting.off_time.split(" ")[0])) > (now.getHours()*60 + now.getMinutes())?(element.setting.off_time.split(" ")[4].indexOf(now.getDay())>=0?true:false):(element.setting.off_time.split(" ")[4].indexOf((now.getDay()==6?0:now.getDay()+1))>=0?true:false)))) {
  
                              if((parseInt(element.setting.off_time.split(" ")[1])*60 + parseInt(element.setting.off_time.split(" ")[0])) > (now.getHours()*60 + now.getMinutes())){
                                  usbTimerArray.push("0 0 0 "+element.setting.off_time.split(" ")[1]+" "+element.setting.off_time.split(" ")[0]+" "+element.setting.enable_timer_on+" "+element.us_id);
                              }else{
                                  usbTimerArray.push("1 0 0 "+element.setting.off_time.split(" ")[1]+" "+element.setting.off_time.split(" ")[0]+" "+element.setting.enable_timer_on+" "+element.us_id);
                              }
                          }
                      } else {
                          if (element.setting.enable_timer == '1' && element.setting.enable_timer_on == '1' && (element.setting.on_time.split(" ")[4] == "*" || ((parseInt(element.setting.on_time.split(" ")[1])*60 + parseInt(element.setting.on_time.split(" ")[0])) > (now.getHours()*60 + now.getMinutes())?(element.setting.on_time.split(" ")[4].indexOf(now.getDay())>=0?true:false):(element.setting.on_time.split(" ")[4].indexOf((now.getDay()==6?0:now.getDay()+1))>=0?true:false)))) {
                              if((parseInt(element.setting.on_time.split(" ")[1])*60 + parseInt(element.setting.on_time.split(" ")[0])) > (now.getHours()*60 + now.getMinutes())){
                                  usbTimerArray.push("0 0 0 "+element.setting.on_time.split(" ")[1]+" "+element.setting.on_time.split(" ")[0]+" "+element.setting.enable_timer_off+" "+element.us_id);
                              }else{
                                  usbTimerArray.push("1 0 0 "+element.setting.on_time.split(" ")[1]+" "+element.setting.on_time.split(" ")[0]+" "+element.setting.enable_timer_off+" "+element.us_id);
                              }
                          }
                      }
                  }
            });
            
            if (plugTimerArray.length > 0) {
                var plug_recentTimer = plugTimerArray.sort()[0];
                var plug_minuteFromNow = 0;
                var plug_hourFromNow = 0;
                var plug_borrow = 0; //借位
                if (plug_recentTimer.split(" ")[4] - now.getMinutes() >= 0) {
                    plug_minuteFromNow = plug_recentTimer.split(" ")[4] - now.getMinutes();
                } else {
                    plug_minuteFromNow = plug_recentTimer.split(" ")[4] - now.getMinutes() + 60;
                    plug_borrow = -1;
                }
                plug_hourFromNow = plug_recentTimer.split(" ")[3] - now.getHours() + plug_borrow;
                if (plug_hourFromNow < 0) {
                    plug_hourFromNow += 24;
                }
                this.setState({
                    plug_recentTimer: plug_recentTimer,
                    plug_minuteFromNow: plug_minuteFromNow,
                    plug_hourFromNow: plug_hourFromNow
                });
            } else {
                this.setState({
                    plug_recentTimer:"0 0 0 0 0",
                    plug_minuteFromNow: 0,
                    plug_hourFromNow: 0
                });
            }
  
            console.log("mytest:list1 "+usbTimerArray.toString());
            if (usbTimerArray.length > 0) {
                var usb_recentTimer = usbTimerArray.sort()[0];
                console.log("mytes/t:list2 "+usb_recentTimer.toString());
                var usb_minuteFromNow = 0;
                var usb_hourFromNow = 0;
                var usb_borrow = 0; //借位
                if (usb_recentTimer.split(" ")[4] - now.getMinutes() >= 0) {
                    usb_minuteFromNow = usb_recentTimer.split(" ")[4] - now.getMinutes();
                } else {
                    usb_minuteFromNow = usb_recentTimer.split(" ")[4] - now.getMinutes() + 60;
                    usb_borrow = -1;
                }
                usb_hourFromNow = usb_recentTimer.split(" ")[3] - now.getHours() + usb_borrow;
                if (usb_hourFromNow < 0) {
                    usb_hourFromNow += 24;
                }
                this.setState({
                    usb_recentTimer: usb_recentTimer,
                    usb_minuteFromNow: usb_minuteFromNow,
                    usb_hourFromNow: usb_hourFromNow
                });
            } else {
                this.setState({
                    usb_recentTimer:"0 0 0 0 0",
                    usb_minuteFromNow: 0,
                    usb_hourFromNow: 0
                });
            }
  
        })
        .catch((error)=>{
            console.log('error:'+JSON.stringify(error));
        });
  
    }

    _startPowerAnimated(){
        this._stopPowerAnimated();
        this._startPowerLoadingAnimated();
        this.powerdelay2=setTimeout(() =>{
            this._startPowerLoadingAnimated2();
        },400);
        this.powerdelay3=setTimeout(() =>{
            this._startPowerLoadingAnimated3();
        },800);
    }

    _startPowerLoadingAnimated(){
        this.state.opValue.setValue(1.0);
        this.state.scValue.setValue(1.0);
        this.powerloading.start((result)=>{
            if(result.finished){
                this._startPowerLoadingAnimated()
            }
        });
    }

    _startPowerLoadingAnimated2(){
        this.state.opValue2.setValue(1.0);
        this.state.scValue2.setValue(1.0);
        this.powerloading2.start((result)=>{
            if(result.finished){
                this._startPowerLoadingAnimated2()
            }
        });
    }

    _startPowerLoadingAnimated3(){
        this.state.opValue3.setValue(1.0);
        this.state.scValue3.setValue(1.0);
        this.powerloading3.start((result)=>{
            if(result.finished){
                this._startPowerLoadingAnimated3()
            }
        });
    }

    _stopPowerAnimated() {
        this.powerloading.stop();
        clearTimeout(this.powerdelay2);
        this.powerloading2.stop();
        clearTimeout(this.powerdelay3);
        this.powerloading3.stop();
        this.state.opValue.setValue(0.0);
        this.state.scValue.setValue(1.0);
        this.state.opValue2.setValue(0.0);
        this.state.scValue2.setValue(1.0);
        this.state.opValue3.setValue(0.0);
        this.state.scValue3.setValue(1.0);
    }

    componentWillUnmount () {
        this._deviceNameChangedListener.remove();
        this._deviceStatusListener.remove();
        this._openpopChangedListener.remove();
    }

    _powerOnOrOff() {
        
        var self = this;
        this._startPowerAnimated();
        var value = '';
        if (this.state.currentState) {
            value = 'off';
        } else {
            value = 'on';
            isShowAlert=false;
        }
        powerClickable=false;

        Device.getDeviceWifi().callMethod("set_power",[value])
        .then((json)=>{
            powerClickable=true;
            self._stopPowerAnimated();
            if(json &&(json.code==0)){
                self.setState({currentState: !self.state.currentState});
            }
            self._stopPowerAnimated();
        })
        .catch((error)=>{
            powerClickable=true;
            self._stopPowerAnimated();
            console.log('_usbOnOrOff error:'+JSON.stringify(error));
        });
    }

    _getProp() {

        var self = this;
        Device.getDeviceWifi().callMethod('get_prop', ['power', 'usb_on', 'temperature','wifi_led'])
        .then((json)=>{
            console.log("mytest:get_prop success"+JSON.stringify(json));
            self.setState({
                currentState: json.result[0] == 'on' ? true : false,
                usbCurrentState: json.result[1],
                temperature: json.result[2],
                wifi_led: json.result[3] == "on" ? true : false
            });
        })
        .catch((err)=>{
            console.log("get_prop err"+JSON.stringify(err));
        });
    }

    onOpenTimerSettingPage () {
        // 打开定时设置页面
        Host.ui.openTimerSettingPageWithVariousTypeParams("set_power", "on", "set_power", "off");
    }

    _onCountdownClick () {

        var newParams = {onMethod:"set_power", offMethod:'set_power', onParam:'on', offParam:'off'};
        Host.ui.openCountDownPage((this.state.currentState),newParams);  
    }

    render () {
        let stateTitle = this.state.currentState ? LocalizedStrings.power_on : LocalizedStrings.power_off;
        let plug_Image = this.state.currentState ? PowerImage.on : PowerImage.off;
        let plug_bg = this.state.currentState ? require('../../Resources/background_on.png') : require('../../Resources/backgroupd_off.png');

        var plug_timetext = "";
        if (this.state.plug_minuteFromNow > 0 || this.state.plug_hourFromNow > 0) {
            if (this.state.plug_hourFromNow > 0) {

                plug_timetext = (this.state.currentState ? LocalizedStrings.close :  LocalizedStrings.open);
                let hourtxt=this.state.plug_hourFromNow + ((this.state.plug_hourFromNow==1 || this.state.plug_hourFromNow==0)?LocalizedStrings.hour:LocalizedStrings.hours);
                let minutetxt=(this.state.plug_minuteFromNow > 0?(this.state.plug_minuteFromNow+((this.state.plug_minuteFromNow==1 || this.state.plug_minuteFromNow==0)?LocalizedStrings.minute:LocalizedStrings.minutes)):"");
                let timetxt=hourtxt+minutetxt;
                plug_timetext = plug_timetext.replace("%1$s",timetxt);
            } else {
                plug_timetext = (this.state.currentState ? LocalizedStrings.close :  LocalizedStrings.open);
                let minutetxt2=this.state.plug_minuteFromNow+((this.state.plug_minuteFromNow==1 || this.state.plug_minuteFromNow==0)?LocalizedStrings.minute:LocalizedStrings.minutes);
                plug_timetext=plug_timetext.replace("%1$s",minutetxt2);
            }
        }

        let progress = this.state.plug_minuteFromNow + this.state.plug_hourFromNow * 60;
        let totalNum = 1440;
        let radius = 100;
        let degress = progress / totalNum * 360;
        let degress1 = degress;
        let degress2 = degress;
        let progressWidth = 2;
        let size = radius * 2;
        let centerW = Math.sqrt(Math.pow(radius - progressWidth * 3 / 2, 2) / 2) * 2;
        let originR = radius - progressWidth;//这才是真实半径
        let startX = radius;
        let startY = progressWidth;
        let endX = radius;
        let endY = progressWidth;
        let startX1 = radius;
        let startY1 = size - progressWidth;
        let endX1 = radius;
        let endY1 = size - progressWidth;
        //先计算 右边的
        if (degress1 > 180) {
            degress1 = 180;//强制算180
        }
        if (degress1 <= 90) {
            degress1 = degress1 * 2 * Math.PI / 360;
            endX = startX + originR * Math.sin(degress1);
            endY = startY + originR - originR * Math.cos(degress1);
        } else if (degress1 <= 180) {
            degress1 = degress1 - 90;
            degress1 = degress1 * 2 * Math.PI / 360;
            endX = startX + originR * Math.cos(degress1);
            endY = startY + originR + originR * Math.sin(degress1);
        }
        if (degress2 > 180) {
            //在计算左边的
            if (degress2 > 360) {
                degress2 = 360;
            }
            if (degress2 <= 270) {
                degress2 = degress2 - 180;
                degress2 = degress2 * 2 * Math.PI / 360;
                endX1 = startX1 - originR * Math.sin(degress2);
                endY1 = startY1 - (originR - +originR * Math.cos(degress2));
            } else if (degress2 <= 360) {
                degress2 = degress2 - 270;
                degress2 = degress2 * 2 * Math.PI / 360;
                endX1 = startX1 - originR * Math.cos(degress2);
                endY1 = startY1 - originR - originR * Math.sin(degress2);
            }
        }
        //底圈
        let path0 = Path().push(`M${startX},${startY} A${originR},${originR} 0 0,1 ${startX1},${startY1}`);
        let path00 = Path().push(`M${startX1-1.5},${startY1} A${originR},${originR} 0 0,1 ${startX-1.5},${startY}`);
        //进度圈
        let path = new Path().push(`M${startX},${startY} A${originR},${originR} 0 0,1 ${endX},${endY}`);
        let path1 = new Path().push(`M${startX1},${startY1} A${originR},${originR} 0 0,1 ${endX1},${endY1}`);

        let highTemp =null;
        if(this.state.temperature >=78){
            plug_bg = require('../../Resources/background_high_temp.png');
            stateTitle=LocalizedStrings.plug_seat_high_temp;
            plug_timetext = LocalizedStrings.plug_seat_high_temp_tips;
            highTemp=(<Image style={{width: 19 / 3, height: 154 / 3}} source={require('../../Resources/high_temp_warning.png')}/>);
        }

        return (
            <View style={{flex: 1,flexDirection: "column"}}>
                <View style={styles.containerAll}>
                    <ImageBackground style={styles.containerAll} source={plug_bg}>
                        <View style={{flex: 1,justifyContent: "center",alignItems: "center",flexDirection: "column"}}>
                            <View style={{width:250,height:250,justifyContent: "center",alignItems: "center",flexDirection: "column"}}>
                                <Surface width={size} height={size}>
                                    <Group>
                                        <Shape d={path0} stroke={"#ffffff55"} strokeWidth={progressWidth}/>
                                        <Shape d={path00} stroke={"#ffffff55"} strokeWidth={progressWidth}/>
                                        {degress > 0 ?<Shape d={path} stroke={"#ffffff"} strokeWidth={progressWidth}/> : null}
                                        {degress > 180 ?<Shape d={path1} stroke={"#ffffff"} strokeWidth={progressWidth}/> : null}
                                    </Group>
                                </Surface>
                                <View style={{width:250,height:250,position: 'absolute',top:0,left:0,justifyContent:"center",alignItems:"center",backgroundColor:'transparent'}}>
                                    <Animated.View ref="powerAnimated" style={{width:210,height:210,borderRadius:210,borderColor: "#ffffff55", borderWidth: 1,backgroundColor:'transparent',opacity:this.state.opValue,transform: [{scale: this.state.scValue}]}}></Animated.View>
                                </View>
                                <View style={{width:250,height:250,position: 'absolute',top:0,left:0,justifyContent:"center",alignItems:"center"}}>
                                    <Animated.View ref="powerAnimated2" style={{width:210,height:210,borderRadius:210,borderColor: '#ffffff55', borderWidth: 1,backgroundColor:'transparent',opacity:this.state.opValue2,transform: [{scale: this.state.scValue2}]}}></Animated.View>
                                </View>
                                <View style={{width:250,height:250,position: 'absolute',top:0,left:0,justifyContent:"center",alignItems:"center"}}>
                                    <Animated.View ref="powerAnimated3" style={{width:210,height:210,borderRadius:210,borderColor: '#ffffff55', borderWidth: 1,backgroundColor:'transparent',opacity:this.state.opValue3,transform: [{scale: this.state.scValue3}]}}></Animated.View>
                                </View>
                                <View style={{position: 'absolute',width: 250,height: 250,top: 0,left: 0,justifyContent: "center",alignItems: "center"}}>
                                    <TouchableWithoutFeedback onPress={()=>{powerClickable?this._powerOnOrOff():null}}>
                                        <ImageBackground style={{width: 182, height: 182,justifyContent:"center",alignItems:"center"}} source={plug_Image}>
                                        {highTemp}
                                        </ImageBackground>
                                    </TouchableWithoutFeedback>
                                </View>
                            </View>
                            <Text style={{color: "#FFFFFF", fontSize: 14, marginTop: 20}}
                                  numberOfLines={1}>{stateTitle}</Text>
                            <Text style={{color: "#FFFFFF", fontSize: 12, marginTop: 8,opacity:0.8}}
                                  numberOfLines={1}>{plug_timetext}</Text>
                        </View>
                        <View style={{justifyContent: "center",alignItems: "center",flexDirection: "column",marginBottom: 50+40}}>
                        </View>
                        <View style={{height: 100,flexDirection: 'row',alignItems: 'center',justifyContent: 'space-around'}}>
                            <Button onPress={()=>{powerClickable?this._powerOnOrOff():null}} title={LocalizedStrings.plug_switch} titleClor="#ffffff"
                                    imageNormal={require('../../Resources/power_on.png')} imageHighlight={require('../../Resources/power_pressed.png')}
                                    imageWidth={163 / 3} imageHeight={163 / 3} titleSize={12}/>
                            <Button onPress={()=>{this.onOpenTimerSettingPage()}} title={LocalizedStrings.plug_timer} titleClor="#ffffff"
                                    imageNormal={require('../../Resources/timer_on.png')} imageHighlight={require('../../Resources/timer_pressed.png')}
                                    imageWidth={163 / 3} imageHeight={163 / 3} titleSize={12}/>
                            <Button onPress={()=>{this._onCountdownClick()}} title={LocalizedStrings.plug_count_down_timer} titleClor="#ffffff"
                                    imageNormal={require('../../Resources/countdown_on.png')} imageHighlight={require('../../Resources/countdown_pressed.png')}
                                    imageWidth={163 / 3} imageHeight={163 / 3} titleSize={12}/>
                        </View>
                        <View style={{height: 40-40, marginBottom: 50}}>
                        </View>
                    </ImageBackground>
                </View>

                {/* 导航头 */}
                <View style={{position:'absolute',marginTop:0,}}>
                    <TitleBarWhite
                        title={this.props.navigation.state["params"] ? this.props.navigation.state.params.name : Device.name}
                        // style={{ backgroundColor: 'transparent' }}
                        onPressLeft={() => { Package.exit() }}
                        onPressRight={() => {

                            if (Platform.OS == 'android') {
                              this.props.navigation.setParams({ showDialog: true });
                            } else {
                              this.props.navigation.navigate('moreMenu', { 'title': '设置' });
                            }}} 
                        onPressRight2 ={()=>{
                            console.log('onPressRight2');
                            Host.file.screenShot('share.png').then((res)=>{
                                Host.ui.openShareListBar('小米智能家庭', '小米智能家庭', { uri: res },'');
                            });
                        }}
                        onPressTitle={()=>{
                            alert('version:' +projectModel.version_code);
                        }}    
                    />
                    <MoreDialog
                        visible={typeof this.props.navigation.state.params === 'undefined' ? false : this.props.navigation.state.params.showDialog}
                        navigation={this.props.navigation} />
                  </View>
            </View>
        );
    }
}

var styles = StyleSheet.create({
  containerAll: {
      flex: 1,
      flexDirection: 'column',
      width: window.width,
      height: window.height,
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
});
