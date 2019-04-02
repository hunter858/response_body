/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

import React,{Component} from 'react';
import {
  TouchableOpacity,
  AppRegistry,
  StyleSheet,
  Text,
  View,
  PixelRatio,
  ListView,
  Image,
  Alert,
  LayoutAnimation,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Animated,
  DeviceEventEmitter,
  Easing,
  TouchableHighlight
} from 'react-native';

var THUMB_SIZE = 65; // 缩略图大小
var PLAY_THUMB_SIZE = 10; //直播缩略图中间的播放按钮大小
var TRACK_DESC_HEIGHT = 13;				//   缩略图底部专辑曲目数量描述的高度
var TRACK_DESC_COLOR = 'lightGray';
var MARGIN = 8;
var CELL_HEIGHT = MARGIN * 2 + THUMB_SIZE;// CELL高度
import Constants from '../../Main/Constants';
import {Device,DeviceEvent,Host,Package,Service} from 'miot';
import {
  APPBAR_HEIGHT,APPBAR_MARGINBOTTOM,APPBAR_MARGINTOP,isIPX ,
  ratio,NavigatorBarHeight,screenWidth,screenHeight} from '../ConstDefine';

import AlbumOrLivecastCell from '../View/AlbumOrLivecastCell';
import LoadingView from '../View/LoadingView';
import {XimalayaSDK,XMReqType} from '../Const/XimalayaSDK';
import Label from '../View/Label';



import MainTopNotice from '../View/MainTopNotice';
import NoWifiView from '../View/NoWifiView';
import FailView from '../View/FailView';
import BottomView from '../View/NewBottomView';
import {withNavigation} from 'react-navigation';



var dataStores;
let data ={};

let order =Object.keys(data); //Array of keys

var DEFAULT_PULL_DISTANCE = 80;
var DEFAULT_HF_HEIGHT = 80;
var channelId=new Array();


class DefaultMainPage extends React.Component{

  constructor(props){
    super(props);

    this.state = {
      isScroll:false,
      dataSource: new ListView.DataSource({rowHasChanged:(r1, r2) => true }),
      loaded:false,
      editing:false,
      longPressRow: -1,
      failed: false,
      failCount : 0,
      dataTmp: null,
      dataChange: false,
      cueWordBool: false, // 显示网络错误种类 false是RPC指令发送成功，true是喜马拉雅的接口问题
      hideBottomView:false,
      isRadioCf: false,
      animatedV: new Animated.Value(0),
      close:false,
      loadDataCache:false,//是否加载了缓存数据
      xmError:false,
      delete:false,
    }
  }


  componentWillMount() {

    //顶部闹铃通知是否显示
    this.setState({
      failed:false,
      loaded:false,
      xmError:false,
    });
    this.mainTopNotice();
    // 新的缓存方法进行加载
    this.newCacheLoad();
    // 按照原有方式进行加载
    this.originalLoad();


    this.radioProgresses=[];
    this.radioPrograms=[];
    this.deleteRows=[];
    this.lostCount=0; // 收音机是否断电
    this.errorInfo='';//接口错误信息
    this.radio_cf = 0;
    this.shouldShowRadioCF= true;
    this.totalprograms = 0;
  }

  componentDidMount() {

    // console.log('已经完成加载componentDidMount');
    // 可以在这里注册监听设备状态6s轮询的通知，监听前需要用registerDeviceStatusProps方法来指定轮询哪些设备属性，将会调用RPC的getProps方法与设备通信获取相应属性值

    
    this.subscription = DeviceEventEmitter.addListener(
      'ChannelsChangeEvent',
      (notification) => {
        this.loadPrograms();
      }
    );

    this.subscription2 = DeviceEventEmitter.addListener(
      'ChannelsSortChangeEvent',
      (notification) => {
          this._deleteBtnPressHandler(0);//取消编辑状态
          this.loadPrograms();
      }
    );

    this.timer = setInterval(()=>{
      this._getRadioProps()
    }, 6000);
    //定时器  
    this.countDownTimer = setTimeout(() => {
        this.setState({close:true,})
      },
      1000*10
    );

  }

  componentWillUnmount() {
    this.subscription2.remove();
    this.subscription.remove();
    this.timer && clearTimeout(this.timer);
    this.countDownTimer && clearTimeout(this.countDownTimer);
    // 缓存节目
    this.cacheDataOnce();
  }

  mainTopNotice(){

    Host.file.readFile(Service.account.ID + '===' +  Device.deviceID + '::MainTopNotice')
    .then((content) => {
      if (content != null&&content=='close') {
        this.setState({close:true});
      }else{
        this.setState({close:false});
      }
    });
  }

