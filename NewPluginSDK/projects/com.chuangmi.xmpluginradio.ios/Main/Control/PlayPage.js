'use strict';

import React,{component} from 'react' ;
import Constants  from '../../Main/Constants';
import {XimalayaSDK,XMReqType}  from '../Const/XimalayaSDK';
import TouchableBtn  from '../View/TouchableBtn';
import NoWifiView  from '../View/NoWifiView';
import LoadingView  from '../View/LoadingView';
import CustomerTitleBar  from '../View/CustomerTitleBar';
import Label from'../View/Label';
import Slider  from 'react-native-slider';
import { TitleBarBlack,TitleBarWhite,LoadingDialog } from 'miot/ui';
import PopupDialog, {ScaleAnimation,DialogTitle,SlideAnimation } from 'react-native-popup-dialog';
import {AnimatedCircularProgress,CircularProgress } from 'react-native-circular-progress';

import {Device,DeviceEvent,Host,Package,Service} from 'miot';
import {
  APPBAR_HEIGHT,APPBAR_MARGINBOTTOM,APPBAR_MARGINTOP,isIPX ,
  ratio,NavigatorBarHeight,screenWidth,screenHeight} from '../ConstDefine';
const scaleAnimation = new ScaleAnimation();


import {
  Image,
  ImageBackground,
  ListView,
  TouchableHighlight,
  StyleSheet,
  Text,
  PixelRatio,
  View,
  Alert,
  DeviceEventEmitter,
  TouchableWithoutFeedback,
  LayoutAnimation,
  TouchableOpacity,
  PanResponder,
  StatusBar,
} from 'react-native';

/*

      type: 0,
      favored: true,
      radioInfo: this.props.rowData.radioInfo,
      tartTime: this.props.rowData.startTime,
      endTime: this.props.rowData.endTime,
      type: 1,
      favored: true,
      albumInfo: this.props.rowData.radioInfo,
      trackInfo?: this.props.rowData.trackInfo,
      trackProgress:this.props.rowData.trackProgress,
*/

const ImageHeight = screenHeight < 570 ? 160 : 220;
const SoundMax = 31;

class PlayPage extends React.Component{

  /*
    type: 0,
    favored: true,
    radioInfo: this.props.rowData.radioInfo,
    tartTime: this.props.rowData.startTime,
    endTime: this.props.rowData.endTime,
    playing: false,
    radioChannels:[],
    type: 1,
    favored: true,
    albumInfo: this.props.rowData.radioInfo,
    trackInfo?: this.props.rowData.trackInfo,
    trackProgress:this.props.rowData.trackProgress,
    playing: false,
    radioChannels:[],
  */
 static navigationOptions = ({ navigation }) => {
    return {
    header:
        <View>
        <CustomerTitleBar
            title={navigation.state["params"] ? navigation.state.params.title : Device.name}
            style={{ backgroundColor:'#805e5f' }}
            onPressLeft={() => {
                navigation.pop();
            }}
            sourceRight={require('../../Resources/title/std_tittlebar_main_device_share_white_normal.png')}
            highlightedSourceRight={require('../../Resources/title/std_tittlebar_main_device_share_white_press.png')}
            onPressRight={() => {
              Host.ui.openShareListBar('米家网络收音机增强版', '米家网络收音机增强版', require('../../Resources/radio_icon.png'),'https://www.xiaomiyoupin.com/detail?gid=92');
            }}/>
        </View>
    };
  };

  constructor(props){
      super(props);

      var params = this.props.navigation.state.params;
      this.state = {
        loaded:false,
        allInfo: null,
        panning: false,
        styleH: {},
        volume:10,//默认值
        showVolume:false,
        battery:0,
        showVolumeTint: false,
        timerSeconds: 0,
        opened:false,
        options:['音乐闹钟','10分钟后停止播放','20分钟后停止播放','30分钟后停止播放',
          '60分钟后停止播放','90分钟后停止播放','120分钟后停止播放','取消'],
        /* 入参数*/
        visible:false,
        message:'',
        visLoading:false,
        playing:params.playing,
        trackProgress2:params.trackProgress2,
        radioInfo:params.radioInfo,
        startTime:params.startTime,
        favored:params.favored,
        endTime:params.endTime,
        type:params.type,
        trackInfo:params.trackInfo,
        albumInfo:params.albumInfo,
       
      };
  }

  componentWillMount() {
    this.prevSliderValue= 0;
    this._sliding = false;
    this.opened =false,
    this. _height = 0;
    this._initailHeight = 0;
    this._maxH = 180;
    this._minH = 0;
    this._sliderY = 0;
    this._sliderH = 0;

    this.data = {};
    this.clockData = {};
    this.data.favored = false;
    this.volume = -1;
    this.pauseNotification = true;
    this.inter = -100;
    this.start = 0 ;
    this.loadClocks();//加载定时关闭信息
    this.loadVolume();//加载音量
    this.getRadioChannels();


    if(this.state.type == -1) {

      Device.getDeviceWifi().callMethod('resume',{}).then((json) => {

          Device.getDeviceWifi().callMethod('get_prop', {}).then((json2) => {
                
            if (json2.code==0 && json2.result) {
              var radioProps = json2.result;
              this.updateData(radioProps);
            }
          }).catch(error=>{
            console.log('error-707 -'+JSON.stringify(error));
          });
      }).catch(error=>{
        console.log('error-708 -'+JSON.stringify(error));
      });
      return;
    }
    else if(this.state.type == Constants.Channels_Type.M3U8_TYPE){

      this.data = {
           type: Constants.Channels_Type.M3U8_TYPE,
           favored: true,
           radioInfo: this.state.radioInfo,
           startTime: '00:00',
           endTime: '23:59',
           playing: this.state.playing? this.state.playing : false,
       };

       this.setState({
           loaded: true,
           allInfo: this.data,
       });
       this.playRadio(this.state.radioInfo);
       return;
    }
    else if(this.state.type == 0){

        if(!this.state.startTime) {

            XimalayaSDK.requestXMData(XMReqType.XMReqType_LiveSchedule, {radio_id: this.state.radioInfo.id}, (result2, error2) => {

                if(!error2 && result2 != undefined && result2.length > 0) {

                  for(var j=0; j<result2.length; j++){

                    var xprogram = result2[j];
                    if (xprogram.id == this.state.radioInfo.schedule_id) {
                      // 直播数据
                      this.data = {
                          type: 0,
                          favored: this.state.favored,
                          radioInfo: this.state.radioInfo,
                          startTime: xprogram.start_time,
                          endTime: xprogram.end_time,
                          playing: this.state.playing? this.state.playing : false,
                      };
                      this.setState({
                          loaded: true,
                          allInfo: this.data,
                      });
                      this.playRadio(this.state.radioInfo);

                      break;
                    }
                  }
                } else {

                      this.data = {
                          type: 0,
                          favored: this.state.favored,
                          radioInfo: this.state.radioInfo,
                          startTime: '00:00',
                          endTime: '23:59',
                          playing: this.state.playing? this.state.playing : false,
                      };
                      this.setState({
                          loaded: true,
                          allInfo: this.data,
                      });
                      this.playRadio(this.state.radioInfo);
                }

             });
        }  else{

             // 直播数据
            this.data = {
                type: 0,
                favored: this.state.favored,
                radioInfo: this.state.radioInfo,
                startTime: this.state.startTime,
                endTime: this.state.endTime,
                playing: this.state.playing? this.state.playing : false,
            };

            this.setState({loaded: true,allInfo: this.data});
            this.playRadio(this.state.radioInfo);

        }
    }
    else {


          if(!this.state.trackInfo) {

               XimalayaSDK.requestXMData(XMReqType.XMReqType_AlbumsBrowse,{album_id:this.state.albumInfo.id, count: 1, page: 1,sort:'desc'},(result, error) => {


                  if(!error){

                        if(result.tracks[0] == undefined){return;}
                        this.data = {
                              type: 1,
                              favored: this.state.favored,
                              albumInfo: this.state.albumInfo,
                              trackInfo: result.tracks[0],
                              trackProgress:this.state.trackProgress,
                              playing: this.state.playing? this.state.playing : false,
                        };

                        this.setState({
                            loaded: true,
                            allInfo: this.data,
                        });
                        this.playTrack(this.data.albumInfo, this.data.trackInfo);
                  }
              });

          }  
          else {

              this.data = {
                  type: 1,
                  favored: this.state.favored,
                  albumInfo: this.state.albumInfo,
                  trackInfo: this.state.trackInfo,
                  trackProgress:this.state.trackProgress,
                  playing: this.state.playing? this.state.playing : false,
              };

              this.setState({
                  loaded: true,
                  allInfo: this.data,
              });
              this.playTrack(this.data.albumInfo, this.data.trackInfo);
          }
    }

  }
 
