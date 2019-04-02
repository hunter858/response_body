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
  Alert,
  StyleSheet,
  PixelRatio,
  StatusBar,
  ScrollView,
  Image,
  Animated,
  ImageBackground,
  DeviceEventEmitter,
  TouchableWithoutFeedback,
  NativeModules,
} from 'react-native';


import { ImageButton,Button ,TitleBarBlack,TitleBarWhite} from 'miot/ui';
import {LocalizedStrings , getString} from '../MHLocalizableString';
import { Package, Device,DeviceProperties, Service,DeviceEvent,Host} from "miot";
import MoreDialog from '../MoreDialog';
import {
APPBAR_HEIGHT,APPBAR_MARGINBOTTOM,APPBAR_MARGINTOP,isIPX ,
ratio,NavigatorBarHeight,screenWidth,screenHeight} from '../ConstDefine';
var projectModel = require('../../project.json');

let powerScaleValue=0;
let usbScaleValue=0;
let isShowAlert=false;
let powerClickable=true;
let usbClickable=true;


export default class MainLaunchPage extends React.Component {
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
                onPressTitle={()=>{
                    alert('version:' +projectModel.version_code);
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
        this.state = {
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
            wifi_led:true
        };
    }

    componentWillMount() {
        this._deviceNameChangedListener = DeviceEvent.deviceNameChanged.addListener((device) => {
        this.props.navigation.setParams({
            name: device.name
        });
        this.forceUpdate();
        });
    }

    componentDidMount(){

        var self = this;
        Device.getDeviceWifi().subscribeMessages("prop.on","prop.usb_on","prop.temperature");
        this._deviceStatusListener = DeviceEvent.deviceReceivedMessages.addListener(
            (device, map, resArray) => {

                self.getSmartHomeApi();
                self.getDeviceProps();
        });
        this._getProp();
        this.getSmartHomeApi();
        this._startGetPower();
        this.provite_func();
    }


    componentWillUnmount() {
        this._deviceNameChangedListener.remove();
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
        Device.getDeviceWifi().callMethod("get_prop", ["on", "usb_on", "temperature"])
        .then((pairs) => {
            console.log("getDevicePropertyFromMemCache:" +JSON.stringify(pairs));
            self.setState({
                currentState: pairs.result[0],
                usbCurrentState: pairs.result[1],
                temperature: pairs.result[2]
            });
            
            var temperature = pairs[2];
            if(temperature>=78){
                if(!isShowAlert){
                    isShowAlert=true;
                    Alert.alert(
                        '',
                        LocalizedStrings.temp_high_alert_title+'\n'+
                        LocalizedStrings.temp_high_alert_msg1+'\n' +
                        LocalizedStrings.temp_high_alert_msg2+'\n' +
                        LocalizedStrings.temp_high_alert_msg3+'\n' +
                        LocalizedStrings.temp_high_alert_msg4,
                        [
                            {text: LocalizedStrings.i_know, onPress: () => {
                                if(this.state.currentState){
                                    this._powerOnOrOff();
                                }
                                if(this.state.usbCurrentState){
                                    this._usbOnOrOff();
                                }
                            }},
                        ]
                    );
                }
            }

        })
        .catch(err => {console.log('get_prop:',+JSON.stringify(err))});
    }

    /* /scene/list */
    getSmartHomeApi(){
        //从后台获取设备的定时列表
        var TimerQuestData = {
            "did": this.state.did,
            "st_id": "8",
            "identify": this.state.did,
        };

        var self = this;
        Service.scene.loadTimerScenes(TimerQuestData).then((response) => {
            //alert(JSON.stringify(response));
            console.log("mytest:/scene/list "+JSON.stringify(response));
            var now = new Date();
            var plugTimerArray = [];
            var usbTimerArray = [];
            for (var key in response) {
                var IScene = response[key];
                if (IScene.setting.on_method == "set_power" && IScene.setting.off_method == "set_power") {
                    if (this.state.currentState) {
                        if (IScene.setting.enable_timer == '1' && IScene.setting.enable_timer_off == '1' && (IScene.setting.off_time.split(" ")[4] == "*" || ((parseInt(IScene.setting.off_time.split(" ")[1])*60 + parseInt(IScene.setting.off_time.split(" ")[0])) > (now.getHours()*60 + now.getMinutes())?(IScene.setting.off_time.split(" ")[4].indexOf(now.getDay())>=0?true:false):(IScene.setting.off_time.split(" ")[4].indexOf((now.getDay()==6?0:now.getDay()+1))>=0?true:false)))) {

                            if((parseInt(IScene.setting.off_time.split(" ")[1])*60 + parseInt(IScene.setting.off_time.split(" ")[0])) > (now.getHours()*60 + now.getMinutes())){
                                plugTimerArray.push("0 0 0 "+IScene.setting.off_time.split(" ")[1]+" "+IScene.setting.off_time.split(" ")[0]+" "+IScene.setting.enable_timer_on+" "+IScene.us_id);
                            }else{
                                plugTimerArray.push("1 0 0 "+IScene.setting.off_time.split(" ")[1]+" "+IScene.setting.off_time.split(" ")[0]+" "+IScene.setting.enable_timer_on+" "+IScene.us_id);
                            }
                        }
                    } else {
                        if (IScene.setting.enable_timer == '1' && IScene.setting.enable_timer_on == '1' && (IScene.setting.on_time.split(" ")[4] == "*" || ((parseInt(IScene.setting.on_time.split(" ")[1])*60 + parseInt(IScene.setting.on_time.split(" ")[0])) > (now.getHours()*60 + now.getMinutes())?(IScene.setting.on_time.split(" ")[4].indexOf(now.getDay())>=0?true:false):(IScene.setting.on_time.split(" ")[4].indexOf((now.getDay()==6?0:now.getDay()+1))>=0?true:false)))) {

                            if((parseInt(IScene.setting.on_time.split(" ")[1])*60 + parseInt(IScene.setting.on_time.split(" ")[0])) > (now.getHours()*60 + now.getMinutes())){
                                plugTimerArray.push("0 0 0 "+IScene.setting.on_time.split(" ")[1]+" "+IScene.setting.on_time.split(" ")[0]+" "+IScene.setting.enable_timer_off+" "+IScene.us_id);
                            }else{
                                plugTimerArray.push("1 0 0 "+IScene.setting.on_time.split(" ")[1]+" "+IScene.setting.on_time.split(" ")[0]+" "+IScene.setting.enable_timer_off+" "+IScene.us_id);
                            }
                        }
                    }
                } else if (IScene.setting.on_method == "set_usb_on" && IScene.setting.off_method == "set_usb_off") {
                    if (this.state.usbCurrentState) {
                        if (IScene.setting.enable_timer == '1' && IScene.setting.enable_timer_off == '1' && (IScene.setting.off_time.split(" ")[4] == "*" || ((parseInt(IScene.setting.off_time.split(" ")[1])*60 + parseInt(IScene.setting.off_time.split(" ")[0])) > (now.getHours()*60 + now.getMinutes())?(IScene.setting.off_time.split(" ")[4].indexOf(now.getDay())>=0?true:false):(IScene.setting.off_time.split(" ")[4].indexOf((now.getDay()==6?0:now.getDay()+1))>=0?true:false)))) {
                            //usbTimerArray.push(IScene.setting.off_time.split(" ").reverse().join(" "));
                            if((parseInt(IScene.setting.off_time.split(" ")[1])*60 + parseInt(IScene.setting.off_time.split(" ")[0])) > (now.getHours()*60 + now.getMinutes())){
                                usbTimerArray.push("0 0 0 "+IScene.setting.off_time.split(" ")[1]+" "+IScene.setting.off_time.split(" ")[0]+" "+IScene.setting.enable_timer_on+" "+IScene.us_id);
                            }else{
                                usbTimerArray.push("1 0 0 "+IScene.setting.off_time.split(" ")[1]+" "+IScene.setting.off_time.split(" ")[0]+" "+IScene.setting.enable_timer_on+" "+IScene.us_id);
                            }
                        }
                    } else {
                        if (IScene.setting.enable_timer == '1' && IScene.setting.enable_timer_on == '1' && (IScene.setting.on_time.split(" ")[4] == "*" || ((parseInt(IScene.setting.on_time.split(" ")[1])*60 + parseInt(IScene.setting.on_time.split(" ")[0])) > (now.getHours()*60 + now.getMinutes())?(IScene.setting.on_time.split(" ")[4].indexOf(now.getDay())>=0?true:false):(IScene.setting.on_time.split(" ")[4].indexOf((now.getDay()==6?0:now.getDay()+1))>=0?true:false)))) {
                            //usbTimerArray.push(IScene.setting.on_time.split(" ").reverse().join(" "));
                            if((parseInt(IScene.setting.on_time.split(" ")[1])*60 + parseInt(IScene.setting.on_time.split(" ")[0])) > (now.getHours()*60 + now.getMinutes())){
                                usbTimerArray.push("0 0 0 "+IScene.setting.on_time.split(" ")[1]+" "+IScene.setting.on_time.split(" ")[0]+" "+IScene.setting.enable_timer_off+" "+IScene.us_id);
                            }else{
                                usbTimerArray.push("1 0 0 "+IScene.setting.on_time.split(" ")[1]+" "+IScene.setting.on_time.split(" ")[0]+" "+IScene.setting.enable_timer_off+" "+IScene.us_id);
                            }
                        }
                    }
                }

            }

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
                //alert(plug_hourFromNow+":"+plug_minuteFromNow);
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
                //alert(usb_hourFromNow+":"+usb_minuteFromNow);
                this.setState({
                    usb_recentTimer: usb_recentTimer,
                    usb_minuteFromNow: usb_minuteFromNow,
                    usb_hourFromNow: usb_hourFromNow
                });
            } else {
                self.setState({
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

    render () {
        let stateTitle = this.state.currentState ? LocalizedStrings.power_on : LocalizedStrings.power_off;
        let usbStateTitle = this.state.usbCurrentState ? LocalizedStrings.usb_on : LocalizedStrings.usb_off;

        let plug_Image = this.state.currentState ?require("../../Resources/center_icon_power_on2.png") : require("../../Resources/center_icon_power_off2.png");
        let usb_Image = this.state.usbCurrentState ? require("../../Resources/center_icon_usb_on2.png") : require("../../Resources/center_icon_usb_off2.png");

        let plug_bg = this.state.currentState ? require("../../Resources/launch_background_on.png") : require("../../Resources/launch_background_off.png");
        let usb_bg = this.state.usbCurrentState ? require("../../Resources/launch_background_on.png") : require("../../Resources/launch_background_off.png");

        let plug_time = null;
        if (this.state.plug_minuteFromNow > 0 || this.state.plug_hourFromNow > 0) {
            var plug_timetext = "";
            if (this.state.plug_hourFromNow > 0) {
                plug_timetext = this.state.plug_hourFromNow + LocalizedStrings.hour + (this.state.plug_minuteFromNow > 0 ? (this.state.plug_minuteFromNow.toString() + LocalizedStrings.count_down_msg_minute) : LocalizedStrings.later) + (this.state.currentState ? LocalizedStrings.close : LocalizedStrings.open);
            } else {
                plug_timetext = this.state.plug_minuteFromNow + LocalizedStrings.count_down_msg_minute + (this.state.currentState ? LocalizedStrings.close : LocalizedStrings.open);
            }
            plug_time = (<Text style={{color: "#b9d7f8", fontSize: 36 / 3, marginTop: 31 / 3}}
                            numberOfLines={1}>{plug_timetext}</Text>);
        }
        let usb_time = null;
        if (this.state.usb_minuteFromNow > 0 || this.state.usb_hourFromNow > 0) {
            var usb_timetext = "";
            if (this.state.usb_hourFromNow > 0) {
                usb_timetext = this.state.usb_hourFromNow + LocalizedStrings.hour + (this.state.usb_minuteFromNow > 0 ? (this.state.usb_minuteFromNow.toString() + LocalizedStrings.count_down_msg_minute) : LocalizedStrings.later) + (this.state.usbCurrentState ? LocalizedStrings.close :  LocalizedStrings.open);
            } else {
                usb_timetext = this.state.usb_minuteFromNow + LocalizedStrings.count_down_msg_minute + (this.state.usbCurrentState ? LocalizedStrings.close : LocalizedStrings.open);
            }
            usb_time = (<Text style={{color: "#b9d7f8", fontSize: 36 / 3, marginTop: 31 / 3}}
                            numberOfLines={1}>{usb_timetext}</Text>);
        }

        let highTemp =null;
        if(this.state.temperature >=78){
            plug_bg = require("../../Resources/launch_background_high_temp.png");
            usb_bg = require("../../Resources/launch_background_high_temp.png");
            stateTitle=LocalizedStrings.plug_seat_high_temp;
            usbStateTitle=LocalizedStrings.plug_seat_high_temp;
            plug_time = (<Text style={{color: "#b9d7f8", fontSize: 36 / 3, marginTop: 31 / 3}} numberOfLines={1}>{LocalizedStrings.plug_seat_high_temp_tips}</Text>);
            usb_time = (<Text style={{color: "#b9d7f8", fontSize: 36 / 3, marginTop: 31 / 3}} numberOfLines={1}>{LocalizedStrings.plug_seat_high_temp_tips}</Text>);
            highTemp=(<Image style={{width: 19 / 3, height: 154 / 3}} source={require('../../Resources/high_temp_warning.png')}/>);
        }
        return (
            <View style={{flex: 1, 
                backgroundColor: "#f8f8f8", flexDirection: "column"}}>
                <StatusBar barStyle='default'/>
                <View style={{backgroundColor: "#ffffff",marginTop:0,}}/>
                <View style={{backgroundColor: "#bfbfc0", height: 1 / 3}}/>
                {/*plug模块*/}
                <ScrollView>
                    <View style={{marginTop: 6}}>
                        <TouchableOpacity onPress={()=>{this._onOpenPlugPage()}}>
                            {/*width:1046*/}
                            <ImageBackground style={{width: screenWidth - 34 / 3,height: 645 / 3,borderRadius: 5,alignSelf: "center",alignItems: 'center',flexDirection: 'row'}} source={plug_bg}>
                                <TouchableWithoutFeedback onPress={()=>{powerClickable?(this._powerOnOrOff()):(null)}} >
                                    <View style={{width:164,height:164,flexDirection:"column",justifyContent:"center"}}>
                                        <ImageBackground style={{width: 320 / 3, height: 320 / 3, marginLeft: 86 / 3,justifyContent:"center",alignItems:"center"}} source={plug_Image}>
                                        {highTemp}
                                        </ImageBackground>
                                        <View style={{width:164,height:164,position: 'absolute',top:0,left:0,justifyContent:"center",alignItems:"center"}}>
                                            <View ref="powerAnimated" style={{width:111,height:111,borderRadius:111,borderColor: "#ffffff55", borderWidth: 1,opacity:0}}/>
                                        </View>
                                    </View>
                                </TouchableWithoutFeedback>
                                <View style={{flex: 1,flexDirection: 'column',backgroundColor: 'transparent',justifyContent: 'center',alignItems: 'center'}}>
                                    <Text style={{color: "#FFFFFF", fontSize: 48 / 3}} numberOfLines={1}>{stateTitle}</Text>
                                    {plug_time}
                                </View>
                                <Image style={{width: 25 / 3, height: 44 / 3, marginRight: 99 / 3}} source={require('../../Resources/' +'goto_nor2.png')}/>
                            </ImageBackground>
                        
                        </TouchableOpacity>
                    </View>
                    {/*USB模块*/}
                    <View style={{marginTop: 19 / 3}}>
                        <TouchableOpacity onPress={()=>this._onOpenUsbPage()}>
                            {/*width:1046*/}
                            <ImageBackground style={{width: screenWidth - 34 / 3,height: 645 / 3,borderRadius: 5,alignSelf: "center",alignItems: 'center',flexDirection: 'row'}} source={usb_bg}>

                                    <TouchableWithoutFeedback onPress={()=>{ usbClickable?(this._usbOnOrOff()):(null)}}>
                                        <View style={{width:164,height:164,flexDirection:"column",justifyContent:"center"}}>
                                            <ImageBackground style={{width: 320 / 3, height: 320 / 3, marginLeft: 86 / 3,justifyContent:"center",alignItems:"center"}}source={usb_Image}>
                                            {highTemp}
                                            </ImageBackground>
                                            <View style={{width:164,height:164,position: 'absolute',top:0,left:0,justifyContent:"center",alignItems:"center"}}>
                                                <View ref="usbAnimated" style={{width:111,height:111,borderRadius:111,borderColor: "#ffffff55", borderWidth: 1,opacity:0}}/>
                                            </View>
                                        </View>
                                    </TouchableWithoutFeedback>
                                    <View style={{flex: 1,flexDirection: 'column',backgroundColor: 'transparent',justifyContent: 'center',alignItems: 'center'}}>
                                        <Text style={{color: "#FFFFFF", fontSize: 48 / 3}}
                                            numberOfLines={1}>{usbStateTitle}</Text>
                                        {usb_time}
                                    </View>
                                    <Image style={{width: 25 / 3, height: 44 / 3, marginRight: 99 / 3}} source={require('../../Resources/goto_nor2.png')}/>
                            </ImageBackground>
                        </TouchableOpacity>
                    </View>
                    {/*电量统计*/}
                    <View style={{marginTop: 19 / 3}}>
                        <TouchableOpacity onPress={()=>{this._onOpenNewPowerCostPage()}}>
                            {/*width:1046*/}
                            <ImageBackground style={{backgroundColor:'#ffffff',width: screenWidth - 34 / 3,height:((screenWidth - 34/3)*0.347) ,borderRadius: 5,alignSelf: "center",alignItems: 'center',flexDirection: 'row',borderWidth: 1 / 3,borderColor: 'gray'
                                }}>
                                    <View style={{flex: 1,flexDirection: 'column',backgroundColor: 'transparent',justifyContent: 'center',marginLeft: 107 / 3}}>
                                        <Text style={{color: "#585858", fontSize: 15}} numberOfLines={1}>{LocalizedStrings.string_look_history_data}</Text>
                                        <View style={{flexDirection: "row", marginTop: 31 / 3}}>
                                            <Text style={{color: "#a9a9aa", fontSize: 13}} numberOfLines={1}>{LocalizedStrings.string_now_all_power}</Text>
                                            <Text style={{color: "#1993f1", fontSize: 13, marginHorizontal: 4}}
                                                numberOfLines={1}>{this.state.currentPower}</Text>
                                            <Text style={{color: "#a9a9aa", fontSize: 13}} numberOfLines={1}>{"W"}</Text>
                                        </View>
                                    </View>
                                    <Image style={{width: 25 / 3, height: 44 / 3, marginRight: 99 / 3}} source={require('../../Resources/goto_nor.png')}/>
                            </ImageBackground>
                            
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        );
    }

   _startPowerAnimated(){
        powerScaleValue=0;
        this.poweranimated && clearInterval(this.poweranimated);
        powerScaleValue=0;
        this.poweranimated = setInterval(() => {
            requestAnimationFrame(() =>{
                this.refs.powerAnimated.setNativeProps({style:{width:111+powerScaleValue,height:111+powerScaleValue,borderRadius:111+powerScaleValue,borderColor: "#ffffff55", borderWidth: 1,opacity:1}});
                if(powerScaleValue>20){
                    powerScaleValue=0;
                }else{
                    powerScaleValue+=2;
                }
            });
        }, 20);
    }

    _stopPowerAnimated() {
        powerScaleValue=0;
        this.poweranimated && clearInterval(this.poweranimated);
        powerScaleValue=0;
        requestAnimationFrame(() =>{
            powerScaleValue=0;
            this.refs.powerAnimated.setNativeProps({style:{width:111+powerScaleValue,height:111+powerScaleValue,borderRadius:111+powerScaleValue,borderColor: "#ffffff55", borderWidth: 1,opacity:0}});
            powerScaleValue=0;
        });
        //setTimeout(()=>{this._stopPowerAnimated()},20);
    }

    _startUsbAnimated(){
        usbScaleValue=0;
        this.usbanimated && clearInterval(this.usbanimated);
        usbScaleValue=0;
        this.usbanimated = setInterval(() => {
            requestAnimationFrame(() =>{
                this.refs.usbAnimated.setNativeProps({style:{width:111+usbScaleValue,height:111+usbScaleValue,borderRadius:111+usbScaleValue,borderColor: "#ffffff55", borderWidth: 1,opacity:1}});
                if(usbScaleValue>20){
                    usbScaleValue=0;
                }else{
                    usbScaleValue+=2;
                }
            });
        }, 20);
    }

    _stopUsbAnimated() {
        usbScaleValue=0;
        this.usbanimated && clearInterval(this.usbanimated);
        usbScaleValue=0;
        requestAnimationFrame(() =>{
            usbScaleValue=0;
            this.refs.usbAnimated.setNativeProps({style:{width:111+usbScaleValue,height:111+usbScaleValue,borderRadius:111+usbScaleValue,borderColor: "#ffffff55", borderWidth: 1,opacity:0}});
            usbScaleValue=0;
        });
        //setTimeout(()=>{this._stopUsbAnimated()},20);
    
    }

    /* 电源power*/
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

    /* usb power*/
    _usbOnOrOff() {
        this._startUsbAnimated();
        var value = '';
        if (this.state.usbCurrentState) {
            value = 'set_usb_off';
        } else {
            value = 'set_usb_on';
            isShowAlert=false;
        }
        usbClickable=false;
        Device.getDeviceWifi().callMethod(value,[]).then((json)=>{

            usbClickable=true;
            console.log(value  + JSON.stringify(json));
            this._stopUsbAnimated();
            if(json &&(json.code==0)){ 
                this.setState({usbCurrentState: !this.state.usbCurrentState});   
            }
            this._stopUsbAnimated();

        }).catch((error)=>{
            usbClickable=true;
            this._stopUsbAnimated();
            console.log('_usbOnOrOff error:'+JSON.stringify(error));
        });
    }

    _onOpenPlugPage() {

        var params = this.state;
        params.plugType=0;
        this.props.navigation.navigate('newPlugMainPage',params);
    }

    _onOpenNewPowerCostPage() {
        this.props.navigation.navigate('NewPowerCostPage',{name:LocalizedStrings.string_power_data});
    }

    _onOpenUsbPage() {
        var params = this.state;
        params.plugType=1;
        this.props.navigation.navigate('newPlugMainPage',params);
    }

    _getPower() {
        Device.getDeviceWifi().callMethod("get_power",[])
        .then((data)=>{

            // console.log("mytest:get_power " +" "+ JSON.stringify(data));
            if (data&& data.code==0) {
                //alert(JSON.stringify(data));
                let value = JSON.stringify(data.result[0]);
                //Alert.alert("Test", JSON.stringify(data.result[0]));
                this.setState({currentPower: value >= 0 ? ((value / 100.0).toString().indexOf(".")>=0?(value / 100.0):(value / 100.0)+".0" ): "--"});
            } else {
                this.setState({currentPower: "--"});
            }
            this.powertimer = setTimeout(()=>{
                this._getPower();
            },3000);

        })
        .catch(()=>{

        });
    }

    _startGetPower() {
        this._getPower();
    }
    
    /*  停止电源定时器*/
    _stopGetPower() {
        this.powertimer && clearTimeout(this.powertimer);
    }

    /* 属性获取*/
    _getProp() {

        var self = this;
        Device.getDeviceWifi().callMethod("get_prop", ["on", "usb_on", "temperature"])
        .then((json)=>{
            console.log("mytest:get_prop success"+JSON.stringify(json));
            self.setState({
                currentState: json.result[0] == true ? true : false,
                usbCurrentState: json.result[1],
                temperature: json.result[2],
                wifi_led: json.result[3] == "on" ? true : false
            });
        })
        .catch((err)=>{
            console.log("mytest:get_prop err"+JSON.stringify(err));
        });
    }
}

var styles = StyleSheet.create({
  containerAll: {
    flex: 1,
    marginTop: 0,
    justifyContent:'center',
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