  newCacheLoad() {

    Host.file.readFile(Service.account.ID + '===' + Device.deviceID + 'cacheDataSource').then((content) => {
          
      
      if (content != null) {
            // js中字符串转对象
            if(content!=''){
              var dataCache = JSON.parse(content);
            }else{
              var dataCache=content;
            }
            if (dataCache._dataBlob == null) {
              this.setState({loadDataCache:false,});//是否加载了缓存数据
              this.originalLoad();
            }
            else {
              //设置dataStores,
              //从本地获取的数据如果全部为下架的节目，则不显示，直接请求接口数据；

                if(this.isAllUndercarriage(dataCache._dataBlob.s1)){

                  this.setState({loadDataCache:false,});//是否加载了缓存数据
                  this.originalLoad();
                }else{

                  this.setDataStores(dataCache._dataBlob.s1);
                  this.radioPrograms=dataCache._dataBlob.s1;
                  this.setState({
                    failed: false,
                    loaded: true,
                    loadDataCache:true,//是否加载了缓存数据
                    dataSource: this.state.dataSource.cloneWithRows(dataCache._dataBlob.s1),
                  });
                }
            }
        }

    }).catch((error)=>{
      console.log('error---'+ JSON.stringify(error));
    });

  }

  //从文件获取到节目列表，DataStores处理为{[{id:111,t:1}]}
  setDataStores(data){
    var DataStores=[];
    for(var i=0;i<data.length;i++){
      if(data[i].type==0||data[i].type==4){
        var temp={};
        temp.id=data[i].radioInfo.id;
        temp.t=data[i].type;
      }else if(data[i].type==1){
        var temp={};
        temp.id=data[i].albumInfo.id;
        temp.t=data[i].type;
      }
      DataStores.push(temp);
    }
    dataStores=DataStores;
  }

  originalLoad() {

     this.i = 0;
     this.radioProgresses = [];
     this.radioPrograms = [];
     this.shouldShowRadioCF = true;
     this.lostCount = 0;
     this.setState({
        loaded:false,
        failed:false,
        xmError:false,
        data:[],
     });

    this.doNormalLoadProcess();
  }

  // 不是第一次配置收音机的时候进行常规加载
  doNormalLoadProcess(){

      // console.log('常规加载开始');

      // 获取系统音量信息
      //获取收音机中的播放进度
      // 问题的原因，调小米的SDKget_all_progress时候返回失败，是与收音机的网络断开了么？？？？？？
      // 能否先进行网络判断，然后根据网络判断来进行和收音机的交互
      Device.getDeviceWifi().callMethod("get_all_progress", {}).then((json) => {

  
          if (json.code==0) {
            if(json.result == undefined || json.result.progresses == undefined) {
                return
            };
            this.radioProgresses = json.result.progresses;
          } 
          this.loadRadioChannels();

      }).catch(error=>{
        console.log('error339' +JSON.stringify(error));
      });
  }

  // 调用数据源数组产生方法
  resortPrograms(programs){

      var result = [];
      this.state.data=[];
    	for(var i=0; i<dataStores.length; i++){
        var findProgram=false;//是否匹配上节目，每次循环初始化为false;
    	 	var tmp = dataStores[i];
    	 	var type = tmp.t;
    	 	var id = tmp.id;
    	 	for(var j=0; j<programs.length; j++){
    	 		var tmp = programs[j];
    	 		var channelType = tmp.type;
          if(channelType==Constants.Channels_Type.M3U8_TYPE){
            var channelId =tmp.radioInfo.id;
          }else{
            var channelId = tmp.type == 0 ? tmp.radioInfo.id : tmp.albumInfo.id;
          }
          if(channelId == id && channelType == type) {//未下架的节目
            findProgram=true;
            result.push(tmp);
            this.state.data.push(tmp);
            break;
          }
    	 	}
        if(!findProgram){//下架的节目
            if(type==0){//直播节目未下架
              var radioInfo={};
              radioInfo.id=id;
              radioInfo.radio_name='';
              var tempZB={
                 type: 0,
                 radioInfo: radioInfo,
                 startTime: '00:00',
                 endTime: '23:59',
               };
              result.push(tempZB);
              this.state.data.push(tempZB);
            }else if(type==1){//点播节目下架
              var albumInfo={};//track_title
              albumInfo.id=id;
              albumInfo.album_title='';
              var trackInfo={};
              trackInfo.track_title='';
              var tempDB={
                   type: 1,
                   albumInfo:albumInfo,
                   trackInfo: trackInfo,
                   trackProgress: 0,
               };
              result.push(tempDB);
              this.state.data.push(tempDB);
            }
        }
      }
      return result;
  }

  // 加载收音机频道的方法
  loadRadioChannels(){

        // console.log('加载收音机频道开始');
        // 权限的只读分享 这是device的一个属性 “isShareReadonly”，可以用getDevicePropertyFromMemCache来读
        //从收音机中获取所有节目列表
        Device.getDeviceWifi().callMethod("get_channels",{"all":0}).then((json) => {

           if ((json.code==0) && json.result != undefined && json.result.chs != undefined && json.result.chs.length > 0) {
                // alert("成功：从收音机获取频道" + JSON.stringify(json.result.chs));
                var chs = json.result.chs;
                var filter = [];
                //去重
                for(var m=0; m<chs.length; m++){
                   var isRepeated = false;
                   var t1 = chs[m];
                   for(var n=0; n<filter.length; n++){
                      var t2 = filter[n];
                      if(t1.id == t2.id && t1.t == t2.t){
                      
                      isRepeated = true;
                      Device.getDeviceWifi().callMethod("remove_channels",{"tens":[t1]}).then((json) => {

                      }).catch(error=>{
                        console.log('error498' +JSON.stringify(error));
                      });
                      break;
                      }
                   }

                   if(!isRepeated){
                     filter.push(t1);
                   }
                }
                chs = filter;

                //缓存收藏列表数据
                //保存到文件 节目{[id:123456,t:0,id:123456,t:0]}
                Host.file.writeFile(Service.account.ID + '===' + Device.deviceID + 'channelsIdAndType',JSON.stringify(chs)).then((json) => {});
                this.loadPrograms();

           } else {
              //  console.log("失败:通过RPC从收音机获取频道");
               if(this.i > 5) {
                    this.i = 0;
                    this.setState({failed: true,loaded: true,cueWordBool: false,});
               } else {
                  this.i++;
                  this.loadRadioChannels();
              }
           }

        }).catch(error=>{
          console.log('error532' +JSON.stringify(error));
        });
  }

