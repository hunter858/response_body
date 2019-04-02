/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

import React,{component} from 'react' ;
import {
  TouchableOpacity,
  AppRegistry,
  StyleSheet,
  Text,
  View,
  PixelRatio,
  ListView,
  Image,
  ImageBackground,
  AlertIOS,
  LayoutAnimation,
  ActivityIndicator,
  TouchableWithoutFeedback,
  DeviceEventEmitter,
  Animated,
  Easing,
  TouchableHighlight
} from 'react-native';


var MARGIN = 8;


import Constants  from '../Constants';
import {XimalayaSDK,XMReqType} from '../Const/XimalayaSDK';
import NoWifiView from '../View/NoWifiView';
import FailView  from '../View/FailView';
import LoadingView  from '../View/LoadingView';
import { TitleBarBlack,TitleBarWhite,LoadingDialog } from 'miot/ui';
import {Device,DeviceEvent,Host,Package,Service} from 'miot';
import {
  APPBAR_HEIGHT,APPBAR_MARGINBOTTOM,APPBAR_MARGINTOP,isIPX ,
  ratio,NavigatorBarHeight,screenWidth,screenHeight} from '../ConstDefine';
import SortableListView from 'react-native-sortable-listview';

var dataStores;
let data ={};



var channelId=new Array();

class NewSortPrograms extends React.Component{

  
  constructor(props){
    super(props);
    

    this.state = {
      visLoading:false,
      message:'',
      dataSource:[],
      loaded:false,
      longPressRow: -1,
      failed: false,
      failCount : 0,
      dataTmp: null,

      cueWordBool: false, // 显示网络错误种类 false是RPC指令发送成功，true是喜马拉雅的接口问题
      data:[],
      isRadioCf: false,
      animatedV: new Animated.Value(0),
    };
    
    this.radioProgresses=[];
    this.radioPrograms = [];
    this.deleteRows = [];
    this.lostCount = 0; // 收音机是否断电
    this.radio_cf  =  0;
    this.order=[];
    this.shouldShowRadioCF =  true;
    this.totalprograms= 0;
    this.i = 0;

  }

  componentWillMount() {

    // 按照原有方式进行加载
    this.loadPrograms();
  }

  componentDidMount() {
  }

