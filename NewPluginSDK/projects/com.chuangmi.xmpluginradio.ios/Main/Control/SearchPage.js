'use strict';

import React,{component} from 'react' ;
import {XimalayaSDK,XMReqType} from '../Const/XimalayaSDK';
import { TitleBarBlack,TitleBarWhite,LoadingDialog } from 'miot/ui';
import {Device,DeviceEvent,Host,Package,Service} from 'miot';
import {
  APPBAR_HEIGHT,APPBAR_MARGINBOTTOM,APPBAR_MARGINTOP,isIPX ,
  ratio,NavigatorBarHeight,screenWidth,screenHeight} from '../ConstDefine';
import Constants from '../../Main/Constants';
import SearchHistory from '../View/SearchHistory';
import SearchRsView from '../View/SearchRsView';
import NoWifiView from '../View/NoWifiView';
import NewBottomView from '../View/NewBottomView';
import SearchingResultView from '../View/SearchingResultView';




import {
  Image,
  TextInput,
  StyleSheet,
  Text,
  PixelRatio,
  View,
  ActionSheetIOS,
  DeviceEventEmitter,
} from 'react-native';


class SearchPage extends React.Component{


    constructor(props){
       super(props);

       var params = this.props.navigation.state.params;
       this.state= {
          queryStr:(params.queryStr)?(params.queryStr):'',
          showQuery:(params.showQuery)?(params.showQuery):false,
          message:'',
          visLoading:false,
       }
       this._showQ= false;
       this._searchingResultPageShowed=false;
       this.local=[];
       this.info= null;
    }

    componentWillMount(){

      // this.state.queryStr=this.props.navigation.state.params.queryStr;
    
      this.local = [];
      Host.file.readFile(Service.account.ID + '===' + Device.deviceID + '::history').then((content)=>{
        if(content != '') {
          var datas = JSON.parse(content);
          for(var i=0; i<datas.length; i++) {
            this.local.push(datas[i]);
          }
        }
      });

    }

    componentDidMount(){
      //第一次进入搜索页面需要把值设置到textinput
      this.input.setNativeProps({text:this.props.params });

      this.subscription = DeviceEventEmitter.addListener('SearchPageRightBtnPress',(notification) => {
          ActionSheetIOS.showActionSheetWithOptions({
            options: ['定时关闭', '特色闹铃', '取消'],
            cancelButtonIndex: 2,
            title: Constants.Channels.sheetTitle(),
          },
          (buttonIndex) => {
             this.sheetBtnHandler(buttonIndex);
          });
      });

    }

    componentWillUnmount(){
      console.log("搜索组件消失了");
       this.subscription.remove();

       Host.file.writeFile(Service.account.ID + '===' + Device.deviceID + '::history', "" + JSON.stringify(this.local) ).then((result)=>{
        // result
       });

    }


    cancellTextPressHandler(){
       this.props.navigation.pop();
    }

    broadSearchTextChangeEvent(text){

      if(this._searchingResultPageShowed && text != '') {

          if(this.list) {
            this.list.reloadData(text);
          }
      }
    }

    onFocus(){
      this._showQ = false;
    }

    onChangeText(text){

      if(text.length > 30 && this.input){
          //  MHPluginSDK.showFailTips('您输入的字符数量已达上限');
           text = text.substring(0,30);
           this.input.setNativeProps({text: text});
      }

      if(this._showQ) {
        return;
      }

      if(text != '' && this.state.queryStr != ''){
          this.setState({
            queryStr: text,
            showQuery: false,
          });
          this.broadSearchTextChangeEvent(text);
      } else {
          this.setState({
            queryStr: text,
            showQuery: false,
          });
      }
    }

    onSubmitEditing(){

      if(this.state.queryStr != '' ){

        var founded = false;
        for(var k=0; k<this.local.length; k++){
           if(this.local[k] == this.state.queryStr) {
             founded = true;
             break;
           }
        }
        if(!founded) {
            if(this.local.length == 8) {
              this.local.splice(0, 1);
            }
            this.local.push(this.state.queryStr);
        }

      }

      this.setState({
         showQuery: true,
      });

    }


