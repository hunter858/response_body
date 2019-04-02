'use strict';

import React,{component} from 'react' ;
import CustomeTabBar from '../View/CustomeTabBar';
import {
  APPBAR_HEIGHT,APPBAR_MARGINBOTTOM,APPBAR_MARGINTOP,isIPX ,
  ratio,NavigatorBarHeight,screenWidth,screenHeight} from '../ConstDefine';
import SingleTypeLiveView from '../View/SingleTypeLiveView';
import NoWifiView from '../View/NoWifiView';
import Constants from '../../Main/Constants';
import ScrollableTabView from 'react-native-scrollable-tab-view';


import {
  Image,
  StyleSheet,
  Text,
  PixelRatio,
  View,
  ActionSheetIOS,
  DeviceEventEmitter,
} from 'react-native';


class RadioTypes extends React.Component{


  constructor(props){
    super(props);
    this.state={
      activeTab:this.props.navigation.state.params.activeTab,
    };
  }

  componentDidMount(){

      this.subscription = DeviceEventEmitter.addListener('RadioTypesRightBtnPress',(notification) => {
          ActionSheetIOS.showActionSheetWithOptions({
            options: ['定时关闭', '特色闹铃', '取消'],
            cancelButtonIndex: 2,
            title: Constants.Channels.sheetTitle(),
          },
          (buttonIndex) => {
             this.sheetBtnHandler(buttonIndex);
          });
      });

  }

  componentWillUnmount(){
    this.subscription.remove();
  }

  sheetBtnHandler(index){
      if (index == 0) {
        this.props.navigation.navigate('TimerSetting', {
          title:'定时关闭',
        });


      } else if(index == 1){

        this.props.navigation.navigate('ClockSetting', {
          title:'特色闹铃',
        });
   
      }
  }

  render(){

    // if(this.state.netInfo == 'none' || this.state.netInfo == 'unknown'){
    //   return <NoWifiView />
    // }

    return (
      <View  style={styles.controllerView}>
        <ScrollableTabView 
          style={{marginTop:0,marginBottom:APPBAR_MARGINBOTTOM,height:screenHeight-APPBAR_HEIGHT-APPBAR_MARGINBOTTOM }} 
          renderTabBar={() => <CustomeTabBar />} 
          scrollWithoutAnimation={true}
          tabBarPosition='top'
          locked={false}
          initialPage={this.state.activeTab} 
          edgeHitWidth={150} >
            <SingleTypeLiveView key={4} type={4} tabLabel="本地台"  style={{flex:1,width:screenWidth}}  />
            <SingleTypeLiveView key={1} type={1} tabLabel="国家台"  style={{flex:1,width:screenWidth}}  />
            <SingleTypeLiveView key={2} type={2} tabLabel="省市台"  style={{flex:1,width:screenWidth}}  />
            <SingleTypeLiveView key={3} type={3} tabLabel="网络台"  style={{flex:1,width:screenWidth}}  />
        </ScrollableTabView>
      </View>
    )
  }

}

var styles = StyleSheet.create({
  controllerView:{
    flex:1,
    paddingTop:0,
    height:screenHeight,
    backgroundColor:Constants.TintColor.rgb237,
    alignItems:'stretch'
  },
  scrollableTablView:{
    flex:1,
    paddingBottom:130/PixelRatio.get(),
    alignItems:'stretch'
  },
});


module.exports = RadioTypes;
