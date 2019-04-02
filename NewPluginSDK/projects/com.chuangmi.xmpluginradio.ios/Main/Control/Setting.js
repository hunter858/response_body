'use strict';

import React,{component} from 'react' ;
import Constants  from '../../Main/Constants';
import {Device,DeviceEvent,Host,Package,Service} from 'miot';
import { TitleBarBlack,TitleBarWhite } from 'miot/ui';
import {
  APPBAR_HEIGHT,APPBAR_MARGINBOTTOM,APPBAR_MARGINTOP,isIPX ,
  ratio,NavigatorBarHeight,screenWidth,screenHeight} from '../ConstDefine';

import {
  Image,
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  DeviceEventEmitter,
  PixelRatio,
  SwitchIOS,
  PanResponder,
  ScrollView,
}from 'react-native';

class Setting extends React.Component{


    constructor(props){
        super(props);

        this.state = {
          showTest:false,
          timerSeconds: 0,
          visible: false,
          versionText:'',
          showLedLight:true,
        }
        this.inter=-100;
        this.tapCount =0;
        this.lastTimestamp=0;
        this.start= 0;
        this.clockData={};
    }

    componentDidMount(){
        this.subscription = DeviceEventEmitter.addListener('TimerOn', (event) => {
            if(this.inter > 0) {
                this.clearInterval(this.inter);
                this.inter = -100;
            }
            this.setState({
              timerSeconds:0,
            });
            this.startInterval(event.data * 1000);
        });

         this.subscription1 = DeviceEventEmitter.addListener('TimerOff', (event) => {

            if(this.inter > 0) {
                this.clearInterval(this.inter);
                this.inter = -100;
            }
            this.setState({
              timerSeconds:0,
            });
        });
    }

    componentWillUnmount(){
      this.subscription.remove();
      this.subscription1.remove();

      if(this.inter > 0) {
          this.clearInterval(this.inter);
          this.inter = -100;
      }
    }

    _handleStartShouldSetPanResponder(e, gestureState) {

        return true;
    }

    _handlePanResponderEnd(e, gestureState) {


      if(this.lastTimestamp == 0){
        this.lastTimestamp = e.nativeEvent.timestamp;
        this.tapCount = 0;
      }

      var k = Math.floor(e.nativeEvent.timestamp - this.lastTimestamp);
      if(k > 1000) {
        this.tapCount = 0;
      }

      this.lastTimestamp = e.nativeEvent.timestamp;
      if(this.state.versionText == '' && e.nativeEvent.changedTouches != undefined && e.nativeEvent.changedTouches.length == 1){
          this.tapCount++;
      }

      if(this.state.versionText == '' && this.tapCount >= 8) {
        this.tapCount = 0;
        this.lastTimestamp = 0;
        this.setState({
            showTest:true,
            versionText: 'Version No. 80',
        });
      }
    }

    componentWillMount(){

        this.inter = -100;
        this.start = 0 ;
        this.clockData={};
        this.tapCount = 0;
        this.lastTimestamp = 0;
        this.setState({
            versionText:'',
        });

        Device.getDeviceWifi().callMethod('get_airplay', {}).then((success, json) => {

          if(success && json != null && json.result != undefined && json.result.visible != undefined){
            var k = json.result.visible == 0 ? false : true;
            this.setState({
              visible: k
            });
          }
        }).catch(error=>{
          console.log('error-151 -'+JSON.stringify(error));
        });

        if(Device.model!=Constants.DeviceModel.v601){

          Device.getDeviceWifi().callMethod('get_speaker_info', {}).then((json) => {

            if (json.code==0&&json.result!=null&&json.result!=undefined) {
              var k = parseInt(json.result.btversion) >=143 ? true : false;
              this.setState({
                showLedLight: true,
              });
            }
          }).catch(error=>{
            console.log('error-150 -'+JSON.stringify(error));
          });
        }

        this._panResponder = PanResponder.create({
              onStartShouldSetPanResponder: this._handleStartShouldSetPanResponder,
              onPanResponderRelease: this._handlePanResponderEnd,
              onPanResponderTerminate: this._handlePanResponderEnd,
        });

    }

    loadClocks(){
      Device.getDeviceWifi().callMethod('get_alarm_clock', {params:{start: this.start}}).then((json) => {

              if ((json.code==0) && json.result!= undefined && json.result.clocks != undefined) {

                  var clocks = json.result.clocks;

                  for(var k=0; k<clocks.length; k++){
                     var tmp = clocks[k];
                     if(tmp.action == 'pause' && (tmp.tag !=10&&tmp.tag !=20&&tmp.tag !=30&&tmp.tag !=60&&tmp.tag !=90&&tmp.tag !=120 )) {
                        this.clockData = tmp;
                        var now = new Date().getTime();
                        var left = tmp.next * 1000 - now;

                        if(left > 0){
                          this.startInterval(left);
                        }
                        break;
                     }
                  }

                  if(this.clockData.id != undefined){
                    return;
                  }

                  if(clocks.length >= 5 ) {
                     this.start += 5;
                     this.loadClocks();
                  }
              }
         }).catch(error=>{
            console.log('error-195 -'+JSON.stringify(error));
          });
    }

    startInterval(millionSecondss){
        var sds = millionSecondss / 1000;
        this.setState({
          timerSeconds : sds,
        });
        if(this.inter > 0) {
          this.clearInterval(this.inter);
          this.inter = -100;
        }
        this.inter = this.setInterval(this.setTimerSeconds, 1000);
    }