  // 更新状态
  updateState(){

        //  console.log('正在进行状态更新剩余的请求数据' + this.totalprograms + '====' + this.radioPrograms.length);
         if(this.radioPrograms.length >= this.totalprograms&&!this.isAllUndercarriage(this.radioPrograms)){

                this.setState({
                    failed: false,
                    loaded: true,
                    xmError:false,
                    editing:this.state.editing?true:false,
                    dataSource: this.state.dataSource.cloneWithRows( this.resortPrograms(this.radioPrograms)),
                    longPressRow:-1,
                  });
                if(this.state.delete){
                  this._deleteBtnPressHandler(0);
                }

                //保存到文件
                this.cacheDataOnce();
                if(this.shouldShowRadioCF) {
                  this.shouldShowRadioCF = false;
                }

          }
        // 如果所有的数据都没有请求到，显示错误界面
        if(this.totalprograms <= 0&&!this.state.loadDataCache) {
          this.setState({failed: true,loaded: true,cueWordBool: true});
          // 新的缓存
        }

  }

  //判断是否所有节目名称为空
  isAllUndercarriage(programs){
    for(var i=0;i<programs.length;i++){
      if(programs[i].type==0&&programs[i].radioInfo.radio_name!=''){
        return false;
      }else if(programs[i].type==1&&programs[i].albumInfo.album_title!=''){
        return false;
      }
    }
    return true;
  }

