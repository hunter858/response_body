'use strict';

import React,{component} from 'react' ;
import {Device,DeviceEvent,Host,Package,Service} from 'miot';
import StatusButtonWithImg from './StatusButtonWithImg';
import Constants from '../../Main/Constants';
import PropTypes from 'prop-types';




import {
  Image,
  ImageBackground,
  ListView,
  TouchableOpacity,
  StyleSheet,
  Text,
  Animated,
  Easing,
  View,
  AlertIOS,
  TouchableWithoutFeedback,
  DeviceEventEmitter,
} from 'react-native';


var styles = StyleSheet.create({

  btnContainerStyle:{
   position:'absolute',
   right:10,
   top:0,
   width:75,
   height:82,
  },
  trackPlay:{
    height:26,
    width:26,
    borderRadius:13,
    alignSelf:'center',
    backgroundColor:'transparent',
  },
  statusBtn:{
    position:'absolute',
    right:10,
    top:28,
    width:60,
    height:24,
  },
  cell:{
      flexDirection:'row',
      height:82,
      backgroundColor:Constants.TintColor.rgb255,
      alignItems:'center',
  },
  thumb_shadow:{
      height: 60,
      width: 60,
      borderRadius:5,
      alignItems:'center',
      justifyContent:'center',
      marginLeft:12,
  },
  thumb:{
    height:60,
    width:60,
    borderRadius:5,
    backgroundColor:'transparent',
    alignSelf:'center',
    justifyContent:'center',
    alignItems:'center',
  },
  rowTextDesc:{
    flex:1,
    alignSelf:'stretch',
    flexDirection:'column',
    paddingRight:95,
    paddingLeft:15,
  },
  rowTextTop:{
    marginTop:11,
    color:'#333333',
    fontSize:Constants.FontSize.fs30,
  },
  rowTextCenter:{
    marginTop:10,
    color:'rgba(0,0,0,0.6)',
    fontSize:13,
  },
  rowTextBottom:{
    color:'rgba(0,0,0,0.6)',
    fontSize:Constants.FontSize.fs22,
  },
});

var propTypes = {
  dataId: PropTypes.number, //专辑id 或者 电台id
  onRowPress : PropTypes.func,  //废弃
  thumbSource: PropTypes.string,
  text1: PropTypes.string,
  text2: PropTypes.string,
  text3: PropTypes.string,
  favored: PropTypes.bool,
  onFavorBtnPress: PropTypes.func, // 废弃
  onPlayBtnPress: PropTypes.func,
  islive: PropTypes.bool,
};


class CommonCell extends React.Component{
  // islive 判定是不是直播，显示播放按钮


  static propTypes = propTypes
  
  constructor(props){
    super(props);
    this.state = {
      playing: false,
      thumbSource:this.props.thumbSource?(this.props.thumbSource):null,
      fuck: true,
      favored:this.props.favored?(this.props.favored): false,
    }
  }

  componentWillMount(){

  }

  onPress(value) {

    // Animated.timing(
    //     this.state.value,
    //     {
    //        toValue: 1,
    //        duration:800,

    //     },
    // ).start();

    if(this.__saving) return;
    this.__saving = true;
    var fff = this.state.favored;
    var url = this.props.islive ? this.props.radioInfo.rate64_aac_url : 'http://api.ximalaya.com/openapi-gateway-app/albums/browse';
    var type = this.props.islive ? 0 : 1;

    this.onFavorBtnPress(this.props.dataId, fff, url, type);
  }

