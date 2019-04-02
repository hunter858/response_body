
'use strict';

import React,{component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  PixelRatio,
  TouchableWithoutFeedback,
  TouchableOpacity,
  DeviceEventEmitter,
  Image,
  ImageBackground,
  Animated,
  Easing,
  TouchableHighlight,
} from 'react-native';

import {Device,DeviceEvent,Host,Package,Service} from 'miot';
import {
  APPBAR_HEIGHT,APPBAR_MARGINBOTTOM,APPBAR_MARGINTOP,isIPX ,
  ratio,NavigatorBarHeight,screenWidth,screenHeight} from '../ConstDefine';
import Constants from '../../Main/Constants';

import { AnimatedCircularProgress } from 'react-native-circular-progress';
import {XimalayaSDK,XMReqType} from '../Const/XimalayaSDK';
import TouchableBtn from '../View/TouchableBtn';
import {withNavigation} from 'react-navigation';


var subscription;
var progressValue = 0;
var progress = 0;
var data= {};

class NewBottomView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      loaded: false,
      pressIn:false,  //播放按钮按下状态
      allInfo:null,
    };
  }

  componentWillMount(){

      this.data ={};
      this.data.playing = false;
      this.progress = 0;
      this.unMount = false;

      this.getRadioChannels();
      Device.getDeviceWifi().callMethod('get_prop', {}).then((json2) => {

          if (json2.result) {
            var radioProps = json2.result;
            this.updateData(radioProps);
          }

      }).catch(error=>{
        console.log('error-75 -'+JSON.stringify(error));
      });
  }

  componentDidMount() {

    subscription = DeviceEventEmitter.addListener(Constants.Event.radio_props, (event) => {

      this.updateData(event.data);
    });

    this.subscription2 = DeviceEventEmitter.addListener('ChannelsChangeEvent', (event) => {

      Device.getDeviceWifi().callMethod("get_channels",{"all":0}).then((result)=>{

          const channels = result.result.chs;
          if(channels != undefined) {
            this.data.radioChannels = channels;
          }
        }).catch(error=>{
          console.log('error-98 -'+JSON.stringify(error));
        });
    });

    this.subscription4 = DeviceEventEmitter.addListener('LocalRadioPropsEvent', (event) => {

        this.updateData(event.data);
    });
    //兼容601、602、603
    if(Device.model!=Constants.DeviceModel.v601){
      this.getBattery();
      this.timerInterval =  setInterval(()=>{
        this.getBattery()
      },1000*10);
    }
  }

  componentWillUnmount(){

    this.unMount = true;
    var thumbSource ='';
    if(this.data.type == 0 && this.data.radioInfo != undefined) {
        thumbSource = this.data.radioInfo.cover_url_small;
    } else if(this.data.type == 1 && this.data.albumInfo != undefined) {
      thumbSource = this.data.albumInfo.cover_url_small;
    }


    this.timerInterval && clearTimeout(this.timerInterval);
    this.inter && clearTimeout(this.inter);
    subscription.remove();
    this.subscription2.remove();
    this.subscription4.remove();

  }

  //获取电量
  getBattery(){

    Device.getDeviceWifi().callMethod('get_speaker_info', {}).then((json) => {
      // MHPluginSDK.dismissTips();
      if (json.code==0&&json.result!=null&&json.result!=undefined) {
        this.setState({
          battery:json.result.battery,
        });

        DeviceEventEmitter.emit('BatteryChangeEvent', {data:this.state.battery });
      }
    }).catch(error=>{
        console.log('error-173 -'+JSON.stringify(error));
    });
  }

  /*

      type: 0,
      favored: true,
      radioInfo: this.props.rowData.radioInfo,
      tartTime: this.props.rowData.startTime,
      endTime: this.props.rowData.endTime,
      playing; false,


      type: 1,
      favored: true,
      albumInfo: this.props.rowData.radioInfo,
      trackInfo?: this.props.rowData.trackInfo,
      trackProgress:this.props.rowData.trackProgress,
  */



  updateThumbProgress(){
      this.progress +=1;
      if(this.progress >= 360) {
        this.progress = 0;
      }
  }


  updateUI(){


      if(this.unMount) {
        return;
      }

      if(this.data.type == 0||this.data.type == Constants.Channels_Type.M3U8_TYPE) {

        if(this.data.radioInfo == undefined&&this.data.type == 0) {
          return;
        }

      } else {
        if(this.data.albumInfo == undefined || this.data.trackInfo == undefined){
          return;
        }
      }

      if(this.data.playing && !this.inter){
        this.progress = 0;
        this.inter = setInterval(()=>{this.updateThumbProgress()}, 25);
      } else if(!this.data.playing){
        
        this.progress=0;
        this.inter && clearTimeout(this.inter);
        this.timerInterval && clearInterval(this.timerInterval);
      }



      var thumbSource ='';
      if(this.data.type == 0 && this.data.radioInfo != undefined) {

        thumbSource=require('../../Resources/playbar_pausebutton.png');

      } else if(this.data.type == 1 && this.data.albumInfo != undefined) {

        thumbSource=require('../../Resources/playbar_pausebutton.png');

      }else if(this.data.type == Constants.Channels_Type.M3U8_TYPE){
        thumbSource=require('../../Resources/m3u8_cover.png');
      }

      this.setState({
          loaded: true,
          allInfo: this.data,
      });


  }

  updateData(radioProps) {


        this.data.playing = radioProps.current_status == 'run' ? true : false;
        if(radioProps.current_player == Constants.Channels_Type.M3U8_TYPE){//M3U8
            //获取m3u8电台名称
            var text='M3U8 自定义电台';
            Host.file.readFile(Service.account.ID + '===' + Device.deviceID + '::M3U8_NAME'+':'+radioProps.current_program)
            .then((content)=>{
                if(content != '') {
                  text =String(content);
                }
                this.data.playing = radioProps.current_status == 'run' ? true : false;
                this.data.startTime='00:00';
                this.data.endTime ='23:59';
                this.data.type=Constants.Channels_Type.M3U8_TYPE;
                var radioInfo={};
                radioInfo.id=radioProps.current_program;
                radioInfo.radio_name=text;
                radioInfo.cover_url_small=require('../../Resources/m3u8_cover.png');
                radioInfo.cover_url_large=require('../../Resources/m3u8_cover.png');
                radioInfo.program_name='';
                this.data.radioInfo=radioInfo;
                this.checkProgramHasFavored(radioProps.current_program);
            });
        }else{

            this.data.type = radioProps.current_player == 0 ? 0 : 1;
            if(this.data.type == 0) { //更新直播信息

                  XimalayaSDK.requestXMData(XMReqType.XMReqType_LiveRadioByID, {ids: radioProps.current_program+''}, (result, error) => {


                      if(!error) {

                          if(result.radios[0] == undefined) {
                              this.updateUI();
                              return;
                          }
                          this.data.radioInfo = result.radios[0];
                          XimalayaSDK.requestXMData(XMReqType.XMReqType_LiveSchedule, {radio_id: this.data.radioInfo.id}, (result2, error2) => {

                                      if(!error2 && result2 != undefined && result2.length > 0  && this.data.radioInfo.schedule_id != undefined) {
                                        if(result2[0] == undefined){
                                          this.updateUI();
                                        }

                                        for(var j=0; j<result2.length; j++){

                                          var xprogram = result2[j];
                                          if (xprogram.id == this.data.radioInfo.schedule_id) {

                                              this.data.startTime = xprogram.start_time;
                                              this.data.endTime = xprogram.end_time;

                                              break;
                                          }
                                        }

                                        this.checkProgramHasFavored(this.data.radioInfo.id);

                                      } else {
                                        this.data.startTime='00:00';
                                        this.data.endTime = '23:59';
                                        this.checkProgramHasFavored(this.data.radioInfo.id);
                                      }

                          });

                      } else {
                        this.updateUI();
                      }

                  });

            }
            else {

                // //根据id获取专辑信息
                XimalayaSDK.requestXMData(XMReqType.XMReqType_AlbumsBatch, {ids: radioProps.current_program + ''}, (result, error) => {


                      if(!error) {


                          if(result[0] == undefined){
                              this.updateUI();
                            return;
                          }
                          this.data.albumInfo = result[0];
                          this.data.trackProgress = radioProps.current_progress;
                          XimalayaSDK.requestXMData(XMReqType.XMReqType_TracksBatch, {ids: radioProps.current_sub + ''}, (result2, error2) => {
                              if(!error2) {

                                if(result2.tracks[0] == undefined){
                                    this.updateUI();
                                  return;
                                }

                                this.data.trackInfo = result2.tracks[0],
                                this.checkProgramHasFavored(radioProps.current_program);

                              } else {
                                this.updateUI();
                              }

                          });

                      } else {
                        this.updateUI();
                      }

                });
            }

      }
  }

  checkProgramHasFavored(id){

    Device.getDeviceWifi().callMethod("get_channels",{"all":0}).then((result)=>{

          const channels = result.result.chs;
          if(channels != undefined){
             var isfavored = false;
             var chs = channels;
             for(var k=0; k<chs.length; k++){
              var tmp = chs[k];
              if(tmp.id == id && tmp.t == this.data.type){
                isfavored = true;
                break;
              }
             }
             this.data.favored = isfavored;
             this.updateUI();
          }
    }).catch(error=>{
      console.log('error-400 -'+JSON.stringify(error));
    });
  }

  getRadioChannels(){

    Device.getDeviceWifi().callMethod("get_channels",{"all":0}).then((result)=>{

      const channels = result.result.chs;
      if(channels != undefined){
        this.data.radioChannels = channels;

      } else {
        this.data.radioChannels = [];
      }
    }).catch(error=>{
      console.log('error-410 -'+JSON.stringify(error));
      this.data.radioChannels = [];
    });
  }

  _onPressHander(index){
    if(index == 0) {

      if(this.state.allInfo.playing){
        Device.getDeviceWifi().callMethod('pause', {}).then((json) => {

            if(json.code!=0){
              // MHPluginSDK.showFailTips('暂停失败,请重试');
            }else{
              this.state.allInfo.playing=false;
            }
        }).catch(error=>{
          console.log('error-428 -'+JSON.stringify(error));
        });

      }else{

          Device.getDeviceWifi().callMethod('resume', {}).then((json) => {

            if(json.code!=0){
              // MHPluginSDK.showFailTips('播放失败,请重试');
            }else{
              this.state.allInfo.playing=true;
            }
          }).catch(error=>{
            console.log('error-441 -'+JSON.stringify(error));
          });
      }

    }
    else{
      Device.getDeviceWifi().callMethod('next_program', {}).then((json) => {

          if(json.code!=0){
            // MHPluginSDK.showFailTips('下一曲失败,请重试');
          }
      }).catch(error=>{
        console.log('error-453 -'+JSON.stringify(error));
      });
    }

  }

  _onPress(){

        
    if(this.state.allInfo == undefined || this.state.allInfo == null ) {

      this.props.navigation.navigate('PlayPage', {
        title: '',
        type: -1,
      });
      return;
    }

    //跳播放页
    var isAlbum = ((this.state.allInfo.type == 0||this.state.allInfo.type == Constants.Channels_Type.M3U8_TYPE) ? false : true);
    if(!isAlbum && this.state.allInfo.radioInfo != undefined && this.state.allInfo.radioInfo.id !=undefined ){
        this.props.navigation.navigate('PlayPage', {
          title: '',
          type: this.state.allInfo.type,
          favored: this.state.allInfo.favored,
          radioInfo: this.state.allInfo.radioInfo,
          startTime: this.state.allInfo.startTime,
          endTime: this.state.allInfo.endTime,
          playing: this.state.allInfo.playing,
        });
        
        return;

    } else if(isAlbum && this.state.allInfo.albumInfo != undefined && this.state.allInfo.albumInfo.id != undefined) {


      this.props.navigation.navigate('PlayPage', {
        title: '',
        type: 1,
        favored: this.state.allInfo.favored,
        albumInfo: this.state.allInfo.albumInfo,
        trackInfo: this.state.allInfo.trackInfo,
        trackProgress:this.state.allInfo.trackProgress,
        playing: this.state.allInfo.playing,
      });
      return;

    } else {

      this.props.navigation.navigate('PlayPage', {
        title: '',
        type: -1,
      });
      return;
    }
      
        
  }


  shouldComponentUpdate(nextProps, nextState) {

      if(nextState.allInfo) {
            if(nextState.allInfo.type == 0||nextState.allInfo.type == Constants.Channels_Type.M3U8_TYPE) {

                  if(nextState.allInfo.radioInfo == undefined&&nextState.allInfo.type == 0) {
                      this.componentWillMount();
                      return false;
                  };
            } else {

                    if(nextState.allInfo.albumInfo == undefined || nextState.allInfo.trackInfo == undefined) {
                        this.componentWillMount();
                        return false;
                    };
            }
      }
      return true;
  }


  getBatteryPic(battery){
      if(battery>0&&battery<=10){
          return require('../../Resources/battery1.png');
      }else if(battery>=11&&battery<=20){
        return require('../../Resources/battery2.png');
      }else if(battery>=21&&battery<=40){
        return require('../../Resources/battery3.png');
      }else if(battery>=41&&battery<=60){
        return require('../../Resources/battery4.png');
      }else if(battery>=61&&battery<=80){
        return require('../../Resources/battery5.png');
      }else if(battery>=81&&battery<=100){
        return require('../../Resources/battery6.png');
      }else{
        return require('../../Resources/battery6.png');
      }
  }


  isLoadingView(){

    var name='正在获取';
    var program='正在获取';
    var  progress = (
          <Text style={styles.rowTextDescProgress} numberOfLines={1}>未收听</Text>
    );

    return(
      <View style={{flexDirection:'column',height:60,width:screenWidth,}}>
        <View style={{height:1/PixelRatio.get(),width:screenWidth,backgroundColor:'rgba(0,0,0,.15)',marginTop:0}}></View>
        <View style={styles.rowContainer}>
        <ImageBackground style={styles.thumbShadow} source={require("../../Resources/holder_small.png")} resizeMode='stretch'>
          <ImageBackground style={styles.thumb1} source={{uri:''}}></ImageBackground>
        </ImageBackground>
          <View style={styles.rowTextDesc}>
            <Text style={styles.rowTextDescTitle} numberOfLines={1}>{name}</Text>
            <Text style={styles.rowTextDescTrack} numberOfLines={1}>{program}</Text>
          </View>
          <TouchableWithoutFeedback >
                <View style={[styles.playBtnContainer,{marginRight:20}]}>
                      <ImageBackground style={styles.thumb3} source={require('../../Resources/playbar_pausebutton.png')}/>
                  </View>
            </TouchableWithoutFeedback>
            <TouchableHighlight >
                  <View style={[styles.playBtnContainer,{marginRight:15}]}>
                      <ThumbImage ref={(component) => {this.thumbImageback1 = component}} style={styles.thumb3} source={require('../../Resources/playbar_next.png')}/>
                  </View>
            </TouchableHighlight>
        </View>
      </View>
    );
  }

  render() {
  
      if(!this.state.loaded) {
        return this.isLoadingView();
      }

      //电量
      var batteryView=null;
      if(Device.model!=Constants.DeviceModel.v601){
        batteryView=(<ImageBackground style={styles.battery} source={this.getBatteryPic(this.state.battery)}></ImageBackground>);
      }
      var isAlbum = (this.state.allInfo.type == 0||this.state.allInfo.type == Constants.Channels_Type.M3U8_TYPE) ? false : true;


      var id = null;
      var program = null;
      var smallThumbSource = null;
      var name = null;
      var progress;

      if(!isAlbum ) {
         id = this.state.allInfo.radioInfo.id;
         name = this.state.allInfo.radioInfo.radio_name;
         program = this.state.allInfo.radioInfo.program_name + ' 直播中';
         if(this.state.allInfo.radioInfo.program_name == '') {
          program = '暂无节目单';
         }
         smallThumbSource = this.state.allInfo.radioInfo.cover_url_small;
         if(name.length > 14) {
          name = name.substr(0, 14) + '...';
        }

        if(this.state.allInfo.startTime != '00:00') {
          progress = <Text style={styles.rowTextDescProgress}>直播时间 {this.state.allInfo.startTime} - {this.state.allInfo.endTime}</Text>
        } else {
          progress = <Text style={styles.rowTextDescProgress}>{'累计收听 ' + this.state.allInfo.radioInfo.radio_play_count}</Text>
        }
      } else if (isAlbum ) {
        id = this.state.allInfo.albumInfo.id;
        name = this.state.allInfo.albumInfo.album_title;
        smallThumbSource = this.state.allInfo.albumInfo.cover_url_small;
        var text = this.state.allInfo.trackInfo.track_title;
        program ='第' + (this.state.allInfo.trackInfo.order_num+1) + '集   ' + text;

        if(name.length > 14) {
          name = name.substr(0, 14) + '...';
        }

        if(text.length > 14) {
          text = text.substr(0, 14) + '...';
        }

        var tmpStr;
        // 没有获取到收听进度
        if (this.state.allInfo.trackProgress != 0) {


          progress = (
            <Text style={styles.rowTextDescProgress} numberOfLines={1}>收听进度 <Text style={{color:'rgb(31,215,208)'}}>{Constants.DateUtils.transformProgress(this.state.allInfo.trackProgress)}</Text> / {Constants.DateUtils.transformProgress(this.state.allInfo.trackInfo.duration)}</Text>
          );
        } else {
          progress = (
            <Text style={styles.rowTextDescProgress} numberOfLines={1}>未收听</Text>
          );
        }
      }

    var playMaskSource;
    var MaskView;
    var thumbSource;
    var playingThumb = null;
    var progressValue = 0;
    var playMaskImg=null;
    var rotateStyle = {
      transform:[
        {rotate: '0deg'}
      ],
    };


    if(this.state.allInfo.type == 0||this.state.allInfo.type == Constants.Channels_Type.M3U8_TYPE) {

      thumbSource = this.state.allInfo.radioInfo.cover_url_small;

    } else {

      thumbSource = this.state.allInfo.albumInfo.cover_url_small;
    }



    if(this.state.allInfo.playing) {
        playMaskImg= require('../../Resources/playbar_playbutton.png');
        playingThumb = <ImageBackground style={styles.thumb4} source={playMaskImg}/>;
        if(this.state.allInfo.type == 0||this.state.allInfo.type == Constants.Channels_Type.M3U8_TYPE) {

          var current = new Date();
          var totalLength =  Constants.DateUtils.getSecondsBetween(this.state.allInfo.startTime, this.state.allInfo.endTime);
          var currentLength = Constants.DateUtils.getSecondsBetween(this.state.allInfo.startTime, current.getHours() + ':' + current.getMinutes());
          progressValue = totalLength==0? 0 : currentLength / totalLength;

        } else {

            progressValue = this.state.allInfo.trackProgress / this.state.allInfo.trackInfo.duration;

        }
        //记录进度
        this.progressValue=progressValue;
        var rotateAngle = progressValue * 360;
        rotateStyle = {
          transform:[
            {rotate: rotateAngle + 'deg'}
          ],
        };

        MaskView = (
                  <AnimatedCircularProgress
                        size={41}
                        width={1}
                        fill={progressValue*100}
                        tintColor='#cd3f3f'
                        backgroundColor='rgba(0,0,0,0.1)'/>
        );
    } else {

        playMaskImg=require('../../Resources/playbar_pausebutton.png');
        playingThumb = <Image style={styles.thumb4} source={playMaskImg}/>;
        MaskView = (
                <AnimatedCircularProgress
                      size={41}
                      width={1}
                      fill={this.progressValue*100}
                      tintColor='#cd3f3f'
                      backgroundColor='rgba(0,0,0,0.1)'/>);
    }




    return(

      <TouchableOpacity onPress={()=>{this._onPress()}} activeOpacity={1} >
        <View style={{flexDirection:'column',width:screenWidth,height:60}}>
          <View style={{height:1/PixelRatio.get(),width:screenWidth,backgroundColor:'rgba(0,0,0,.15)',marginTop:0}}></View>
          <View style={styles.rowContainer} >
          <TouchableWithoutFeedback onPress={()=>{this._onPress()}}>
          <ImageBackground style={styles.thumbShadow} source={require('../../Resources/holder_small.png')} resizeMode='stretch'>
            <Image style={styles.thumb1} source={{uri:smallThumbSource}} ></Image>
          </ImageBackground>
          </TouchableWithoutFeedback>
            <View style={styles.rowTextDesc}>
              <Text style={styles.rowTextDescTitle} numberOfLines={1}>{name}</Text>
              <View style={{flexDirection:'row',marginTop:8,alignItems:'center'}}>
                {batteryView}
                <Text style={[styles.rowTextDescTrack,{marginTop:0,overflow: 'hidden',flex:1,}]} numberOfLines={1}>{program}</Text>
              </View>
            </View>
            <TouchableWithoutFeedback  onPress={()=>{this._onPressHander(0)}}>
                  <View style={[styles.playBtnContainer,{marginRight:20}]}>
                      {MaskView}
                      {playingThumb}
                  </View>
            </TouchableWithoutFeedback>
            <TouchableBtn imgStyle={styles.prevAndNexPlay} 
              pressInSource={require('../../Resources/playbar_next_down.png')}
              pressOutSource={require('../../Resources/playbar_next.png')}
              onPress={()=>{this._onPressHander(1)}}/>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

}

class ThumbImage extends React.Component{
    constructor(props){
      super(props);
      this.state ={
        progress:0,
        source: this.props.source? this.props.source:'',
        abc: true,
      }
    }

    setProgress(p){

       this.setState({
          progress: p,
       });

    }

    componentWillMount(){

    }

    shouldComponentUpdate(nextProps, nextState){
      return  true;
    }

    randomColor(){
    	return ('rgb(' +  Math.round(Math.random() * 255) + ',' + Math.round(Math.random() * 255) + ',' + Math.round(Math.random() * 255) + ')');
    }

    setSource(ss){

      if(this.state.source != ss ) {
          var st = this.state.abc;

           this.setState({
              source: ss,
              abc: !st,
           });
      }

    }

    render(){

           var style = {
                    transform:[
                      {rotate: this.state.progress + 'deg'}
                    ],
           };

          if(this.state.abc){
                return(
                   <ImageBackground style={[this.props.style, style, {justifyContent:'center', alignItems:'center'}]}>
                      <ImageBackground source={this.state.source} style={[styles.thumb2]}></ImageBackground>
                    </ImageBackground>
                );
          } else {
                return(
                   <View style={[this.props.style, style, {justifyContent:'center', alignItems:'center'}]}>
                     <ImageBackground style={[styles.thumb2, {alignSelf:'center',justifyContent:'center', alignItems:'center'}]}>
                            <ImageBackground source={this.state.source} style={[styles.thumb2]}></ImageBackground>
                      </ImageBackground>
                    </View>
                );
          }


    }
}

var styles = StyleSheet.create({

  bottom:{
    position:'absolute',
    bottom:0,
    left:0,
    flexDirection:'row',
    justifyContent:'space-around',
    backgroundColor:'rgba(255,255,255,0.95)',
    height:60,
    width:screenWidth,
  },
  bottomImage:{
    position:'absolute',
    bottom:0,
    left:0,
    height: 68,
    width: screenWidth,
    backgroundColor:Constants.TintColor.transparent,
  },
  bottomBtn:{
    marginTop:6,
    width:23,
    height:23,
  },
  playBtnContainer:{
    width:40,
    height:40,
    borderRadius: 20,
    alignItems:'center',
    justifyContent:'center',
  },
  thumb:{
    borderRadius: 21,
    width:42,
    height:42,
    alignSelf:'center',
    position:'absolute',
    bottom:4,
    left: 4,
    backgroundColor:'transparent',
    opacity:0.5,
  },
  thumb3:{
    borderRadius: 21,
    width:42,
    height:42,
    alignSelf:'center',
    position:'absolute',
    bottom:0,
    left: 0,
    backgroundColor:'transparent',
    opacity:0.5,
  },
  thumb4:{
    borderRadius: 20,
    width:40,
    height:40,
    alignSelf:'center',
    position:'absolute',
    bottom:0,
    left: 0,
    backgroundColor:'transparent',
  },
  thumb1:{
    height:40,
    width:40,
    borderRadius:5,
    alignSelf:'center',
    backgroundColor:'transparent',
  },
  thumb2:{
    borderRadius: 21,
    width:42,
    height:42,
    alignSelf:'center',
    backgroundColor:'transparent',
  },
  playMask:{
    borderRadius: 21,
    width:42,
    height:42,
    position:'absolute',
    bottom:0,
    backgroundColor:'transparent',
  },
  rowContainer:{
    flexDirection:'row',
    alignItems:'center',
    flex:1,
    backgroundColor:'rgba(255,255,255,0.95)',
  },

  circularProgress:{
    position:'absolute',
    bottom:0,
  },
  rowTextDesc:{
    flex:1,
    alignSelf:'stretch',
    flexDirection:'column',
    marginRight: 30,
  },
  rowTextDescTitle:{
    marginTop:10,
    color:Constants.TextColor.rgb51,
    fontSize:Constants.FontSize.fs30,
  },
  thumbShadow:{
    height: 40,
    width: 40,
    borderRadius:5,
    alignItems:'center',
    justifyContent:'center',
    margin:8,
    marginLeft:10,
  },
  rowTextDescProgress:{
		marginTop:8,
		color:Constants.TextColor.rgb153,
		fontSize:Constants.FontSize.fs20,
	},
  rowTextDescTrack:{
    marginTop:8,
    color:Constants.TextColor.rgb127,
    fontSize:Constants.FontSize.fs25,
  },
  prevAndNexPlay:{
    marginRight:15,
    width:40,
    height:40,
    borderRadius:20,
  },
  battery:{
    width:13,
    height:7.5,
    marginRight:5,
  },

});

export default withNavigation(NewBottomView);