  loadPrograms(){
      // console.log('loadPrograms 开始加载工程');
      Device.getDeviceWifi().callMethod("get_channels",{"all":0}).then((result)=>{

          const channels = result.result.chs;
          if(channels != undefined){
              dataStores = channels;
              this.radioPrograms = [];
              this.totalprograms = channels.length;
              for(var i=0; i<dataStores.length; i++) {
                var tmp = dataStores[i];
                //获取专辑预览信息或者直播详情信息；
                var id = tmp.id
                var type = tmp.t;  // 0直播， 1点播  4 m3u8
                if(type == Constants.Channels_Type.M3U8_TYPE){
                  var text='M3U8 自定义电台';
                  Host.file.readFile(Service.account.ID + '===' + Device.deviceID + '::M3U8_NAME'+':'+id)
                  .then((content)=>{

                      if(content != '') {
                        text =String(content);
                      }
                      var temp={};
                      temp.id=id;
                      temp.radio_name=text;
                      temp.program_name='';
                      temp.cover_url_large= require('../../Resources/m3u8_cover.png');
                      temp.rate64_aac_url='http://live.xmcdn.com/live/1065/64.m3u8';
                      this.radioPrograms.push({
                         type: Constants.Channels_Type.M3U8_TYPE,
                         radioInfo:temp,
                         startTime: '00:00',
                         endTime: '23:59',
                    });
                    this.updateState();
                  });

                }
                else if(type == 0) {// 根据点播或者直播从喜马拉雅请求数据
                          //获取直播电台信息
                     
                          XimalayaSDK.requestXMData(XMReqType.XMReqType_LiveRadioByID,{ids:id+''}, (result, error) => {
                          
                            if(!error && result != undefined && result.radios != undefined && result.radios.length > 0) {
                               //获取当前直播节目的直播时间
                               var radioInfo = result.radios[0];
                               if(radioInfo == undefined){
                               	 var item = {
                              	  	id: id,
                              	  	t:0,
                              	  };

                                  this.totalprograms--;                                  
                                  this.updateState();

                                  return;
                               }

                                XimalayaSDK.requestXMData(XMReqType.XMReqType_LiveSchedule, {radio_id: radioInfo.id}, (result2, error2) => {

                                  // console.log('喜马拉雅的二级回调');
                                  if(!error2 && radioInfo.schedule_id != undefined && result2 != undefined && result2.length > 0) {

                                    for(var j=0; j<result2.length; j++){
                                      var xprogram = result2[j];
                                      if (xprogram.id == radioInfo.schedule_id) {
                                         // 直播数据
                                        this.radioPrograms.push({
                                          type: 0,
                                          radioInfo: radioInfo,
                                          startTime: xprogram.start_time,
                                          endTime: xprogram.end_time,
                                        });
                                        this.updateState();
                                      }
                                    }
                                  } else {

                                       this.radioPrograms.push({
                                          type: 0,
                                          radioInfo: radioInfo,
                                          startTime: '00:00',
                                          endTime: '23:59',
                                        });
                                        this.updateState();
                                  }

                                });

                            } else { // 如果存在错误或者没有数据，就删除
                              if(error&&error.error_no&&error.error_desc){
                                this.errorInfo='error_no:'+JSON.stringify(error.error_no)+'  '+JSON.stringify(error.error_desc);
                                this.state.xmError=true;
                                this.state.failed=true;
                              }
                                 this.totalprograms--;
                                 this.updateState();
                            }

                          });

                          

                }
                else {//点播

                        XimalayaSDK.requestXMData(XMReqType.XMReqType_AlbumsBatch, {ids: id + ''}, (result, error) => {
                          var tmpId=id;

                          if(!error  && result!= undefined && result != null && result.length > 0) {


                              var albumInfo = result[0];
                              if(albumInfo == undefined || albumInfo.id <= 0){

                              	  var item = {
                              	  	id: id,
                              	  	t:1,
                              	  };
                                  this.totalprograms--;

                                  this.updateState();
                                  return;
                              }

                              var trackProgress = -100;
                              //检查是否有播放进度
                              for(var k=0; k<this.radioProgresses.length;k++) {
                                   var tmp = this.radioProgresses[k];
                                   if(Boolean(albumInfo.id) && tmp.id == albumInfo.id && tmp.sub != 0) {
                                      trackProgress = tmp;
                                      break;
                                   }
                              }

                              if(trackProgress > 0 ){    //  如果有播放进度
                                  XimalayaSDK.requestXMData(XMReqType.XMReqType_TracksBatch, {ids: trackProgress.sub + ''}, (result, error) => {

                                    if(!error && result.tracks != undefined && result.tracks.length > 0){
                                         if(result.album_id <= 0 || result.tracks[0].id <= 0) {
                                               this.totalprograms--;
                                                this.updateState();
                                              return;
                                            }


                                        // 声音数据

                                        this.radioPrograms.push({
                                          type: 1,
                                          albumInfo: albumInfo,
                                          trackInfo: result.tracks[0],
                                          trackProgress: trackProgress.progress,
                                        });
                                        this.updateState();


                                    } else {
                                              XimalayaSDK.requestXMData(XMReqType.XMReqType_AlbumsBrowse,
                                                 {album_id:albumInfo.id, count: 1, page: 1,sort:'desc'},
                                                 (result, error) => {

                                                  if(!error && result.tracks != undefined && result.tracks.length > 0){
                                                      if(result.album_id <= 0 || result.tracks[0].id <= 0) {
                                                         this.totalprograms--;
                                                          this.updateState();
                                                        return;
                                                      }


                                                       this.radioPrograms.push({
                                                            type: 1,
                                                            albumInfo: albumInfo,
                                                            trackInfo: result.tracks[0],
                                                            trackProgress: 0,

                                                        });

                                                      this.updateState();


                                                  }else {

                                                      this.totalprograms--;
                                                      this.updateState();
                                                  }

                                              });
                                    }

                                });

                              } else { //获取专辑中第一条声音信息

                                    XimalayaSDK.requestXMData(XMReqType.XMReqType_AlbumsBrowse,
                                       {album_id:albumInfo.id, count: 1, page: 1,sort:'desc'},
                                       (result, error) => {

                                        if(!error && result.tracks != undefined && result.tracks.length > 0){

                                            if(result.album_id <= 0) {
                                              this.totalprograms--;
                                              this.updateState();
                                              return;
                                            }


                                            this.radioPrograms.push({
                                                type: 1,
                                                albumInfo: albumInfo,
                                                trackInfo: result.tracks[0],
                                                trackProgress: 0,
                                            });

                                          this.updateState();

                                        }else {
                                            this.totalprograms--;
                                            this.updateState();
                                        }

                                    });
                              }

                          } else {
                            if(error&&error.error_no&&error.error_desc){
                              this.errorInfo='error_no:'+JSON.stringify(error.error_no)+'  '+JSON.stringify(error.error_desc);
                              this.state.xmError=true;
                              this.state.failed=true;
                            }

                            this.totalprograms--;
                            this.updateState();
                          }
                        });

                      
                }

          }

          } 
          else {
              if(!this.state.failed)this.loadPrograms();
          }

      }).catch(error=>{
        this.setState({loaded:true});
        console.log('error-845 -'+JSON.stringify(error));
      });
  }

  _getRadioProps(){

    Device.getDeviceWifi().callMethod('get_prop',{}).then((json) => {

          if (json.result != undefined) {

             if(this.lostCount > 0) {
                this.lostCount = 0;
             }
             var radioProps = json.result;
             DeviceEventEmitter.emit(Constants.Event.radio_props, {data : radioProps});
            
          }

          if((json.code!=0) && this.lostCount < 10) {
              this.lostCount++;
          }
    }).catch(error=>{
      this.lostCount++;
      console.log('error876' +JSON.stringify(error));
    });
  }