  onFavorBtnPress(id, favored, url, type){
    if(!favored){

      var self = this;
      Device.getDeviceWifi().callMethod("get_channels",{"all":0}).then((result)=>{

            const channels = result.result.chs;
            if(channels != undefined){

                var chs = channels;
                var hFavored = false;
                for(var k=0; k<chs.length; k++){
                  var tmp = chs[k];
                  if(tmp.id == id && tmp.t == type){
                      hFavored = true;
                      break;
                  }
                }
                if(hFavored){
                  this.__saving = false;
                  return;
                }


                if(chs.length >= 35) {
                  this.__saving = false;
                  AlertIOS.alert(
                      '提示',
                      Constants.Channels.addInfo(),
                      [
                        {text: '确认', onPress: () => {}, style: 'cancel'},
                      ]
                    );

                } else {

                      var params = {
                            chs:[{
                              url: url,
                              type:type,
                              id: id,
                            }],
                          };
                    this.item = {id: id,t:type,};

                    // MHPluginSDK.showLoadingTips('加载中...');
                    Device.getDeviceWifi().callMethod('add_channels', params).then((json) => {
                      // MHPluginSDK.dismissTips();
                      this.__saving = false;
                      if(json &&json.code==0){
                        Constants.Channels.addItem(this.item);
                        self.setState({favored: true});
                      } 
                      else {
                          // MHPluginSDK.showFailTips(Constants.Channels.addFailInfo());
                      }
                    }).catch(error=>{
                      console.log('error-206 -'+JSON.stringify(error));
                    });

              }
            }
      }).catch(error=>{
        console.log('error-212 -'+JSON.stringify(error));
      });


    } else {
      Device.getDeviceWifi().callMethod("get_channels",{"all":0}).then((result)=>{

            const channels = result.result.chs;
            if(channels != undefined){
                var chs = channels;
                if(chs.length <=1) {
                    this.__saving = false;
                    AlertIOS.alert(
                      '提示',
                      Constants.Channels.deleteInfo(),
                      [
                        {text: '确认', onPress: () => {}, style: 'cancel'},
                      ]
                    );

                } else {
                      this.item = {
                        id: id,
                        t:type,
                      };
                      // MHPluginSDK.showLoadingTips('加载中...');
                      Device.getDeviceWifi().callMethod("remove_channels",{params:{tens:[{id:id, t:type}]}})
                      .then((json) => {
                        // MHPluginSDK.dismissTips();
                        this.__saving = false;
                        if(success){

                          Constants.Channels.deleteItem(this.item);
                          this.setState({favored: false});
                        }
                        else {
                          // MHPluginSDK.showFailTips(Constants.Channels.deleteFailInfo());
                        }
                      });
                }
            }
      }).catch(error=>{
        console.log('error-252 -'+JSON.stringify(error));
      });

    }

  }

  onPlayBtnPress(){
    if(!this.props.islive) return;

        this.__isfavored = 1;
        Device.getDeviceWifi().callMethod("get_channels",{"all":0}).then((result)=>{

            const channels = result.result.chs;
            if(channels != undefined){
                var chs = channels;
                for(var k=0; k<chs.length; k++){
                  var tmp = chs[k];
                  if(tmp.id == this.props.radioInfo.id){
                    this.__isfavored = 0;
                    break;
                  }
                }
            }
        }).catch(error=>{
          console.log('error-277 -'+JSON.stringify(error));
        });


        if(!this.props.islive) return;
        var localProps = {
            current_status: 'pause',
            current_player: 0,
            current_program: this.props.radioInfo.id,
        };

        var isFavor = false;
        if(!this.state.playing){

                //播放指定声音
                var params = {

                  params:{
                    url: this.props.radioInfo.rate64_aac_url,
                    type:0,
                    id: this.props.radioInfo.id,
                    try: this.__isfavored,  // xin jia
                  }

                };

                Device.getDeviceWifi().callMethod('play',params)
                .then((json) => {
                        this.setState({
                          playing: true,
                        });
                        localProps.current_status = 'run';
                        DeviceEventEmitter.emit('LocalRadioPropsEvent', {data: localProps});
                        DeviceEventEmitter.emit(Constants.Event.radio_status, {data : {status:1, trackId:this.props.radioInfo.id}});
                }).catch(error=>{
                  console.log('error-312 -'+JSON.stringify(error));
                });


      } else {

        Device.getDeviceWifi().callMethod('pause',{})
        .then((success, json) => {
            this.setState({
                playing: false,
              });
            localProps.current_status = 'pause';
            DeviceEventEmitter.emit('LocalRadioPropsEvent', {data: localProps});
            DeviceEventEmitter.emit(Constants.Event.radio_status, {data : {status:0, trackId:this.props.radioInfo.id}});
        }).catch(error=>{
          console.log('error-327 -'+JSON.stringify(error));
          });
      }

  }

  checkItemHasFavored(item) {

    Device.getDeviceWifi().callMethod("get_channels",{"all":0}).then((result)=>{

          const channels = result.result.chs;
          if(channels != undefined){
             var isfavored = false;
             var chs = channels;
             for(var k=0; k<chs.length; k++){
              var tmp = chs[k];
              if(tmp.id == item.id && tmp.t == item.t){
                isfavored = true;
                break;
              }
             }
             if(isfavored != this.state.favored){
                this.setState({favored: isfavored});
             }
          }
    }).catch(error=>{
      console.log('error-353 -'+JSON.stringify(error));
    });

  }

