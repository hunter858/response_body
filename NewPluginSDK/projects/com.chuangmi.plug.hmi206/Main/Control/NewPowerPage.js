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
const {Group, Path, Shape, Surface} = ART;
import {LocalizedStrings}  from'../MHLocalizableString';
import {Device,DeviceEvent,Host,Service} from 'miot';
import Button from '../../CommonModules/Button';
import {withNavigation } from 'react-navigation';
import {
    APPBAR_HEIGHT,APPBAR_MARGINBOTTOM,APPBAR_MARGINTOP,isIPX ,
    ratio,NavigatorBarHeight,screenWidth,screenHeight} from '../ConstDefine';

let powerScaleValue=0;
let powerClickable=true;
class NewPowerPage extends React.Component{


    constructor(props,context){
        super(props,context);

        var params = this.props.navigation.state.params;
        this.state ={
            did: Device.deviceID,
            model: Device.deviceModel,
            currentState: params.currentState,
            usbCurrentState: params.usbCurrentState,
            plug_hourFromNow: params.plug_hourFromNow,
            plug_minuteFromNow: params.plug_minuteFromNow,
            plug_recentTimer: params.plug_recentTimer,
            usb_hourFromNow: params.usb_hourFromNow,
            usb_minuteFromNow: params.usb_minuteFromNow,
            usb_recentTimer: params.usb_recentTimer,
            currentPower: params.currentPower,
            temperature: params.temperature
        };
    }

    componentWillMount() {
        
    }

    componentDidMount() {
        // 监听设备改名通知
        var self = this;
        this._deviceNameChangedListener = DeviceEvent.deviceNameChanged.addListener((device) => {
            self.props.navigation.setParams({
                name: device.name
            });
            self.forceUpdate();
        });
        var self = this;
        Device.getDeviceWifi().subscribeMessages('on','usb_on','temperature');
        this._deviceStatusListener = DeviceEvent.deviceReceivedMessages.addListener(
            (device, map, res) => {

                self._getDeviceProps_func();
                self._callSmartHomeApi_func();
        });
    }

    _getDeviceProps_func(){
        
        var now = new Date();
        Device.getDeviceWifi().callMethod("get_prop", ["on", "usb_on", "temperature"]).then((pairs)=>{

            if(pairs&&(pairs.code==0)){
                this.setState({
                    now: now,
                    currentState: pairs.result[0],
                    usbCurrentState: pairs.result[1],
                    temperature: pairs.result[2]
                });
            }
        })
        .catch((error)=>{console.log('error'+JSON.stringify(error))});
    }

