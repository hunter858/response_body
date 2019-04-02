'use strict';
import React from 'react';
import {
  View,
  Text,
  AppRegistry,
  TouchableWithoutFeedback,
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
  ImageBackground,
  DeviceEventEmitter,
} from 'react-native';


// var MHPluginSDK = require('NativeModules').MHPluginSDK;
import { Package, Device,DeviceProperties, Service,DeviceEvent,Host } from "miot";
import { TitleBarBlack,TitleBarWhite } from 'miot/ui';
import {LocalizedStrings} from'../MHLocalizableString';
var window = Dimensions.get('window');

import {
    APPBAR_HEIGHT,APPBAR_MARGINBOTTOM,APPBAR_MARGINTOP,isIPX ,
    ratio,NavigatorBarHeight,screenWidth,screenHeight} from '../ConstDefine';



var day_start = [0, 0, 0, 0, 0, 0, 0];
var day_powers = [0, 0, 0, 0, 0, 0, 0];
var day_times = [0, 0, 0, 0, 0, 0, 0];
var day_text = ["", "", "", "", "", "", ""];

var week_start = [0, 0, 0, 0, 0];
var week_powers = [0, 0, 0, 0, 0];
var week_times = [0, 0, 0, 0, 0];
var week_text = ["", "", "", "", ""];
var week_end = [0, 0, 0, 0, 0];
var week_end_text = ["", "", "", "", ""];

var month_start = [0, 0, 0, 0, 0, 0];
var month_powers = [0, 0, 0, 0, 0, 0];
var month_times = [0, 0, 0, 0, 0, 0];
var month_text = ["", "", "", "", "", ""];

var today = 0;
var day_end = 0;

const TYPE_DAY = 0;
const TYPE_WEEK = 1;
const TYPE_MONTH = 2;
const TYPE_SWITCH_POWER = 3;
const TYPE_SWITCH_USB = 4;

var powerSwtich = new Array();
var usbSwtich = new Array();
var allSwtich = new Array();
var apiCount = 0;

export default class NewPowerCostPage extends React.Component{
    
    static navigationOptions = ({ navigation }) => {
        return {
        header: null
        };
    };

    constructor(props, context) {
        super(props, context);
        this.state = {
            chartType: TYPE_DAY,
            selectIndex: -1
        };

    }

    componentWillMount() {
        this.initDate();
    }

    componentDidMount() {
        allSwtich = new Array();
        // MHPluginSDK.showLoadingTips(LocalizedStrings.ios_sting_3);

        this.getPowerData(TYPE_DAY);
        this.getPowerData(TYPE_WEEK);
        this.getPowerData(TYPE_MONTH);
        this.getPowerData(TYPE_SWITCH_POWER);
        this.getPowerData(TYPE_SWITCH_USB);

    }

    componentWillUnmount() {

    }

    refreshUI() {
        ++apiCount;
        if (apiCount % 5 == 0) {
            // MHPluginSDK.dismissTips();
            this.setState({
                chartType: TYPE_DAY,
                selectIndex: day_start.length - 1
            });
        }
    }

