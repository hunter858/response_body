'use strict';

import React,{Component} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  Image,

} from 'react-native';

class FailView extends React.Component{
	
	render(){	
		return(
			<TouchableWithoutFeedback onPress={this.props.onPress}>
			<View style={[styles.top,this.props.style,{backgroundColor:'white'}]}>
				  <Image  source={require('../../Resources/fail.png')} style={{height:100, width:100, borderRadius:50}}/>	
				  <Text style={styles.text1}>{this.props.text1}</Text>
				  <Text style={styles.text2}>{this.props.text2}</Text>
			</View>
			</TouchableWithoutFeedback>
		);
	}
}

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
		color:'rgb(184,184,184)',
		marginTop:10,
	},

});

module.exports=FailView;