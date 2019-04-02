'use strict';

var React = require('react-native');
var MHPluginSDK = require('NativeModules').MHPluginSDK;
// var StatusButtonWithText = require('./StatusButtonWithText');
var StatusButtonWithImg= require('./StatusButtonWithImg');
var Constants=require('../Constants.js');
// var icon_play=require('../Resources/icon_play.png');
var icon_play={isStatic:!MHPluginSDK.devMode,uri:MHPluginSDK.basePath+'icon_play@2x.png'};


var {
  Image,
  ListView,
  TouchableOpacity,
  StyleSheet,
  Text,
  Animated,
  Easing,
  View,
  PropTypes,
  AlertIOS,
  TouchableWithoutFeedback,
  DeviceEventEmitter,
  PixelRatio,
} = React;


var CommonCellNoImage = React.createClass({
  // islive 判定是不是直播，显示播放按钮
    propTypes: {
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
       // radioInfo:
    },

  //  favored: false,

    componentWillMount: function(){
  //      this.favored = this.props.favored;
        this.setState({
          thumbSource:this.props.thumbSource,
          favored: this.props.favored,
        });
    },
    // // 退出页面的时候，不能进行update
    // var unMount = false;
    // componentWillUnmount: function() {
    //   this.unMount = true;
    // },

    getInitialState: function(){

      return {
         playing: false,
         thumbSource:'',
         fuck: true,
         favored: false,


       //  value: new Animated.Value(0),

      }

    },


//      onLayout: function(e){
// console.log('>>>>>>>>>>>>>>>>>jjjkkkkk ' + JSON.stringify(e.nativeEvent));
//         this.x1 = e.nativeEvent.layout.x;
//         this.y1 = e.nativeEvent.layout.y;
//      },



    onPress: function() {

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
 //console.log('@@@@@@@@@@@@@@@@@url>>>>> ' + JSON.stringify(this.props.radioInfo));
      this.onFavorBtnPress(this.props.dataId, fff, url, type);
    },



     onFavorBtnPress: function(id, favored, url, type){
      if(!favored){

            MHPluginSDK.getDevicePropertyFromMemCache(['channels'], (result)=>{

              if(result.channels != undefined){

                 var chs = result.channels;
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
                        params:{
                              chs:[{
                                url: url,
                                type:type,
                                id: id,
                              }],
                            }
                        };

                      this.item = {
                        id: id,
                        t:type,
                      };

                      MHPluginSDK.showLoadingTips('加载中...');
                      MHPluginSDK.callMethod('add_channels', [], params, (success, json) => {
                        MHPluginSDK.dismissTips();
                        this.__saving = false;
                        if(success){
                          Constants.Channels.addItem(this.item);
                          // if (!this.unMount) {
                            this.setState({
                               favored: true,
                            });
                          // }
                        } else {
                          // if (!this.unMount) {
                            MHPluginSDK.showFailTips(Constants.Channels.addFailInfo());
                          // }
                        }
                      });

                }
              }
            });


      } else {
            MHPluginSDK.getDevicePropertyFromMemCache(['channels'], (result)=>{
              if(result.channels != undefined){
                  var chs = result.channels;
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
                        MHPluginSDK.showLoadingTips('加载中...');
                        MHPluginSDK.callMethod("remove_channels", [], {params:{tens:[{id:id, t:type}]}}, (success, json) => {
                          MHPluginSDK.dismissTips();
                          this.__saving = false;
                          if(success){
                            Constants.Channels.deleteItem(this.item);
                            //  if (!this.unMount) {
                               this.setState({
                                    favored: false,
                               });
                            //  }
                          } else {
                            // if (!this.unMount) {
                              MHPluginSDK.showFailTips(Constants.Channels.deleteFailInfo());
                            // }
                          }
                        });
                  }
              }
            });

      }

    },



    onPlayBtnPress: function(){
      if(!this.props.islive) return;

          this.__isfavored = 1;
          MHPluginSDK.getDevicePropertyFromMemCache(['channels'], (result)=>{
              if(result.channels != undefined){
                 var chs = result.channels;
                 for(var k=0; k<chs.length; k++){
                  var tmp = chs[k];
                  if(tmp.id == this.props.radioInfo.id){
                    this.__isfavored = 0;
                    break;
                  }
                 }
              }
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

                  MHPluginSDK.callMethod('play', [], params, (success, json) => {
                          this.setState({
                            playing: true,
                          });
                          localProps.current_status = 'run';
                          MHPluginSDK.sendEvent('LocalRadioPropsEvent', {data: localProps});
                          MHPluginSDK.sendEvent(Constants.Event.radio_status, {data : {status:1, trackId:this.props.radioInfo.id}});

                  });


        } else {

           MHPluginSDK.callMethod('pause', [], {}, (success, json) => {
              this.setState({
                  playing: false,
               });
              localProps.current_status = 'pause';
              MHPluginSDK.sendEvent('LocalRadioPropsEvent', {data: localProps});
              MHPluginSDK.sendEvent(Constants.Event.radio_status, {data : {status:0, trackId:this.props.radioInfo.id}});

           });
        }

    },

   checkItemHasFavored: function(item) {

      MHPluginSDK.getDevicePropertyFromMemCache(['channels'], (result)=>{

          if(result.channels != undefined){
             var isfavored = false;
             var chs = result.channels;
             for(var k=0; k<chs.length; k++){
              var tmp = chs[k];
              if(tmp.id == item.id && tmp.t == item.t){
                isfavored = true;
                break;
              }
             }
             if(isfavored != this.state.favored){
                  this.setState({
                      favored: isfavored,
                  });
             }
          }
      });

  },

    componentDidMount: function(){

       this.subscription3 = DeviceEventEmitter.addListener('ChannelsChangeEvent', (event) => {
          MHPluginSDK.getDevicePropertyFromMemCache(['channels'], (result)=>{
              if(result.channels != undefined) {

                    var item = {
                       id: this.props.dataId,
                       t: this.props.islive ? 0 : 1,
                    };
                    this.checkItemHasFavored(item);
              }
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
                        this.setState({
                          playing: false,
                        });
                    }
                }

              });
      }

  },

  componentWillReceiveProps: function(nextProps) {
    if(nextProps.thumbSource != undefined && nextProps.thumbSource != this.state.thumbSource){
     // this.favored = nextProps.favored;
      this.setState({
         thumbSource: nextProps.thumbSource,
         fuck: !this.state.fuck,
         favored: nextProps.favored,
      });
    }
  },


  componentWillUnmount: function(){
      this.subscription3.remove();
        if(this.props.islive){
          this.subscription.remove();
          this.subscription2.remove();
        }

  },



    render: function(){

        MHPluginSDK.dismissTips();

        var trackPlaySource = this.state.playing ? {isStatic:!MHPluginSDK.devMode, uri:MHPluginSDK.basePath + "track_pause.png" } : {isStatic:!MHPluginSDK.devMode, uri:MHPluginSDK.basePath + "track_play.png" };
        var playbtn = this.props.islive ? <Image ref='palyBtn' style={styles.trackPlay} source={trackPlaySource} /> : null;

        var tmpView = null;
        if(this.state.fuck){
           tmpView = (

                 <Image style={styles.thumb_shadow} source={{isStatic:!MHPluginSDK.devMode, uri:MHPluginSDK.basePath + "holder_small.png" }} resizeMode='stretch'>
                        <Image style={styles.thumb} source={{uri: this.state.thumbSource}}>
                            {playbtn}
                        </Image>
                 </Image>

           );
        } else {
            tmpView = (
                  <View style={styles.thumb_shadow}>
                     <Image style={styles.thumb} source={{isStatic:!MHPluginSDK.devMode, uri:MHPluginSDK.basePath + "holder_small.png" }} resizeMode='stretch'>
                          <Image style={styles.thumb} source={{uri: this.state.thumbSource}}>
                              {playbtn}
                          </Image>
                    </Image>
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
                     {/* <TouchableWithoutFeedback onPress={this.onPlayBtnPress}>
                          {tmpView}
                      </TouchableWithoutFeedback> */}

                       <View style={styles.rowTextDesc}>
                          <Text style={styles.rowTextTop} numberOfLines={1}>{this.props.text1}</Text>
                          <Text style={styles.rowTextCenter} numberOfLines={1}>{this.props.text2}</Text>
                       </View>
                       <StatusButtonWithImg
                            onPress={this.onPress}
                            initialStatus={this.state.favored}
                            containerStyle={{width:17,height:30,marginRight:33}}
                            selectedImg='enter_icon@3x.png'
                            unSelectedImg='col_btn@2x.png'>
                        </StatusButtonWithImg>

                  </View>
              </TouchableOpacity>

        );
    }

});