  componentDidMount(){

        this.radioTimer = setTimeout(()=>{this.addListenerForRadioStatusChange()}, 8000);

        this.subscription2 = DeviceEventEmitter.addListener('ChannelsChangeEvent', (event) => {

          Device.getDeviceWifi().callMethod("get_channels",{"all":0}).then((result)=>{

                const channels = result.result.chs;
                if(channels != undefined) {
                   this.data.radioChannels = channels;
                      var id = -1;
                      if(this.data.type == 0 && this.data.radioInfo != undefined) {
                        id = this.data.radioInfo.id;
                      } else if(this.data.type ==1 && this.data.albumInfo != undefined) {
                        id = this.data.albumInfo.id;
                      }
                     this.checkProgramHasFavored(id);
                }
          }).catch(error=>{
            console.log('error-571 -'+JSON.stringify(error));
          });
       });


       this.subscription00 = DeviceEventEmitter.addListener('AlbumPageBackToPlayPageEvent', (event)=>{

            this.pauseNotification = true;

              this.data = {
                    type: 1,
                    favored: event.data.favored,
                    albumInfo: event.data.albumInfo,
                    trackInfo: event.data.trackInfo,
                    trackProgress:event.data.trackProgress2,
                    playing: false,
              };

              this.playTrack2(this.data.albumInfo, this.data.trackInfo);
              this.setState({
                  loaded: true,
                  allInfo: this.data,
              });
       });

       this.batterySubscription=DeviceEventEmitter.addListener('BatteryChangeEvent', (event)=>{
          
          this.setState({
              battery:event.data,
          });
       });


  }

  componentWillUnmount() {


  	  if(this.state.showVolumeTint){

        const VolumeTint = 'VolumeTint';
        Host.storage.get(VolumeTint).then((info)=>{
          
            if(info == undefined || info == null){
              
              Host.storage.set(VolumeTint,{volumeTintHasShowed: true});

            } else {
              
              info.volumeTintHasShowed = true;
              Host.storage.set(VolumeTint,info);
            }
        });
  	  }


      this.cacheVolume();
      this.subscription00.remove();
      if(this.batterySubscription)  this.batterySubscription.remove();

      if(this.subscription)  this.subscription.remove();
      this.subscription2.remove();
      if(this.inter) {
        this.inter &&clearInterval(this.inter);
      }
      this.radioTimer && clearTimeout(this.radioTimer);
  }

  /** volume **/
  _onLayout(y, height){
      this._sliderY = y;
      this._sliderH = height;
  }

  playRadio(radioInfo ){
      if(this.state.playing) {
        this.pauseNotification = false;
        return;
      }

       var tmp = radioInfo.rate64_aac_url;
       var idx = tmp.indexOf('?');
       if(idx != -1) {
         tmp = tmp.substring(0, idx);
       }

      var params = {
           id: radioInfo.id,
           type:radioInfo.kind=='radio'?0:Constants.Channels_Type.M3U8_TYPE,
           url: tmp,
           try: this.data.favored ? 0 : 1,
        };

      Device.getDeviceWifi().callMethod('play',params).then((json) => {
        
        this.pauseNotification = false;
        if(json.code==0){

            this.data.playing = true;
            this.setState({allInfo: this.data});
        }
      }).catch(error=>{
        console.log('error-257-'+JSON.stringify(error));
      });

  }

  playTrack2(albumInfo, trackInfo){

    var tmp = trackInfo.play_url_64_m4a;
    var idx = tmp.indexOf('?');
    if(idx != -1) {
      tmp = tmp.substring(0, idx);
    }

    var params = {
        url: 'http://api.ximalaya.com/openapi-gateway-app/albums/browse',
        type:1,
        id: albumInfo.id,
        voice: tmp,
        try: this.data.favored ? 0 : 1, // xin jia
    };

    Device.getDeviceWifi().callMethod('play_voice', params).then((json) => {
        
      this.pauseNotification = false;
        if(json.code==0){
            this.data.playing = true;
            if(this.data.trackProgress > 0) {

                var params = {
                     to: this.data.trackProgress,
                };
                Device.getDeviceWifi().callMethod('drag', params).then((json) => {

                   if(this.slider) {
                       this.slider.setState({
                         value: this.data.trackProgress / trackInfo.duration,
                     });
                   }
                }).catch(error=>{
                  console.log('error-293 -'+JSON.stringify(error));
                });
            }

        }

    }).catch(error=>{
      console.log('error-302 -'+JSON.stringify(error));
    });

  }