    sheetBtnHandler(index){
     if (index == 0) {

      this.props.navigation.navigate('TimerSetting', {
        title:'定时关闭',
      });

    } 
    else if(index == 1){

        this.props.navigation.navigate('ClockSetting', {
          title:'特色闹铃',
        });
        // DeviceEventEmitter.emit('ClockSettingRightBtnPressEvent', {});
    }

    }

    // 清除历史记录
    clearLocal(){
      this.local = [];
    }

    onLabelPress(data) {

       this.input.setNativeProps({text: data});

       var founded = false;
        for(var k=0; k<this.local.length; k++){
           if(this.local[k] == data) {
             founded = true;
             break;
           }
        }
        if(!founded) {
           if(this.local.length == 8) {
              this.local.splice(0, 1);
            }
            this.local.push(data);
        }

        this._showQ = true;

        this.setState({
           showQuery: true,
           queryStr: data,
        });
    }

    onAlbumRowPress(id) {

          //根据id获取专辑信息
          this.setState({message:'加载中...',visLoading:true});
          XimalayaSDK.requestXMData(XMReqType.XMReqType_AlbumsBatch, {ids: id + ''}, (result, error) => {

              this.setState({message:'',visLoading:false});
              if(!error && result!= undefined && result != null) {
                   this.info = result[0];
                   Device.getDeviceWifi().callMethod("get_channels",{"all":0}).then((result)=>{

                        const channels = result.result.chs;
                        if(channels != undefined){
                           var isfavored = false;
                           var chs = channels;
                           for(var k=0; k<chs.length; k++){
                            var tmp = chs[k];
                            if(tmp.id == id && tmp.t == 1){
                              isfavored = true;
                              break;
                            }
                           }

                          
                          this.props.navigation.navigate('AlbumPage', {
                              albumInfo: this.info,
                              favored: isfavored,
                              isFromFind: true,
                          }); 
                          // 跳转至专辑详情页

                        }
                     }).catch(error=>{
                      console.log('error282'+JSON.stringify(error));
                    });

              } else {
                 this.onAlbumRowPress(id);
              }

          });
    }

