'use strict';

import React,{component} from 'react' ;
import {XimalayaSDK,XMReqType} from '../Const/XimalayaSDK';
import Constants from '../../Main/Constants';
import CommonBtn from './CommonBtn';
import LoadingView from '../View/LoadingView';

import {
  StyleSheet,
  Text,
  PixelRatio,
  View,
} from 'react-native';


class SearchHistory extends React.Component{


    constructor(props){
        super(props);
        this.state =  {
            loaded: false,
            remote:[],
            locals:[],
        }
    }

    componentWillUnmount(){
      this.unMount = true;
    }

    componentWillMount(){
       this.unMount = false;
        XimalayaSDK.requestXMData(XMReqType.XMReqType_SearchHotWords, {top: 8}, (result, error) => {
            if(!error && result != undefined && result.length > 0 && !this.unMount){
                this.setState({
                  remote: result,
                  loaded: true,
                  locals: this.props.locals,
                });
            } else if(!this.unMount){
              this.setState({
                 loaded: true,
                 locals: this.props.locals,
              });
            }

        });
    }

    onClear() {
      if(!this.unMount) {
        this.setState({
          locals:[],
        });
        this.props.clear();
      }
    }

    labelPressHandler(data){
        this.props.onLabelPress(data);
    }

    renderSingleLabel(data, index){

        return  <CommonBtn
                    key={index}
                    style={styles.labelBtn}
                    onPress={this.labelPressHandler.bind(this,data)}
                    selectColor='rgb(240,240,240)'
                    selectPressColor='rgb(202,202,202)'
                    unselectPressColor='rgb(24,194,168)'
                    unselectTextColor='rgb(127,127,127)'
                    selectTextColor='rgb(127,127,127)'
                    unselectText={data}
                    selectText={data}/>


    }

    renderLocal(){

      return(
          <View>
            <View style={{flexDirection:'row', justifyContent:'space-between'}}>
                <Text style={styles.text}>历史搜索</Text>
                <Text style={{fontSize:11, color:Constants.TintColor.navBar}} onPress={this.onClear}>清空历史</Text>
            </View>

            <View style={styles.containerView}>
                {this.state.locals.map((data, i) => this.renderSingleLabel(data, i))}
            </View>

          </View>

      );

    }

    renderRemote(){

      var mtop = this.state.locals.length > 0 ? 29 : 0;
      return(
          <View style={{marginTop: mtop}}>
            <View style={{flexDirection:'row', justifyContent:'space-between'}}>
                <Text style={styles.text}>热门搜索</Text>
            </View>
            <View style={styles.containerView}>
                {this.state.remote.map((data, i) => this.renderSingleLabel(data.search_word, i))}
            </View>
          </View>
      );
    }

    render(){
      if(!this.state.loaded) {
          return <LoadingView style={{flex:1}}/>
      }

      var localLabels = null;
      if(this.state.locals.length > 0) {
         localLabels = this.renderLocal();
      }
      var remoteLabels = null;
      if(this.state.remote.length > 0){
         remoteLabels = this.renderRemote();
      }

      return  (
          <View style={styles.top}>
              {localLabels}
              {remoteLabels}
          </View>
      );
    }
}

var styles = StyleSheet.create({
   top:{
     flex:1,
     backgroundColor:'white',
     paddingLeft:13,
     paddingRight:13,
     paddingTop: 15,
   },

   text:{
       fontSize:13,
       color:'rgb(127,127,127)',
   },

   containerView:{
      marginTop: 15,
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    labelBtn:{
      height: 28,
      borderRadius:14,
      paddingLeft:15,
      paddingRight:15,
      marginBottom:10,
      marginRight:10,
    },
});

module.exports = SearchHistory;
