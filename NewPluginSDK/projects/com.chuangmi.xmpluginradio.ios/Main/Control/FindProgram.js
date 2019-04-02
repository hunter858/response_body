'use strict';

// 找节目界面
import React,{component} from 'react' ;
import CustomeTabBar  from '../View/CustomeTabBar';
import ScrollableTabView  from 'react-native-scrollable-tab-view';
import Dimensions  from 'Dimensions';
import Constants  from '../../Main/Constants';
import NoWifiView  from '../View/NoWifiView';
import LivePage  from './LivePage';
import Recommend  from '../Control/Recommend';
import DlivePage  from './DlivePage';
import {
  APPBAR_HEIGHT,APPBAR_MARGINBOTTOM,APPBAR_MARGINTOP,isIPX ,
  ratio,NavigatorBarHeight,screenWidth,screenHeight} from '../ConstDefine';

import {
  Image,
  ListView,
  TouchableHighlight,
  StyleSheet,
  Text,
  View,
  DeviceEventEmitter,
  TouchableWithoutFeedback,
  LayoutAnimation,
  ProgressViewIOS,
  TouchableOpacity,
} from 'react-native';


class FindProgram extends React.Component{

  componentWillMount() {

  }

  componentWillUnmount() {

  }

  render(){

    if(this.state.netInfo == 'none' || this.state.netInfo == 'unknown'){
      return <NoWifiView />
    }

    return (

         <View  style={styles.controllerView}>
               <ScrollableTabView
                    locked={true}
                    style={styles.scrollableTablView} renderTabBar={() => <CustomeTabBar />} edgeHitWidth={150}>
                    <Recommend  tabLabel="推荐" style={{flex:1,width:Dimensions.width}} navigator={this.props.navigator} />
                    <DlivePage      tabLabel="点播" style={{flex:1,width:Dimensions.width}} navigator={this.props.navigator} />
                    <LivePage       tabLabel="直播" style={{flex:1,width:Dimensions.width}} navigator={this.props.navigator} />
               </ScrollableTabView>
          </View>
    )
  }
}

var styles = StyleSheet.create({
  controllerView:{
    paddingTop:0,
    height: Dimensions.height,
    backgroundColor:Constants.TintColor.rgb237,
    alignItems:'stretch'
  },

  scrollableTablView:{
    flex:1,
    paddingBottom:65,
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
});


module.exports = FindProgram;
