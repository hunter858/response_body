'use strict';

import React,{component} from 'react' ;
import Constants  from '../../Main/Constants';
import {Device,DeviceEvent,Host,Package,Service} from 'miot';
import { TitleBarBlack,TitleBarWhite,LoadingDialog } from 'miot/ui';
import {
  APPBAR_HEIGHT,APPBAR_MARGINBOTTOM,APPBAR_MARGINTOP,isIPX ,
	ratio,NavigatorBarHeight,screenWidth,screenHeight} from '../ConstDefine';

import NoWifiView  from '../View/NoWifiView';
import LoadingView  from '../View/LoadingView';
import FailView  from '../View/FailView';

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


class LightControlSetting extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      loaded: false,
      failed: false,
      nodata: false,
      led:false,
      led_atmosphere:false,
      led_with:false,
      led_switch:false,
      message:'',
      visLoading:false,
    }
  }

  componentDidMount(){

    if(Device.model==Constants.DeviceModel.v603){

      Device.getDeviceWifi().callMethod('get_led_off', {}).then(( json) => {

        if((json.code==0) && json != null && json.result != undefined && json.result.led_off != undefined){
          var k = json.result.led_off == 0 ? true : false;
            this.setState({
            loaded: true,
            nodata: false,
            failed: false,
            led: k,
            });
          }else{
            this.setState({
              loaded: true,
              nodata: false,
              failed: true,
            });
          }
        });
    }

  }

  switchValueChange(index,value){
    
    var methodName='';
    var mParmas={};
    var temp={};
    switch (index) {
      case 1:
        temp.led_off=value?0:1;
        mParmas=temp;
        methodName='set_led_off';
        break;
      case 2:
          temp.led_atmosphere=value?1:2;
          mParmas=temp;
          methodName='set_led_atmosphere';
          break;
      case 3:
          temp.led_switch=value?1:2;
          mParmas=temp;
          methodName='set_led_switch';
          break;
      case 4:
        temp.led_with=value?1:2;
        mParmas=temp;
        methodName='set_led_with';
        break;
      default:

    }
    switch (index) {
      case 1:
        this.setState({
          led:temp.led_off==1?false:true,
        });
        break;
        case 2:
          this.setState({
            led_atmosphere:temp.led_atmosphere==2?false:true,
          });
          break;
        case 3:
            this.setState({
              led_switch:temp.led_switch==2?false:true,
            });
            break;
          case 4:
              this.setState({
                led_with:temp.led_with==2?false:true,
              });
            break;
    }

      this.setState({message:'设置中....',visLoading:true});
    Device.getDeviceWifi().callMethod(methodName, mParmas).then((json) => {
      
      if(json.code==0){
        this.setState({message:'设置成功',visLoading:false});
      }else{
        switch (index) {
          case 1:
            this.setState({
              led:!this.state.led,
            });
            break;
            case 2:
              this.setState({
                led_atmosphere:!this.state.led_atmosphere,
              });
              break;
            case 3:
                this.setState({
                  led_switch:!this.state.led_switch,
                });
                break;
            case 4:
                  this.setState({
                    led_with:!this.state.led_with,
                  });
                break;
        }

        this.setState({message:'设置失败',visLoading:false});
      }
    }).catch(error=>{
      console.log('error-131 -'+JSON.stringify(error));
      this.setState({message:'设置失败',visLoading:false});
    });


  }

  onPress(){

    this.props.navigation.navigate('LightControlSettingList', {
      title:'灯光控制',
    });
  }

	render(){

    // MHPluginSDK.dismissTips();

    if(this.state.netInfo == 'none' || this.state.netInfo == 'unknown'){
      return <NoWifiVieww />
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
    var deng=null;
    var deng1=null;
    var deng2=null;
    var deng3=null;
    var deng4=null;

    if(Device.model==Constants.DeviceModel.v603){
      
      deng=(<View>
                <View style={[styles.container2,{height:44,justifyContent:'center'}]}>
                    <View style={{justifyContent:'center',}}>
                        <Text style={[styles.text3,{marginTop:0}]}>关闭LED指示灯</Text>
                    </View>
                    <View style={{position:'absolute', height:44, top:0, right:15, alignItems:'center', justifyContent:'center'}}>
                        <Switch 	onValueChange={(value) => this.switchValueChange(1,value)}
                                  onTintColor={Constants.TintColor.switchBar} value={this.state.led}
                          tintColor={Constants.TintColor.rgb235}  />
                    </View>
                </View>
                <View style={{height:1/PixelRatio.get(),backgroundColor:'rgba(0,0,0,0.1)'}}></View>
            </View>);
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
        {deng}
        {deng1}
        {deng2}
        {deng3}
        {deng4}
        </View>
			);
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

module.exports = LightControlSetting;
