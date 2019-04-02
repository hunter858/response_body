'use strict';

import React,{component} from 'react' ;
import { TitleBarBlack,TitleBarWhite,LoadingDialog } from 'miot/ui';
import Constants  from'../../Main/Constants';
import LoadingView  from '../View/LoadingView';
import FailView  from '../View/FailView';
import NoWifiView from '../View/NoWifiView';
import {Device,DeviceEvent,Host,Package,Service} from 'miot';
import {
  APPBAR_HEIGHT,APPBAR_MARGINBOTTOM,APPBAR_MARGINTOP,isIPX ,
  ratio,NavigatorBarHeight,screenWidth,screenHeight} from '../ConstDefine';

import {
  Image,
  ListView,
  TouchableHighlight,
  StyleSheet,
  Text,
  View,
  Switch,
  PixelRatio,
  LayoutAnimation,
  DeviceEventEmitter
} from 'react-native';



class AudioControlSetting extends React.Component{


  constructor(props){
    super(props);
    this.state =  {
      loaded: false,
      failed: false,
      nodata: false,
      speech_input:false,
      airPlay:false,
      hifi:false,
      speech_onoff:false,
      click_sound:false,
      touch_key_onoff:false,
      live_mode:false,
      key_onoff:false,
      smoothMode:false,
      message:'',
      visLoading:false,
    }
  }

  switchValueChange(index,value){
    var methodName='';
    var mParmas={};
    var temp={};
    switch (index) {
      case 1:
        temp.speech_input=value?1:0;
        mParmas=temp;
        methodName='set_speech_input';
        break;
      case 2:
        temp.visible=value?1:0;
        mParmas=temp;
        methodName='set_airplay';
        break;
      case 3:
          temp.live_mode=value?0:1;
          mParmas=temp;
          methodName='switch_live_mode';
        break;
      case 4:
          temp.set_hifi=value?0:1;
          mParmas=temp;
          methodName='set_hifi';
        break;
      case 5:
          temp.speech_onoff=value?0:1;
          mParmas=temp;
          methodName='set_channel_speech_onoff';
        break;
      case 6:
          temp.click_sound=value?0:1;
          mParmas=temp;
          methodName='click_sound';
        break;
      case 7:
          temp.key_onoff=value?0:1;
          mParmas=temp;
          methodName='set_touch_key_onoff';
        break;
      default:

    }

    this.setState({message:'设置中...',visLoading:true});
    Device.getDeviceWifi().callMethod(methodName, mParmas).then((json) => {
      
      if(json.code==0){
          switch (index) {
            case 1:
              this.setState({
                speech_input:temp.speech_input==1?false:true,
              });
              break;
              case 2:
              this.setState({
                airPlay: !this.state.airPlay,
              });
              break;
              case 3:
              this.setState({
                smoothMode:!this.state.smoothMode,
              });
              break;
              case 4:
              this.setState({
                hifi: !this.state.hifi,
              });
              break;
              case 5:
              this.setState({
                speech_onoff: !this.state.speech_onoff,
              });
              break;
              case 6:
              this.setState({
                click_sound: !this.state.click_sound,
              });
              break;
              case 7:
              this.setState({//
                touch_key_onoff: !this.state.touch_key_onoff,
              });
              break;
          }
          this.setState({message:'设置成功',visLoading:false});

      }else{
        this.setState({message:'设置失败',visLoading:false});

      }
    }).catch(error=>{
      this.setState({message:'设置失败',visLoading:false});
      console.log('error-145 -'+JSON.stringify(error));
    });


  }