  playTrack(albumInfo, trackInfo){



      if(this.state.playing) {
         this.pauseNotification = false;
         return;
      }

      // 刚进来的时候 判定收音机状态
      Device.getDeviceWifi().callMethod('get_prop',{}).then((json2) => {

          if ((json2.code==0) && json2.result != undefined && json2.result.current_player == 2
              && json2.result.current_status == 'run' && json2.result.current_program == albumInfo.id
              && json2.result.current_sub == trackInfo.id) {

              this.pauseNotification = false;
              this.data.playing = true;
              this.data.trackProgress = this.state.trackProgress2 ;
              if(this.slider) {
                       this.slider.setState({
                         value: this.state.trackProgress2 / trackInfo.duration,
                     });
               }
              this.setState({allInfo: this.data});
          } else {

                var tmp = trackInfo.play_url_64_m4a;
                var idx = tmp.indexOf('?');
                if(idx != -1) {
                   tmp = tmp.substring(0, idx);
                }
                //播放指定声音
                var params = {
                    url: 'http://api.ximalaya.com/openapi-gateway-app/albums/browse',
                    type:1,
                    id: albumInfo.id,
                    voice: tmp,
                    try: this.data.favored ? 0 : 1, // xin jia
                };


              Device.getDeviceWifi().callMethod('play_voice', params).then((json) => {


                if(json.code==0){
                    this.pauseNotification = false;
                    this.data.playing = true;

                    if(this.state.trackProgress2 > 0) {

                          this.data.trackProgress = this.state.trackProgress2 ;
                          var params = {
                              to: this.state.trackProgress2,
                            };

                        Device.getDeviceWifi().callMethod('drag', params).then(( json3) => {

                            if(this.slider) {
                              this.slider.setState({
                                  value: this.state.trackProgress2 / trackInfo.duration,
                              });
                            }
                        }).catch(error=>{
                          console.log('error-283 -'+JSON.stringify(error));
                        });
                    }
                    this.setState({allInfo: this.data,});
                }

              }).catch(error=>{
                console.log('error-377 -'+JSON.stringify(error));
              });
          }
      }).catch(error=>{
        console.log('error-384 -'+JSON.stringify(error));
      });

  }

  onFavorBtnPress(){

    if(!this.data.favored) {
      this.addFavorate();
    } 
    else {
      this.deleteFavorate();
    }

  }

  deleteFavorate(){
    
    var id = -1;
    id = (this.data.type == 0)?( this.data.radioInfo.id):( this.data.albumInfo.id);
    this.paramss = {tens:[{id:id, t:this.data.type}]};

    Device.getDeviceWifi().callMethod("get_channels",{"all":0}).then((result)=>{

          const channels = result.result.chs; 
          if(channels != undefined){
              var chs = channels;
              if(chs.length <=1) {
                  Alert.alert(
                    '提示',
                    Constants.Channels.deleteInfo(),
                    [
                      {text: '确认', onPress: () => {}, style: 'cancel'},
                    ]
                 );

              } else {


                    this.setState({message:'加载中...',visLoading:true})
                    Device.getDeviceWifi().callMethod("remove_channels", this.paramss).then((json) => {
                        this.setState({message:'',visLoading:false})
                        if(json.code==0){
                          this.data.favored= false;
                          Constants.Channels.deleteItem();
                        } else {
                          //  MHPluginSDK.showFailTips(Constants.Channels.deleteFailInfo());
                          this.data.favored= true;
                        }
                        this.setState({message:'',visLoading:false,allInfo:this.data});
                    }).catch(error=>{
                      this.setState({message:'',visLoading:false})
                      console.log('error-400 -'+JSON.stringify(error));
                    });
              }
          }
    }).catch(error=>{
      console.log('error-491 -'+JSON.stringify(error));
    });
  }