    getPowerData(type) {
        var params;
        switch (type) {
            case TYPE_DAY:
                params = {
                    did: Device.deviceID,
                    time_start: day_start[0] - 1,
                    time_end: day_end,
                    type: "prop_cal_day",
                    key: "power_cost",
                    limit: 1000
                };
                break;
            case TYPE_WEEK:
                params = {
                    did: Device.deviceID,
                    time_start: week_start[0] - 1,
                    time_end: day_end,
                    type: "prop_cal_week",
                    key: "power_cost",
                    limit: 1000
                };
                break;
            case TYPE_MONTH:
                params = {
                    did: Device.deviceID,
                    time_start: month_start[0] - 1,
                    time_end: day_end,
                    type: "prop_cal_month",
                    key: "power_cost",
                    limit: 1000
                };
                break;
            case TYPE_SWITCH_POWER:
                params = {
                    did: Device.deviceID,
                    time_start: day_start[day_start.length - 1],
                    time_end: day_end,
                    type: "prop",
                    key: "power",
                    limit: 1000
                };
                break;
            case TYPE_SWITCH_USB:
                params = {
                    did: Device.deviceID,
                    time_start: day_start[day_start.length - 1],
                    time_end: day_end,
                    type: "prop",
                    key: "usb_on",
                    limit: 1000
                };
                break;
        }
        
        console.log("get_user_device_data:" + type + JSON.stringify(params));
        Service.smarthome.getDeviceData(params)
        .then((response) => {

            console.log("/user/get_user_device_data:"+JSON.stringify(response));

            let list = response;
            if (list.length > 0) {
                //alert(JSON.stringify(list[0].time) + "|" + JSON.stringify(list[0].value));
                switch (type) {
                    case TYPE_DAY:
                        for (let i = 0; i < list.length; i++) {
                            let num = day_start.indexOf(list[i].time);
                            if (num >= 0) {
                                day_powers[num] = list[i].value.pc>0?list[i].value.pc:0;
                                day_times[num] = list[i].value.pc_time;
                            }
                        }
                        break;
                    case TYPE_WEEK:
                        for (let i = 0; i < list.length; i++) {
                            let num = week_start.indexOf(list[i].time);
                            if (num >= 0) {
                                week_powers[num] = list[i].value.pc>0?list[i].value.pc:0;
                                week_times[num] = list[i].value.pc_time;
                            }
                        }
                        break;
                    case TYPE_MONTH:
                        for (let i = 0; i < list.length; i++) {
                            let num = month_start.indexOf(list[i].time);
                            if (num >= 0) {
                                month_powers[num] = list[i].value.pc>0?list[i].value.pc:0;
                                month_times[num] = list[i].value.pc_time;
                            }
                        }
                        break;
                    case TYPE_SWITCH_POWER:
                        powerSwtich = new Array();
                        for (let i = 0; i < list.length; i++) {
                            powerSwtich[i] = {t: list[i].time, v: JSON.parse(list[i].value)[0], k: list[i].key};
                            allSwtich.push({t: list[i].time, v: JSON.parse(list[i].value)[0], k: list[i].key});
                        }
                        //alert(powerSwtich);
                        break;
                    case TYPE_SWITCH_USB:
                        usbSwtich = new Array();
                        for (let i = 0; i < list.length; i++) {
                            usbSwtich[i] = {t: list[i].time, v: JSON.parse(list[i].value)[0], k: list[i].key};
                            allSwtich.push({t: list[i].time, v: JSON.parse(list[i].value)[0], k: list[i].key});
                        }
                        //alert(usbSwtich);
                        break;
                }
            }
            this.refreshUI();
        })
        .catch(err=>{
            console.log('callSmartHomeAPI.err:'+JSON.stringify(err))
        });
    }

    callSmartHomeAPI(params){
        
        
        // MHPluginSDK.callSmartHomeAPI('/user/get_user_device_data', params, );
    }



