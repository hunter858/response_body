//
//  小米万能遥控器 - 首页
//  MiHome
//
//  Created by Woody on 15/7/29.
//  Copyright (c) 2015年 小米移动软件. All rights reserved.
//
'use strict';

import React,{Component} from 'react';
import {
  View,
  Text,
  AppRegistry,
  TouchableHighlight,
  TouchableOpacity,
  Platform,
  Dimensions,
  StyleSheet,
  PixelRatio,
  StatusBar,
  ScrollView,
  Image,
  Alert,
  Animated,
  ListView,
  RefreshControl,
  FlatList,
  ImageBackground,
  DeviceEventEmitter,
  TouchableWithoutFeedback,
  NativeModules,
} from 'react-native';


import MIRequestServer from '../../Main/ConstDefine/MIRequestServer';
import MessageToast from '../../Main/View/MessageToast';
import DeviceFactory from '../../Main/ConstDefine/DeviceFactory';
var ProjectModel = require('../../project.json');
import { ImageButton,TitleBarBlack,TitleBarWhite,LoadingDialog} from 'miot/ui';
import Button from '../../CommonModules/Button';
import {LocalizedStrings} from '../../Main/MHLocalizableString';
import { Package, Device,DeviceProperties,Service,DeviceEvent,Host} from "miot";
import {
APPBAR_HEIGHT,APPBAR_MARGINBOTTOM,APPBAR_MARGINTOP,isIPX ,
ratio,NavigatorBarHeight,screenWidth,screenHeight} from '../../Main/ConstDefine';
import Swipeout from 'react-native-swipeout';
var projectModel = require('../../project.json');

var isDataListLoad = false;
var isEmptyList = true;
var ioOpening = false;
var subscription;


export default class DeviceList extends React.Component{

  static navigationOptions = ({ navigation }) => {
    return {
    header:
        <View>
        <TitleBarBlack
            title={navigation.state["params"] ? navigation.state.params.name : Device.name}
            style={{ backgroundColor: 'transparent' }}
            onPressLeft={() => { Package.exit() }}
            onPressRight={() => {
              if (Platform.OS == 'android') {
                  navigation.setParams({ showDialog: true });
              } else {
                  navigation.navigate('moreMenu', { 'title': '设置' });
              }
            }} 
            onPressTitle={()=>{
                alert('version:' +projectModel.version_code);
            }}    
            />
        </View>
    };
  };


  constructor(props) {
    super(props);
    this.state = {
        did: Device.deviceID,
        model: Device.deviceModel,
        spaceB: 26,
        controllers:[],
        visLoading:false,
        device_Factory: new DeviceFactory(),
    };
  }

  componentWillMount() {
    this._deviceNameChangedListener = DeviceEvent.deviceNameChanged.addListener((device) => {
      this.props.navigation.setParams({
          name: device.name
      });
      this.forceUpdate();
    });
  }

  componentDidMount() {
    var self = this;
    this.loadDataFormServer();
    this.provite_func();

    if(Host.isDebug)
    {
      this.requestTimer = setTimeout(
        ()=> this.showToast()
      ,3000);
    }
  }

  componentWillUnmount() {
    this._deviceCancelAuthorization.remove();
  }

  /*隐私协议*/
  provite_func (){

    var Agreement_url,Policy_url;
    var deviceModel = Device.model;

    if(deviceModel=='chuangmi.remote.h102a03' ){/*小白万能遥控器 A03*/
      Agreement_url =  LocalizedStrings.A03_greement_url;
      Policy_url = LocalizedStrings.A03_policy_url;
    }else if(deviceModel=='chuangmi.remote.h102b01'){/*小白万能遥控器 B01*/
      Agreement_url =  LocalizedStrings.B01_greement_url;
      Policy_url =  LocalizedStrings.B01_policy_url;
    }
    else if(deviceModel=='chuangmi.remote.v2'){/*小白万能遥控器二代*/
      Agreement_url =  LocalizedStrings.V2_greement_url;
      Policy_url =  LocalizedStrings.V2_policy_url;
    }
    if(Agreement_url ==undefined){
      return {};
    }

    Host.storage.get('disclam_checked_flag').then((value) => {

          if((value==false )||(value==null)||(value==undefined)){

            Host.ui.openPrivacyLicense("license",Agreement_url,"privacy",Policy_url)
            .then((res)=>{

                if(res==true){
                  Host.storage.save({'disclam_checked_flag':true});
                }else{
                  Host.storage.save({'disclam_checked_flag':false});
                }
            });

          }
    });
  }


  /* 显示软件版本 */
  showToast(){
    
    var Message = LocalizedStrings.ir_toast_version + ProjectModel.version_code;
    this.refs.toast.showMessage(Message);
  }


