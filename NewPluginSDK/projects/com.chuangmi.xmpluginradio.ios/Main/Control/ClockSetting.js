'use strict';

import React,{component} from 'react' ;
import { TitleBarBlack,TitleBarWhite,LoadingDialog } from 'miot/ui';
import {Device,DeviceEvent,Host,Package,Service} from 'miot';
import {
  APPBAR_HEIGHT,APPBAR_MARGINBOTTOM,APPBAR_MARGINTOP,isIPX ,
  ratio,NavigatorBarHeight,screenWidth,screenHeight} from '../ConstDefine';
import {XimalayaSDK,XMReqType}  from '../Const/XimalayaSDK';
import Constants  from '../../Main/Constants';
import LoadingView  from '../View/LoadingView';
import FailView  from '../View/FailView';
import ClockCell from '../View/ClockCell';
import CustomerTitleBar from '../View/CustomerTitleBar';


import {
  Image,
  ListView,
  StyleSheet,
  Text,
  View,
  Switch,
  LayoutAnimation,
  PixelRatio,
  Alert,
  DeviceEventEmitter,
  TouchableHighlight,
  PanResponder,
} from 'react-native';


var panEnable = true;


class ClockSetting extends React.Component{
    

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
                sourceRight={require('../../Resources/title/addclock.png')}
                highlightedSourceRight={require('../../Resources/title/addclock_p.png')}
                onPressRight={() => {
                    navigation.navigate('NewClockPage', {title:'新建闹铃' });
                }}/>
            </View>
        };
    };
   

    constructor(props){
      super(props);
      var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
      this.state = {
        loaded: false,
        failed: false,
        nodata: false,
        dataSource: ds,
        len:0,
        scrollEnabled: true,
      }
      this.start = 0;
      this.clocks=[];
      this.pauseclocks=[];
      this.programs=[];
    }


    componentWillMount(){
        this.start = 0;
        this.clocks = [];
        this.pauseclocks = [];
 
        this.setState({
            loaded: false,
            failed: false,
            nodata: false,
            len:0,
            scrollEnabled: true,
        });
 
        this.loadClocks();
        panEnable = true;
    }

    componentDidMount(){

       this.subscription2 = DeviceEventEmitter.addListener('ScrollEnabledEvent', (event) => {

            this.setState({
                scrollEnabled: event.data.scrollable,
            });
        });

        this.subscription3 = DeviceEventEmitter.addListener('PanEnable', (event) => {

            panEnable = true;
        });


        this.subscription = DeviceEventEmitter.addListener('clockUpdate', (event) => {

            this.componentWillMount();
        });

        this.subscription4 = DeviceEventEmitter.addListener('ClockSettingRightBtnPressEvent',(notification) => {

            
            if(this.state.len >= 18) {

                Alert.alert(
                  '提示',
                  '设置的闹铃数量已达上限',
                  [
                    {text: '确认', onPress: () => {}, style: 'cancel'},
                  ]
                );

                return;

            }  else {
               this.pushToNewClock();
            }

        });
    }

    componentWillUnmount(){
        this.subscription.remove();
        this.subscription2.remove();
        this.subscription3.remove();
        this.subscription4.remove();
    }

    pushToNewClock(){
         
        this.props.navigation.navigate('NewClockPage', {
            title:'新建闹铃',
        });
    }

    clockSort(arr){

        var i = 0;
        var len = arr.length;
        var j, d;
        for(; i<len; i++){
           for(j=0; j<len; j++){
              if(arr[i].id < arr[j].id){
                 d = arr[j];
                 arr[j] = arr[i];
                 arr[i] = d;
              }
           }
        }
    }

    clocksHandler(){

        for(var k=0; k<this.clocks.length; k++) {
            var t = this.clocks[k];
            var tag = t.tag;
            for(var j=0; j<this.pauseclocks.length; j++){
               var tmp = this.pauseclocks[j];
               if(tag > 0 && tag == tmp.tag) {
                  t.closeUtc = tmp.utc;
                  t.closeId = tmp.id;
                  t.enable = tmp.enable;
                  break;
               }
            }
        }
        this.clockSort(this.clocks);
    }

    saveClockCounts(len){
        Host.file.writeFile(Service.account.ID + '===' + Device.deviceID + '::clockCounts', "" + len ).then((success)=>{

        });
    }


    loadClocks(){

        Device.getDeviceWifi().callMethod('get_alarm_clock',{start: this.start}).then((json) => {

              if ((json.code==0) && json.result!= undefined && json.result.clocks != undefined) {

                  var clocks = json.result.clocks;
                  for(var k=0; k<clocks.length; k++){
                     var tmp = clocks[k];
                     if(tmp.action == 'pause' && (tmp.tag != 10&&tmp.tag != 20&&tmp.tag != 30&&
                     tmp.tag != 60&&tmp.tag != 90&&tmp.tag != 120)) {

                        this.pauseclocks.push(tmp);
                     } else if(tmp.action != 'pause'){
                         this.clocks.push(tmp);
                     }
                  }

                  if(clocks.length >= 5) {
                     this.start += 5;
                     this.loadClocks();
                  } else {

                    this.clocksHandler();
                    var _len = this.clocks.length + this.pauseclocks.length;
                    this.saveClockCounts(_len);
                    if(this.clocks.length >0){
                           this.setState({
                              loaded: true,
                              nodata: false,
                              len: _len,
                              dataSource: this.state.dataSource.cloneWithRows(this.clocks),
                           });
                    } else {
                        this.setState({
                           loaded: true,
                           nodata: true,
                           len:0,
                        });
                    }

                  }

              } else {
                this.setState({loaded: true,failed: true});
              }
         }).catch(error=>{
            console.log('error-259 -'+JSON.stringify(error));
            this.setState({loaded: true,failed: true});
        });
    }

    loadPrograms(){

        Device.getDeviceWifi().callMethod("get_channels",{"all":0}).then((result)=>{

                const channels = result.result.chs;
                if(channels != undefined){

                    this.programs = [];
                    this.count = channels.length;
                    for(var i=0; i<channels.length; i++) {

                        var tmp = channels[i];
                          //获取专辑预览信息或者直播详情信息；
                        var id = tmp.id
                        var type = tmp.t;  // 0直播， 1点播
                        if(type == 0) {
                                  //获取直播电台信息
                                  XimalayaSDK.requestXMData(XMReqType.XMReqType_LiveRadioByID, {ids: id+''}, (result, error) => {

                                    if(!error && result.radios != undefined && result.radios[0] !=undefined ) {
                                       //获取当前直播节目的直播时间
                                       var radioInfo = result.radios[0];
                                       this.programs.push(radioInfo);
                                    }

                                  });

                        } else {

                                //根据id获取专辑信息
                                XimalayaSDK.requestXMData(XMReqType.XMReqType_AlbumsBatch, {ids: id + ''}, (result, error) => {
                                    if(!error && result!= undefined && result != null) {
                                          var albumInfo = result[0];
                                          this.programs.push(albumInfo);
                                    }
                                });
                       }
                  }

             }

        }).catch(error=>{
            console.log('error-261 -'+JSON.stringify(error));
        });
    }


    _renderRow(rowData, sectionId, rowId) {
      return (<ClockCell key={JSON.stringify(rowData)} id={rowData.id} data={rowData} onPressEdit={()=>{this._onPressEdit()}} />);
    }

    _onPressEdit(messageName,visLoadingValue){
        // this.setState({message:messageName,visLoading:visLoadingValue})
        this.props.navigation.navigate('NewClockPage', {
          title:'闹铃编辑',
          edit: true,
          data: this.props.data,
        });   
    }

    _rendSeparator(rowData, sectionId, rowId) {
      return (<View key={sectionId + rowId} style={styles.separator} />);
    }


    render(){
      //   MHPluginSDK.dismissTips();

      if(!this.state.loaded) {
        return <LoadingView style={{flex:1}}/>
      }

      if(this.state.failed) {
        return(
            <View style={{flex:1}}>
                <FailView
                    onPress={this.componentWillMount.bind(this,0)}
                    style={{flex:1, paddingBottom:65}} text1='糟糕 发生错误了'
                    text2='点击屏幕重试' />
            </View>
        );
      }

      if(this.state.nodata) {
          return (
            <View style={{flex:1, paddingTop:0, backgroundColor:'#f8f8f8', justifyContent:'center', alignItems:'center'}}>
                <Text style={styles.text3}>暂无闹铃</Text>
                <Text style={[styles.text3,{marginTop:5}]}>请点击右上角＋添加</Text>
                <Text style={[styles.text3,{marginTop:5}]}>闹钟需要外接电源并保持开机状态和网络良好</Text>
            </View>
          );

      }

      return (
        <View style={{flex:1, paddingTop:0, backgroundColor:Constants.TintColor.rgb255}}>
            <LoadingDialog 
                title={this.state.message}
                cancelable={true}
                timeout={3000}
                onDismiss={() => {
                  this.setState({visLoading: false});
                }}
                visible={this.state.visLoading}
            />
            <ListView
                initialListSize={8}
                automaticallyAdjustContentInsets={false}
                showsVerticalScrollIndicator={false}
                renderRow={this._renderRow.bind(this)}
                scrollEnabled={this.state.scrollEnabled}
                renderSeparator={this._rendSeparator.bind(this)}
                dataSource={this.state.dataSource} />
        </View>
      );
    }
}



var styles = StyleSheet.create({

  text1:{
    fontSize: 16,
    color:'rgba(0,0,0,0.8)',
  },
  text2:{
    fontSize: 13,
    color:'rgba(0,0,0,0.4)',
  },
  text3:{
    fontSize: 15,
    color:'rgba(0,0,0,.2)',
  },
  container:{
    height:80,
    width: screenWidth,
    paddingLeft:15,
    paddingRight:15,
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center'
  },
  container2:{
    height:80,
    width:70,
    backgroundColor:'red',
    justifyContent:'center',
    alignItems:'center'
  },
  separator: {
    height:1/PixelRatio.get(),
  },
});


module.exports = ClockSetting;
