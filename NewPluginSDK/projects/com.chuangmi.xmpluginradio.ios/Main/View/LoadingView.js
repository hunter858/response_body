'use strict';

import React from 'react';

import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,

}from 'react-native';


var styles = StyleSheet.create({
	top:{
		justifyContent:'center',
		alignItems:'center',
	},
});

export default class LoadingView extends React.Component{

	render(){
		return(
			<View style={[styles.top,this.props.style]}>
				 <ActivityIndicator
                        size='small'
                        animating={true}/>
          <Text style={{marginTop:30, color:'rgb(142,142,142)'}}>奋力加载中,请稍候...</Text>
			</View>
		);
	}
}