  cacheDataOnce(){
    // 如果非空，写入到文件
    if (this.state.dataSource._dataBlob != null) {
      // console.log('现在数据源为空，这个时候不进行存储');
      // 这时候进行文件写入

      Host.file.writeFile(Service.account.ID + '===' + Device.deviceID + 'cacheDataSource',JSON.stringify(this.state.dataSource))
      .then((json) => {
        // console.log('终于缓存成功了');
      });

    }

  }

  //首页长按时调用
  _onLongPress(rowData) {
    if (this.state.editing||this.radioPrograms=='') { return };

    if(this.state.isScroll == true) { return};

    var id = -1;
    if(rowData.type==Constants.Channels_Type.M3U8_TYPE){
      id=rowData.radioInfo.id;
    }else{
      var isAlbum = (rowData.type == 0 ? false : true);
      if(isAlbum) {
      	id = rowData.albumInfo.id;
      } else {
      	id = rowData.radioInfo.id;
      }
    }

    this.deleteRows.push({
    	t: rowData.type,
    	id: id,
    });

     LayoutAnimation.linear();
     this.setState({
        failed: false,
        editing: true,
        dataSource: this.state.dataSource.cloneWithRows(this.resortPrograms(this.radioPrograms)),
        longPressRow: id,
     });

    // 发送事件通知底部bottomView 隐藏
    DeviceEventEmitter.emit('hideBottomView', {});
  }

  //长按一行时调用 新所有要删除的rows
  _toggleRowSelectStatus(rowData) {
    /*
        type: 1,
          albumInfo: albumInfo,
          trackInfo: result.tracks[0],
          trackProgress: 0,

        type: 0,
          radioInfo: radioInfo,
          startTime: xprogram.start_time,
          endTime: xprogram.end_time,

        {params:{tens:[{id:id, t:1}]}},

    */
    var itemId = (rowData.type == 0||rowData.type==4 )? rowData.radioInfo.id : rowData.albumInfo.id;
    var item = {
      t: rowData.type,
      id: itemId,
    };

    var index = -1;
    //检查是否已经存在
    for (var i=0; i<this.deleteRows.length; i++) {
      var tmp = this.deleteRows[i];
      if (tmp.id == itemId) {
        index = i;
        break;
      }
    }

    if(index >= 0) {
      this.deleteRows.splice(index, 1);
    } else {
      this.deleteRows.push(item);
    }

    if(this.refs.deleteBtn) {
      this.refs.deleteBtn.changeDisableState(this.deleteRows.length > 0 ? false : true, this.deleteRows.length);
    }

  }

  //排序
  _sortChannels(){
    this.props.navigation.navigate('NewSortProgram', {
      title: '排序节目',
    });
  }

  // 按下 取消或者删除 按钮  0－取消按钮
  _deleteBtnPressHandler(index) {
    
    if (index == 0) {

      this.deleteRows = [];
      LayoutAnimation.linear();
      this.refs.deleteBtn.changeDisableState(true, 0);
      this.setState({
          failed: false,
          editing: false,
          dataSource: this.state.dataSource.cloneWithRows(this.resortPrograms(this.radioPrograms)),
          longPressRow:-1,
      });
      //通知显示底部隐藏的bottomView
      DeviceEventEmitter.emit('showBottomView',{});
      this.state.delete=false;

    } else {

      if(this.deleteRows.length >= this.radioPrograms.length) {

      		Alert.alert(
            '提示',
            '收音机中应至少保留一个节目',
            [
              {text: '确认', onPress: () => {}, style: 'cancel'},
            ]
          );

			return;
	  }


    // MHPluginSDK.showLoadingTips("正在删除,请稍候...");
    Device.getDeviceWifi().callMethod("remove_channels",{"params":{"tens":this.deleteRows}}).then((json) => {


       if (json.code==0) {
          //从收音机中获取所有节目列表
          Device.getDeviceWifi().callMethod("get_channels",{"all":0}).then((result)=>{
                
                const channels = result.result.chs;
                if(channels != undefined){

                    var oldChannels = channels;
                    var newChannels = [];
                    for(var k=0; k<oldChannels.length; k++) {
                        var tmp = oldChannels[k];
                        var founded = false;

                        for(var j=0; j<this.deleteRows.length; j++){
                            var tmp2 = this.deleteRows[j];
                            if(tmp2.id == tmp.id && tmp2.t == tmp.t){
                              founded = true;
                              break;
                            }
                        }
                        if(!founded) {
                            newChannels.push(tmp);
                        }
                    }

                   
                    this.deleteRows = [];
                    this.radioPrograms = [];
                    this.state.delete=true;
                    this.loadPrograms();
                }
          });

       }
       else {
            // MHPluginSDK.dismissTips();
            // MHPluginSDK.showFailTips("删除收藏列表失败...");
            this._deleteBtnPressHandler(0);
            LayoutAnimation.linear();
            this.setState({
                   failed: false,
                   editing: false,
                   dataSource: this.state.dataSource.cloneWithRows(this.resortPrograms(this.radioPrograms)),
                   longPressRow:-1,
            });
       }

    }).catch(error=>{
      console.log('error1163' +JSON.stringify(error));
    });


    }

  }

