'use strict';

import React from 'react';
import {
  View,
  Text,
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
  TouchableWithoutFeedback,
  NativeModules,
} from 'react-native';
import NewPowerPage from './NewPowerPage';
import NewUsbPage from './NewUsbPage';
import NewCustomeTabBar from '../View/NewCustomeTabBar';
var ScrollableTabView = require('react-native-scrollable-tab-view');
import { TitleBarBlack,TitleBarWhite} from 'miot/ui';
import {Device,Package,Host,DeviceEvent} from 'miot';

import {
    APPBAR_HEIGHT,APPBAR_MARGINBOTTOM,APPBAR_MARGINTOP,isIPX ,
    ratio,NavigatorBarHeight,screenWidth,screenHeight} from '../ConstDefine';


export default class NewPlugMainPage extends React.Component{
    static navigationOptions = ({ navigation }) => {
        return {
        header: null
        };
    };
    constructor(props,context){
        super(props,context);
        var params = this.props.navigation.state.params;
        this.state={
            did: Device.deviceID,
            model: Device.deviceModel,
            currentState: params.currentState,
            usbCurrentState:params.usbCurrentState,
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

    componentWillMount () {
        this._deviceNameChangedListener = DeviceEvent.deviceNameChanged.addListener((device) => {
            this.props.navigation.setParams({
                name: device.name
            });
            this.forceUpdate();
        });
    }

    componentDidMount () {
        this._deviceNameChangedListener.remove();
    }

    componentWillUnmount () {

    }

    render () { 
        return (
            <View style={styles.containerAll}>
                <ScrollableTabView
                    style={styles.containerAll}
                    initialPage={this.props.navigation.state.params.plugType}
                    tabBarPosition='bottom'
                    renderTabBar={(response) => <NewCustomeTabBar/>}>
                    <NewPowerPage></NewPowerPage>
                    <NewUsbPage ></NewUsbPage>
                </ScrollableTabView>
                <TitleBarWhite  style={{ backgroundColor: 'transparent' }}
                    onPressLeft={() => {
                        this.props.navigation.goBack();
                    }} 
                    title={Device.name}
                    style={{ backgroundColor: 'transparent' }}
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

    
var styles = StyleSheet.create({
    containerAll: {
        flex: 1,
        backgroundColor:'transparent',
        position:'absolute'
    },
});