    _callSmartHomeApi_func(){

        //从后台获取设备的定时列表
        var TimerQuestData = {
            "did": this.state.did,
            "st_id": "8",
            "identify": this.state.did,
        }
        Service.scene.loadScenes(TimerQuestData)
        .then((response) => {
            //alert(JSON.stringify(response));
            //console.log(JSON.stringify(response));
            var now = new Date();
            var plugTimerArray = [];
            var usbTimerArray = [];
            response.forEach(element => {

                if (element.setting.on_method == "set_power" && element.setting.off_method == "set_power") {
                    if (this.state.currentState) {
                        if (element.setting.enable_timer == '1' && element.setting.enable_timer_off == '1' && (element.setting.off_time.split(" ")[4] == "*" || ((parseInt(element.setting.off_time.split(" ")[1])*60 + parseInt(element.setting.off_time.split(" ")[0])) > (now.getHours()*60 + now.getMinutes())?(element.setting.off_time.split(" ")[4].indexOf(now.getDay())>=0?true:false):(element.setting.off_time.split(" ")[4].indexOf((now.getDay()==6?0:now.getDay()+1))>=0?true:false)))) {
                            //plugTimerArray.push(element.setting.off_time.split(" ").reverse().join(" "));
                            if((parseInt(element.setting.off_time.split(" ")[1])*60 + parseInt(element.setting.off_time.split(" ")[0])) > (now.getHours()*60 + now.getMinutes())){
                                plugTimerArray.push("0 0 0 "+element.setting.off_time.split(" ")[1]+" "+element.setting.off_time.split(" ")[0]+" "+element.setting.enable_timer_on+" "+element.us_id);
                            }else{
                                plugTimerArray.push("1 0 0 "+element.setting.off_time.split(" ")[1]+" "+element.setting.off_time.split(" ")[0]+" "+element.setting.enable_timer_on+" "+element.us_id);
                            }
                        }
                    } else {
                        if (element.setting.enable_timer == '1' && element.setting.enable_timer_on == '1' && (element.setting.on_time.split(" ")[4] == "*" || ((parseInt(element.setting.on_time.split(" ")[1])*60 + parseInt(element.setting.on_time.split(" ")[0])) > (now.getHours()*60 + now.getMinutes())?(element.setting.on_time.split(" ")[4].indexOf(now.getDay())>=0?true:false):(element.setting.on_time.split(" ")[4].indexOf((now.getDay()==6?0:now.getDay()+1))>=0?true:false)))) {
                            // plugTimerArray.push(element.setting.on_time.split(" ").reverse().join(" "));
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
                            //usbTimerArray.push(element.setting.off_time.split(" ").reverse().join(" "));
                            if((parseInt(element.setting.off_time.split(" ")[1])*60 + parseInt(element.setting.off_time.split(" ")[0])) > (now.getHours()*60 + now.getMinutes())){
                                usbTimerArray.push("0 0 0 "+element.setting.off_time.split(" ")[1]+" "+element.setting.off_time.split(" ")[0]+" "+element.setting.enable_timer_on+" "+element.us_id);
                            }else{
                                usbTimerArray.push("1 0 0 "+element.setting.off_time.split(" ")[1]+" "+element.setting.off_time.split(" ")[0]+" "+element.setting.enable_timer_on+" "+element.us_id);
                            }
                        }
                    } else {
                        if (element.setting.enable_timer == '1' && element.setting.enable_timer_on == '1' && (element.setting.on_time.split(" ")[4] == "*" || ((parseInt(element.setting.on_time.split(" ")[1])*60 + parseInt(element.setting.on_time.split(" ")[0])) > (now.getHours()*60 + now.getMinutes())?(element.setting.on_time.split(" ")[4].indexOf(now.getDay())>=0?true:false):(element.setting.on_time.split(" ")[4].indexOf((now.getDay()==6?0:now.getDay()+1))>=0?true:false)))) {
                            //usbTimerArray.push(element.setting.on_time.split(" ").reverse().join(" "));
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
        })
        .catch((error)=>{console.log('error'+JSON.stringify(error))})
    
    }

    _startPowerAnimated(){
        powerScaleValue=0;
        clearInterval(this.poweranimated);
        powerScaleValue=0;
        this.poweranimated = setInterval(() => {
            requestAnimationFrame(() =>{
                this.refs.powerAnimated.setNativeProps({style:{width:210+powerScaleValue,height:210+powerScaleValue,borderRadius:210+powerScaleValue,borderColor: "#ffffff55", borderWidth: 1,opacity:1}});
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
        clearInterval(this.poweranimated);
        powerScaleValue=0;
        requestAnimationFrame(() =>{
            powerScaleValue=0;
            this.refs.powerAnimated.setNativeProps({style:{width:210+powerScaleValue,height:210+powerScaleValue,borderRadius:210+powerScaleValue,borderColor: "#ffffff55", borderWidth: 1,opacity:0}});
            powerScaleValue=0;
        });
    }

    componentWillUnmount () {
        this._deviceNameChangedListener.remove();
        this._deviceStatusListener.remove();
        clearInterval(this.poweranimated);
    }

    onOpenTimerSettingPage () {
        Host.ui.openTimerSettingPageWithVariousTypeParams("set_power", "on", "set_power", "off");
    }

    _onCountdownClick () {

        var newParams = {onMethod:"set_power", offMethod:'set_power', onParam:'on', offParam:'off'};
        Host.ui.openCountDownPage((this.state.currentState),newParams);
    }

    _powerOnOrOff() {
        this._startPowerAnimated();
        var value = '';
        if (this.state.currentState) {
            value = 'off'
        } else {
            value = 'on'
        }
        powerClickable=false;
        Device.getDeviceWifi().callMethod('set_power',[value])
        .then((json) => {
            powerClickable=true;
            this._stopPowerAnimated();
            if (json &&(json.code==0)) {
                this.setState({
                    currentState:(value=='on')?(true):(false)
                });
            }
            this._stopPowerAnimated();
        })
        .catch((error)=>{
            powerClickable =true;
            this._stopPowerAnimated();
            console.log('_powerOnOrOff-error'+JSON.stringify(error))});
    }

    _getProp() {
        Device.getDeviceWifi().callMethod('get_prop',['power', 'usb_on', 'temperature'])
        .then((json ) => {
            if (json&&(json.code==0)) {
                this.setState({
                    currentState: json.result[0] == "on" ? true : false,
                    usbCurrentState: json.result[1],
                    temperature: json.result[2]
                });
            }
        }).catch((error)=>{console.log('get_prop error'+JSON.stringify(error))});
    }

    render () {
        let stateTitle = this.state.currentState ? LocalizedStrings.power_on : LocalizedStrings.power_off;
        let usbStateTitle = this.state.usbCurrentState ? LocalizedStrings.usb_on : LocalizedStrings.usb_off;

        let plug_Image = this.state.currentState ? require('../../Resources/center_icon_power_on.png') : require('../../Resources/center_icon_power_off.png');
        let usb_Image = this.state.usbCurrentState ? require('../../Resources/center_icon_usb_on.png') : require('../../Resources/center_icon_usb_off.png');

        let plug_bg = this.state.currentState ? require('../../Resources/background_on.png') : require('../../Resources/backgroupd_off.png');
        let usb_bg = this.state.usbCurrentState ? require('../../Resources/background_on.png') : require('../../Resources/backgroupd_off.png');

        var plug_timetext = "";
        if (this.state.plug_minuteFromNow > 0 || this.state.plug_hourFromNow > 0) {
            if (this.state.plug_hourFromNow > 0) {
                plug_timetext = this.state.plug_hourFromNow + LocalizedStrings.hour + (this.state.plug_minuteFromNow > 0 ? (this.state.plug_minuteFromNow.toString() + LocalizedStrings.count_down_msg_minute) : LocalizedStrings.later) + (this.state.currentState ? LocalizedStrings.close :  LocalizedStrings.open);
            } else {
                plug_timetext = this.state.plug_minuteFromNow + LocalizedStrings.count_down_msg_minute + (this.state.currentState ? LocalizedStrings.close :  LocalizedStrings.open);
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
            highTemp=(<ImageBackground style={{width: 19 / 3, height: 154 / 3}} source={require('../../Resources/high_temp_warning.png') } />);
        }

        return (
            <View style={styles.containerAll}>
                <ImageBackground style={styles.containerAll}
                       source={ plug_bg}>
                    <View style={{backgroundColor: "transparent", height: APPBAR_HEIGHT + 20}}/>
                    <View style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                        flexDirection: "column"
                    }}>
                        <View style={{width:250,height:250,justifyContent: "center",alignItems: "center",flexDirection: "column"}}>
                            <Surface width={size} height={size}>
                                <Group>
                                    <Shape d={path0} stroke={"#ffffff55"} strokeWidth={progressWidth}/>
                                    <Shape d={path00} stroke={"#ffffff55"} strokeWidth={progressWidth}/>
                                    {degress > 0 ?
                                        <Shape d={path} stroke={"#ffffff"} strokeWidth={progressWidth}/> : null}
                                    {degress > 180 ?
                                        <Shape d={path1} stroke={"#ffffff"} strokeWidth={progressWidth}/> : null}
                                </Group>
                            </Surface>
                            <View style={{width:250,height:250,position: 'absolute',top:0,left:0,justifyContent:"center",alignItems:"center"}}>
                                <View ref="powerAnimated" style={{width:210,height:210,borderRadius:210,borderColor: "#ffffff55", borderWidth: 1,opacity:0}}/>
                            </View>
                            <View style={{
                                position: 'absolute',
                                width: 250,
                                height: 250,
                                top: 0,
                                left: 0,
                                justifyContent: "center",
                                alignItems: "center"
                            }}>
                                <TouchableWithoutFeedback onPress={()=>{
                                    powerClickable?this._powerOnOrOff():null
                                    }}>
                                    <ImageBackground style={{width: 182, height: 182,justifyContent:"center",alignItems:"center"}}
                                           source={plug_Image}>{highTemp}</ImageBackground>
                                </TouchableWithoutFeedback>
                            </View>
                        </View>
                    </View>


                    <View style={{
                        justifyContent: "center",
                        alignItems: "center",
                        flexDirection: "column",
                        marginBottom: 50
                    }}>
                        <Text style={{color: "#FFFFFF", fontSize: 14, marginTop: 20}}
                              numberOfLines={1}>{stateTitle}</Text>
                        <Text style={{color: "#FFFFFF", fontSize: 12, marginTop: 8}}
                              numberOfLines={1}>{plug_timetext}</Text>
                    </View>
                    <View style={{
                        height: 100,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-around'
                    }}>
                        <Button onPress={()=>{
                            powerClickable?this._powerOnOrOff():null
                        }} title={LocalizedStrings.plug_switch} titleClor="#ffffff"
                                imageNormal={require('../../Resources/power_on.png')} imageHighlight={require('../../Resources/power_pressed.png')}
                                imageWidth={163 / 3} imageHeight={163 / 3} titleSize={12}/>
                        <Button onPress={()=>{this.onOpenTimerSettingPage()}} title={LocalizedStrings.plug_timer} titleClor="#ffffff"
                                imageNormal={require("../../Resources/timer_on.png")} imageHighlight={require("../../Resources/timer_pressed.png")}
                                imageWidth={163 / 3} imageHeight={163 / 3} titleSize={12}/>
                        <Button onPress={()=>{this._onCountdownClick()}} title={LocalizedStrings.plug_count_down_timer} titleClor="#ffffff"
                                imageNormal={require("../../Resources/countdown_on.png")} imageHighlight={require("../../Resources/countdown_pressed.png")}
                                imageWidth={163 / 3} imageHeight={163 / 3} titleSize={12}/>
                    </View>
                    <View style={{height: 40, marginBottom: 50}}>

                    </View>
                </ImageBackground>
            </View>
        );
    }
}

var styles = StyleSheet.create({
    containerAll: {
        flex: 1,
        flexDirection: 'column',
        width: screenWidth,
        height: screenHeight
    }
});

export default withNavigation(NewPowerPage);