  componentWillUnmount() {

    // 缓存节目
    this.cacheDataOnce();
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
      if(channelId == id && channelType == type) {
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


        //从收音机中获取所有节目列表
        Device.getDeviceWifi().callMethod("get_channels",{"all":0}).then((json) => {

          if (json.code==0 && json.result != undefined && json.result.chs != undefined && json.result.chs.length > 0) {
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
                          console.log('error-455 -'+JSON.stringify(error));
                        });
                        break;
                      }
                  }

                  if(!isRepeated){
                    filter.push(t1);
                  }
                }
                chs = filter;
                this.loadPrograms();

          } 
          else {
              console.log("失败:通过RPC从收音机获取频道");
              if(this.i > 5) {
                    this.i = 0;
                    this.setState({
                      failed: true,
                      loaded: true,
                      cueWordBool: false,
                    });
              } else {
                  this.i++;
                  this.loadRadioChannels();
              }
          }

        }).catch(error=>{
          console.log('error-574-'+JSON.stringify(error));
        });
  }

  // 更新状态
  updateState(){

        console.log('正在进行状态更新剩余的请求数据' + this.totalprograms + '====' + this.radioPrograms.length);

        if(this.radioPrograms.length >= this.totalprograms){

                this.order = Object.keys(this.radioPrograms)
                this.setState({
                      failed: false,
                      loaded: true,
                      dataSource:this.resortPrograms(this.radioPrograms),
                      longPressRow:-1,
                  });

                if(this.shouldShowRadioCF) {
                    this.shouldShowRadioCF = false;
                }

          }
        // 如果所有的数据都没有请求到，显示错误界面
        if(this.totalprograms <= 0) {
          this.setState({
            failed: true,
            loaded: true,
            cueWordBool: true,
          });
        }

  }


  loadPrograms(){

      // console.log('loadPrograms 开始加载工程');

      Device.getDeviceWifi().callMethod("get_channels",{"all":0}).then(result=>{
          
          const channels = result.result.chs;
          if(channels != undefined){
              dataStores = channels;
              this.radioPrograms = [];
              this.totalprograms = channels.length;
              for(var i=0; i<dataStores.length; i++) {
                var tmp = dataStores[i];
                // 获取专辑预览信息或者直播详情信息；
                var id = tmp.id
                var type = tmp.t;  // 0直播， 1点播 4:m3u8
                if(type == Constants.Channels_Type.M3U8_TYPE){
                  var text='M3U8 自定义电台';
                  Host.file.readFile(Service.account.ID + '===' + Device.deviceID + '::M3U8_NAME'+':'+id).then((content)=>{
                    if(content != '') {
                      text =String(content);
                    }
                    var temp={};
                    temp.id=id;
                    temp.radio_name=text;
                    temp.program_name='';
                    temp.rate64_aac_url='';
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
                          XimalayaSDK.requestXMData(XMReqType.XMReqType_LiveRadioByID, {ids: id+''}, (result, error) => {


                            if(!error && result != undefined && result.radios != undefined && result.radios.length > 0) {


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

                                this.totalprograms--;
                                this.updateState();
                            }

                          });

                } 
                else {

                        //根据id获取专辑信息
                        // id = 244842;
                        // id = 4201877;

                        // // 测试
                        // break;
                        var tempId=id;
                        XimalayaSDK.requestXMData(XMReqType.XMReqType_AlbumsBatch, {ids: id + ''}, (result, error) => {

                         

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
                                                      // MHPluginSDK.showFailTips("获取专辑预览信息失败...");
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
                            this.totalprograms--;
                            this.updateState();
                          }
                        });
                }

          }

          } else {
              if(!this.state.failed)this.loadPrograms();
          }

      }).catch(error=>{
        console.log('error-832 -'+JSON.stringify(error));
      });
  }

  cacheDataOnce(){

    // 如果非空，写入到文件
    if (this.state.dataSource._dataBlob != null) {
      // console.log('现在数据源为空，这个时候不进行存储');
      // 这时候进行文件写入
      
      Host.file.writeFile(Service.account.ID + '===' + Device.deviceID + 'cacheDataSource',JSON.stringify(this.state.dataSource)).then((content) => {
        console.log('终于缓存成功了');
      });

    }
  }

  _createParams(){
    var keyIds=this.order;
    var chs=[];
    for(var i=0;i<keyIds.length;i++){

        let item = this.state.dataSource[keyIds[i]];
        let item_id = (item.albumInfo)?(item.albumInfo.id):(item.radioInfo.id);
        var temp={'id':parseInt(item_id)};
        chs.push(temp);
    }
    return chs;
  }

  _sortChannels(){

    // MHPluginSDK.showLoadingTips('排序中...');
    var params={
      chs:this._createParams()
    };

    Device.getDeviceWifi().callMethod("sort_channels", params).then((json) => {
      // MHPluginSDK.dismissTips();
      if(json.code==0){

        //发布通知节目改变了
        DeviceEventEmitter.emit('ChannelsSortChangeEvent',{});
        // MHPluginSDK.showFinishTips('排序成功');
        this.popToLastPage();
      }else{
        // MHPluginSDK.showFailTips('排序失败');
      }
    }).catch(error=>{
      console.log('error-956 -'+JSON.stringify(error));
    });
  }

  popToLastPage(){
    this.props.navigation.pop()
  }

  _deleteBtnPressHandler(index) {

    if (index == 0) {

      this.deleteRows = [];
      LayoutAnimation.linear();
      this.refs.deleteBtn.changeDisableState(true, 0);
      this.setState({
          failed: false,
          dataSource: this.resortPrograms(this.radioPrograms),
          longPressRow:-1,
      });

    } else {

      if(this.deleteRows.length >= this.radioPrograms.length) {

          AlertIOS.alert(
        '提示',
        '收音机中应至少保留一个节目',
        [
          {text: '确认', onPress: () => {}, style: 'cancel'},
        ]
      );

      return;
    }


      // MHPluginSDK.showLoadingTips("正在删除,请稍候...");
    this.setState({message:'正在删除,请稍候...',visLoading:true});
    Device.getDeviceWifi().callMethod("remove_channels",{"tens":this.deleteRows}).then((json) => {
          
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
                  LayoutAnimation.linear();
                  this.loadPrograms();
              }
        });

      }else {
            // MHPluginSDK.dismissTips();
            this.setState({message:'删除收藏列表失败...',visLoading:false});
            // MHPluginSDK.showFailTips("删除收藏列表失败...");
            this._deleteBtnPressHandler(0);
            LayoutAnimation.linear();
            this.setState({
                  failed: false,
                  dataSource: this.resortPrograms(this.radioPrograms),
                  longPressRow:-1,
            });
      }

    }).catch(error=>{
      this.setState({message:'',visLoading:false});
      console.log('error-628 -'+JSON.stringify(error));
    });


    }

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
  // if(this.state.netInfo == 'none' || this.state.netInfo == 'unknown'){   
  //     return <NoWifiView />
  // }
  // if (!this.state.loaded) {
  //   return <LoadingView style={{flex:1}}/>
  // }


  // if(this.state.failed) {

  //     // 连续进入失败，失败次数加1
  //     this.state.failCount++;
  //     // 提示语分类提示
  //     var alertTextTop = '糟糕，网络不太好';
  //     var alertTextBottom = '请点击屏幕重试';

  //     if (this.state.cueWordBool) {
  //       alertTextTop = '哎呀 手机网络不太好';
  //       alertTextBottom = '^_^用洪荒之力点击屏幕重试一下^_^';
  //     } else {
  //       alertTextTop = '哎呀 收音机网络不太好';
  //       alertTextBottom = '^_^用洪荒之力点击屏幕重试一下^_^';
  //     }

  //     return(
  //       <View style={{flex:1}}>
  //             <FailView
  //                 onPress={this.componentWillMount.bind(this, 0)}
  //                 style={{flex:1, paddingBottom:65}}
  //                 text1={alertTextTop}
  //                 text2={alertTextBottom} />
  //       </View>
  //     );
  // }

  // 进入正式渲染，将错误次数清空
  this.state.failCount = 0;
  var bottomBtn = (
    <View style={styles.bottom}>
      <TouchableHighlight style={styles.listenBtn} onPress={()=>{this._sortChannels()}} underlayColor={'rgba(255,255,255,0.4)'}>
          <Text style={{marginTop:13,textAlign:'center',flex:1,fontSize:14,color :'rgb(255,255,255)'}}>确定</Text>
      </TouchableHighlight>
    </View>
  );
  return (

      <View style={{flex:1, paddingTop:0}}>
        <LoadingDialog 
          title={this.state.message}
          cancelable={true}
          timeout={3000}
          onDismiss={() => {
              this.setState({visLoading: false});
          }}
          visible={this.state.visLoading}/>
        <SortableListView
          style={{ flex:1,height:screenHeight-NavigatorBarHeight-BottomViewHeight }}
          data={this.state.dataSource}
          order={this.order}
          onRowMoved={e => {
            this.order.splice(e.to, 0, this.order.splice(e.from, 1)[0])
            this.forceUpdate()
          }}
          renderRow={row => <RowComponent rowData={row} />}
        />
        {bottomBtn}
      </View>
  );
  }

};


