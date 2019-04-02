'use strict';

import React,{component} from 'react' ;
import SingleSearchRsView from '../View/SingleSearchRsView';

import {
  Image,
  StyleSheet,
  Text,
  PixelRatio,
  View,
  Dimensions,
} from 'react-native';

class SearchRsView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      totals:0,
      albums:0,
      radios:0,
    };
  }

  setCount(type, total){
      switch (type) {
        case 0:
          this.setState({
             totals: total,
          });
          break;
        case 1:
          this.setState({
             albums: total,
          });
          break;
        case 2:
          this.setState({
             radios: total,
          });
          break;
        default:
          break;
      }
  }

  render(){


   var label1 = this.state.totals == 0 ? '全部' : '全部(' + this.state.totals + ')';
   var label2 = this.state.albums == 0 ? '点播' : '点播(' + this.state.albums + ')';
   var label3 = this.state.radios == 0 ? '直播' : '直播(' + this.state.radios + ')';

    return (

         <View  style={styles.top}>
         	   <View style={{height:1/PixelRatio.get(), backgroundColor:'rgb(200,200,200)', opacity:0.7}}/>
                <SingleSearchRsView
                setCount={(type, total)=>{this.setCount(type, total)}} 
                type={0} queryStr={this.props.queryStr} 
                tabLabel={label1}  style={{flex:1,width:Dimensions.width,}} 
                navigator={this.props.navigator} />
          </View>
    )
  }
}

var styles = StyleSheet.create({
  top:{
     flex:1,
     backgroundColor:'white',
  },
  scrollableTablView:{
    flex:1,
    alignItems:'stretch'
  },
});


module.exports = SearchRsView;
