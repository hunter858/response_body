'use strict';

import React,{component} from 'react' ;
import {XimalayaSDK,XMReqType} from '../Const/XimalayaSDK';
import {
    APPBAR_HEIGHT,APPBAR_MARGINBOTTOM,APPBAR_MARGINTOP,isIPX ,
    ratio,NavigatorBarHeight,screenWidth,screenHeight} from '../ConstDefine';
import LoadingView from '../View/LoadingView';
import FailView from '../View/FailView';


import {
  StyleSheet,
  Text,
  PixelRatio,
  View,
  ImageBackground,
  Image,
  TouchableOpacity,
  DeviceEventEmitter
} from 'react-native';


var queryStr= '';
var queringData = false;

class SearchingResultView extends React.Component{

    constructor(props){
        super(props);
        this.state =  {
            failed:false,
            loaded: false,
            datas: null,
        }
    }
  
    componentWillMount(){
       this.setState({
          loaded:false,
          failed:false,
          datas: null,
       });
       this.queryStr = this.props.queryStr;
       this.loadData();
    }
    
    loadData(){

        if(this.queringData){
           return;
        }

        this.queringData = true;
         XimalayaSDK.requestXMData(XMReqType.XMReqType_SearchSuggestWords, {q: this.queryStr}, (result, error) => {

              if(!error && result != undefined){
                  this.queringData = false;
                  this.setState({
                      loaded: true,
                      datas: result,
                  });
              } else {

                this.queringData = false;
                this.i = 0;
                this.setState({
                    failed: true,
                    loaded: true,
                });
              }

         });
    }

    componentWillReceiveProps(nextProps){
        if(this.queryStr != nextProps.queryStr){
          this.queryStr = nextProps.queryStr;
          this.loadData();
        }
    }

    componentDidMount(){

    }

    reloadData(text){

         var nextQuery = text;
         if(this.queryStr != nextQuery){
            this.queryStr = nextQuery;
            this.loadData();
         }
    }

    componentWillUnmount(){

      this.setState({
          loaded:false,
          failed:false,
          datas: null,
       });
    }

    renderAlbums(){
        var values = this.state.datas.albums;
        return(
            <View >
                {values.map((data, i) => this.renderAlbumsRow(data, i))}
            </View>
        );
    }

    renderAlbumsRow(data, index){

        return(
            <TouchableOpacity key={index + data.id} onPress={this.props.onAlbumRowPress.bind(this,data.id)}>
                <View style={styles.containerView}>
                      <View style={{flex:1, flexDirection:'row', alignItems:'center',}}>
                         <ThumbImage source={data.cover_url_small}/>
                         <Text style={{fontSize:15, marginLeft:12}}>{data.album_title}</Text>
                         <Text style={{fontSize:13, color:'rgb(127,127,127)', position:'absolute', top:21, right:12}}>{data.category_name}</Text>
                      </View>
                      <View style={styles.separator}/>
                </View>
            </TouchableOpacity>
        );

    }

    renderKeyWords(){

        var values = this.state.datas.keywords;
        return(
             <View>
                {values.map((data, i) => this.renderKeyWordRow(data, i))}
            </View>
        );

    }
    renderKeyWordRow(data, index){

       return (
        <TouchableOpacity key={index} onPress={this.onKeyWordRowPress.bind(this,data.keyword)}>
            <View style={styles.containerView2}>
                <Text > {data.keyword}</Text>
                <View style={styles.separator}/>
            </View>
        </TouchableOpacity>
       );
    }

    onKeyWordRowPress(data){
        this.props.onKeyWordRowPress(data);
    }

    render(){
        if(!this.state.loaded) {
            return <LoadingView style={{flex:1}}/>
        }

        if(this.state.failed) {
         return(
              <View style={{flex:1}}>
                    <FailView
                       onPress={this.componentWillMount.bind(this,0)}
                       style={{flex:1, paddingBottom:65}} text1='糟糕 发生错误了'
                       text2='点击屏幕重试' />
              </View>
         );
        }

      var albums = null;
      var keywords = null;
      if(this.state.datas.album_total_count > 0) {
        albums = this.renderAlbums();
      }

      if(this.state.datas.keyword_total_count > 0) {
        keywords = this.renderKeyWords();
      }

      return (
            <View style={styles.top}>
                {albums}
                {keywords}
            </View>
        );
    }
}



class ThumbImage extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            source:'',
            abc: true,
        }
    }

    componentWillMount(){
        this.setState({
          source: this.props.source,
        });
    }

    setSource(ss){

      if(this.state.source != ss ) {
          var st = this.state.abc;
           this.setState({
              source: ss,
              abc: !st,
           });
      }

    }

    render(){

          if(this.state.abc){
                return(
                   <ImageBackground style={{justifyContent:'center', alignItems:'center'}} source={require('../..//Resources/holder_small.png')}>
                      <ImageBackground source={{uri:this.state.source}} style={[styles.thumb2]}></ImageBackground>
                    </ImageBackground>
                );
          } else {
                return(
                   <View style={ {justifyContent:'center', alignItems:'center'}}>
                     <ImageBackground style={[styles.thumb2, {alignSelf:'center',justifyContent:'center', alignItems:'center'}]} source={require('../../Resources/holder_small.png')}>
                            <ImageBackground source={{uri:this.state.source}} style={[styles.thumb2]}></ImageBackground>
                      </ImageBackground>
                    </View>
                );
          }

    }

}


var styles = StyleSheet.create({
    top:{
        flex:1,
        backgroundColor:'white',
        paddingLeft:12,
    },
    containerView2:{
        height:44,
        justifyContent:'center',
    },
    containerView:{
        height:55,
        justifyContent:'center',
    },
    separator:{
        position:'absolute',
        left:0,
        bottom:0,
        height: 1/PixelRatio.get(),
        backgroundColor:'rgb(235,235,235)',
        width: screenWidth - 12,
    },
    thumb2:{
        width:43,
        height:43,
        alignSelf:'center',
        backgroundColor:'transparent',
    },
});

module.exports = SearchingResultView;
