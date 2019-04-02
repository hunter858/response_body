'use strict';

import React,{component} from 'react' ;
import  Constants  from '../../Main/Constants';
import  Yeelight from '../Control/Yeelight';

import  {
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


class LightControlCell extends React.Component{

  constructor(props){
    super(props);
    this.state =  {
      dataSource: new ListView.DataSource({rowHasChanged:(r1, r2) => true }),
      loaded: false,
      failed: false,
      nodata: false,
    }
  }

  componentDidMount(){

  }

  onPress(){
    
  }

  _rowPressHandler(data) {

    // var alarm = MHPluginSDK.devMode? {isStatic:true, uri:MHPluginSDK.uriNaviMoreButtonImage, scale: (PixelRatio != undefined) ? PixelRatio.get() : 2.0} : {isStatic:!MHPluginSDK.devMode, uri:MHPluginSDK.basePath + "alarm.png" , scale: (PixelRatio != undefined) ? PixelRatio.get() : 2.0};
    // var lightControlRout = {
    //         // tintColor:'black',
    //         // barTintColor:'#f8f8f8',
    //         // titleTextColor:'#f8f8f8',
    //         title: '灯光控制',
    //         component: Yeelight,
    //         leftButtonIcon: {isStatic:true, uri:MHPluginSDK.uriNaviBackButtonImage, scale: (PixelRatio != undefined) ? PixelRatio.get() : 2.0},
    //         // rightButtonIcon: alarm,
    //         onLeftButtonPress:()=>{
    //           this.props.navigator.pop();
    //         },
    //         // onRightButtonPress:()=>{
    //         //
    //         // },
    //         passProps:{
    //           r:data.r,
    //           g:data.g,
    //           b:data.b,
    //           alpha:data.alpha,
    //           id:data.id,
    //         }
    //      }

    // this.props.navigator.push(lightControlRout);
    // return;
  }

	render(){
    //渲染view
    var rgba='rgb('+this.props.rowData.r+','+this.props.rowData.g+','+this.props.rowData.b+')';
    return (
      <TouchableHighlight style={{backgroundColor: Constants.TintColor.rgb255}} underlayColor={Constants.TintColor.rgb255}  onPress={()=>{this._rowPressHandler(this.props.rowData)}}>
        <View style={styles.rowContainer}>
          <View style={[styles.thumbShadow,{backgroundColor:rgba}]}></View>
          <View style={styles.rowTextDesc}>
            <Text style={styles.rowTextDescTitle} numberOfLines={1}>{this.props.rowData.r+','+this.props.rowData.g+','+this.props.rowData.b+','+parseInt(this.props.rowData.alpha/255)}</Text>
          </View>
        </View>
      </TouchableHighlight>
      );
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
	},
  container2:{
    height: 59,
    backgroundColor:'white',
    paddingLeft:15,
    paddingRight:15,
  },
  thumbShadow:{
    height: 60,
    width: 60,
    borderRadius:5,
    alignItems:'center',
    justifyContent:'center',
    marginLeft:12,
  },
  rowContainer:{
    flexDirection:'row',
    alignItems:'center',
    height:80,
  },
  rowTextDesc:{
		flex:1,
		alignSelf:'stretch',
		flexDirection:'column',
		paddingRight: 30,
    paddingLeft:15,
	},
  rowTextDescTitle:{
    marginTop:21.5,
    color:'#333333',
    fontSize:Constants.FontSize.fs30,
  },
});

module.exports = LightControlCell;
