'use strict';

import React,{component} from 'react' ;

import {
  PixelRatio,
  View,
  Image,
  TouchableOpacity,
} from 'react-native';



class StatusButtonWithImg extends React.Component{

    constructor(props){
        super(props);
        this.state = {
          initialStatus:this.props.initialStatus?this.props.initialStatus: false,
          onPress:{},
          selected: false,
        };
    }


    _onPress() {
       this.props.onPress(!this.state.selected);
    }


    componentWillMount() {

    }

    componentWillReceiveProps(nextProps) {
      if(this.state.selected != nextProps.initialStatus){
        this.setState({
          selected: nextProps.initialStatus,
        });
      }
    }

    render() {

      var imgUri;
      var img;
      if(this.state.selected) {
        img=this.props.selectedImg;
      } else {
        img=this.props.unSelectedImg;
      }
    
      return (
        <TouchableOpacity onPress={()=>{this._onPress()}} style={this.props.containerStyle} activeOpacity={0.5}>
            <View style={[{justifyContent:'center', alignItems:'center', flex:1}]}>
                  <Image style={{width:30/2,height:26/2,}} source={img}></Image>
            </View>
        </TouchableOpacity>
      );
    }

}

module.exports = StatusButtonWithImg;