  componentDidMount(){

      this.subscription3 = DeviceEventEmitter.addListener('ChannelsChangeEvent', (event) => {
        Device.getDeviceWifi().callMethod("get_channels",{"all":0}).then((result)=>{

            const channels = result.result.chs;
            if(channels != undefined) {

              var item = {
                  id: this.props.dataId,
                  t: this.props.islive ? 0 : 1,
              };
              this.checkItemHasFavored(item);
            }
          }).catch(error=>{
            console.log('error-373 -'+JSON.stringify(error));
        });
      });


      if(this.props.islive) {
             this.subscription = DeviceEventEmitter.addListener(Constants.Event.radio_props, (event) => {

                var radioProps = event.data;
                if(radioProps.current_status == 'run' && radioProps.current_program == this.props.radioInfo.id) {
                      this.setState({
                         playing:true,
                       });

                } else{
                    this.setState({
                      playing: false,
                    });
                }

            });


            this.subscription2 = DeviceEventEmitter.addListener(Constants.Event.radio_status, (event) => {

              var status = event.data.status;
              var id = event.data.trackId;
              if(this.props.radioInfo.id != id) {
                  if(status==1 && this.state.playing) {
                    this.setState({playing: false,});
                  }
              }

            });
      }

  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.thumbSource!='' && nextProps.thumbSource != undefined && nextProps.thumbSource != this.state.thumbSource){

      this.setState({
         thumbSource: nextProps.thumbSource,
         fuck: !this.state.fuck,
         favored: nextProps.favored,
      });
    }
  }

  componentWillUnmount(){
      this.subscription3.remove();
        if(this.props.islive){
          this.subscription.remove();
          this.subscription2.remove();
        }

  }

  render(){
      // MHPluginSDK.dismissTips();

      var trackPlaySource = this.state.playing ? require('../../Resources/track_pause.png'):require('../../Resources/track_play.png');
      var playbtn = this.props.islive ? <Image ref='palyBtn' style={styles.trackPlay} source={trackPlaySource} /> : null;

      var tmpView = null;
      if(this.state.fuck){
          tmpView = (

                <ImageBackground style={styles.thumb_shadow} source={require("../../Resources/holder_small.png")} resizeMode='stretch'>
                      <ImageBackground style={styles.thumb} source={{uri: this.state.thumbSource}}>
                          {playbtn}
                      </ImageBackground>
                </ImageBackground>
          );
      } else {
          tmpView = (
                <View style={styles.thumb_shadow}>
                    <ImageBackground style={styles.thumb} source={require("../../Resources/holder_small.png")} resizeMode='stretch'>
                        <ImageBackground style={styles.thumb} source={{uri: this.state.thumbSource}}>
                            {playbtn}
                        </ImageBackground>
                  </ImageBackground>
                </View>
          );
      }
      var text='';

      if (this.props.text3 > 10000) {
        var w = Math.floor(this.props.text3 / 10000);
        var q = Math.floor((this.props.text3 - 10000*w) / 1000);
        if (q > 0) {
          text =w + '.' + q + '万次';
        } else {
          text = w + '万次';
        }

      } else {
        text =this.props.text3+ '次';
      }

      return (

        <TouchableOpacity onPress={this.props.onRowPress}  >
            <View style={styles.cell} onLayout={this.onLayout}>
                  <TouchableWithoutFeedback onPress={()=>{this.onPlayBtnPress()}}>
                      {tmpView}
                  </TouchableWithoutFeedback>
                  <View style={styles.rowTextDesc}>
                    <Text style={styles.rowTextTop} numberOfLines={1}>{this.props.text1}</Text>
                    <Text style={styles.rowTextCenter} numberOfLines={1}>{this.props.text2}</Text>
                    <View style={{flexDirection:'row',flex:1,alignItems:'center'}}>
                    <ImageBackground style={{marginRight:5,width:8,height:10}} source={require('../../Resources/icon_play.png')}></ImageBackground>
                    <Text style={styles.rowTextBottom} numberOfLines={1}>{text}</Text>
                    </View>
                  </View>
                  <StatusButtonWithImg
                      onPress={(value)=>{this.onPress(value)}}
                      initialStatus={this.state.favored}
                      containerStyle={{width:50,height:50}}
                      selectedImg={require('../../Resources/col_btn_selected.png')}
                      unSelectedImg={require('../../Resources/col_btn.png')}>
                  </StatusButtonWithImg>
            </View>
        </TouchableOpacity>
    );
  

  }

}


module.exports = CommonCell;
