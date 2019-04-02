'use strict';

import React,{component} from 'react' ;
var MHPluginSDK = require('NativeModules').MHPluginSDK;
import {
  View,
  StyleSheet,
  Text,
  Image,
} from 'react-native';


var styles = StyleSheet.create({
	top:{
		justifyContent:'center',
		alignItems:'center',
	},
	text1:{
		fontSize:15,
		color:'rgb(142,142,142)',
		marginTop:20,
	},
	text2:{
		fontSize:11,
		color:'rgb(174,174,174)',
		marginTop:10,
	},
});

class NoWifi extends React.Component{

	render(){	
		return(
			<View style={[styles.top,{flex:1, backgroundColor:'rgb(211,211,211)'}]}>
				  <Image style={{height:95, width:120,}} source={require('../../Resources/wifi.png')} resizeMode='stretch'/>	
				  <Text style={styles.text1}>当前无法连接到网络</Text>
				  <Text style={styles.text2}>请检查您的网络设置</Text>
			</View>
		);
	}
}



module.exports=NoWifi;