    render() {

        if(this.state.netInfo == 'none' || this.state.netInfo == 'unknown'){
            return <NoWifiView />
        }
        if(this.state.showQuery){
          return(
              <View style={{flex:1, backgroundColor:Constants.TintColor.rgb237, marginTop:0,}}>
                  <LoadingDialog 
                    title={this.state.message}
                    cancelable={true}
                    timeout={3000}
                    onDismiss={() => {
                      this.setState({visLoading: false});
                    }}
                    visible={this.state.visLoading}
                  />
                  <View style={styles.top}>
                        <View style={styles.topContainer}>
                            <Image source={require('../../Resources/query.png')} style={styles.queryImg} resizeMode='stretch'/>
                            <TextInput  style={styles.input}
                                        ref = {(input) => {this.input= input}}
                                        keyboardType='default'
                                        multiline={false}
                                        placeholder='搜索专辑，电台'
                                        clearButtonMode='while-editing'
                                        enablesReturnKeyAutomatically={true}
                                        returnKeyType='search'
                                        autoFocus = {false}
                                        onFocus={()=>{this.onFocus()}}
                                        maxLength={30}
                                        onSubmitEditing={()=>{this.onSubmitEditing()}}
                                        onChangeText={(text)=>{this.onChangeText(text)}}/>
                          </View>
                          <Text style={styles.cancelText} onPress={()=>{this.cancellTextPressHandler()}}>取消</Text>
                  </View>
                  <View style={{flex:1,}}>
                      <SearchRsView queryStr={this.state.queryStr} navigator={this.props.navigator} />
                  </View>
                  <NewBottomView  navigator={this.props.navigator} radioActive={false} findActive={true}/>
              </View>
          );
        }

        if(this.state.queryStr == ''){
              this._searchingResultPageShowed = false;
              return(
                  <View style={{flex:1, backgroundColor:Constants.TintColor.rgb237, paddingTop:0,}}>
                    <View style={styles.top}>
                          <View style={styles.topContainer}>
                              <Image source={require('../../Resources/query.png')} style={styles.queryImg} resizeMode='stretch'/>
                              <TextInput  style={styles.input}
                                          ref = {(input) => {this.input= input}}
                                          keyboardType='default'
                                          multiline={false}
                                          placeholder='搜索专辑，电台'
                                          clearButtonMode='while-editing'
                                          enablesReturnKeyAutomatically={true}
                                          returnKeyType='search'
                                          autoFocus = {false}
                                          onFocus={()=>{this.onFocus()}}
                                          maxLength={30}
                                          onSubmitEditing={()=>{this.onSubmitEditing()}}
                                          onChangeText={(text)=>{this.onChangeText(text)}}/>
                            </View>
                            <Text style={styles.cancelText} onPress={()=>{this.cancellTextPressHandler()}}>取消</Text>
                    </View>
                    <View style={{flex:1,}}>
                        <SearchHistory locals={this.local} clear={()=>{this.clearLocal()}} onLabelPress={()=>{this.onLabelPress()}}/>
                    </View>
                    <NewBottomView  navigator={this.props.navigator}  radioActive={false} findActive={true}/>
                </View>
              );
        }


        this._searchingResultPageShowed = true;
          return (
            <View style={{flex:1, backgroundColor:Constants.TintColor.rgb237, paddingTop:0,}}>
                <View style={styles.top}>
                      <View style={styles.topContainer}>
                          <Image source={require('../../Resources/query.png')} style={styles.queryImg} resizeMode='stretch'/>
                          <TextInput  style={styles.input}
                                      ref = {(input) => {this.input= input}}
                                      keyboardType='default'
                                      multiline={false}
                                      placeholder='搜索专辑，电台'
                                      clearButtonMode='while-editing'
                                      enablesReturnKeyAutomatically={true}
                                      returnKeyType='search'
                                      autoFocus = {false}
                                      onFocus={()=>{this.onFocus()}}
                                      maxLength={30}
                                      onSubmitEditing={()=>{this.onSubmitEditing()}}
                                      onChangeText={(text)=>{this.onChangeText(text)}}/>
                        </View>
                        <Text style={styles.cancelText} onPress={()=>{this.cancellTextPressHandler()}}>取消</Text>
                </View>
                <View style={{flex:1,}}>
                    <SearchingResultView  
                    ref={(list) => {this.list= list}}   
                    queryStr={this.state.queryStr} 
                    onKeyWordRowPress={()=>{this.onLabelPress()}} 
                    onAlbumRowPress={()=>{this.onAlbumRowPress()}}/>
                </View>
                <NewBottomView  
                  navigator={this.props.navigator} 
                  radioActive={false} findActive={true}/>
            </View>
          );
    }

}

var styles = StyleSheet.create({

  top:{
    height: 48,
    flexDirection: 'row',
    alignItems:'center',
    justifyContent:'space-between',
    paddingLeft: 13,
    paddingRight: 13,
  },
  cancelText:{
    marginLeft:14,
    fontSize:14,
    color:'rgb(127,127,127)',
  },
  topContainer:{
    flex:1,
    alignItems:'center',
    backgroundColor:'white',
    flexDirection:'row',
    height:28,
    borderRadius:14,
    paddingLeft:8,
    paddingRight:10,
  },
  queryImg:{
    height:13,
    width:16,
    marginRight:8,
  },
  input:{
    flex:1,
    fontSize:13,
    color:'rgb(127,127,127)',
  },

});

module.exports = SearchPage;