  _rendRow(rowData, sectionID, rowID) {

    if(rowData&&rowData.type==Constants.Channels_Type.M3U8_TYPE){//m3u8
      return(
        <AlbumOrLivecastCell key={rowID+sectionID} rowData= {rowData} 
          longPressHandler={()=>{this._onLongPress(rowData)}}
          rowPressHandler ={(rowData,index)=>{this._rowPressHandler(rowData,index)}}
          editing={this.state.editing} 
          toggleRowSelectStatus={()=>{this._toggleRowSelectStatus(rowData)}}
          longPressRow={this.state.longPressRow}
          navigator={this.props.navigator}/>
      );
    }

    return (
        <AlbumOrLivecastCell key={rowID+sectionID} rowData= {rowData} 
          longPressHandler={()=>{this._onLongPress(rowData)}}
          rowPressHandler ={(rowData,index)=>{this._rowPressHandler(rowData,index)}}
          editing={this.state.editing} 
          toggleRowSelectStatus={()=>{this._toggleRowSelectStatus(rowData)}}
          longPressRow={this.state.longPressRow}
          navigator={this.props.navigator}/>
    );
  }

  _rendSeparator(rowData, sectionID, rowID, highlightRow) {
    return (<View key={rowID+sectionID} style={styles.separator} />);
  }

  _rowPressHandler(rowData,index){

    if(index==1){
      // MHPluginSDK.showFailTips('该节目已下架');
      return;
    }
    //跳播放页

    if( rowData.type==Constants.Channels_Type.M3U8_TYPE){

      this.props.navigation.navigate('PlayPage', {
          title: '',
          type: Constants.Channels_Type.M3U8_TYPE,
          favored: true,
          radioInfo: rowData.radioInfo,
          startTime: rowData.startTime,
          endTime: rowData.endTime,
      });
      return;
    }

    var isAlbum = ( rowData.type == 0 ? false : true);

    if(!isAlbum){

      this.props.navigation.navigate('PlayPage', {
        title: '',
        type: 0,
        favored: true,
        radioInfo: rowData.radioInfo,
        startTime: rowData.startTime,
        endTime: rowData.endTime,
      });

      return;

    } else {


      this.props.navigation.navigate('PlayPage', {
        title: '',
        type: 1,
        favored: true,
        albumInfo: rowData.albumInfo,
        trackInfo: rowData.trackInfo,
        trackProgress:0,
        trackProgress2: rowData.trackProgress,
      });

      return;


    }
  }

  onRefresh(){

    //获取收音机中的播放进度
    Device.getDeviceWifi().callMethod("get_all_progress",{}).then((json) => {

      this.shouldShowRadioCF = false;

      if (json.code==0) {

          if(json.result == undefined){
            return;
          }

          this.radioProgresses = json.result.progresses;
          this.loadPrograms();
      } else {
          //MHPluginSDK.showFailTips("获取收音机播放进度失败...");
          this.loadPrograms();
      };

    }).catch(error=>{
      console.log('error1237' +JSON.stringify(error));
    });
  }


  handleScroll(event) {
    this.state.isScroll = true;
  }

  _onMomentumScrollStart(){
    this.state.isScroll = true;
  }

  _onMomentumScrollEnd(){
    setTimeout(() => {
      this.state.isScroll = false;
    }, 300);
  }

