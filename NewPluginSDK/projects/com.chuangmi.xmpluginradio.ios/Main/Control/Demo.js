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
// import {XimalayaSDK,XMReqType} from '../Const/XimalayaSDK';

import xmly from 'miot/native/xmly';
import {XimalayaRequest} from 'miot/native/xmly';

export default class Demo extends React.Component{

  constructor(props){
        super(props);
    
  }

  render(){

    return(
    <View style={{flex:1,backgroundColor:'#0ff',justifyContent:'center',alignItems:'center',alignSelf:'center'}}>
        <Text>哈哈哈哈</Text>
    </View>
    )
  }

  componentWillMount(){
    
  }

  componentDidMount(){
    
    var self  = this;
    setTimeout(() => {
      self.Register_func();
    }, 3000);
    setTimeout(() => {
      self.requestXMData_func();
    }, 6000);

    
  }

  Register_func(){

    xmly.registry('','',1).then(res=>{
      console.log('register'+res);

    }).catch(error=>{
      console.log('failed'+error);
    });

  }

  requestXMData_func(){
    xmly.request(XimalayaRequest.CategoriesList,{}).then(res=>{

      console.log('CategoriesList:'+JSON.stringify(res));
    }).catch(error=>{
      console.log('CategoriesList:error '+JSON.stringify(error));
    });
  }


  componentWillUnmount(){
    
  }

}