  loadDataFormServer(){

    var self = this;
    var parm = {
      "parent_id": this.state.did
    };

    MIRequestServer.Post_getAllRemoter(parm,
      function(response){

          if(response.result.controllers != undefined){
              var controllers = response.result.controllers;
              self.setState({controllers:controllers});
          }
  
      },function(error){
        self.refs.toast.showMessage(LocalizedStrings.ir_toast_get_data_failed);
      });
  }



  triggerRefreshUI() {
    var dataSource = new ListView.DataSource({rowHasChanged: (r1, r2)=>r1!==r2});
    this.state.dataSource = dataSource.cloneWithRows(this.state.controllers);
  }

  /* 渲染*/
  render() {
      //如果存在遥控器
      this.triggerRefreshUI(); 
      return (
        <View style={styles.mainContainer}>
            <LoadingDialog 
              title={LocalizedStrings.string_is_loading}
              cancelable={true}
              timeout={3000}
              onDismiss={() => {
                  this.setState({visLoading: false});
              }}
              visible={this.state.visLoading}/>
            <MessageToast ref='toast'/>
            {(this.state.controllers.length>0)?(this.deviceListView()):(this.TempView())  }
        </View>
      );
  }
 

  TempView(){
    let disable_SharDevice = (Device.isOwner)?(true):(false);
    return(
      <View style={styles.emptyListView}>
            <View style={styles.emptyContentView}>
                <Button onPress={()=>{this._pressAdd()}} 
                enabled={disable_SharDevice}
                style={{}} 
                title={LocalizedStrings.ir_main_add} 
                imageWidth={80} imageHeight={80} titleSize={14} opacityValue={0.5} 
                titleMarginTop={8} imageNormal={require('../../Resources/Main/add_normal.png')} imageHighlight={require('../../Resources/Main/add_press.png')}/>
               <Text style={{marginTop:10}}>{LocalizedStrings.ir_main_copy_desc}</Text>
            </View>
            <View style={styles.emptyContentView}>
                <Button onPress={()=>{this._pressReproduce()}} 
                enabled={disable_SharDevice} 
                style={{}} 
                title={LocalizedStrings.ir_main_copy} 
                imageWidth={80} imageHeight={80} titleSize={14} opacityValue={0.5}  
                titleMarginTop={8} imageNormal={require('../../Resources/Main/reproduce_normal.png')} imageHighlight={require('../../Resources/Main/reproduce_press.png')}/>
                <Text style={{marginTop:10}}>{LocalizedStrings.main_add_desc}</Text>
            </View>
           
      </View>
    );
  }

  deviceListView(){

    let disable_SharDevice = (Device.isOwner == true)?(true):(false);
    return(
      <View style={styles.mainContainerContent}>
        <View style={styles.deviceListView}>
            <ListView style={[styles.remoterList,{height:(screenHeight-NavigatorBarHeight)-bottomButtonViewHeight}]} 
               refreshControl={
                <RefreshControl
                  refreshing={false}
                  onRefresh={()=>{this.loadDataFormServer()}}/>
                }
            enableEmptySections={true} 
            dataSource={this.state.dataSource} 
            renderRow={this._renderRow.bind(this)} 
            automaticallyAdjustContentInsets={false} />
        </View>
        <View style={[styles.addRemoterAreaContainer,{height: bottomButtonViewHeight,}]}>           
            <View style={styles.bottomButtonView}>
                <Button onPress={()=>{this._pressReproduce()}} enabled={disable_SharDevice} style={{marginRight:20,}} title={LocalizedStrings.ir_main_copy} imageWidth={40} imageHeight={40} titleSize={11} opacityValue={0.5}  titleMarginTop={8} imageNormal={require('../../Resources/Main/reproduce_normal.png')} imageHighlight={require('../../Resources/Main/reproduce_press.png')}/>
            </View>
            <View style={styles.bottomButtonView}>
                <Button onPress={()=>{this._pressAdd()}} enabled={disable_SharDevice} style={{marginLeft:0,}} title={LocalizedStrings.ir_main_add} imageWidth={40} imageHeight={40} titleSize={11} opacityValue={0.5} titleMarginTop={8} imageNormal={require('../../Resources/Main/add_normal.png')} imageHighlight={require('../../Resources/Main/add_press.png')}/>
            </View>
        </View>
      </View>
    );
  }
  
  /*复制*/
  _pressReproduce() {
    
    Host.ui.openDevice('', 'mijia.ir.add', { type: 'copy', gatewayID: Device.deviceID });
  }
  
  /*添加*/
  _pressAdd() {   
    
    Host.ui.openDevice('', 'mijia.ir.add', { type: 'add', gatewayID: Device.deviceID });
  }