/*
     <Animated.View

                            style={{ backgroundColor:'orange',width:30, height:30, borderRadius:15,   transform: [
                                         {translateX: this.state.value.interpolate({
                                               inputRange: [0,  1],
                                               outputRange: [0, 380],
                                               easing:Easing.bezier(0.05,0.66,0,0.99),
                                          })},

                                         {translateY: this.state.value.interpolate({
                                            inputRange: [0,   1],
                                             outputRange: [0, 30],
                                             easing: Easing.linear,
                                         })}
                                     ]}}/>

*/


var styles = StyleSheet.create({

         btnContainerStyle:{

          position:'absolute',
          right:10,
          //right:-80,
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
              height:160,
              backgroundColor:'#ffffff',
              // backgroundColor:'blue',
              alignItems:'center',
              marginLeft:19/3,
              marginRight:19/3,
              borderRadius:5,
              borderWidth:1/PixelRatio.get(),
              borderColor:'gray',
           },

           thumb_shadow:{
              height: 366/3,
              width: 366/3,
              // borderRadius:5,
              alignItems:'center',
              justifyContent:'center',
              // margin:8,
              marginLeft:86/3,
           },

           thumb:{
            height:366/3,
            width:366/3,
            // borderRadius:5,
            backgroundColor:'transparent',
            alignSelf:'center',
            justifyContent:'center',
            alignItems:'center',
          },


          rowTextDesc:{

            flex:1,
            alignSelf:'stretch',
            flexDirection:'column',
            // alignItems:'center',
            justifyContent:'center',

            // paddingRight:95,
            paddingLeft:107/3,
            // backgroundColor:'orange',
          },

          rowTextTop:{
            marginTop:11,
            color:'#585858',
            fontSize:Constants.FontSize.fs32,
            //width:180,
          },

          rowTextCenter:{
            marginTop:10,
            color:'#a9a9a9',
            fontSize:12,
            //width:180,
          },

          rowTextBottom:{
            // marginTop:8,
            color:'rgba(0,0,0,0.6)',
            fontSize:Constants.FontSize.fs22,
            //width:180,
          },
 });

module.exports = CommonCellNoImage;