    dateFormat(date, fmt) {
        var o = {
            "M+": date.getMonth() + 1, //月份
            "d+": date.getDate(), //日
            "H+": date.getHours(), //小时
            "m+": date.getMinutes(), //分
            "s+": date.getSeconds(), //秒
            "q+": Math.floor((date.getMonth() + 3) / 3), //季度
            "S": date.getMilliseconds() //毫秒
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    }

    initDate() {
        var edit_time = new Date();
        edit_time.setMilliseconds(0);
        console.log("当前时间:" + this.dateFormat(edit_time, "yyyy-MM-dd HH:mm:ss"));
        today = edit_time.getTime() / 1000;
        console.log("today:" + today);

        edit_time.setHours(23);
        edit_time.setMinutes(59);
        edit_time.setSeconds(59);
        console.log("今日23点:" + this.dateFormat(edit_time, "yyyy-MM-dd HH:mm:ss"));
        day_end = edit_time.getTime() / 1000;
        console.log("day_end:" + day_end);

        edit_time.setHours(0);
        edit_time.setMinutes(0);
        edit_time.setSeconds(0);
        console.log("今日0点:" + this.dateFormat(edit_time, "yyyy-MM-dd HH:mm:ss"));

        for (let i = 0; i < day_start.length; i++) {
            if (i != 0) {
                edit_time.setDate(edit_time.getDate() - 1);
            }
            day_start[day_start.length - 1 - i] = edit_time.getTime() / 1000;
            day_text[day_text.length - 1 - i] = this.dateFormat(edit_time, "yyyy-MM-dd HH:mm:ss");
        }
        console.log("day_start:" + day_start);
        console.log("day_text:" + day_text);

        edit_time.setTime(day_start[day_start.length - 1] * 1000);//重置到当天凌晨时间
        console.log("今日0点:" + this.dateFormat(edit_time, "yyyy-MM-dd HH:mm:ss"));
        edit_time.setDate(edit_time.getDate() - (edit_time.getDay() == 0 ? 7 : edit_time.getDay()) + 1);
        console.log("本周一:" + this.dateFormat(edit_time, "yyyy-MM-dd HH:mm:ss"));
        for (let i = 0; i < week_start.length; i++) {
            if (i != 0) {
                edit_time.setDate(edit_time.getDate() - 7);
            }
            week_start[week_start.length - 1 - i] = edit_time.getTime() / 1000;
            week_text[week_text.length - 1 - i] = this.dateFormat(edit_time, "yyyy-MM-dd HH:mm:ss");
        }
        console.log("week_start:" + week_start);
        console.log("week_text:" + week_text);

        edit_time.setTime(day_start[day_start.length - 1] * 1000);//重置到当天凌晨时间
        console.log("今日0点:" + this.dateFormat(edit_time, "yyyy-MM-dd HH:mm:ss"));
        edit_time.setDate(edit_time.getDate() - (edit_time.getDay() == 0 ? 7 : edit_time.getDay()) + 7);
        console.log("本周日:" + this.dateFormat(edit_time, "yyyy-MM-dd HH:mm:ss"));
        for (let i = 0; i < week_end.length; i++) {
            if (i != 0) {
                edit_time.setDate(edit_time.getDate() - 7);
            }
            week_end[week_end.length - 1 - i] = edit_time.getTime() / 1000;
            week_end_text[week_end_text.length - 1 - i] = this.dateFormat(edit_time, "yyyy-MM-dd HH:mm:ss");
        }
        console.log("week_end:" + week_end);
        console.log("week_end_text:" + week_end_text);

        edit_time.setTime(day_start[day_start.length - 1] * 1000);//重置到当天凌晨时间
        console.log("今日0点:" + this.dateFormat(edit_time, "yyyy-MM-dd HH:mm:ss"));
        edit_time.setDate(1);
        for (let i = 0; i < month_start.length; i++) {
            if (i != 0) {
                edit_time.setMonth(edit_time.getMonth() - 1);
            }
            month_start[month_start.length - 1 - i] = edit_time.getTime() / 1000;
            month_text[month_text.length - 1 - i] = this.dateFormat(edit_time, "yyyy-MM-dd HH:mm:ss");
        }
        console.log("month_start:" + month_start);
        console.log("month_text:" + month_text);
    }

    getMax(arr) {
        let max = arr[0];
        for (let x = 1; x < arr.length; x++) {
            if (arr[x] > max) {
                max = arr[x];
            }
        }
        return max;
    }

    showSwitchUI() {
        var views = [];
        if (allSwtich.length > 0) {
            allSwtich.sort(function (x, y) {
                if (x.t < y.t) {
                    return 1;
                } else if (x.t > y.t) {
                    return -1;
                } else {
                    return 0;
                }
            });
            for (let i = 0; i < allSwtich.length; i++) {
                let typetext = "";
                //alert(allSwtich[i].k +"|"+allSwtich[i].v);
                if (allSwtich[i].k == "power") {
                    if (allSwtich[i].v == "on") {
                        typetext = LocalizedStrings.string_12;
                    } else {
                        typetext = LocalizedStrings.string_13;
                    }
                } else {
                    if (allSwtich[i].v == true) {
                        typetext = LocalizedStrings.string_14;
                    } else {
                        typetext = LocalizedStrings.string_15;
                    }
                }
                views.push((<View key={`view_${i}`} style={{height: 62, flexDirection: "row", alignItems: "center"}}>
                    <Text style={{
                        fontSize: 14,
                        color: "#000000b3",
                        marginLeft: 21
                    }}>{this.dateFormat(new Date(allSwtich[i].t * 1000), "HH:mm")}</Text>
                    <Text style={{fontSize: 12, color: "#00000080", marginLeft: 21}}>{typetext}</Text>
                </View>));
                views.push(<View key={`line_${i}`}
                                 style={{height: 1 / 3, backgroundColor: "#d9d9d9", marginHorizontal: 20}}/>);
            }
        }

        return views;
    }


    render() {
        let powers;
        let times;
        let chartHeight = 200;
        let b0, b1, b2, b3, b4, b5, b6 = 0;
        let t0, t1, t2, t3, t4, t5, t6;
        let chartTypeString=LocalizedStrings.string_month_data;
        switch (this.state.chartType) {
            case TYPE_DAY:
                chartTypeString=LocalizedStrings.string_day_data;
                powers = day_powers[this.state.selectIndex];
                times = day_times[this.state.selectIndex];
                b0 = this.getMax(month_powers)>0?parseInt(chartHeight / this.getMax(day_powers) * day_powers[0]):0;
                b1 = this.getMax(month_powers)>0?parseInt(chartHeight / this.getMax(day_powers) * day_powers[1]):0;
                b2 = this.getMax(month_powers)>0?parseInt(chartHeight / this.getMax(day_powers) * day_powers[2]):0;
                b3 = this.getMax(month_powers)>0?parseInt(chartHeight / this.getMax(day_powers) * day_powers[3]):0;
                b4 = this.getMax(month_powers)>0?parseInt(chartHeight / this.getMax(day_powers) * day_powers[4]):0;
                b5 = this.getMax(month_powers)>0?parseInt(chartHeight / this.getMax(day_powers) * day_powers[5]):0;
                b6 = this.getMax(month_powers)>0?parseInt(chartHeight / this.getMax(day_powers) * day_powers[6]):0;
                t0 = this.dateFormat(new Date(day_start[0] * 1000), "M/d");
                t1 = this.dateFormat(new Date(day_start[1] * 1000), "M/d");
                t2 = this.dateFormat(new Date(day_start[2] * 1000), "M/d");
                t3 = this.dateFormat(new Date(day_start[3] * 1000), "M/d");
                t4 = this.dateFormat(new Date(day_start[4] * 1000), "M/d");
                t5 = LocalizedStrings.string_5;
                t6 = LocalizedStrings.string_6;
                break;
            case TYPE_WEEK:
                chartTypeString=LocalizedStrings.string_week_data;
                powers = week_powers[this.state.selectIndex];
                times = week_times[this.state.selectIndex];
                b0 = this.getMax(month_powers)>0?parseInt(chartHeight / this.getMax(week_powers) * week_powers[0]):0;
                b1 = this.getMax(month_powers)>0?parseInt(chartHeight / this.getMax(week_powers) * week_powers[1]):0;
                b2 = this.getMax(month_powers)>0?parseInt(chartHeight / this.getMax(week_powers) * week_powers[2]):0;
                b3 = this.getMax(month_powers)>0?parseInt(chartHeight / this.getMax(week_powers) * week_powers[3]):0;
                b4 = this.getMax(month_powers)>0?parseInt(chartHeight / this.getMax(week_powers) * week_powers[4]):0;
                b5 = 0;
                b6 = 0;
                t0 = this.dateFormat(new Date(week_start[0] * 1000), "M/d") + "-" + this.dateFormat(new Date(week_end[0] * 1000), "M/d");
                t1 = this.dateFormat(new Date(week_start[1] * 1000), "M/d") + "-" + this.dateFormat(new Date(week_end[1] * 1000), "M/d");
                t2 = this.dateFormat(new Date(week_start[2] * 1000), "M/d") + "-" + this.dateFormat(new Date(week_end[2] * 1000), "M/d");
                t3 = LocalizedStrings.string_7;
                t4 = LocalizedStrings.string_8;
                t5 = "";
                t6 = "";
                break;
            case TYPE_MONTH:
                chartTypeString=LocalizedStrings.string_month_data;
                powers = month_powers[this.state.selectIndex];
                times = month_times[this.state.selectIndex];
                b0 = this.getMax(month_powers)>0?parseInt(chartHeight / this.getMax(month_powers) * month_powers[0]):0;
                b1 = this.getMax(month_powers)>0?parseInt(chartHeight / this.getMax(month_powers) * month_powers[1]):0;
                b2 = this.getMax(month_powers)>0?parseInt(chartHeight / this.getMax(month_powers) * month_powers[2]):0;
                b3 = this.getMax(month_powers)>0?parseInt(chartHeight / this.getMax(month_powers) * month_powers[3]):0;
                b4 = this.getMax(month_powers)>0?parseInt(chartHeight / this.getMax(month_powers) * month_powers[4]):0;
                b5 = this.getMax(month_powers)>0?parseInt(chartHeight / this.getMax(month_powers) * month_powers[5]):0;
                b6 = 0;
                t0 = this.dateFormat(new Date(month_start[0] * 1000), LocalizedStrings.string_11);
                t1 = this.dateFormat(new Date(month_start[1] * 1000), LocalizedStrings.string_11);
                t2 = this.dateFormat(new Date(month_start[2] * 1000), LocalizedStrings.string_11);
                t3 = this.dateFormat(new Date(month_start[3] * 1000), LocalizedStrings.string_11);
                t4 = LocalizedStrings.string_9;
                t5 = LocalizedStrings.string_10;
                t6 = "";
                break;
        }
        //alert(b0+" "+b1+" "+b2+" "+b3+" "+b4+" "+b5+" "+b6);
        if (this.state.selectIndex == -1) {
            powers = "--";
            times = "--";
        } else {
            if (powers > 0) {
                powers = parseInt(powers)/1000.0;
            } else {
                powers = "--";
            }
            times = parseInt(times / 1000 / 60);
            if (times > 0) {
                times = parseInt(times / 60) + ":" + parseInt(times % 60);
            } else {
                times = "--";
            }
        }

console.log('isIPX:'+isIPX);

        return (
            <View style={styles.container}>
                <View style={{backgroundColor: "#118fed", height: NavigatorBarHeight+20}}/>
                <ScrollView contentContainerStyle={styles.contentContainer} style={styles.scrollViewContainer} bounces={false} showsVerticalScrollIndicator={false}>
                    {/*头部今日用电模块*/}
                    <View style={{
                        height: 215,
                        backgroundColor: "#118fed",
                        alignItems: "center",
                        justifyContent: "center"
                    }}>
                        {day_powers[day_powers.length - 1] > 0 ? (
                            <View style={{flexDirection: "column", alignItems: "center", paddingBottom: 25}}>
                                <Text style={{color: "#ffffffcc", fontSize: 13}}
                                      numberOfLines={1}>{LocalizedStrings.string_today_power_data}</Text>
                                <Text style={{color: "#ffffff", fontSize: 67, marginTop: 6}}
                                      numberOfLines={1}>{parseInt(day_powers[day_powers.length - 1])/1000.0}</Text>
                            </View>) : (
                            <View style={{flexDirection: "row", alignItems: "center", paddingBottom: 25}}>
                                <Image style={{width: 34 / 3, height: 47 / 3}}
                                       source={require('../../Resources/icon_no_power_data.png')}/>
                                <Text style={{color: "#ffffff80", fontSize: 12, marginLeft: 6, marginRight: 8}}
                                      numberOfLines={1}>{LocalizedStrings.string_no_power_data}</Text>
                            </View>)}
                    </View>
                    {/*头部今日用电模块*/}

                    {/*4宫格模块*/}
                    <View style={{flexDirection: "row", height: 78, backgroundColor: "#ffffff"}}>
                        <View
                            style={{flexDirection: "column", flex: 1, justifyContent: "center", alignItems: "center"}}>
                            <Text style={{color: "#00000099", fontSize: 12, marginTop: 5}}
                                  numberOfLines={1}>{LocalizedStrings.string_month_power_data}</Text>
                            <View style={{flexDirection: "row", alignItems: "center", marginTop: 3}}>
                                <Text style={{color: "#000000cc", fontSize: 23}}
                                      numberOfLines={1}>{month_powers[month_powers.length - 1] > 0 ? parseInt(month_powers[month_powers.length - 1])/1000.0 : "--"}</Text>
                                <Text style={{color: "#00000080", fontSize: 11, marginLeft: 2}}
                                      numberOfLines={1}>{LocalizedStrings.string_du}</Text>
                            </View>
                        </View>
                        <View style={{width: 1 / 3, alignSelf: "stretch", backgroundColor: "#d9d9d9"}}/>

                        <View
                            style={{flexDirection: "column", flex: 1, justifyContent: "center", alignItems: "center"}}>
                            <Text style={{color: "#00000099", fontSize: 12, marginTop: 5}}
                                  numberOfLines={1}>{LocalizedStrings.string_yesterday_power_data}</Text>
                            <View style={{flexDirection: "row", alignItems: "center", marginTop: 3}}>
                                <Text style={{color: "#000000cc", fontSize: 23}}
                                      numberOfLines={1}>{day_powers[day_powers.length - 1 - 1] > 0 ? parseInt(day_powers[day_powers.length - 1 - 1])/1000.0 : "--"}</Text>
                                <Text style={{color: "#00000080", fontSize: 11, marginLeft: 2}}
                                      numberOfLines={1}>{LocalizedStrings.string_du}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={{height: 1 / 3, backgroundColor: "#d9d9d9"}}/>
                    <View style={{flexDirection: "row", height: 78, backgroundColor: "#ffffff"}}>
                        <View
                            style={{flexDirection: "column", flex: 1, justifyContent: "center", alignItems: "center"}}>
                            <Text style={{color: "#00000099", fontSize: 12, marginTop: 5}}
                                  numberOfLines={1}>{LocalizedStrings.string_today_open_time}</Text>
                            <View style={{flexDirection: "row", alignItems: "center", marginTop: 3}}>
                                <Text style={{color: "#000000cc", fontSize: 23}}
                                      numberOfLines={1}>{day_times[day_times.length - 1] > 0 ? parseInt(day_times[day_times.length - 1] / 1000 / 60 / 60) : "--"}</Text>
                                <Text style={{color: "#00000080", fontSize: 11, marginLeft: 2}}
                                      numberOfLines={1}>{LocalizedStrings.string_shi}</Text>
                                <Text style={{color: "#000000cc", fontSize: 23, marginLeft: 2}}
                                      numberOfLines={1}>{day_times[day_times.length - 1] > 0 ? parseInt(day_times[day_times.length - 1] / 1000 / 60 % 60) : "--"}</Text>
                                <Text style={{color: "#00000080", fontSize: 11, marginLeft: 2}}
                                      numberOfLines={1}>{LocalizedStrings.string_fen}</Text>
                            </View>
                        </View>
                        <View style={{width: 1 / 3, alignSelf: "stretch", backgroundColor: "#d9d9d9"}}/>

                        <View
                            style={{flexDirection: "column", flex: 1, justifyContent: "center", alignItems: "center"}}>
                            <Text style={{color: "#00000099", fontSize: 12, marginTop: 5}}
                                  numberOfLines={1}>{LocalizedStrings.string_today_switch_count}</Text>
                            <View style={{flexDirection: "row", alignItems: "center", marginTop: 3}}>
                                <Text style={{color: "#000000cc", fontSize: 23}}
                                      numberOfLines={1}>{(allSwtich.length) > 0 ? (allSwtich.length) : "--"}</Text>
                                <Text style={{color: "#00000080", fontSize: 11, marginLeft: 2}}
                                      numberOfLines={1}>{LocalizedStrings.string_ci}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={{height: 1 / 3, backgroundColor: "#d9d9d9"}}/>
                    {/*4宫格模块*/}
                    <View style={{height: 1 / 3, backgroundColor: "#d9d9d9", marginTop: 6}}/>
                    {/*白色背景*/}
                    <View style={{flexDirection: "column", backgroundColor: "#ffffff"}}>
                        {/*月周日选择器模块*/}
                        <View style={{
                            height: 63,
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center"
                        }}>
                            <Text style={{color: "#000000cc", fontSize: 14, marginLeft: 20}}
                                  numberOfLines={1}>{chartTypeString}</Text>
                            <View style={{
                                flexDirection: "row",
                                borderRadius: 45,
                                borderColor: "#b2b2b2",
                                borderWidth: 1 / 3,
                                marginRight: 20,
                                backgroundColor: "#ffffff"
                            }}>
                                <TouchableWithoutFeedback onPress={() => {
                                    this.setState({chartType: TYPE_MONTH, selectIndex: month_start.length - 1});
                                }}>
                                    <View style={[{
                                        height: 27,
                                        width: 40,
                                        borderTopLeftRadius: 45,
                                        borderBottomLeftRadius: 45,
                                        alignItems: "center",
                                        justifyContent: "center"
                                    }, this.state.chartType == TYPE_MONTH ? {backgroundColor: "#0000000d"} : null]}>
                                        <Text style={{color: "#00000066", fontSize: 11}}>{LocalizedStrings.string_month}</Text>
                                    </View>
                                </TouchableWithoutFeedback>
                                <View style={{width: 1 / 3, alignSelf: "stretch", backgroundColor: "#cccccc"}}/>
                                <TouchableWithoutFeedback onPress={() => {
                                    this.setState({chartType: TYPE_WEEK, selectIndex: week_start.length - 1});
                                }}>
                                    <View style={[{
                                        height: 27,
                                        width: 37,
                                        alignItems: "center",
                                        justifyContent: "center"
                                    }, this.state.chartType == TYPE_WEEK ? {backgroundColor: "#0000000d"} : null]}>
                                        <Text style={{color: "#00000066", fontSize: 11}}>{LocalizedStrings.string_week}</Text>
                                    </View>
                                </TouchableWithoutFeedback>
                                <View style={{width: 1 / 3, alignSelf: "stretch", backgroundColor: "#cccccc"}}/>
                                <TouchableWithoutFeedback onPress={() => {
                                    this.setState({chartType: TYPE_DAY, selectIndex: day_start.length - 1});
                                }}>
                                    <View style={[{
                                        height: 27,
                                        width: 40,
                                        borderTopRightRadius: 45,
                                        borderBottomRightRadius: 45,
                                        alignItems: "center",
                                        justifyContent: "center"
                                    }, this.state.chartType == TYPE_DAY ? {backgroundColor: "#0000000d"} : null]}>
                                        <Text style={{color: "#00000066", fontSize: 11}}>{LocalizedStrings.string_day}</Text>
                                    </View>
                                </TouchableWithoutFeedback>
                            </View>
                        </View>
                        {/*月周日选择器模块*/}
                        <View style={{height: 1 / 3, backgroundColor: "#d9d9d9", marginHorizontal: 20}}/>
                        {/*月周日用电用时模块*/}
                        <View style={{
                            height: 74,
                            flexDirection: "row",
                            alignItems: "center",
                            marginLeft: 20
                        }}>
                            <View style={{flexDirection: "column", alignItems: "center"}}>
                                <Text style={{color: "#878d92", fontSize: 11, marginTop: 3}}
                                      numberOfLines={1}>{LocalizedStrings.string_power_du_data}</Text>

                                <Text style={{color: "#1993f1", fontSize: 23, marginTop: 3}}
                                      numberOfLines={1}>{powers}</Text>
                            </View>
                            <View style={{width: 1 / 3, height: 30, marginHorizontal: 10, backgroundColor: "#d9d9d9"}}/>
                            <View style={{flexDirection: "column", alignItems: "center"}}>
                                <Text style={{color: "#878d92", fontSize: 11, marginTop: 3}}
                                      numberOfLines={1}>{LocalizedStrings.string_use_time}</Text>
                                <Text style={{color: "#000000b3", fontSize: 23, marginTop: 3}}
                                      numberOfLines={1}>{times}</Text>
                            </View>
                        </View>
                        {/*月周日用电用时模块*/}

                        {/*图表背景柱子模块*/}
                        <View style={{height: 200, flexDirection: "column"}}>
                            {/*背景虚线*/}
                            <View style={{position: "relative",height: 200,flexDirection: "column",marginHorizontal: 20}}>
                                <View style={{flex: 1}}/>
                                <View style={{
                                    borderStyle: "dashed",
                                    borderColor: "#0000001a",
                                    borderWidth: 1 / 3,
                                    height: 1 / 3
                                }}/>
                                <View style={{flex: 1}}/>
                                <View style={{
                                    borderStyle: "dashed",
                                    borderColor: "#0000001a",
                                    borderWidth: 1 / 3,
                                    height: 1 / 3
                                }}/>
                                <View style={{flex: 1}}/>
                                <View style={{
                                    borderStyle: "dashed",
                                    borderColor: "#0000001a",
                                    borderWidth: 1 / 3,
                                    height: 1 / 3
                                }}/>
                                <View style={{flex: 1}}/>
                                <View style={{
                                    borderStyle: "dashed",
                                    borderColor: "#0000001a",
                                    borderWidth: 1 / 3,
                                    height: 1 / 3
                                }}/>
                                <View style={{flex: 1}}/>
                            </View>
                            {/*背景虚线*/}

                            {/*柱状模块*/}
                            <View style={{
                                position: "relative",
                                flexDirection: "row",
                                height: 200,
                                flex: 1,
                                marginHorizontal: 26,
                                alignItems: "flex-end"
                            }}>
                                <Text style={{
                                    height: b0,
                                    flex: 1,
                                    backgroundColor: this.state.selectIndex == 0 ? "#1993f1" : "#badefb"
                                }} onPress={() => {
                                    this.setState({selectIndex: 0});
                                }}/>
                                <View style={{alignSelf: "stretch", flex: 0.6}}/>
                                <Text style={{
                                    height: b1,
                                    flex: 1,
                                    backgroundColor: this.state.selectIndex == 1 ? "#1993f1" : "#badefb"
                                }} onPress={() => {
                                    this.setState({selectIndex: 1});
                                }}/>
                                <View style={{alignSelf: "stretch", flex: 0.6}}/>
                                <Text style={{
                                    height: b2,
                                    flex: 1,
                                    backgroundColor: this.state.selectIndex == 2 ? "#1993f1" : "#badefb"
                                }} onPress={() => {
                                    this.setState({selectIndex: 2});
                                }}/>
                                <View style={{alignSelf: "stretch", flex: 0.6}}/>
                                <Text style={{
                                    height: b3,
                                    flex: 1,
                                    backgroundColor: this.state.selectIndex == 3 ? "#1993f1" : "#badefb"
                                }} onPress={() => {
                                    this.setState({selectIndex: 3});
                                }}/>
                                <View style={{alignSelf: "stretch", flex: 0.6}}/>
                                <Text style={{
                                    height: b4,
                                    flex: 1,
                                    backgroundColor: this.state.selectIndex == 4 ? "#1993f1" : "#badefb"
                                }} onPress={() => {
                                    this.setState({selectIndex: 4});
                                }}/>
                                {(this.state.chartType == TYPE_DAY || this.state.chartType == TYPE_MONTH) ? (
                                    <View style={{alignSelf: "stretch", flex: 0.6}}/>) : null}
                                {(this.state.chartType == TYPE_DAY || this.state.chartType == TYPE_MONTH) ? (
                                    <Text style={{
                                        height: b5,
                                        flex: 1,
                                        backgroundColor: this.state.selectIndex == 5 ? "#1993f1" : "#badefb"
                                    }} onPress={() => {
                                        this.setState({selectIndex: 5});
                                    }}/>) : null}
                                {this.state.chartType == TYPE_DAY ? (
                                    <View style={{alignSelf: "stretch", flex: 0.6}}/>) : null}
                                {this.state.chartType == TYPE_DAY ? (<Text style={{
                                    height: b6,
                                    flex: 1,
                                    backgroundColor: this.state.selectIndex == 6 ? "#1993f1" : "#badefb"
                                }} onPress={() => {
                                    this.setState({selectIndex: 6});
                                }}/>) : null}

                            </View>
                            {/*柱状模块*/}
                        </View>
                        {/*图表背景柱子模块*/}
                        <View style={{height: 1 / 3, backgroundColor: "#d9d9d9", marginHorizontal: 20}}/>
                        {/*图表底部标注模块*/}
                        <View style={{
                            flexDirection: "row",
                            height: 28,
                            marginHorizontal: 26,
                            alignItems: "center"
                        }}>
                            <Text style={{
                                flex: 1,
                                textAlign: "center",
                                fontSize: 8,
                                color: this.state.selectIndex == 0 ? "#1993f1" : "#00000080"
                            }}>{t0}</Text>
                            <View style={{alignSelf: "stretch", flex: 0.5}}/>
                            <Text style={{
                                flex: 1,
                                textAlign: "center",
                                fontSize: 8,
                                color: this.state.selectIndex == 1 ? "#1993f1" : "#00000080"
                            }}>{t1}</Text>
                            <View style={{alignSelf: "stretch", flex: 0.5}}/>
                            <Text style={{
                                flex: 1,
                                textAlign: "center",
                                fontSize: 8,
                                color: this.state.selectIndex == 2 ? "#1993f1" : "#00000080"
                            }}>{t2}</Text>
                            <View style={{alignSelf: "stretch", flex: 0.5}}/>
                            <Text style={{
                                flex: 1,
                                textAlign: "center",
                                fontSize: 8,
                                color: this.state.selectIndex == 3 ? "#1993f1" : "#00000080"
                            }}>{t3}</Text>
                            <View style={{alignSelf: "stretch", flex: 0.5}}/>
                            <Text style={{
                                flex: 1,
                                textAlign: "center",
                                fontSize: 8,
                                color: this.state.selectIndex == 4 ? "#1993f1" : "#00000080"
                            }}>{t4}</Text>
                            {(this.state.chartType == TYPE_DAY || this.state.chartType == TYPE_MONTH) ? (
                                <View style={{alignSelf: "stretch", flex: 0.5}}/>) : null}
                            {(this.state.chartType == TYPE_DAY || this.state.chartType == TYPE_MONTH) ? ( <Text style={{
                                flex: 1,
                                textAlign: "center",
                                fontSize: 8,
                                color: this.state.selectIndex == 5 ? "#1993f1" : "#00000080"
                            }}>{t5}</Text>) : null}


                            {this.state.chartType == TYPE_DAY ? (
                                <View style={{alignSelf: "stretch", flex: 0.5}}/>) : null}
                            {this.state.chartType == TYPE_DAY ? (<Text style={{
                                flex: 1,
                                textAlign: "center",
                                fontSize: 8,
                                color: this.state.selectIndex == 6 ? "#1993f1" : "#00000080"
                            }}>{t6}</Text>) : null}


                        </View>
                        {/*图表底部标注模块*/}
                        <View style={{height: 1 / 3, backgroundColor: "#d9d9d9"}}/>

                        {/*开关记录模块*/}
                        <View style={{flexDirection: "column"}}>
                            {this.showSwitchUI()}

                        </View>
                        {/*开关记录模块*/}
                    </View>
                    {/*白色背景*/}
                </ScrollView>
                <TitleBarWhite  style={{position:'absolute',height:APPBAR_HEIGHT, backgroundColor: 'transparent'}}
                    onPressLeft={() => {
                        this.props.navigation.goBack();
                    }} 
                    title={this.props.navigation.state["params"] ? this.props.navigation.state.params.name : Device.name}
                    // style={{ backgroundColor: 'transparent' }}
                    onPressRight={() => { this.props.navigation.navigate('moreMenu', { 'title': '设置' }) }} 
                    onPressRight2 ={()=>{
                        Host.file.screenShot('share.png').then((res)=>{
                            Host.ui.openShareListBar('小米智能家庭', '小米智能家庭', { uri: res },'');
                        });
                    }} 
                    />
               
            </View>
        );
    }

}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor:'transparent',
        // position:'absolute',
        flexDirection: "column"
    },
    scrollViewContainer:{
        marginTop:APPBAR_MARGINTOP,
        // marginBottom:0,
        backgroundColor:'rgb(244,244,244)',
        // position:'absolute',
        width:screenWidth,     
        height:screenHeight-NavigatorBarHeight,
        padding:0,  
    },
    contentContainer:{

    },
    titleBackStyle:{
        position:'absolute',
        marginTop:0,
    }
});