  render() {

    // console.log('UI组件渲染开始');

    // 在这里对dataSource进行比对，如果有变化保存新的dataSource
    // 通过MHPluginFS.writeFile来进行写入，因为参数是个字符串直接传个字符串进去
    // MHPluginFS.writeFile();
    // 保存的字段名
    /*
    {
      "_dataBlob": null,
      "_dirtyRows": [ ],
      "_dirtySections": [ ],
      "_cachedRowCount": 0,
      "rowIdentities": [ ],
      "sectionIdentities": [ ]
    }
    */

    // MHPluginSDK.dismissTips();
    if(this.state.netInfo == 'none' || this.state.netInfo == 'unknown'){
      return <NoWifiView />
    }

    // 如果当前正在加载返回一个indicatorView
    if (!this.state.loaded) {
      return <LoadingView style={{flex:1}}/>
    }

    if(this.state.failed) {
        // 连续进入失败，失败次数加1
        this.state.failCount++;
        // console.log('记录连续点击错误次数this.state.failCount' + this.state.failCount);
        // 提示语分类提示
        var alertTextTop = '糟糕，网络不太好';
        var alertTextBottom = '请点击屏幕重试';
        if(this.state.xmError){
          alertTextTop =this.errorInfo;
          alertTextBottom = '页面加载错误,请双击Home键清空后台重试';
        }else if (this.state.cueWordBool) {
          alertTextTop = '哎呀 手机网络不太好';
          alertTextBottom = '^_^用洪荒之力点击屏幕重试一下^_^';
        } else {
          alertTextTop = '哎呀 收音机网络不太好';
          alertTextBottom = '^_^用洪荒之力点击屏幕重试一下^_^';
        }

        return(
          <View style={{flex:1}}>
                <FailView
                   onPress={this.componentWillMount.bind(this, 0)}
                   style={{flex:1, paddingBottom:65}}
                   text1={alertTextTop}
                   text2={alertTextBottom} />
          </View>
        );
    }

    var bottomView;
    if(this.state.editing) {
        bottomView = (

          <View style={styles.deleteBtnContainer}>
            <DeleteBtn  pressingSource={require('../../Resources/delete_pressing.png')}
                        normalSource={require('../../Resources/delete_normal.png')}
                        disableSource={require('../../Resources/delete_disable.png')}
                        text='取消'  index={0}
                        source={require('../../Resources/btn_sort.png')}
                        pressHandler={()=>{this._deleteBtnPressHandler(0)}}/>
            <DeleteBtn  pressingSource={require('../../Resources/delete_pressing.png')}
                        normalSource={require('../../Resources/delete_green.png')}
                        disableSource={require('../../Resources/delete_disable.png')}
                        text='删除' index={1}
                        style={{marginLeft:20}}
                        source={require('../../Resources/btn_del.png')}
                        ref='deleteBtn'
                        pressHandler={()=>{this._deleteBtnPressHandler(1)}}/>
            <DeleteBtn  pressingSource={require('../../Resources/delete_pressing.png')}
                        normalSource={require('../../Resources/delete_green.png')}
                        disableSource={require('../../Resources/delete_disable.png')}
                        text='排序' index={2}
                        style={{marginLeft:20}}
                        source={require('../../Resources/btn_sort.png')}
                        pressHandler={()=>{this._sortChannels()}}/>
          </View>

        );
    } else {
      bottomView=null;
    }

  
    // 进入正式渲染，将错误次数清空
    this.state.failCount = 0;
    var mainTopNotice=this.state.close?null:<MainTopNotice  close={()=>{this.close()}}></MainTopNotice>;
    return (
        <View style={{flex:1, paddingTop: 0}}>
        {mainTopNotice}
        {
        <ListView
          dataSource={this.state.dataSource}
          ref = {(list) => {this.list= list}}
          onScroll={(event)=>{this.handleScroll(event)}}
          onMomentumScrollStart={()=>{ this._onMomentumScrollStart();}}
          onMomentumScrollEnd={()=>{ this._onMomentumScrollEnd();}}
          automaticallyAdjustContentInsets={false}
          enableEmptySections = {true}
          style={[styles.list,{marginBottom:this.state.editing==true?70:0}]}
          initialListSize={10}
          pageSize={Constants.PageCount.size}
          renderSeparator={this._rendSeparator.bind(this)}
          renderRow={this._rendRow.bind(this)}
        />
      }
      {bottomView}
    </View>
    );
  }

  close(){

    Host.file.writeFile(Service.account.ID + '===' +Device.deviceID + '::MainTopNotice', 'close')
    .then((json)=>{

      this.setState({close:true});
    });

  }
}



//底部删除按钮
class DeleteBtn extends React.Component{


  constructor(props){
    super(props);
    this.state = {
       pressing: false,
       disable: false,
       selectedRows:0,
    }
  }


  componentWillMount() {
  }

  _togglePressingState(){

    if(this.state.disable) {
      return;
    }

    this.setState({
      pressing: !this.state.pressing,
    });

  }

  changeDisableState(enableState, selectedRows){

    this.setState({
        disable:enableState,
        selectedRows: selectedRows,
    });
  }

  _pressHandler() {

    if(this.state.disable) {
      return;
    }
    this.props.pressHandler(this.props.index);
  }

  render() {

    var imgSource;
    var textColor;
    var textbkColor = Constants.TintColor.transparent;

    if(this.state.pressing) {
      imgSource = this.props.pressingSource;
      textbkColor = Constants.TintColor.rgb229;
      if (this.props.index == 1) {
          textColor = 'rgb(26,205,199)';
      }
    } else {

      if(this.state.disable) {
        imgSource = this.props.disableSource;
        textColor = Constants.TextColor.rgb217;
      } else {
        imgSource = this.props.normalSource;
        textColor = Constants.TextColor.rgb51;
        if (this.props.index == 1) {
          textColor = 'rgb(26,205,199)';
        }
      }

    }


    var deleteText = this.props.text;
    if(this.state.deleteRows > 0) {
      deleteText += '('+ this.state.deleteRows +')';
    }

    return (
       <TouchableWithoutFeedback  onPress={()=>{this._pressHandler()}}>
           <View style={[{justifyContent:'center', alignItems:'center'},this.props.style]}  >
                 <Image   style={{height:32, width:32}} source={this.props.source}/>
                 <Label   style={{marginTop:5}} text={this.props.text} textStyle={{fontSize:12,color:'rgba(0,0,0,.5)'}}/>
           </View>
      </TouchableWithoutFeedback>
    );

  }

}