  addFavorate(){

    var id = -1;
    id = (this.data.type == 0)?( this.data.radioInfo.id):( this.data.albumInfo.id);
    var address = this.data.type == 0? this.data.radioInfo.rate64_aac_url :'http://api.ximalaya.com/openapi-gateway-app/albums/browse';
    this.paramss = {
        chs:[{
          url: '' + address,
          type:this.data.type,
          id: id,
        }],
    };

    Device.getDeviceWifi().callMethod("get_channels",{"all":0}).then((result)=>{

        const channels = result.result.chs;
        if(channels != undefined){
           var chs = channels;
           if(chs.length >= 35) {
              Alert.alert(
                  '提示',
                  Constants.Channels.addInfo(),
                  [
                    {text: '确认', onPress: () => {}, style: 'cancel'},
                  ]
              );

           } else {
                var params = this.paramss;
                this.setState({message:'加载中...',visLoading:true})
                Device.getDeviceWifi().callMethod('add_channels', this.paramss).then((json) => {
                    
                    if(json.code==0){

                      Constants.Channels.addItem();
                      this.data.favored= true;
                    } else {
                      this.data.favored= false;
                    }
                    this.setState({message:'',visLoading:false,allInfo:this.data})
                }).catch(error=>{
                  console.log('error-441 -'+JSON.stringify(error));
                  this.setState({message:'',visLoading:false})
                });

          }
        }
    }).catch(error=>{
      console.log('error-445 -'+JSON.stringify(error));
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
      console.log('error-510 -'+JSON.stringify(error));
    });

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
      console.log('error-534 -'+JSON.stringify(error));
    });
  }

  addListenerForRadioStatusChange(){

      this.subscription = DeviceEventEmitter.addListener(Constants.Event.radio_props, (event) => {

           if(!this.pauseNotification) {
              this.state.volume = event.data.current_volume;
              this.updateData(event.data);
           }
      });

  }

  cacheVolume(){

    Device.getDeviceWifi().loadProperties('volume').then((result)=>{
          
        const volume = result.get('volume');
        if(volume != undefined){
          Host.file.writeFile(Service.account.ID + '===' + Device.deviceID + '::volume', "" + result.volume ).then((success)=>{});
        }
    });
  }

  //取消定制闹钟
  cancleAlarmClock(){
    this.clearAndSetTimer(0,0);
    Host.file.writeFile(Device.deviceID + '===' + Device.deviceID + '::timerIsOn', "" + JSON.stringify({on: false})).then((success)=>{});
  }

  updateSliderProgress(){

      if(this.state.allInfo.type != 0 && this.state.allInfo != undefined
            && this.state.allInfo.trackInfo != undefined && this.state.allInfo.trackProgress != undefined && this.state.allInfo.trackInfo.duration != undefined) {

            var duration = this.state.allInfo.trackInfo.duration;
            var current = this.state.allInfo.trackProgress;

            if(current >= duration) {
              if(this.inter) {
                this.inter &&clearInterval(this.inter);
              }
              return;
            }

            if(this.slider) {

               this.data = this.state.allInfo;
               this.data.trackProgress += 1;
               this.setState({
                    loaded: true,
                    allInfo: this.data,
                });
            }

      }


  }

  _onSliderStart(){
     this.prevSliderValue = this.slider.state.value;
     this._sliding = true;
  }

  _onSliderVoiceValueChange(value){
    this.setState({
      showVolume:true,
      volume:Math.floor(value*SoundMax),
    });
    console.log('changeValue:' + value*SoundMax);
  }

  _onSliderStartVoice(){

  }

  _onSliderCompleteVoice(value){
    console.log('completeVoice:' + value);
    this.setState({
      showVolume:false,
      volume:Math.floor(value*SoundMax),
    });
    this.state.volume = Math.floor(value*SoundMax);
    var params = {
      volume: this.state.volume,
    };

    Device.getDeviceWifi().callMethod('set_volume', params).then((json) => {

      console.log('set_volume-'+JSON.stringify(json))
     
    }).catch(error=>{
      console.log('error-928 -'+JSON.stringify(error));
    });

  }

  _onSliderComplete() {
    
    this._sliding = false;
    var currentSliderValue = this.slider.state.value;

    if(this.state.allInfo.type == 0) {
      if(this.slider) {
         this.slider.setState({
            value: this.prevSliderValue,
        });
      }

    } else{

        var params = {
            to: currentSliderValue * this.state.allInfo.trackInfo.duration,
        };

        this.data.trackProgress = currentSliderValue * this.state.allInfo.trackInfo.duration;


        Device.getDeviceWifi().callMethod('drag', params).then((json) => {
            if(json.code==0) {
              this.setState({
                loaded: true,
                allInfo: this.data,
              });
            }
        }).catch(error=>{
          console.log('error-964 -'+JSON.stringify(error));
        });

    }

  }

  updateUI(){

      if(this.data.type == 0) {
        if(this.data.radioInfo == undefined || this.data.radioInfo == null) {
          return;
        }
      } else if(this.data.type==1){
        if(this.data.albumInfo == undefined || this.data.trackInfo == undefined || this.data.albumInfo == null || this.data.trackInfo == null){
          return;
        }
      }
     
      if(this.data.type == 1 && this.data.playing && (this.inter==null) && this.state.allInfo != null && this.state.allInfo.albumInfo != null && this.state.allInfo.trackInfo != null
                                  && this.data.albumInfo.id == this.state.allInfo.albumInfo.id
                                  && this.data.trackInfo.id == this.state.allInfo.trackInfo.id) {
          this.inter = setInterval(()=>{this.updateSliderProgress()},1000);
      } else if(this.data.type == 1 && this.data.playing && this.inter && this.state.allInfo != null && this.state.allInfo.albumInfo != null && this.state.allInfo.trackInfo != null
                                  && this.data.albumInfo.id == this.state.allInfo.albumInfo.id
                                  && this.data.trackInfo.id == this.state.allInfo.trackInfo.id){

      } else {
        if(this.inter ) {
          this.inter &&clearInterval(this.inter)
        }
      }
 


      /*

          type: 0,
          favored: true,
          radioInfo: this.props.rowData.radioInfo,
          tartTime: this.props.rowData.startTime,
          endTime: this.props.rowData.endTime,

          playing: false,
          radioChannels:[],

          type: 1,
          favored: true,
          albumInfo: this.props.rowData.radioInfo,
          trackInfo?: this.props.rowData.trackInfo,
          trackProgress:this.props.rowData.trackProgress,

            playing: false,
          radioChannels:[],
      */


      var localProps;
      if(this.data.type == Constants.Channels_Type.M3U8_TYPE){
        localProps = {
           current_status: 'pause',
           current_player: Constants.Channels_Type.M3U8_TYPE,
           current_program: this.data.radioInfo.id,
        };
      }
      else{
        if(this.data.type == 0){
           localProps = {
              current_status: 'pause',
              current_player: 0,
              current_program: this.data.radioInfo.id,
           };
        } else {
           localProps = {
              current_status: 'pause',
              current_player: 1,
              current_program: this.data.albumInfo.id,
              current_sub: this.data.trackInfo.id,
              current_progress: this.data.trackProgress,
           };
        }
      }

      if(this.data.playing){
        localProps.current_status = 'run';
      }
      DeviceEventEmitter.emit('LocalRadioPropsEvent', {data: localProps});
      this.setState({
          loaded: true,
          allInfo: this.data,
      });
  }

  updateData(radioProps) {

      //M3U8
      if(radioProps.current_player==Constants.Channels_Type.M3U8_TYPE){
        this.data.playing = radioProps.current_status == 'run' ? true : false;
        this.data.startTime='00:00';
        this.data.endTime ='23:59';
        this.data.radioInfo=this.state.radioInfo;
        this.checkProgramHasFavored(this.data.radioInfo.id);
      }
      else{

        this.data.playing = radioProps.current_status == 'run' ? true : false;

        this.data.type = radioProps.current_player == 0 ? 0 : 1;
        if(this.data.type == 0) { //更新直播信息

               XimalayaSDK.requestXMData(XMReqType.XMReqType_LiveRadioByID, {ids: radioProps.current_program+''}, (result, error) => {
                  if(!error && result.radios != undefined && result.radios.length > 0) {
                       
                      //没有切换频道
                      this.data.radioInfo = result.radios[0];
                      XimalayaSDK.requestXMData(XMReqType.XMReqType_LiveSchedule, {radio_id: this.data.radioInfo.id}, (result2, error2) => {

                                  if(!error2 && this.data.radioInfo.schedule_id != undefined) {

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
                  }

               });

        } 
        else {



             //根据id获取专辑信息
             XimalayaSDK.requestXMData(XMReqType.XMReqType_AlbumsBatch, {ids: radioProps.current_program + ''}, (result, error) => {

                  if(!error && result != undefined && result.length > 0) {
                    
                      this.data.albumInfo = result[0];
                      this.data.trackProgress = radioProps.current_progress;
                      XimalayaSDK.requestXMData(XMReqType.XMReqType_TracksBatch, {ids: radioProps.current_sub + ''}, (result2, error2) => {

                          if(!error2 && result2.tracks != undefined && result2.tracks.length > 0) {
                             this.data.trackInfo = result2.tracks[0],
                             this.checkProgramHasFavored(radioProps.current_program);
                      
                          }

                      });

                  } else {

                  }

             });


        }

    }
  }

  _onPressHander(index) {

        if(index == 0) {
            this.setState({message:'数据加载中,请稍候...',visLoading:true})
            Device.getDeviceWifi().callMethod('prev_program', {}).then((json) => {
              this.setState({message:'',visLoading:false})
                if(json.code==0){

                  Device.getDeviceWifi().callMethod('get_prop',{}).then((json2) => {
                          
                    if ((json2.code==0) && json2.result) {
                      var radioProps = json2.result;
                      this.updateData(radioProps);
                    }
                  }).catch(error=>{
                    console.log('error-1033 -'+JSON.stringify(error));
                  });
                }
            }).catch(error=>{
              console.log('error-1124 -'+JSON.stringify(error));
              this.setState({message:'',visLoading:false})
            });

        } else if(index == 1) {


              if(this.data.playing) {
                Device.getDeviceWifi().callMethod('pause',{}).then((json) => {
                    
                  if(this.inter) {
                    this.inter&&clearInterval(this.inter);
                  }
                  this.inter = null;
                  this.data.playing = false;
                  this.updateUI();
                }).catch(error=>{
                  console.log('error-1175 -'+JSON.stringify(error));
                });

              } else {

                  Device.getDeviceWifi().callMethod('resume',{}).then((success, json) => {

                      this.data.playing = true;
                      //有可能已经切换频道了
                      Device.getDeviceWifi().callMethod('get_prop',{}).then((json2) => {

                        if ((json2.code==0) && json2.result) {
                          var radioProps = json2.result;
                          this.updateData(radioProps);
                        }
                      }).catch(error=>{
                        console.log('error-1173 -'+JSON.stringify(error));
                      });

                  }).catch(error=>{
                    console.log('error-1177 -'+JSON.stringify(error));
                  });
              }


        } else {


            this.setState({message:'数据加载中,请稍候...',visLoading:true})
            Device.getDeviceWifi().callMethod('next_program',{}).then((json) => {
                if(json.code==0){
                    if(this.inter) {
                      this.inter &&clearInterval(this.inter);
                    }
                    Device.getDeviceWifi().callMethod('get_prop',{}).then((json2) => {
                         this.setState({message:'',visLoading:false})
                        if (json2.code==0 && json2.result) {
                          var radioProps = json2.result;
                          this.updateData(radioProps);
                        }
                    }).catch(error=>{
                      this.setState({message:'',visLoading:false})
                      console.log('error-1183 -'+JSON.stringify(error));
                    });

                }

            }).catch(error=>{
              this.setState({message:'',visLoading:false})
              console.log('error-1217 -'+JSON.stringify(error));
            });
        }
  }

  onListBtnPressHandler() {

      if(this.state.allInfo.type == 0 || this.state.allInfo.albumInfo == undefined) { //直播返回
        return;
      } 
      else {
        this.props.navigation.navigate('AlbumPage', {
          title: this.state.allInfo.albumInfo.album_title,
          albumInfo: this.state.allInfo.albumInfo,
          favored: this.state.allInfo.favored,
          from: 'playpage',
        });
      }

  }

  // shouldComponentUpdate(nextProps, nextState) {

  //   if(this._sliding){
  //     return false;
  //   }

  //   if(nextState.allInfo){
  //       if(nextState.allInfo.type == 0||nextState.allInfo.type == Constants.Channels_Type.M3U8_TYPE) {

  //         if(nextState.allInfo.radioInfo == undefined) {
  //             return false;
  //         };

  //       } else {

  //         if(nextState.allInfo.albumInfo == undefined || nextState.allInfo.trackInfo == undefined) {
  //             return false;
  //         };
  //       }
  //   }
  //       return true;
  // }

  sheetBtnHandler(index){
    if(index == 0){
      
      this.props.navigation.navigate('ClockSetting', {
        title:'音乐闹钟',
      });

    }else if(index == 1){
      var seconds = 1 * 10 * 60;
      this.clearAndSetTimer(seconds,10);
    }else if(index == 2){
      var seconds = 2 * 10 * 60;
      this.clearAndSetTimer(seconds,20);
    }else if(index == 3){
      var seconds = 3 * 10 * 60;
      this.clearAndSetTimer(seconds,30);
    }else if(index == 4){
      var seconds = 6 * 10 * 60;
      this.clearAndSetTimer(seconds,60);
    }else if(index == 5){
      var seconds = 9 * 10 * 60;
      this.clearAndSetTimer(seconds,90);
    }else if(index == 6){
      var seconds = 12 * 10 * 60;
      this.clearAndSetTimer(seconds,120);
    }else if(index == 7){
      this.cancleAlarmClock();//取消定时闹钟
    }

  }

  sheetBtnHandler1(index){
    if(index == 0){
      
      this.props.navigation.navigate('ClockSetting', {
        title:'音乐闹钟',
      });
    

    }else if(index == 1){
      var seconds = 1 * 10 * 60;
      this.clearAndSetTimer(seconds,10);
    }else if(index == 2){
      var seconds = 2 * 10 * 60;
      this.clearAndSetTimer(seconds,20);
    }else if(index == 3){
      var seconds = 3 * 10 * 60;
      this.clearAndSetTimer(seconds,30);
    }else if(index == 4){
      var seconds = 6 * 10 * 60;
      this.clearAndSetTimer(seconds,60);
    }else if(index == 5){
      var seconds = 9 * 10 * 60;
      this.clearAndSetTimer(seconds,90);
    }else if(index == 6){
      var seconds = 12 * 10 * 60;
      this.clearAndSetTimer(seconds,120);
    }

  }

  clearAndSetTimer(seconds,tag){

    if(this.inter > 0) {
      this.inter &&clearInterval(this.inter)
      this.inter = -100;
    }
    
    if(seconds > 0) {
      this.setTimer(seconds,tag);
    }
    else {
      if(this.id != -1) {

          Device.getDeviceWifi().callMethod('disable_alarm_clock',{id: this.id}).then((json) => {
            
              if(json.code==0){
                this.opened=false;
                this.setState({
                  opened:false,
                });
                //  MHPluginSDK.showFinishTips('已取消一段时间停止播放');

              }else{
                //  MHPluginSDK.showFailTips('取消一段时间停止播放失败');
              }
          }).catch(error=>{
            console.log('error-1349 -'+JSON.stringify(error));
          });
      }
    }



  }

  setTimer(seconds,tag){  // 设置闹钟
    
      var current = new Date();
      var startSeconds =  current.getTime();
      var stopSeconds = startSeconds + seconds * 1000;

      current.setTime(stopSeconds);
      var stopUTC = current.getUTCHours() + ':' + current.getUTCMinutes();
      var params = {
          utc: stopUTC,
          zone: 480,
          action: 'pause',
          tag:tag,
      };

      if(this.id != -1) {
        params.id = this.id;
      }

      Device.getDeviceWifi().callMethod("set_alarm_clock", params).then((success2, json2) => {

        if(json2.code==0) {

          this.opened=true;
          this.setState({opened:true});
          // MHPluginSDK.showFinishTips('定时关闭设置成功');

        } else {
          // MHPluginSDK.showFailTips('定时关闭设置失败');
        }
      }).catch(error=>{
        console.log('error-1391-'+JSON.stringify(error));
      });
  }

  closeVolumeTint(){

      const VolumeTint = 'VolumeTint';
      Host.storage.get(VolumeTint).then((info)=>{
        if(info == undefined || info == null){
          
          Host.storage.set(VolumeTint,{volumeTintHasShowed: true});

        } else {
          
          info.volumeTintHasShowed = true;
          Host.storage.set(VolumeTint,info);
        }

      });
  		this.setState({
  			showVolumeTint: false,
  		});
  }

  loadVolume(){
    //先从内存获取，如果没有从文件获取，如果没有获取到，则发送接口请求获取


    Device.getDeviceWifi().callMethod('get_prop',{}).then((response) => {

      if((response.code==0)&&(response.result!=undefined)&&(response.result.current_volume)){
        this.volume=response.result.current_volume;
        this.setState({volume:response.result.current_volume});

      }else{

        Host.file.readFile(Service.account.ID + '===' + Device.deviceID + '::volume').then((content)=>{
          
            if((content != '')&& (content!=undefined) && (content!='undefined')) {
              this.volume=content;
              this.setState({volume:content});
            }else{
              // 刚进来的时候 判定收音机状态
              Device.getDeviceWifi().callMethod('get_prop',{}).then((json2) => {
                  
                  if((json2.code==0)&&(json2!=null)){
                    this.volume=json2.result.current_volume;
                    this.setState({volume:this.volume});
                    Host.file.writeFile(Service.account.ID + '===' + Device.deviceID + '::volume', "" + json2.volume ).then((success)=>{});
                  }
              }).catch(error=>{
                console.log('error-1444-'+JSON.stringify(error));
              });
            }
    
        });
      }


    }).catch(error=>{
      console.log('error-1426 -'+JSON.stringify(error));
    });

  }

  loadClocks(){

    Device.getDeviceWifi().callMethod('get_alarm_clock', {start:this.start}).then((json) => {
           
      if ((json.code==0) && json.result!= undefined && json.result.clocks != undefined) {

               var clocks = json.result.clocks;
               for(var k=0; k<clocks.length; k++){
                  
                  var tmp = clocks[k];
                  if(tmp.action == 'pause' && (tmp.tag ==10||tmp.tag ==20||
                  tmp.tag ==30||tmp.tag ==60||tmp.tag ==90||tmp.tag ==120)) {
                     this.clockData = tmp;
                     if(this.clockData.enable=='true'){//定时关闭打开
                        this.opened=true;
                        this.setState({opened:true,});

                      }else if(this.clockData.enable=='false') {
                        
                        this.opened=false;
                      }
                      var now = new Date().getTime() / 1000;
                      var unixTimestamp = tmp.next;
                      var left = (unixTimestamp - now) * 1000;
                      if(left > 0){}
                     break;
                  }
               }

               if(this.clockData.id != undefined){
                 this.id = this.clockData.id;
                 return;
               }

               if(clocks.length >= 5 ) {
                  this.start += 5;
                  this.loadClocks();
               }
           }
    }).catch(error=>{
      console.log('error-1495 -'+JSON.stringify(error));
    });

  }

  openActionSheet(){
   if(this.opened){

    Alert.alert(
      'Alert Title',
      '请选择需要的操作',
      [
        {text: '音乐闹钟', onPress: () => this.sheetBtnHandler(0)},
        {text: '10分钟后停止播放', onPress: () => this.sheetBtnHandler(1)},
        {text: '20分钟后停止播放', onPress: () => this.sheetBtnHandler(2)},
        {text: '30分钟后停止播放', onPress: () => this.sheetBtnHandler(3)},
        {text: '60分钟后停止播放', onPress: () => this.sheetBtnHandler(4)},
        {text: '90分钟后停止播放', onPress: () => this.sheetBtnHandler(5)},
        {text: '120分钟后停止播放', onPress: () => this.sheetBtnHandler(6)},
        {text: '取消一段时间后停止播放', onPress: () => this.sheetBtnHandler(7)},
        {text: '取消', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
      ],
      { cancelable: false }
    );

   }else{


    Alert.alert(
      'Alert Title',
      '请选择需要的操作',
      [
        {text: '音乐闹钟', onPress: () => this.sheetBtnHandler1(0)},
        {text: '10分钟后停止播放', onPress: () => this.sheetBtnHandler1(1)},
        {text: '20分钟后停止播放', onPress: () => this.sheetBtnHandler1(2)},
        {text: '30分钟后停止播放', onPress: () => this.sheetBtnHandler1(3)},
        {text: '60分钟后停止播放', onPress: () => this.sheetBtnHandler1(4)},
        {text: '90分钟后停止播放', onPress: () => this.sheetBtnHandler1(5)},
        {text: '120分钟后停止播放',onPress: () => this.sheetBtnHandler1(6)},
        {text: '取消', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
      ],
      { cancelable: false }
    );


  }

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


  render() {

        if(this.state.netInfo == 'none' || this.state.netInfo == 'unknown'){          
            return <NoWifiView />
        }
        if (!this.state.loaded) {
            return <LoadingView style={{flex:1}}/>
        }
        var showVolumeTintView = <View/>;
        if(this.state.showVolumeTint){
            showVolumeTintView = (	
            <TouchableWithoutFeedback onPress={()=>{this.closeVolumeTint()}}>
                  <View style={styles.vtint}>
                      <ImageBackground style={styles.vtintImg} source={require('../../Resources/volumeTint.png')} resizeMode='stretch'/>
                      <Text style={styles.vtingText}></Text>
                  </View>
            </TouchableWithoutFeedback>  );
        }

        
        //电量
        if( Device.model!=Constants.DeviceModel.v601){
          var batteryView =  <ImageBackground style={styles.battery} source={this.getBatteryPic(this.state.battery)}></ImageBackground>  
        }

        //是否有闹钟
        var clockSource = (this.state.opened)?(require('../../Resources/playAlarm.png')):(require('../../Resources/playAlarm_down.png'));
        var touchable = false;
        var thumbSource = '';
        var title='';
        var program = '';
        var progressStr = '';
        var totalProgressStr = '';
        var slideValue = 0;
        var listSource;
        var listTextStyle=Constants.TextColor.rgb255;
        var listView=null;
        var styleMarginRight=null;
        var opacity = 1.0;
        
            // MHPluginSDK.dismissTips();
        if(this.state.allInfo.type == 0||this.state.allInfo.type == Constants.Channels_Type.M3U8_TYPE) {


              thumbSource = this.state.allInfo.radioInfo.cover_url_large;
              title= this.state.allInfo.radioInfo.radio_name;
              program = this.state.allInfo.radioInfo.program_name;

              if( this.state.allInfo.radioInfo.program_name == '') {
                  program = '暂无节目单';
              }

              listSource = require('../../Resources/list_disable.png');
              listTextStyle= 'rgb(168,168,168)';
              opacity = 0.4;

              if(this.state.allInfo.startTime != '') {

                if (this.state.allInfo.endTime == '00:00') {
                  this.state.allInfo.endTime = '24:00';
                }

                var current = new Date();
                var totalLength =  Constants.DateUtils.getSecondsBetween(this.state.allInfo.startTime, this.state.allInfo.endTime);
                var currentLength = Constants.DateUtils.getSecondsBetween(this.state.allInfo.startTime, current.getHours() + ':' + current.getMinutes());
                slideValue = currentLength / totalLength;
                progressStr = Constants.DateUtils.transformProgress(currentLength);
                totalProgressStr = Constants.DateUtils.transformProgress(totalLength);
              }
              styleMarginRight={marginRight:0};
              
        } else {

          styleMarginRight={marginRight:67/2};
          listView=(<TouchableBtn imgStyle={styles.prevAndNexPlay1} 
                      pressInSource={require('../../Resources/playlist_down.png')}
                      pressOutSource={require('../../Resources/playlist.png')}
                      onPress={()=>{this.onListBtnPressHandler()}}/>);
            touchable = true;

            thumbSource = this.state.allInfo.albumInfo.cover_url_large;
            title = this.state.allInfo.albumInfo.album_title;
            program = this.state.allInfo.trackInfo.track_title;
            progressStr = Constants.DateUtils.transformProgress(this.state.allInfo.trackProgress);
            totalProgressStr = Constants.DateUtils.transformProgress(this.state.allInfo.trackInfo.duration);
            slideValue = this.state.allInfo.trackProgress / this.state.allInfo.trackInfo.duration;

            if((isNaN(slideValue))||(slideValue ==undefined)) slideValue =0;
            if(slideValue >= 1) slideValue = 0;
            listSource = require('../../Resources/play_list.png');

        }

        if(title && title.length > 14) {
            title = title.substr(0, 14) + '...';
        }

        if(program && program.length > 14) {
            program = program.substr(0, 14) + '...';
        }
        
        var favorSource = this.state.allInfo.favored? require('../../Resources/playCollected.png') : require('../../Resources/playCollection.png');
        var pressInSource = (this.state.allInfo.playing)?(require('../../Resources/play_pause_down.png')):(require('../../Resources/play_page_play_down.png'));
        var pressOutSource = (this.state.allInfo.playing)?(require('../../Resources/play_pause.png')):(require('../../Resources/play_page_play.png'));

        var volumeView = null;
        if(this.state.panning) {
            volumeView = (
                <View style={styles.top2}>
                    <ImageBackground style={styles.volume} source={require('../../Resources/volume.png')} resizeMode='stretch'>
                          <View style={styles.volumeProgress}>
                                <View style={[styles.volumep, this.state.styleH]} />
                          </View>
                    </ImageBackground>
                </View>
            );
        }
      //音量百分比
      var volumeText='音量调节';
      if(this.state.showVolume){
        var volumePercent=parseInt(this.state.volume/31*100);
        volumeText='音量调节  '+volumePercent+'%';
      }
    
        return  (
            <View   style={styles.top} >
                    <LoadingDialog 
                      title={this.state.message}
                      cancelable={true}
                      timeout={3000}
                      onDismiss={() => {
                        this.setState({visLoading: false});
                      }}
                      visible={this.state.visLoading}
                    />
                    <View style={styles.circle}>
                        <ImageBackground style={styles.playThumbBack}   imageStyle={{borderRadius:(ImageHeight-20)/2,}} source={require('../../Resources/holder_large.png')} resizeMode='stretch' >
                            <ImageBackground ref={component => this.thumb = component} imageStyle={{ borderRadius:(ImageHeight-20)/2,}}  style={styles.playThumb} source={{uri:thumbSource}} resizeMode='stretch'>
                            </ImageBackground>
                        </ImageBackground>
                  </View>
                  <View style={{height:34,justifyContent:'center'}}>
                  {batteryView}
                  </View>
                  <View>
                    <Label ref={component => this.title = component} style={{width:220}} textStyle={styles.title} text={title}/>
                    <Label ref={component => this.program = component} textStyle={styles.program} text={program} />
                  </View>
                  <View style={[styles.btnContainer,styles.marginTop]}>
                        <TouchableBtn
                            imgStyle={styles.prevAndNexPlay} 
                            pressInSource={ require('../../Resources/prev_down.png')}
                            pressOutSource={ require('../../Resources/prev.png')}
                            onPress={()=>{this._onPressHander(0)}} />

                        <TouchableBtn
                            ref={component => this.playBtn = component}
                            imgStyle={[styles.centerPlay,{marginLeft:15,marginRight:15}]} 
                            pressInSource={pressInSource}
                            pressOutSource={pressOutSource}
                            onPress={()=>{this._onPressHander(1)}}/>

                        <TouchableBtn imgStyle={styles.prevAndNexPlay} 
                            pressInSource={require('../../Resources/next_down.png')}
                            pressOutSource={require('../../Resources/next.png')}
                            onPress={()=>{this._onPressHander(2)}}/>

                  </View>

                  <View style={{flexDirection:'row',width:screenWidth-60}}>
                  <Label style={styles.progressStart} ref={component => this.progressStart = component} text={progressStr}
                        textStyle={{color:'rgba(0,0,0,0.3)',fontSize:11,}}></Label>

                  <Label style={styles.progressEnd} ref={component => this.progressEnd = component} text={totalProgressStr}
                        textStyle={{color:'rgba(0,0,0,0.3)',fontSize:11,}}/>
                  </View>
                  <View>
                    <Slider ref={component => this.slider = component}
                        style={styles.slider}
                        value={slideValue}
                        touchable={touchable}
                        sliderLayout={this._onLayout.bind(this)}
                        thumbTintColor='#ffffff' minimumTrackTintColor='#cd3f3f' maximumTrackTintColor='rgba(0,0,0,.15)'
                        thumbStyle={{width:12, height:12, borderRadius:6,borderWidth:1/PixelRatio.get(),borderColor:'rgba(0,0,0,.15)'}}
                        onSlidingStart={()=>{this._onSliderStart()}}
                        trackStyle={{height:3/PixelRatio.get()}}
                        onSlidingComplete={(value)=>{this._onSliderComplete(value)}}/>
                  </View>
                  {/* 四个按钮的view */}
                  <View style={[styles.btnContainer1,styles.bottom]}>
                        <TouchableBtn imgStyle={[styles.prevAndNexPlay1,{marginRight:67/2}]} 
                                      pressInSource={require('../../Resources/playVoice_down.png')}
                                      pressOutSource={require('../../Resources/playVoice.png')}
                                      onPress={()=>{this.setState({visible:true})}}/>
                        <TouchableBtn ref={component => this.playBtn = component}
                                      imgStyle={[styles.prevAndNexPlay1,{marginRight:67/2}]} 
                                      pressInSource={favorSource}
                                      pressOutSource={favorSource}
                                      onPress={()=>{this.onFavorBtnPress()}}/>
                        <TouchableBtn imgStyle={[styles.prevAndNexPlay1,styleMarginRight]} 
                                      pressInSource={clockSource}
                                      pressOutSource={clockSource}
                                      onPress={()=>{this.openActionSheet()}}/>
                        {listView}
                  </View>
                  {/* 音量控制popview */}
                      <PopupDialog
                          width={screenWidth-40}
                          height={90}
                          dialogTitle={<DialogTitle title={volumeText} titleStyle={{backgroundColor:'#f7f7f7'}} titleTextStyle={{fontSize:15,color:'rgba(0,0,0,.8)'}}/>}
                          ref={(popupDialog) => { this.popupDialog = popupDialog; }}
                          dialogAnimation = { scaleAnimation}
                          visible={this.state.visible}
                          onTouchOutside={() => {
                            this.setState({ visible: false });
                          }}>
                          <View style={{backgroundColor:'#f7f7f7'}}>
                          <Slider ref={component => this.voiceSlider = component}
                              style={styles.slider1}
                              trackStyle={{height:3/PixelRatio.get()}}
                              value={parseFloat(this.state.volume/SoundMax)}
                              touchable={true}
                              disabled={false}
                              sliderLayout={this._onLayout.bind(this)}
                              thumbTintColor='rgb(255,255,255)' minimumTrackTintColor='#cd3f3f' maximumTrackTintColor={'#cccccc'}
                              onValueChange={(value)=>{this._onSliderVoiceValueChange(value)}}
                              thumbStyle={{width:14, height:14, borderRadius:7,borderWidth:1/PixelRatio.get(),borderColor:'#cccccc'}}
                              onSlidingStart={()=>{this._onSliderStartVoice()}}
                              onSlidingComplete={(value)=>{this._onSliderCompleteVoice(value)}}/>
                          </View>
                      </PopupDialog>
            </View>


        );

  }

}


var styles = StyleSheet.create({
	vtint:{
		position:'absolute',
		left:0,
		top:0,
		height: screenHeight - 64,
		width: screenWidth,
		backgroundColor:'rgba(0,0,0,0.7)',
		flexDirection:'row',
		justifyContent:'center',
	},
	vtintImg:{
		width:53,
		height:147,
		marginTop: ImageHeight-100,
	},
	vtingText:{
		color:'white',
		fontSize: 14,
		marginLeft:10,
		marginTop:ImageHeight,
	},
  favorBtn:{
    position: 'absolute',
    left:10,
    bottom:30,
  },
  listBtn:{
      position: 'absolute',
      right:10,
      marginTop:5,
  },
  title:{
    color:'#000000',
    fontSize:21,
  },
  program:{
    color:'rgba(0,0,0,.7)',
    fontSize:13,
    marginTop:10,
  },
  prevAndNexPlay:{
    width:46,
    height:46,
    borderRadius:23,
  },
  prevAndNexPlay1:{
    width:40,
    height:40,
    borderRadius:20,
  },
  centerPlay:{
    width:117,
    height:117,
    borderRadius:50.8,
    marginLeft:26.5,
    marginRight:26.5,
    marginTop:10,
  },
  btnContainer:{
    flexDirection:'row',
    justifyContent:'center',
    alignItems:'center',
    overflow:'visible',
    width:screenWidth,
  },
  btnContainer1:{
    flexDirection:'row',
    justifyContent:'center',
    alignItems:'center',
    overflow:'visible',
    paddingLeft:115/2,
    paddingRight:115/2,
    width:screenWidth,
    marginBottom:APPBAR_MARGINBOTTOM,
  },
  progressStart:{
    flex:1,
    marginLeft:0,
    alignItems:'flex-start',
  },
  progressEnd:{
    flex:1,
    marginRight:0,
    alignItems:'flex-end',
  },
  playThumb:{
    height: ImageHeight-20,
    width:  ImageHeight-20,
    alignItems:'center',
    justifyContent:'center',
  },
  playThumbBack:{
     height: ImageHeight-20,
     width:  ImageHeight-20,
     justifyContent:'center',
     alignItems:'center',
  },
   top2:{
    height:(screenHeight - 64) * 5 / 7 ,
    width:  25,
    paddingBottom:80,
    position:'absolute',
    left:10,
    top:0,
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:'transparent',
  },
  marginTop:{
    marginTop:screenHeight<570?0:12,
  },
  volume:{
     height: ImageHeight-20,
     width:  25,
     paddingTop:15,
     alignItems:'center',
     backgroundColor:'transparent',
  },
  volumeProgress:{
     height: ImageHeight-70,
     width:4,
     borderRadius:2,
     backgroundColor: 'rgb(127,127,127)',
     overflow:'hidden',
  },
   volumep:{
     position:'absolute',
     left:0,
     bottom:0,
     height: 0,
     width:4,
     backgroundColor: 'rgb(12,213,196)',
  },
   volumek:{
     position:'absolute',
     bottom:0,
     left:0,
     height: 15,
     width:15,
     backgroundColor: 'transparent',
  },
  top:{
    flex:1,
    alignItems:'center',
    alignSelf:'center',
    backgroundColor:'#f8f8f8',
    marginTop:0,
    flexDirection:'column',
  },
  slider:{
     height:10,
     width:screenWidth-60,
     marginTop:5,
     backgroundColor:'transparent',
  },
  slider1:{
    marginLeft:20,
    marginRight:20,
    backgroundColor:'transparent',
  },
  bottom:{
    justifyContent:'center',
    alignItems:'center',
    position:'absolute',
    bottom:30,
  },
  circle:{
    alignItems:'center',
    justifyContent:'center',
    width:ImageHeight,
    height:ImageHeight,
    borderColor:'rgba(205, 63, 63,0.25)',
    borderWidth:1.5/PixelRatio.get(),
    borderRadius:ImageHeight/2,
    marginTop:screenHeight<570?25:35,
  },
  battery:{
    width:13,
    height:7.5,
  },
});


module.exports = PlayPage;