    setTimerSeconds(){

      if(this.state.timerSeconds <= 0) {
        this.clearAndSetTimer(0);
        return;
      }

      var sds = this.state.timerSeconds - 1;
      this.setState({
        timerSeconds: sds,
      });

    }

    clearAndSetTimer(seconds){

       if(this.inter > 0) {
          this.clearInterval(this.inter);
          this.inter = -100;
       }
      if(seconds > 0){
        this.startInterval(seconds * 1000);
      }
    }

    onPress(index){

        if(index == 0){

          this.props.navigation.navigate('AudioControlSetting', {
            title:'音频控制',
          });
          
        } else if(index == 1) {

          this.props.navigation.navigate('ClockSetting', {
            title:'音乐闹钟',
          });


        }else if(index == 2) {

          this.props.navigation.navigate('M3U8PlayerSetting', {
            title:'M3U8播放器',
          });

        }else if(index == 3){
          
          this.props.navigation.navigate('LightControlSetting', {
            title:'灯光控制',
          });

        }else if(index == 4){

          this.props.navigation.navigate('AboutPage', {
            title:'关于',
          });

        }
    }

    pushToNewClock(){
          
      this.props.navigation.navigate('NewClockPage', {
        title:'新建闹铃',
      });
    }

    switchValueChange(value){

    	var k = 0;
    	if(value == true) {
    		k = 1;
      }
      
      Device.getDeviceWifi().callMethod('set_airplay', {params:{visible: k}}).then((json) => {

    		if(json.code==0){
             // 刚进来的时候 判定收音机状态
             Device.getDeviceWifi().callMethod('get_prop', {}).then((json2) => {

                if (!value && (json2.code==0) && json2.result != undefined
                    && json2.result.current_status == 'run' && json2.result.current_player == 1 ){
                      Device.getDeviceWifi().callMethod('pause', {}).then((success, json) => {

                      }).catch(error=>{
                        console.log('error-332 -'+JSON.stringify(error));
                      });
                }
             });
    				this.setState({visible: value,});
        }
        
    	}).catch(error=>{
        console.log('error-340 -'+JSON.stringify(error));
      });


    }

    render(){
      var txt = '';
      if(this.state.timerSeconds > 0) {
          txt = Constants.DateUtils.transformProgress(this.state.timerSeconds);
      }

      var testView=null;
      if(this.state.showTest){
        testView=(<TouchView text1='测试'  text2={txt} onPress={()=>{this.onPress(5)}}/>);
      }

      //兼容模式
      var m3u8View=null;
      var about=null;
      if(Device.model!=Constants.DeviceModel.v601){
        about=(
          <View>
          <TouchView text1='关于'  text2={txt} onPress={()=>{this.onPress(4)}}/>
          <View style={styles.separator} />
          </View>);
      }

      var ledLight=null;
      if(this.state.showLedLight){
        ledLight=(
          <View>
            <TouchView text1='灯光控制'  text2={txt} onPress={()=>{this.onPress(3)}}/>
            <View style={styles.separator} />
          </View>)
      }


      return (
        <View style={{flex:1,marginTop:0}}>
          <ScrollView style={{flex:1, backgroundColor:Constants.TintColor.f8}}>
            
                {m3u8View}
                <TouchView text1='音乐闹钟' onPress={()=>{this.onPress(1)}}/>
                <View style={styles.separator} />
                <TouchView text1='音频控制'  text2={txt} onPress={()=>{this.onPress(0)}}/>
                <View style={styles.separator} />
                {ledLight}
                {about}
                {testView}
            <View style={styles.version}  {...this._panResponder.panHandlers}>
                  <Text style={{color:'rgb(127,127,127)'}}>{this.state.versionText}</Text>
            </View>
          </ScrollView>
        </View>
      );
    }
}

class TouchView extends React.Component{


  render(){
    return (
      <TouchableHighlight onPress={this.props.onPress}>
        <View style={styles.container}>
          <Text style={styles.text}>{this.props.text1}</Text>
          <Image style={styles.image}  resizeMode='stretch' source={require('../../Resources/arrow_right.png')}/>
          <Text style={styles.text2}>{this.props.text2}</Text>
        </View>
      </TouchableHighlight>
    );
  }
}

var styles = StyleSheet.create({

  version:{
    height:40,
    width:screenWidth,
    alignItems:'center',
    justifyContent:'center',
    marginTop:20,
  },
   picker:{
     backgroundColor:'white',
     height: 220,
     alignItems:'center'
   },
  container:{
    height: 44,
    backgroundColor:'white',
    paddingLeft:15,
    paddingRight:15,
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center'
  },
  container2:{
    height: 59,
    backgroundColor:'white',
    paddingLeft:15,
    paddingRight:15,
    marginTop: 11,
  },
  text:{
    fontSize: 15,
    color:'rgb(51,51,51)',
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
  text2:{
    position:'absolute',
    top:15,
    right:30,
    fontSize: 13,
    color:'rgb(130,130,130)',
  },
  image: {
    width:8,
    height:10,
  },
  image1: {
    width:20,
    height:20,
  },
  image2: {
    width:30,
    height:30,
  },
  slider:{
    flex:1,
    marginLeft:10,
    marginRight:10,
  },
  separator: {
    height:1/PixelRatio.get(),
    backgroundColor:'rgba(0,0,0,0.1)',
  },
});


module.exports = Setting;
