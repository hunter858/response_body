'use strict'
import React,{Component} from 'react'
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native'



class TitleButton extends React.Component{

  constructor(props){
    super(props);
    this.state =  {
      clicked:false,
    }
  }

  render(){

      if(!this.props.clicked){
          return( 
          <View style={[styles.titleBar,this.props.style]}>
            <TouchableOpacity style={{flex:1}} onPress={this.props.onPress}>
            <Image resizeMode='contain' style={styles.search}
            source={require('../../Resources/arrow_provice_down.png')}/>
            </TouchableOpacity>
        </View>)
      }else{
        return(  
            <View style={[styles.titleBar,this.props.style]}>
              <TouchableOpacity style={{flex:1}} onPress={this.props.onPress}>
              <Image resizeMode='contain' style={styles.search}
              source={require('../../Resources/arrow_provice_up.png')}/>
              </TouchableOpacity>
            </View>)
    }
  }

  componentWillReceiveProps(nextProps) {
    
      if (this.state.clicked != nextProps.clicked) {
        this.setState({clicked:nextProps.clicked});
      }
	}
}

module.exports = TitleButton;

const styles=StyleSheet.create({
  titleBar:{
    flexDirection:'row',
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:'white',
    width:50,
  },
  search:{
    width:30,
    height:30,
    marginLeft:10,
    paddingLeft:10,
    paddingRight:10,
  },
});