  // {"code":0,"message":"ok","result":{"speech_input":1,"hifi":1,
  // "channel_speech_onoff":0,"click_sound":1,"touch_key_onoff":0}}
  componentDidMount(){
    
    this.setState({
      loaded: false,
      nodata: false,
      failed: false,
    });

    Device.getDeviceWifi().callMethod('get_prop',{}).then((json) => {
      
      if (json.code==0&&json.result != undefined) {
          this.setState({
            smoothMode:json.result.current_live_mode==1?false:true,
          });
      }
    });

    Device.getDeviceWifi().callMethod('get_airplay', {}).then((json) => {

      if((json.code==0) && json.result != undefined && json.result.visible != undefined){
        var k = json.result.visible == 0 ? false : true;
        if(Device.model==Constants.DeviceModel.v601){
          this.setState({
          loaded: true,
          nodata: false,
          failed: false,
          airPlay: k,
          });
        }else{
          this.setState({
            airPlay: k
          });
        }

      }
    });

    //加载设置的配置信息
    if( Device.model!=Constants.DeviceModel.v601){

      Device.getDeviceWifi().callMethod('get_setting_info', {}).then((json) => {

        if (json.code==0&&json.result != undefined) {
          var audioControlProps = json.result;
          var speech_input = audioControlProps.speech_input;
          var hifi = audioControlProps.hifi;
          var speech_onoff = audioControlProps.speech_onoff;
          var click_sound = audioControlProps.click_sound;
          var touch_key_onoff = audioControlProps.set_touch_key_onoff;
          this.setState({
             loaded: true,
             nodata: false,
             failed: false,
             speech_input:speech_input == 1?true:false,
             hifi:hifi == 0?true:false,
             speech_onoff:speech_onoff == 0?true:false,
             click_sound:click_sound == 0?true:false,
             touch_key_onoff:touch_key_onoff == 0?true:false,
          });
        }else{
          this.setState({
            loaded: true,
            failed: true,
          });
        }
      });

    }

  }

