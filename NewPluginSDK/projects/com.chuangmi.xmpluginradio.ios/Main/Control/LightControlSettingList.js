'use strict';

import React,{component} from 'react';
import Constants  from '../../Main/Constants';
import LightControlCell from '../View/LightControlCell';
import LoadingView  from '../View/LoadingView';
import FailView  from '../View/FailView';
import {Device,DeviceEvent,Host,Package,Service} from 'miot';
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
  SwitchIOS,
  PixelRatio,
  LayoutAnimation,
  DeviceEventEmitter
} from 'react-native';


class LightControlSettingList extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      dataSource: new ListView.DataSource({rowHasChanged:(r1, r2) => true }),
      loaded: false,
      failed: false,
      nodata: false,
    }
  }

  componentDidMount(){
      this.setState({
        loaded: false,
        failed: false,
        nodata: false,
      });

      Device.getDeviceWifi().callMethod('get_led_atmosphere_list',{}).then((json) => {

       if((json.code==0) && (json != null) && json.result != undefined ){
           this.setState({
           loaded: true,
           nodata: false,
           failed: false,
           dataSource:this.state.dataSource.cloneWithRows(json.result.colors),
           });
         }else{
           this.setState({
             loaded: true,
             nodata: false,
             failed: true,
           });
         }
      });
  }


  _rendRow(rowData, sectionID, rowID) {
      return (
        <LightControlCell key={rowID+sectionID} rowData= {rowData} navigator={this.props.navigator}/>
      );
  }

  _rendSeparator(rowData, sectionID, rowID, highlightRow) {
    return (<View key={rowID+sectionID} style={styles.separator} />);
  }

	render(){
    // MHPluginSDK.dismissTips();
    if(!this.state.loaded) {
      return <LoadingView style={{flex:1}}/>
    }

    if(this.state.failed) {
      return(
          <View style={{flex:1}}>
                <FailView
                    onPress={this.componentDidMount.bind(this,0)}
                    style={{flex:1, paddingBottom:65}} text1='糟糕 发生错误了'
                    text2='点击屏幕重试' />
          </View>
      );
    }

    return (
      <View style={{flex:1, paddingTop:0}}>
          <ListView
            dataSource={this.state.dataSource}
            ref = {(list) => {this.list= list}}
            automaticallyAdjustContentInsets={false}
            enableEmptySections = {true}
            style={[styles.list,{marginBottom:this.state.editing==true?70:0}]}
            initialListSize={10}
            pageSize={Constants.PageCount.size}
            renderSeparator={this._rendSeparator}
            renderRow={this._rendRow}
          />
      </View>);
	}

}


var styles = StyleSheet.create({
	container:{
		height: 44,
		backgroundColor:'white',
		paddingLeft:15,
		paddingRight:15,
		flexDirection:'row',
		justifyContent:'space-between',
		alignItems:'center'
	},
  container1:{
    height: 44,
    backgroundColor:'white',
    paddingLeft:15,
    paddingRight:15,
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center'
  },
	text:{
		fontSize: 15,
		color:'rgb(51,51,51)',
	},
	text2:{
		position:'absolute',
		top:15,
		right:80,
		fontSize: 13,
		color:'rgb(130,130,130)',
	},
  text3:{
    fontSize: 15,
    color:'rgb(51,51,51)',
    marginTop:10,
  },
  text4:{
    fontSize: 12,
    color:'rgb(130,130,130)',
    marginLeft: 6,
    marginTop: 12,
  },
  text5:{
    fontSize: 12,
    color:'rgb(127,127,127)',
    marginTop: 7,
  },
	image: {
		width:15,
		height:15,
	},
  image1: {
    width:8,
    height:10,
  },
	separator: {
		height:1/PixelRatio.get(),
    backgroundColor:'rgba(0,0,0,.1)',
	},
  container2:{
    height: 59,
    backgroundColor:'white',
    paddingLeft:15,
    paddingRight:15,
  },

});

module.exports = LightControlSettingList;
