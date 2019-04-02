'use strict';

import React,{component} from 'react' ;
import Constants from '../../Main/Constants';
import {XimalayaSDK,XMReqType} from '../Const/XimalayaSDK';
import {Device,DeviceEvent,Host,Package,Service} from 'miot';
import CommonCell from '../View/CommonCell';
import FailView from '../View/FailView';
import NoWifiView from '../View/NoWifiView';
import NewBottomView from '../View/NewBottomView';
import LoadingView from '../View/LoadingView';
import PropTypes from 'prop-types';


import {
  Image,
  ListView,
  TouchableHighlight,
  StyleSheet,
  Text,
  PixelRatio,
  View,
  DeviceEventEmitter,
  ActionSheetIOS,
  TouchableWithoutFeedback,
  LayoutAnimation,
  ScrollView,
  ProgressViewIOS,
  TouchableOpacity,
  FlatList,
} from 'react-native';




class AlbumsInSomeCategory extends React.Component{

    static propTypes ={
        categoryId : PropTypes.number,
        categoryName: PropTypes.string,
      }
	 
    constructor(props){
      super(props);
      var params = this.props.navigation.state.params;
      this.state =  {
        loaded: false,
        failed: false,
        dataSource:[],
        categoryId:params.categoryId,
        categoryName:params.categoryName,
      }
    }

    loadHotAlbums(){


      	var params={
              category_id: this.state.categoryId,
              count: Constants.PageCount.size,
              page: this.currentPage,
              calc_dimension:1,
           };
          console.log("分类下的专辑页面请求");
  	      XimalayaSDK.requestXMData(XMReqType.XMReqType_AlbumsList, params, (result, error) => {
  	          if(!error && result!=undefined && result.albums!=undefined && result.albums.length > 0) {
  	          	   if(this.list) {
  	          	   		this.list.hideFooter();
  	          	   }

  	          	   this.totalPage = result.total_page;
  	          	   for(var i=0; i<result.albums.length; i++){
  	          	   		this.loadedAlbums.push(result.albums[i]);
  	          	   }

  	               this.setState({
  	                    loaded: true,
                        failed:false,
  	                    dataSource: this.loadedAlbums,
  	               });

  	          }else {
                
              }

  	      });
    }

    loadRadioChannels() {

      Device.getDeviceWifi().callMethod("get_channels",{"all":0}).then((result)=>{

        const channels = result.result.chs;
        if(channels != undefined){
          this.radioChannels= channels;
          this.loadHotAlbums();
        } else {
          this.radioChannels= [];
          this.loadHotAlbums();
        }
      }).catch(error=>{
          console.log('error-106'+JSON.stringify(error));
      });

    }
    
