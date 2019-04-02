'use strict';

import React,{component} from 'react';
import {Device,DeviceEvent,Host,Package,Service} from 'miot';
import {
  APPBAR_HEIGHT,APPBAR_MARGINBOTTOM,APPBAR_MARGINTOP,isIPX ,
  ratio,NavigatorBarHeight,screenWidth,screenHeight} from '../ConstDefine';
import Label from '../View/Label';
import {XimalayaSDK,XMReqType} from '../Const/XimalayaSDK';
import LoadingView from'../View/LoadingView';
import FailView from'../View/FailView';
import {withNavigation} from 'react-navigation';
import {
  Image,
  ImageBackground,
  ListView,
  TouchableHighlight,
  StyleSheet,
  Text,
  PixelRatio,
  ScrollView,
  View,
  TouchableWithoutFeedback,
} from 'react-native';


var size_large = (screenWidth-11 * 2 - 5) / 2;
var size_small = (size_large - 5) / 2;
class Vbtn extends React.Component{

    render(){
         return (
           <TouchableWithoutFeedback onPress={this.props.onPress} >
              <View style={[{justifyContent:'center', alignItems:'center'},this.props.style]}  >
                    <ImageBackground   style={{height:45, width:45}} source={this.props.source}/>
                    <Label   style={{marginTop:10}} text={this.props.text} textStyle={this.props.textStyle}/>
              </View>
           </TouchableWithoutFeedback>
         );
    }
}

class ListBtn extends React.Component{
    /*
      *   source, text， onPress, leftStyle, topStyle
      */
    render(){
        var m = screenWidth > 320 ? 50 : 42;
        let bkcolor = this.props.source ? 'white' : 'white';
        return (
          <TouchableHighlight onPress={this.props.onPress}
                              underlayColor='rgb(255,255,255)'
                              style={[{height:45,width: screenWidth/2,backgroundColor:'white'}, this.props.topStyle]}>
              <View style={{flex:1}}>
                    <View style={{flex:1, flexDirection:'row', marginLeft: m, alignItems:'center'}}>
                      <ImageBackground style={{height:25, width:25,}} source={require('../../Resources/holder_small.png')} resizeMode='stretch' >
                          <ImageBackground style={{flex:1,backgroundColor: bkcolor}} source={this.props.source}  resizeMode='stretch'/>
                      </ImageBackground>
                      <Text style={{marginLeft:9, fontSize:15,color:'rgb(88,88,88)'}}>{this.props.text}</Text>
                      <View style={[{height:30,width:1/PixelRatio.get(),position:'absolute', top:8, right:0}, this.props.leftStyle]}/>
                    </View>
                    <View style={{height:1/PixelRatio.get(), backgroundColor:'rgb(237,237,237)'}}/>
              </View>
          </TouchableHighlight>
        );
    }

}

class DlivePage extends React.Component{
    
      constructor(props){
        super(props);
          var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
          this.state = {
            failed:false,
            loaded: false,
            dataSource: ds,
            topSource:[],
            xmError:false,
          }
      }

      componentWillMount(){

           this.setState({
             loaded:false,
             failed:false,
             xmError:false,
           });
           this.errorInfo= '';//接口错误信息

           XimalayaSDK.requestXMData(XMReqType.XMReqType_CategoriesList, {}, (result, error) => {
            if(!error) {

              var topData = result.splice(0, 5);
              var listData = result.splice(5, result.length - 5);
              if(listData.length % 2 > 0) {
                listData.push({category_name:'', id: -1});
              }

              this.setState({
                failed:false,
                loaded: true,
                xmError:false,
                dataSource: this.state.dataSource.cloneWithRows(listData),
                topSource: topData,

              });

            } else{

               if(error&&error.error_no&&error.error_desc){
                 this.errorInfo='error_no:'+JSON.stringify(error.error_no)+'  '+JSON.stringify(error.error_desc);
                 this.state.xmError=true;
               }
                this.i = 0;
                this.setState({
                     failed: true,
                     loaded: true,
                });
              
             }
          });

      }


      onPress(id, name){

        if(id == -1) return;
        this.props.navigation.navigate('AlbumsInSomeCategory', {
          title: name,
          categoryId : id,
          categoryName: name,
        });
      }

      getSourceUri(categoryName){
        var sourceUri='';
        switch (categoryName) {
          case '人文':
            sourceUri=require('../../Resources/humanity.png');
            break;
          case '英语':
          sourceUri=require('../../Resources/english.png');
            break;
          case '小语种':
            sourceUri=require('../../Resources/minoritylanguage.png');
            break;
          case '教育培训':
            sourceUri=require('../../Resources/educationAndTraining.png');
            break;
          case '广播剧':
            sourceUri=require('../../Resources/broadcastingPlay.png');
            break;
          case '戏曲':
            sourceUri=require('../../Resources/traditionalOpera.png');
            break;
          case '百家讲坛':
            sourceUri=require('../../Resources/bjjt.png');
            break;
          case '电台':
            sourceUri=require('../../Resources/radioStation.png');
            break;
          case '商业财经':
            sourceUri=require('../../Resources/sycj.png');
            break;
          case 'IT科技':
            sourceUri=require('../../Resources/ITTechnology.png');
            break;
          case '汽车':
            sourceUri=require('../../Resources/car.png');
            break;
          case '动漫游戏':
            sourceUri=require('../../Resources/animegame.png');
            break;
          case '电影':
            sourceUri=require('../../Resources/film.png');
            break;
          case '名校公开课':
            sourceUri=require('../../Resources/mxgkk.png');
            break;
          case '时尚生活':
            sourceUri=require('../../Resources/sssh.png');
            break;
          case '诗歌':
            sourceUri=require('../../Resources/poetry.png');
            break;
          case '健康养生':
              sourceUri=require('../../Resources/jkys.png');
              break;
          case '旅游':
              sourceUri=require('../../Resources/tour.png');
              break;
          default:
            sourceUri=require('../../Resources/others.png');
        }

        return sourceUri;

      }