class RowComponent extends React.Component{

  render() {
    var sortIcon=<Image {...this.props.dragHandlers} style={styles.sortImage} source={require('../../Resources/sort_btn.png')} resizeMode='stretch'/>;
    //m3u8
    if(this.props.rowData.type==Constants.Channels_Type.M3U8_TYPE){
      return(
        <TouchableHighlight key={id} 
        onLongPress={this.props.longPressHandler} 
        onPress={this.props.editing?null:this._rowPressHandler}
        style={{backgroundColor: Constants.TintColor.rgb255}} 
        underlayColor={Constants.TintColor.rgb255}
        {...this.props.sortHandlers}>
          <View style={styles.rowContainer}>
                <Image style={styles.thumbShadow} source={require('../../Resources/m3u8_cover.png')} resizeMode='stretch'>
                </Image>
            <View style={styles.rowTextDesc}>
              <Text style={styles.rowTextDescTitle} numberOfLines={1}>{this.props.rowData.radioInfo.radio_name}</Text>
            </View>
            {sortIcon}
          </View>
        </TouchableHighlight>
      );
    }

    var isAlbum = (this.props.rowData.type == 0 ? false : true);


    var id = null;
    var program = null;
    var smallThumbSource = null;
    var name = null;
    var progress;
    if(!isAlbum ) {

       id = this.props.rowData.radioInfo.id;
       if(!Constants.ArrayUtils._isExistChannel(channelId,id)){
         channelId.push(id);
       }
       name = this.props.rowData.radioInfo.radio_name;
       program = this.props.rowData.radioInfo.program_name + ' 直播中';
       if(this.props.rowData.radioInfo.program_name == '') {
        program = '暂无节目单';
       }
       smallThumbSource = this.props.rowData.radioInfo.cover_url_small;

       if(name.length > 14) {
        name = name.substr(0, 14) + '...';
      }

      if(this.props.rowData.startTime != '00:00') {
        progress = <Text style={styles.rowTextDescProgress}>直播时间 {this.props.rowData.startTime} - {this.props.rowData.endTime}</Text>
      } else {
        progress = <Text style={styles.rowTextDescProgress}>{'累计收听 ' + this.props.rowData.radioInfo.radio_play_count}</Text>
      }
    } else if (isAlbum ) {
      id = this.props.rowData.albumInfo.id;
      if(!Constants.ArrayUtils._isExistChannel(channelId,id)){
        channelId.push(id);
      }
      name = this.props.rowData.albumInfo.album_title;
      smallThumbSource = this.props.rowData.albumInfo.cover_url_small;
      var text = this.props.rowData.trackInfo.track_title;
      program=text;
      if(name.length > 14) {
        name = name.substr(0, 14) + '...';
      }

      if(text.length > 14) {
        text = text.substr(0, 14) + '...';
      }

      if (this.props.rowData.trackProgress != 0) {
        progress = (
          <Text style={styles.rowTextDescProgress} numberOfLines={1}>收听进度 <Text style={{color:'rgb(31,215,208)'}}>{Constants.DateUtils.transformProgress(this.props.rowData.trackProgress)}</Text> / {Constants.DateUtils.transformProgress(this.props.rowData.trackInfo.duration)}</Text>
        );
      } else {
        progress = (
          <Text style={styles.rowTextDescProgress} numberOfLines={1}>未收听</Text>
        );
      }
    }

    if(isAlbum&&name==''&&program==''){//点播节目已下架
      return (
      <TouchableHighlight key={id} 
      onLongPress={this.props.longPressHandler} 
      onPress={this.props.editing?null:this._rowPressHandler}
      style={{backgroundColor: Constants.TintColor.rgb255}} 
      underlayColor={Constants.TintColor.rgb255}
      {...this.props.sortHandlers}>
        <View style={styles.rowContainer}>
          <Thumb ref={(component) => {this.thumbI = component}} showTrack={false} thumbSource={''}  trackText={this.props.rowData.albumInfo && this.props.rowData.albumInfo.include_track_count}/>
          <View style={styles.rowTextDesc}>
            <Text style={styles.rowTextDescTitle} numberOfLines={1}>很遗憾,该点播节目已下架</Text>
            <Text style={styles.rowTextDescTrack} numberOfLines={1}></Text>
          </View>
          {sortIcon}
        </View>
      </TouchableHighlight>);
    }else if(!isAlbum&&name==''&&program=='暂无节目单'){
      return (
      <TouchableHighlight key={id} 
        onLongPress={this.props.longPressHandler} 
        onPress={this.props.editing?null:this._rowPressHandler}
        style={{backgroundColor: Constants.TintColor.rgb255}} 
        underlayColor={Constants.TintColor.rgb255}
        {...this.props.sortHandlers}>
        <View style={styles.rowContainer}>
          <Thumb ref={(component) => {this.thumbI = component}} showTrack={false} thumbSource={''}  trackText={this.props.rowData.albumInfo && this.props.rowData.albumInfo.include_track_count}/>
          <View style={styles.rowTextDesc}>
            <Text style={styles.rowTextDescTitle} numberOfLines={1}>很遗憾,该直播节目已下架</Text>
            <Text style={styles.rowTextDescTrack} numberOfLines={1}></Text>
          </View>
          {sortIcon}
        </View>
      </TouchableHighlight>);
    }else{
      return(
        <TouchableHighlight key={id} 
        onLongPress={this.props.longPressHandler} 
        onPress={this.props.editing?null:this._rowPressHandler}
        style={{backgroundColor: Constants.TintColor.rgb255}} 
        underlayColor={Constants.TintColor.rgb255}
        {...this.props.sortHandlers}>
          <View style={styles.rowContainer}>
            <Thumb ref={(component) => {this.thumbI = component}} showTrack={false} thumbSource={smallThumbSource}  trackText={this.props.rowData.albumInfo && this.props.rowData.albumInfo.include_track_count}/>
            <View style={styles.rowTextDesc}>
              <Text style={styles.rowTextDescTitle} numberOfLines={1}>{name}</Text>
              <Text style={styles.rowTextDescTrack} numberOfLines={1}>{program}</Text>
            </View>
            {sortIcon}
          </View>
          
        </TouchableHighlight>
      )
    }
  }
}