    componentDidMount(){

          this.subscription2 = DeviceEventEmitter.addListener('ChannelsChangeEvent', (event) => {

            Device.getDeviceWifi().callMethod("get_channels",{"all":0}).then((result)=>{

                const channels = result.result.chs;
                if(channels != undefined) {
                  this._radioFavorPrograms = channels;
                }
              }).catch(error=>{
                console.log('error-121-'+JSON.stringify(error));
              });
          });

        this.subscription = DeviceEventEmitter.addListener('AlbumsInSomeCategoryRightBtnPress',(notification) => {
          console.log("通知：接收到新页面的通知");
          // 因为最新版本的MiHome，会弹出两次pop框，如果已经弹出，下次不再弹出
          if (this.actionSheetHasShow) {
            console.log("通知：因为已经弹出，直接返回");
            return;
          }
          this.actionSheetHasShow = true;
          console.log("通知：执行的通知次数");
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

    sheetBtnHandler(index){
      console.log("通知：处理页面通知的功能" + index);
      this.actionSheetHasShow = false;
      if (index == 0) {

        this.props.navigation.navigate('TimerSetting', {
          title:'定时关闭',
        });
      

      } else if(index == 1){
        this.props.navigation.navigate('ClockSetting', {
          title:'特色闹铃',
        });
        // DeviceEventEmitter.emit('ClockSettingRightBtnPressEvent', {});
        
      }

    }

    componentWillUnmount(){
         
      this.subscription2.remove();
      this.subscription.remove();
    }

    componentWillMount() {

    	this.currentPage = 1;
  		this.totalPage = 100;
  		this.loadedAlbums = [];
      this.radioChannels =[];
      // 因为最新版本的MiHome，会弹出两次pop框
      this.actionSheetHasShow = false;

      this.setState({
        loaded:false,
        failed:false,
      });
    	this.loadRadioChannels();

    }

    //跳转至专辑列表也
    onRowPress(albumData, favored) {
      // console.log("专辑信息" + albumData);
      // console.log("跳转专辑详情页面"+ JSON.stringify(albumData));
      //   albumInfo, favored
      Device.getDeviceWifi().callMethod("get_channels",{"all":0}).then((result)=>{

          const channels = result.result.chs;
          if(channels != undefined){
             var isfavored = false;
             var chs = channels;
             for(var k=0; k<chs.length; k++){
              var tmp = chs[k];
              if(tmp.id == albumData.id && tmp.t == 1){
                isfavored = true;
                break;
              }
             }

            this.props.navigation.navigate('AlbumPage', {
                albumInfo: albumData,
                favored: isfavored,
                isFromFind: true,
                title:albumData.album_title
            });
            // MHPluginSDK.sendEvent('AlbumPageRightBtnPress', {});

          }
       }).catch(error=>{
          console.log('error-253'+JSON.stringify(error));
      });
    }

    renderRow(rowData){

    /* 	onRowPress : PropTypes.func,
        thumbSource: PropTypes.string,
        text1: PropTypes.string,
        text2: PropTypes.string,
        text3: PropTypes.string,
        favored: PropTypes.bool,
        onFavorBtnPress: PropTypes.func,
        onPlayBtnPress: PropTypes.func,   */

        //检查当前专辑是否已收藏
        var favored = false;
        for(var i=0; i<this.radioChannels.length; i++) {

        	var tmp = this.radioChannels[i];
        	if(tmp.id == rowData.id){
        		favored = true;
        	}
        }

        var item = rowData.item;
	      return (
	          <CommonCell
              key={JSON.stringify(item)+item.id}
              dataId={item.id}
              onRowPress={this.onRowPress.bind(this,item, favored)}
              thumbSource={item.cover_url_small}
              text1={item.album_title}
              text2={item.album_intro}
              text3={'播放' + Constants.PlayCountsUtils.getPlayCount(item.play_count) + ' 共' + item.include_track_count + '集'}
              favored={favored}/>
	      );

    }


    onInfinite(){

    	 this.currentPage += 1;
    	 this.loadHotAlbums();
    }

    _rendSeparator(rowData, sectionID, rowID, highlightRow) {
      return (<View key={rowID+sectionID} style={styles.separatorView} />);
    }

    renderHeaderRefresh(){
    	return <View/>
    }

    loadedAllData(){
    	return this.currentPage >= this.totalPage;
    }

	  render(){

      if(this.state.netInfo == 'none' || this.state.netInfo == 'unknown'){
          return <NoWifiView />
      }

      if(!this.state.loaded) {
          return <LoadingView style={{flex:1}}/>
      }
      if(this.state.failed) {

          return(
            <View style={{flex:1}}>
                  <FailView
                    onPress={this.componentWillMount.bind(this,0)}
                    style={{flex:1, paddingBottom:130/PixelRatio.get()}} text1='糟糕 发生错误了'
                    text2='点击屏幕重试' />
                  <NewBottomView  navigator={this.props.navigator}  radioActive={false} findActive={true}/>
            </View>
          );
      }


			return(
				<View style={styles.container}>
            <FlatList
              style={styles.list}
              data={this.state.dataSource}
              refreshing={!this.state.loaded}
              renderItem={this.renderRow.bind(this)}
              ItemSeparatorComponent={this._rendSeparator.bind(this)}
              extraData={this.state}
              keyExtractor={this._keyExtractor}
              onEndReached={()=>{this.onInfinite()}}
            />
	          <NewBottomView  navigator={this.props.navigator}  radioActive={false} findActive={true}/>
				</View>
			);

	}

}



var styles = StyleSheet.create({

	container:{
		flex:1,
    paddingTop:0,
    backgroundColor:Constants.TintColor.rgb255,
	},
	list:{
		flex:1,
		paddingBottom:300/PixelRatio.get(),
	},
  separatorView:{
    height:0.8,
    marginLeft:12,
    backgroundColor:Constants.TintColor.rgb243,
  },
});


module.exports=AlbumsInSomeCategory;