      _renderRow(rowData, sectionID, rowID) {

          var leftStyle={backgroundColor:'rgb(237,237,237)'};
          var topStyle = {marginTop: 10};

          if(rowData.category_name!='') rowData.cover_url_small = this.getSourceUri(rowData.category_name);

          if(rowID % 6 <= 1) {

            if(rowID % 2 == 0) {
              return <ListBtn key={rowID+sectionID} topStyle={topStyle} leftStyle={leftStyle} source={rowData.cover_url_small} text={rowData.category_name} onPress={()=>{this.onPress(rowData.id, rowData.category_name)}}/>
            }

            return <ListBtn key={rowID+sectionID} topStyle={topStyle} source={rowData.cover_url_small} text={rowData.category_name} onPress={()=>{this.onPress(rowData.id, rowData.category_name)}}/>
          } else {

              if(rowID % 2 == 0) {
                  return <ListBtn key={rowID+sectionID} leftStyle={leftStyle} source={rowData.cover_url_small} text={rowData.category_name} onPress={()=>{this.onPress(rowData.id, rowData.category_name)}}/>
              }

              return (
                  <ListBtn key={rowID+sectionID} source={rowData.cover_url_small} text={rowData.category_name} onPress={()=>{this.onPress(rowData.id, rowData.category_name)}}/>
              );

          }

      }

      render() {

        if (!this.state.loaded) {
          return <LoadingView style={{flex:1}}/>
        }
        if(this.state.xmError) {
          return(
              <View style={{flex:1}}>
                    <FailView
                      onPress={this.componentWillMount.bind(this,0)}
                      style={{flex:1, paddingBottom:65}} text1={this.errorInfo}
                      text2='页面加载错误,请双击Home键清空后台重试' />
              </View>
          );
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

        var audiobookTxt ='小说';
        var audiobookSource = require('../../Resources/kind_btn_audiobook1.png');
        var varietyTxt ='娱乐';
        var varietySource =require('../../Resources/kind_btn_variety1.png');
        var musicTxt ='音乐';
        var musicSource =require('../../Resources/kind_btn_music1.png');
        var childrenTxt ='儿童';
        var childrenSource =require('../../Resources/kind_btn_children1.png');
        var crosstalkTxt ='相声';
        var crosstalkSource =require('../../Resources/kind_btn_crosstalk1.png');
        return(
            <View  style={{flex:1}}>
                <ScrollView
                  automaticallyAdjustContentInsets={false}
                  contentContainerStyle={styles.contentContainer}
                  style={styles.scrollView}>
                    <View style={styles.topContainer}>
                        <Vbtn ref={component => this.favorBtn = component} style={styles.favorBtn} source={audiobookSource} text={audiobookTxt} textStyle={styles.textStyle} onPress={()=>{this.onPress(this.state.topSource[0].id, this.state.topSource[0].category_name)}}/>
                        <Vbtn ref={component => this.favorBtn = component} style={styles.favorBtn} source={varietySource} text={varietyTxt} textStyle={styles.textStyle} onPress={()=>{this.onPress(this.state.topSource[2].id, this.state.topSource[2].category_name)}}/>
                        <Vbtn ref={component => this.favorBtn = component} style={styles.favorBtn} source={musicSource} text={musicTxt} textStyle={styles.textStyle} onPress={()=>{this.onPress(this.state.topSource[1].id, this.state.topSource[1].category_name)}}/>
                        <Vbtn ref={component => this.favorBtn = component} style={styles.favorBtn} source={childrenSource} text={childrenTxt} textStyle={styles.textStyle} onPress={()=>{this.onPress(this.state.topSource[4].id, this.state.topSource[4].category_name)}}/>
                        <Vbtn ref={component => this.favorBtn = component} style={styles.favorBtn} source={crosstalkSource} text={crosstalkTxt} textStyle={styles.textStyle} onPress={()=>{this.onPress(this.state.topSource[3].id, this.state.topSource[3].category_name)}}/>
                    </View>
                    {/* 列表 */}
                    <ListView
                      initialListSize={50}
                      scrollEnabled={false}
                      automaticallyAdjustContentInsets={false}
                      showsVerticalScrollIndicator={false}
                      renderRow={this._renderRow.bind(this)}
                      dataSource={this.state.dataSource}
                      contentContainerStyle={styles.listContainer}/>
                </ScrollView>
            </View>
          );
      }
}

var styles = StyleSheet.create({
    listContainer:{
      justifyContent: 'space-between',
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    topContainer:{
      paddingLeft: 40,
      paddingRight:40,
      backgroundColor:'#ffffff',
      flexDirection:'row',
      height:102,
      width:screenWidth,
      alignItems:'center',
      justifyContent:'space-around'
    },
    scrollView:{
      flex:1,
    },
    contentContainer:{
      paddingBottom: 70,
    },
    favorBtn:{
      flex:1,
      width:43,
      height:43,
    },
    textStyle: {
      color: 'rgba(0,0,0,.8)',
      fontSize: 14,
    },
});
export default withNavigation(DlivePage);
