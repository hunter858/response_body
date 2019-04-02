'use strict';

import React,{component} from 'react' ;
import { TitleBarBlack,TitleBarWhite,LoadingDialog} from 'miot/ui';
import {Device,DeviceEvent,Host,Package,Service} from 'miot';
import {
  APPBAR_HEIGHT,APPBAR_MARGINBOTTOM,APPBAR_MARGINTOP,isIPX ,
  ratio,NavigatorBarHeight,screenWidth,screenHeight} from '../ConstDefine';
import Constants from '../../Main/Constants';
import NoWifiView  from '../View/NoWifiView';
import LoadingView  from '../View/LoadingView';
import FailView  from '../View/FailView';

import {
  StyleSheet,
  Text,
  View,
  PixelRatio,
  TouchableHighlight,
  ScrollView,
} from 'react-native';

class About extends React.Component{
  constructor(props){
    super(props);
    this.state =  {
      deviceName:'-',
      deviceType:'-',
      cmiit:'-',
      total:'-',
      bloothTime:'-',
      wifiTime:'-',
      bloothFirmwareVersion:'-',
      batteryLevel:'-',
      loaded: false,
      failed: false,
      nodata: false,
     }
  }

  componentDidMount(){
    this.setState({
      loaded: false,
      nodata: false,
      failed: false,
    });

    //获取关于信息
    this.setState({message:'加载中...',visLoading:true});
    Device.getDeviceWifi().callMethod('get_speaker_info', {}).then((json) => {
     
      this.setState({message:'',visLoading:false});
      if (json.code==0&&json.result!=null&&json.result!=undefined) {
        this.setState({
          loaded: true,
          nodata: false,
          failed: false,
          deviceName:Device.name,
          deviceType:json.result.type==null?'WLSYJ02CM':json.result.type,
          cmiitid:json.result.cmiitid,
          channels:json.result.channels==0?this.getCollectionPrograms():json.result.channels,
          wifi_play_time:Constants.DateUtils.transformTime(json.result.wifi_play_time),
          bt_play_time:Constants.DateUtils.minuteTransformTime(json.result.bt_play_time),
          btversion:this.getBtVersion(json.result.btversion),
          battery:json.result.battery+'%',

        });
      }else{
        this.setState({
            loaded: true,
            failed: true,
        });
      }
    }).catch(error=>{
      console.log('error-77 -'+JSON.stringify(error));
    });
  }

  //蓝牙版本处理 比如：132==>1.32
  getBtVersion(value){
    if(value!=null&&''!=value&&value.length>=2){
      var first=value.substr(0,1)
      var last=value.substr(1,value.length);
      var btnVersion=first+'.'+last;
      return btnVersion;
    }
    return '';
  }

  //获取收藏的节目总数
  getCollectionPrograms(){
    Device.getDeviceWifi().callMethod("get_channels",{"all":0}).then((result)=>{
      const channels = result.result.chs;
      if(channels){
        this.setState({
           channels:channels.length,
        });

      }else{
        this.setState({
           channels:'-',
        });
      }
    });
  }

  render(){

    if(this.state.netInfo == 'none' || this.state.netInfo == 'unknown'){
      return <NoWifiView />
    }

    if(!this.state.loaded) {
      return <LoadingView style={{flex:1}}/>
    }

    if(this.state.failed) {
      return(
        <View style={{flex:1}}>
              <FailView
                  onPress={this.componentDidMount.bind(this,0)}
                  style={{flex:1, paddingBottom:65}} text1='糟糕 发生错误了'
                  text2='点击屏幕重试' />
        </View>
    );
    }
    return(
        <ScrollView style={{flex:1,marginTop:0,backgroundColor:Constants.TintColor.f8}}>
          <LoadingDialog 
            title={this.state.message}
            cancelable={true}
            timeout={3000}
            onDismiss={() => {
              this.setState({visLoading: false});
            }}
            visible={this.state.visLoading}
          />
          <TouchView text1='设备名称' text2={this.state.deviceName}/>
          <View style={styles.separator} />
          <TouchView text1='设备类型' text2={this.state.deviceType}/>
          <View style={styles.separator} />
          <TouchView text1='CMIIT ID' text2={this.state.cmiitid}/>
          <View style={styles.separator} />
          <TouchView text1='收听频道总数' text2={this.state.channels}/>
          <View style={styles.separator} />
          <TouchView text1='蓝牙播放时长' text2={this.state.bt_play_time}/>
          <View style={styles.separator} />
          <TouchView text1='Wi-Fi在线时长' text2={this.state.wifi_play_time}/>
          <View style={styles.separator} />
          <TouchView text1='蓝牙固件版本' text2={this.state.btversion}/>
          <View style={styles.separator} />
          <TouchView text1='电池电量' text2={this.state.battery}/>
          <View style={styles.separator} />
        </ScrollView>
    );
  }
}

class TouchView extends React.Component{

  render(){
    return (
      <TouchableHighlight onPress={this.props.onPress}>
        <View style={styles.container}>
          <Text style={styles.text}>{this.props.text1}</Text>
          <Text style={styles.text2} numberOfLines={1}>{this.props.text2}</Text>
        </View>
      </TouchableHighlight>
    );
  }
}


var styles = StyleSheet.create({
  container:{
    height: 51,
    backgroundColor:'white',
    paddingLeft:15,
    paddingRight:15,
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center'
  },
  text:{
    fontSize: 16,
    color:'rgba(0,0,0,0.8)',
  },
  text2:{
    flex:1,
    marginRight:5,
    marginLeft:20,
    textAlign:'right',
    fontSize: 13,
    color:'rgba(0,0,0,0.4)',
  },
  separator: {
    height:0.5,
    backgroundColor:'rgba(0,0,0,0.1)',
  },
});

module.exports = About;