  onPress(){

    this.props.navigation.navigate('ToneEqualizerSetting', {
      title:'音色均衡器',
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

    var hifi=null;

    if(Constants.DeviceModel.v601==Device.model){
      return(
				<View style={{flex:1, paddingTop:0, backgroundColor:Constants.TintColor.rgb235}}>
          <LoadingDialog 
            title={this.state.message}
            cancelable={true}
            timeout={3000}
            onDismiss={() => {
                this.setState({visLoading: false});
            }}
            visible={this.state.visLoading}
          />
          <View>
            <View style={styles.container2}>
              <View style={{flexDirection:'row'}}>
                  <Text style={styles.text3}>音频推送</Text>
              </View>
              <Text style={styles.text5}>Airplay/米联 Beta</Text>
              <View style={{position:'absolute', height:59, top:0, right:15, alignItems:'center', justifyContent:'center'}}>
                  <Switch 	onValueChange={(value) => this.switchValueChange(2,value)}
                            onTintColor={Constants.TintColor.switchBar} value={this.state.airPlay}
                    tintColor={Constants.TintColor.rgb235}  />
              </View>
            </View>
            <View style={{height:1/PixelRatio.get(),backgroundColor:'rgba(0,0,0,0.1)'}}></View>
          </View>
          <View>
              <View style={styles.container2}>
                  <View style={{flexDirection:'row'}}>
                      <Text style={styles.text3}>流畅播放</Text>
                  </View>
                  <Text style={styles.text5}>若播放出现卡顿请打开</Text>
                  <View style={{position:'absolute', height:59, top:0, right:15, alignItems:'center', justifyContent:'center'}}>
                      <Switch 	onValueChange={(value) => this.switchValueChange(3,value)}
                              onTintColor={Constants.TintColor.switchBar} value={this.state.smoothMode}
                        tintColor={Constants.TintColor.rgb235}  />
                  </View>
              </View>
              <View style={{height:1/PixelRatio.get(),backgroundColor:'rgba(0,0,0,0.1)'}}></View>
          </View>
        </View>
      );

    }

		return(
				<View style={{flex:1, paddingTop:0, backgroundColor:Constants.TintColor.rgb235}}>
                <LoadingDialog 
                  title={this.state.message}
                  cancelable={true}
                  timeout={3000}
                  onDismiss={() => {
                      this.setState({visLoading: false});
                  }}
                  visible={this.state.visLoading}
                />
                <View>
                    <View style={styles.container2}>
                      <View style={{flexDirection:'row'}}>
                          <Text style={styles.text3}>流畅播放</Text>
                      </View>
                      <Text style={styles.text5}>若播放出现卡顿请打开</Text>
                      <View style={{position:'absolute', height:59, top:0, right:15, alignItems:'center', justifyContent:'center'}}>
                          <Switch 	
                            onValueChange={(value) => this.switchValueChange(3,value)}
                            onTintColor={Constants.TintColor.switchBar} value={this.state.smoothMode}
                            tintColor={Constants.TintColor.rgb235}  />
                      </View>
                    </View>
                    <View style={{height:1/PixelRatio.get(),backgroundColor:'rgba(0,0,0,0.1)'}}></View>
                </View>
                {hifi}
                <View>
                    <View style={[styles.container2,{height:44,justifyContent:'center'}]}>
                      <View style={{justifyContent:'center',}}>
                          <Text style={[styles.text3,{marginTop:0}]}>语音播报电台</Text>
                      </View>
                      <View style={{position:'absolute', height:44, top:0, right:15, alignItems:'center', justifyContent:'center'}}>
                          <Switch 	onValueChange={(value) => this.switchValueChange(5,value)}
                                    onTintColor={Constants.TintColor.switchBar} value={this.state.speech_onoff}
                            tintColor={Constants.TintColor.rgb235}  />
                      </View>
                    </View>
                    <View style={{height:1/PixelRatio.get(),backgroundColor:'rgba(0,0,0,0.1)'}}></View>
                </View>
                <View>
                    <View style={[styles.container2,{height:44,justifyContent:'center'}]}>
                        <View style={{flexDirection:'row'}}>
                            <Text style={[styles.text3,{marginTop:0}]}>设备中文提示音</Text>
                        </View>
                        <View style={{position:'absolute', height:44, top:0, right:15, alignItems:'center', justifyContent:'center'}}>
                            <Switch 	onValueChange={(value) => this.switchValueChange(6,value)}
                                    onTintColor={Constants.TintColor.switchBar} value={this.state.click_sound}
                              tintColor={Constants.TintColor.rgb235}  />
                        </View>
                    </View>
                    <View style={{height:1/PixelRatio.get(),backgroundColor:'rgba(0,0,0,0.1)'}}></View>
                </View>
                <View>
                    <View style={styles.container2}>
                      <View style={{flexDirection:'row'}}>
                          <Text style={styles.text3}>音量触摸板</Text>
                      </View>
                      <Text style={styles.text5}>当音量触摸板关闭时暂停/播放请短按电源键</Text>
                      <View style={{position:'absolute', height:59, top:0, right:15, alignItems:'center', justifyContent:'center'}}>
                          <Switch 	onValueChange={(value) => this.switchValueChange(7,value)}
                                    onTintColor={Constants.TintColor.switchBar} value={this.state.touch_key_onoff}
                            tintColor={Constants.TintColor.rgb235}  />
                      </View>
                    </View>
                    <View style={{height:1/PixelRatio.get(),backgroundColor:'rgba(0,0,0,0.1)'}}></View>
                </View>
                <TouchView text1='音色均衡器'  onPress={()=>{this.onPress(2)}}/>
                <View style={styles.separator} />
        </View>
			);
	}

  show_606(){

  }


}

class TouchView extends React.Component{


  render(){
    return (
      <TouchableHighlight onPress={this.props.onPress}>
        <View style={styles.container1}>
          <Text style={styles.text}>{this.props.text1}</Text>
          <Image style={styles.image1}  resizeMode='stretch' source={require('../../Resources/arrow_right.png')}/>
          <Text style={styles.text2}>{this.props.text2}</Text>
        </View>
      </TouchableHighlight>
    );
  }
}


var styles = StyleSheet.create({
	container:{
		height: 44,
		backgroundColor:'white',
		paddingLeft:15,
		paddingRight:15,
		flexDirection:'row',
		justifyContent:'space-between',
		alignItems:'center'
	},
  container1:{
    height: 44,
    backgroundColor:'white',
    paddingLeft:15,
    paddingRight:15,
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center'
  },
	text:{
		fontSize: 15,
		color:'rgb(51,51,51)',
	},
	text2:{
		position:'absolute',
		top:15,
		right:80,
		fontSize: 13,
		color:'rgb(130,130,130)',
	},
  text3:{
    fontSize: 15,
    color:'rgb(51,51,51)',
    marginTop:10,
  },
  text4:{
    fontSize: 12,
    color:'rgb(130,130,130)',
    marginLeft: 6,
    marginTop: 12,
  },
  text5:{
    fontSize: 12,
    color:'rgb(127,127,127)',
    marginTop: 7,
  },
	image: {
		width:15,
		height:15,
	},
  image1: {
    width:8,
    height:10,
  },
	separator: {
		height:1/PixelRatio.get(),
	},
  container2:{
    height: 59,
    backgroundColor:'white',
    paddingLeft:15,
    paddingRight:15,
  },

});

module.exports = AudioControlSetting;