  /* 列表一行，用来展示一个遥控器*/ 
  _renderRow(rowData, sectionID, rowID) {
    /*
          {"did":"ir.1013720798626844672",
          "parent_id":"57368680",
          "model":"miir.tv.ir01",
          "name":"电视红外遥控",
          "category":2,
          "pdid":65725}
    */
    rowData.sectionID = sectionID;
    rowData.rowID = rowID;
    var  deviceModel = this.state.device_Factory.GetDeviceModel_WithModel(rowData.model);
  

    var  iconImageUrl = deviceModel.iconImage;
    var swipeoutBtns = [
      {
        text:LocalizedStrings.ir_delete,
        backgroundColor:"#ff0000",
        onPress:()=>{
          this._longPressRow(rowData);
        }
      }
    ]
    return (
      <Swipeout close={true} autoClose='true' sensitivity={1} right={swipeoutBtns}  backgroundColor='#ffffff' >
            <TouchableHighlight underlayColor='#838383' onPress={() => this._pressRow(rowData)} >
              <View style={{width:screenWidth}}>
                <View style={styles.remoterListRowCell}>
                  <Image style={styles.remoterImage} source={iconImageUrl} />
                  <Text style={styles.remoterName}>{rowData.name}</Text>
                </View>
              <View style={styles.separator}></View>
              </View>
            </TouchableHighlight>
      </Swipeout>
    );
  }

  /* 点击一行 */
  _pressRow(rowData){
    /* 
      obj = {
      "category":2,
      "did":"133xd3.1",
      "name":"客厅电视",
      "model":"mijia.tv.ir01"
      };
    */ 

    /* 跳转到遥控器主页面*/
    var deviceType = rowData.category;
    var deviceModel = this.state.device_Factory.GetDeviceModel_WithModel(rowData.model);
    var remoter_did = rowData.did;
 
    if((ioOpening==true)||(deviceModel ==undefined)){
      return;
    }
    var passProps = {
        deviceType:this.state.deviceType,
        did:rowData.did};
    ioOpening = true;
    Host.ui.openDevice(rowData.did,rowData.model,passProps);
    ioOpening = false;
  }

  /*长按删除功能 */
  _longPressRow(rowData) {
      
      if(Device.isOwner ==false){
        return;
      }
      Alert.alert(
        LocalizedStrings.ir_delete_device_text,
        '',
        [
          {text: LocalizedStrings.ir_cancel, onPress: () => console.log('取消 Pressed!')},
          {text: LocalizedStrings.ir_confirm, onPress: () => this.deleteRemoter(rowData)},
        ]
      )
  }

  /* 删除设备 */
  deleteRemoter(rowData) {
     /* 
      obj = {
      "category":2,
      "did":"133xd3.1",
      "name":"客厅电视",
      "model":"mijia.tv.ir01"
      };
    */ 

    var self = this;
    this.setState({visLoading:true});
    var param  = {"did": rowData.did};
    MIRequestServer.Post_DeleteRemoter(param,
      function(response){
        
        if(response.code==0){
          self.state.controllers.splice(rowData.rowID,1);  
          var newControllers = self.state.controllers;
          self.setState({controllers:newControllers,visLoading:false});
        }

      },function(error){

          self.setState({visLoading:false});
          self.refs.toast.showMessage(JSON.stringify(error));
      });
  }
};

const bottomButtonViewHeight = 76 +APPBAR_MARGINBOTTOM;

var styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    marginTop:0,
    flexDirection: 'column',
    backgroundColor: '#ffffff',
  },
  mainContainerContent:{
    marginTop:0,
    flexDirection:'column',
    flex:1,
  },
  emptyListView:{
    height:screenHeight - NavigatorBarHeight,
    marginTop:0,
    flexDirection:'column',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  emptyContentView:{
    marginTop:30,
    width:screenWidth,
    height:170,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deviceListView: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 0,
  },
  addRemoterAreaContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf:'center',
    width:screenWidth,

    backgroundColor:'#f8f8f8',
    marginTop:0,
  },
  remoterList: {
    flex:1,
    alignSelf: 'stretch',
    width:screenWidth,
    height:(screenHeight-NavigatorBarHeight) -bottomButtonViewHeight,
    marginBottom: 0,
    marginTop:0,
  },
  remoterListRowCell: {
    flexDirection: 'row',
    padding: 22,
    height: 64,
  },
  remoterImage: {
    alignSelf: 'center',
    width: 46,
    height: 46,
  },
  remoterName: {
    fontSize: 15,
    opacity: 0.7,
    alignSelf: 'center',
    color:'#000000',
    marginLeft: 15,
  },
  subArrow: {
     width: 9,
     height: 18,
  },
  separator: {
    height: 0.5,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    marginLeft: 20+50+15,
    marginRight: 0
  },
  bottomButtonView:{
    justifyContent: 'center',
    alignSelf: 'center',
    alignItems:'center',
  },
  column: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  navBarText: {
    fontSize: 18,
    marginVertical: 10,
  },
  navBarTitleText: {
    textAlign: "center",
    color: '#373E4D',
    fontWeight: '500',
    marginBottom: 3,
  },
});