class Thumb extends React.Component{

  constructor(props){
    super(props);
		this.state= {
			source: this.props.thumbSource?this.props.thumbSource:'',
			fuck: true,
		}
	}

	componentWillMount(){


	}

	setThumbSource(source) {
		if(this.state.source != source) {
			this.setState({
				source:  source,
				fuck: !this.state.fuck,
			});
		}

	}

	render() {

		var trackElement = null;
		var text = '共' + this.props.trackText + '集';

		if (this.props.showTrack) {

			trackElement = (
				<View style={styles.tracKDesc}>
					<Text style={styles.trackDescText}>{text}</Text>
				</View>
			);
		}


		if(this.state.fuck) {
				return (

					<ImageBackground style={styles.thumbShadow} source={require('../../Resources/holder_small.png')} resizeMode='stretch'>
						<ImageBackground style={styles.thumb} source={{uri: this.state.source}}>
							{trackElement}
						</ImageBackground>
					</ImageBackground>

				);
		} else {
				return (
					<View style={[styles.thumbShadow, {justifyContent:'center', alignItems:'center'}]}>
						<ImageBackground style={styles.thumb} source={require('../../Resources/holder_small.png')} resizeMode='stretch'>
							<ImageBackground style={styles.thumb} source={{uri: this.state.source}}>
								{trackElement}
							</ImageBackground>
						</ImageBackground>
					</View>
				);

		}

	}
}

