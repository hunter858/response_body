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
  StyleSheet,
  PixelRatio,
  StatusBar,
  ScrollView,
  Image,
  Animated,
  Switch,
  ImageBackground,
  DeviceEventEmitter,
  TouchableWithoutFeedback,
  NativeModules,
} from 'react-native';

import { Host, DeviceEvent ,Device} from "miot";
import { TitleBarBlack,TitleBarWhite,LoadingDialog} from 'miot/ui';
import {LocalizedStrings} from '../MHLocalizableString';
import {
    APPBAR_HEIGHT,APPBAR_MARGINBOTTOM,APPBAR_MARGINTOP,isIPX ,
    ratio,NavigatorBarHeight,screenWidth,screenHeight} from '../ConstDefine';


export default class LedSetting extends React.Component{

    constructor(props) {
        super(props);
        this.state = {
            wifi_led: true,
            visLoading:false,
        };
    }

    componentDidMount(){

        var self = this;
        Device.getDeviceWifi().callMethod('get_indicatorLamp',[]).then((response)=>{
            // console.log(JSON.stringify(response));
            if (response&&(response.code==0)) {
                self.setState({
                    wifi_led: response.result[0] == 'on' ? true : false,
                    visLoading:false
                });
            }
            self.setState({visLoading:false});

        }).catch((err)=>{
            self.setState({visLoading:false});
            console.log("mytest:get_prop err"+JSON.stringify(err));
        });

    }

    switchValueChange(value){

        this.setState({visLoading:true});
        var self = this;    
        (value==true)?(value='on'):(value='off');
        Device.getDeviceWifi().callMethod('set_indicatorLamp', [value]).then((response)=>{

            if(response&&(response.code==0)){
                self.setState({ wifi_led: (value=='on')?(true):(false),visLoading:false});
            }
        })
        .catch((err)=>{

            var newValue = (value=='on')?(false):(true);
            self.setState({wifi_led:newValue,visLoading:false});
        });
    }


    render() {
        return (
            <View style={styles.container}>
                <LoadingDialog 
                title={LocalizedStrings.string_is_loading}
                cancelable={true}
                timeout={3000}
                onDismiss={() => {
                    this.setState({visLoading: false});
                }}
                visible={this.state.visLoading}/>
                <View style={styles.contentView}>
                    <View style={styles.rowContainer}>
                            <View style={[{justifyContent:'flex-start',paddingLeft:10,},styles.cellContentView,]}>
                                <Text style={[styles.title,{paddingLeft:10,}]}>{LocalizedStrings.ir_led_switch}</Text>
                            </View>
                            <View style={[{justifyContent:'flex-end',paddingRight:10,},styles.cellContentView,]}>
                                <Switch style={[{paddingRight:10,}]} onValueChange={(value) => this.switchValueChange(value)}
                                    onTintColor={"#1ad605"} value={this.state.wifi_led}
                                    tintColor={"rgb(235,235,235)"}/>
                            </View>
                    </View>
                    <View style={styles.separator}></View>
                </View>
            </View>
        );
    }


};

var styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#ffffff'
    },
    contentView:{
        flexDirection:'column',
        marginTop:0,
        height:screenHeight-NavigatorBarHeight,
    },
    rowContainer: {
        flexDirection: 'row',
        // backgroundColor: '#ffff00',
        height: 50,
        width:screenWidth,
        marginTop:0,
        justifyContent:'space-between'
    },
    cellContentView:{
        width:screenWidth/2,
        height:50,
        alignItems:'center',
        flexDirection:'row',
    },
    contentRowContainer:{
        flexDirection:'row',
        alignSelf: 'stretch',
        marginLeft:10,
        marginRight:10,
    },
    title: {
        fontSize: 16,
        flex: 1,
    },
    subArrow: {
        width: 9,
        height: 18,
    },
    separator: {
        marginTop:0,
        height: 0.75,
        backgroundColor: '#dddddd',
        marginLeft: 20,
        marginRight: 20
    },
    
});