var styles = StyleSheet.create({

  modal:{
    position:'absolute',
    left:0,
    top:0,
    height: screenHeight,
    width: screenWidth,
    justifyContent: 'center',
    alignItems:'center',
    backgroundColor:'rgba(0,0,0,0.5)'
  },
  innerModal :{
    width:325,
    height:471,
    borderRadius:5,
    backgroundColor:'white',
    overflow:'hidden'
  },
  innerModal2 :{
    width:293,
    height:424,
    borderRadius:5,
    backgroundColor:'white',
    overflow:'hidden'
  },
  geerImage:{
    width:325,
    height:255,
  },
  geerView:{
    flex:1,
    alignItems:'center',
  },
   geerImage2:{
    width:293,
    height:231,
  },
  list:{
    backgroundColor:Constants.TintColor.rgb235,
    flex:1,
  },
  separator:{
    height:1/PixelRatio.get(),
    backgroundColor:'rgba(0,0,0,.1)',
  },
  header:{
    backgroundColor:Constants.TintColor.rgb255,
    height:4,
  },
  footer:{
    height:250,
    paddingTop:30,
    paddingLeft:11,
    paddingRight:11,
  },
  footerBtn:{
    flexDirection:'row',
    alignSelf:'stretch',
    alignItems:'center',
    justifyContent:'center',
    height:41,
    backgroundColor:Constants.TintColor.rgb255,
    borderRadius:5,
  },
  btnText:{
      fontSize: Constants.FontSize.fs25,
      color: Constants.TextColor.rgb127,
  },
  btnArrow:{
      marginLeft:9,
      width:15,
      height:11,
  },
  deleteBtnContainer:{
        height: 70,
        width: screenWidth,
        backgroundColor:'#f7f7f7',
        position:'absolute',
        bottom:0,
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center',
  },
  deleteBtn:{
      height:31,
      width:90,
      justifyContent:'center',
      alignItems:'center',
  },
  deleteBtnText:{
      fontSize:Constants.FontSize.fs30,
  },

     text: {
        fontSize:16,
        color:'rgb(140,140,140)',
        marginBottom:8,
    },
    image: {
        width:40,
        height:32,
    },
    container: {
      backgroundColor: 'white',
      flex: 1
    },
    standalone: {
      marginTop: 30,
      marginBottom: 30,
    },
    standaloneRowFront: {
      alignItems: 'center',
      backgroundColor: '#CCC',
      justifyContent: 'center',
      height: 50,
    },
    standaloneRowBack: {
      alignItems: 'center',
      backgroundColor: '#8BC645',
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 15
    },
    backTextWhite: {
      color: '#FFF'
    },
    rowFront: {
      alignItems: 'center',
      backgroundColor: '#CCC',
      borderBottomColor: 'black',
      borderBottomWidth: 1,
      justifyContent: 'center',
      height: 50,
    },
    rowBack: {
      alignItems: 'center',
      backgroundColor: '#DDD',
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingLeft: 15,
    },
    backRightBtn: {
      alignItems: 'center',
      bottom: 0,
      justifyContent: 'center',
      position: 'absolute',
      top: 0,
      width: 75
    },
    backRightBtnLeft: {
      backgroundColor: 'blue',
      right: 75
    },
    backRightBtnRight: {
      backgroundColor: 'red',
      right: 0
    },
    controls: {
      alignItems: 'center',
      marginBottom: 30
    },
    switchContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 5
    },
    switch: {
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'black',
      paddingVertical: 10,
      width: 100,
    },
    thumbShadow:{
  		height: 65,
  		width: 65,
  		alignItems:'center',
  		justifyContent:'center',
  		margin:8,
  		marginLeft:10,
  	},
  	thumb:{
  		height:63,
  		width:63,
  		alignSelf:'center',
  		backgroundColor:'transparent',

  	},
  	rowTextDesc:{
  		flex:1,
  		alignSelf:'stretch',
  		flexDirection:'column',
  		//alignItems:'flex-start',
  		paddingRight: 30,
  	},
  	rowTextDescTitle:{
  		marginTop:10,
  		color:Constants.TextColor.rgb51,
  		fontSize:Constants.FontSize.fs30,
  	},
  	rowTextDescTrack:{
  		marginTop:8,
  		color:Constants.TextColor.rgb127,
  		//width:250,
  		//height:14,
  		fontSize:Constants.FontSize.fs25,
  		//height:25/PixelRatio.get(),
  	},
  	rowTextDescProgress:{
  		marginTop:8,
  		color:Constants.TextColor.rgb153,
  		fontSize:Constants.FontSize.fs20,
  		//height:20/PixelRatio.get(),
  	},
  	tracKDesc:{
  		height:13,
  		width:63,
  		position:'absolute',
  		backgroundColor:Constants.TintColor.rgb0,
  		opacity:0.6,
  		bottom:0,
  		alignItems:'center',
  		justifyContent:'center',
  	},
  	trackDescText:{
  		color:Constants.TextColor.rgb255,
  		fontSize:Constants.FontSize.fs17,
  	},
  	selectImage:{
  		marginLeft: 20,
  		marginRight:13,
  		width:19,
  		height:19,
  	},
  	rowContainer:{
  		flexDirection:'row',
  		alignItems:'center',
  	},
  	listenProgress:{
  		//alignSelf:'flex-end',
  		color:Constants.TextColor.black,
  		fontSize:Constants.FontSize.small,
  	},
  	selector: {
  		width:20,
  		height:20,
  		borderWidth:1,
  		borderRadius:10,
  		justifyContent:'center',
  		alignSelf:'center',
  		marginRight:MARGIN,
  	}
});

export default withNavigation(DefaultMainPage);
