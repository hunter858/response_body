'use strict';

import React,{Component} from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    ImageBackground,
    TouchableOpacity,
    Dimensions,
    DeviceEventEmitter,
    StatusBar,
    Platform,
    PixelRatio,
    ScrollView,
    TouchableWithoutFeedback,
    ART
} from 'react-native';


import {TitleBarBlack,TitleBarWhite} from 'miot/ui';
import {Device,DeviceProperties,DeviceEvent,Host,Package,Service} from 'miot';
import MoreDialog from '../MoreDialog';
import {
  APPBAR_HEIGHT,APPBAR_MARGINBOTTOM,APPBAR_MARGINTOP,isIPX ,
  ratio,NavigatorBarHeight,screenWidth,screenHeight} from '../ConstDefine';
import Constants from '../Constants';
import CustomeTabBar from '../View/CustomeTabBar';
import Recommend from '../Control/Recommend';
import DlivePage from '../Control/DlivePage';
import LivePage from '../Control/LivePage';
import DefaultMainPage from '../Control/DefaultMainPage';
import NewBottomView from '../View/NewBottomView'
import ScrollableTabView,{ DefaultTabBar,ScrollableTabBar} from 'react-native-scrollable-tab-view';
import {XimalayaSDK} from '../Const/XimalayaSDK';
var projectModel = require('../../project.json');


export default  class NewMainpage extends React.Component{

    static navigationOptions = ({ navigation }) => {
          return {
          header:
              <View>
              <TitleBarWhite
                  title={navigation.state["params"] ? navigation.state.params.title : Device.name}
                  style={{ backgroundColor:'#805e5f', }}
                  onPressLeft={() => { Package.exit() }}
                  onPressRight={() => {

                      if (Platform.OS == 'android') {
                          navigation.setParams({ showDialog: true });
                      } else {
                          navigation.navigate('moreMenu', { 'title': '设置' });
                  }}} 
                  onPressTitle={()=>{
                    alert('version:' +projectModel.version_code);
                  }}   
                  />
              <MoreDialog
                  visible={typeof navigation.state.params === 'undefined' ? false : navigation.state.params.showDialog}
                  navigation={navigation} />
              </View>
          };
    };

    constructor(props,context){
      super(props,context);
      this.state ={
        hideBottomView:false,
        initialPage:0,
      }
    }
  
    componentWillMount() {
      this._deviceNameChangedListener = DeviceEvent.deviceNameChanged.addListener((device) => {
          this.props.navigation.setParams({
              name: device.name
          });
          this.forceUpdate();
      });

      XimalayaSDK.register((result)=>{
        console.log('result'+JSON.stringify(result));
      });

      /* 订阅属性*/
      const eventSubscription = DeviceProperties.addListener(["channels", "volume" ,"newChannels"], (deviceProps, changeProps)=>{
        console.log('订阅成功-'+JSON.stringify(deviceProps));
      });

    }
  
  
    componentDidMount(){
  
      //如果不是第一次进入插件,则默认的是进入到我的，initialPage＝3；
      Host.file.readFile(Service.account.ID + '===' + Device.deviceID + '::FirstTime')
      .then((content)=>{
      
          var str = String(content);
          if(str == '') {
            this.scrollableTablView.goToPage(0);
            Host.file.writeFile(Service.account.ID + '===' + Device.deviceID + '::FirstTime', "no" ,(success)=>{});
  
          }

      });

      this.subscription = DeviceEventEmitter.addListener('hideBottomView', (event) => {
          this.setState({
            hideBottomView:!this.state.hideBottomView,
          })
        }
      );
      this.subscription2 = DeviceEventEmitter.addListener('showBottomView', (event) => {
        this.setState({
          hideBottomView:!this.state.hideBottomView,
        })
      }
      );

      // setTimeout(() => {

      //   this.Get_channels_FromMemory();
      //   this.Get_channnels();
      // }, 6000);

    }

    componentWillUnmount() {
      // console.log("找节目准备卸载");
      this.subscription.remove();
      this.subscription2.remove();
      this._deviceNameChangedListener.remove();
    }

    Get_channnels(){

      Device.getDeviceWifi().callMethod("get_channels",{"all":0}).then((result)=>{

        const channels = result.result.chs;
        console.log('get_prop:'+JSON.stringify(result));

      }).catch(error=>{
        console.log('error:'+JSON.stringify(error));
      });
    }

    Get_channels_FromMemory(){

      Device.getDeviceWifi().callMethod("get_channels",{"all":0}).then((result)=>{

          const channels = result.result.chs;
          console.log('channels:'+ channels);
         
      }).catch(error=>{
        console.log('error:'+JSON.stringify(error));
      });
    }


    onChangeTab(object){

    } 
  
    render(){
  
      if(this.state.netInfo == 'none' || this.state.netInfo == 'unknown'){
        return <NoWifiView />
      }
  
      var bottomView =this.state.hideBottomView?null:<NewBottomView   navigator={this.props.navigator}  radioActive={false} findActive={true}/>;
  
      return (
        
          <View  style={styles.controllerView}>
              <ScrollableTabView
              ref={component => this.scrollableTablView = component}
              style={styles.scrollableTablView} 
              locked={false}
              tabBarPosition='top'
              onChangeTab={(object)=>(this.onChangeTab(object))}
              scrollWithoutAnimation={true}
              renderTabBar={() => <CustomeTabBar/>} 
              edgeHitWidth={150}
              initialPage={3}>
                <Recommend       tabLabel="推荐" style={{flex:1,width:Dimensions.width}} navigator={this.props.navigator} />
                <DlivePage       tabLabel="点播" style={{flex:1,width:Dimensions.width}} navigator={this.props.navigator} />
                <LivePage        tabLabel="直播" style={{flex:1,width:Dimensions.width}} navigator={this.props.navigator} />
                <DefaultMainPage tabLabel="我的" style={{flex:1,width:Dimensions.width}} navigator={this.props.navigator} />
              </ScrollableTabView>
              {bottomView}
         </View>
  
      )
    }
}
  
var styles = StyleSheet.create({
  controllerView:{
    flex:1,
    paddingTop:0,
    height: Dimensions.height,
    marginBottom:APPBAR_MARGINBOTTOM,
    width:Dimensions.width,
    backgroundColor:Constants.TintColor.rgb237,
    alignItems:'stretch'
  },
  scrollableTablView:{
    flex:1,
    alignItems:'stretch'
  },
  bottomView:{
    position:'absolute',
    bottom:0,
    left:0,
    height: 65,
    width: Dimensions.width,
    backgroundColor:Constants.TintColor.transparent,
  },
  container: {
      width: Dimensions.width,
      height: Dimensions.height,
      marginTop:65,
      flex: 1,
      alignItems: 'stretch',
      backgroundColor: 'transparent',
  },

});