const BottomViewHeight = 73;

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
    marginLeft:12,
    backgroundColor:Constants.TintColor.rgb243,
    opacity:0.1,
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
    justifyContent:'space-around',
    alignItems:'center',
  },
  deleteBtn:{
    height:31,
    width:90,
    justifyContent:'center',
    alignItems:'center',
  },
  deleteBtnText:{
    fontSize:24,
    color:'rgba(0,0,0,.5)',
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
    fontSize:Constants.FontSize.fs25,
  },
  rowTextDescProgress:{
    marginTop:8,
    color:Constants.TextColor.rgb153,
    fontSize:Constants.FontSize.fs20,
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
  },
  sortImage:{
    marginLeft: 20,
    marginRight:13,
    width:29,
    height:29,
  },
  bottom:{
    position:'absolute',
    paddingLeft:15,
    paddingRight:15,
    left:0,
    bottom:0,
    height: BottomViewHeight,
    width: screenWidth,
    backgroundColor:Constants.TintColor.rgb235,
    justifyContent:'center',
    alignItems:'stretch',
  },
  listenBtn:{
    alignItems:'center',
    justifyContent:'center',
    height:41,
    borderRadius:6,
    backgroundColor:Constants.TintColor.navBar,
  },
  rowcontainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1/PixelRatio.get(),
    borderColor: '#666',
    backgroundColor: '#fff',
    height:60,
  },
});

module.exports = NewSortPrograms;
