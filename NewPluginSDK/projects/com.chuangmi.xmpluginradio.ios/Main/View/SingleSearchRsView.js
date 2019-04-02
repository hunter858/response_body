'use strict';

import React,{component} from 'react' ;
import {
  APPBAR_HEIGHT,APPBAR_MARGINBOTTOM,APPBAR_MARGINTOP,isIPX ,
  ratio,NavigatorBarHeight,screenWidth,screenHeight} from '../ConstDefine';
import Constants  from '../../Main/Constants';
import {Device,DeviceEvent,Host,Package,Service} from 'miot';
import {XimalayaSDK,XMReqType}  from '../Const/XimalayaSDK';
import CommonCell  from './CommonCell';
import FailView  from '../View/FailView';
import LoadingView  from '../View/LoadingView';
import {withNavigation} from 'react-navigation';


import {
	Image,
	FlatList,
  ListView,
  TouchableHighlight,
  StyleSheet,
  Text,
  PixelRatio,
  DeviceEventEmitter,
  View,
} from 'react-native';


var currentPage = 1;
var totalPage = 10;
var loadedDatas = [];
var radioChannels = [];
var i = 0;

class SingleSearchRs extends React.Component{

	constructor(props){
    super(props);
		this.state =  {
			loaded: false,
			failed: false,
			dataSource:[],
			error_no: -1,
		}
  }

	componentWillMount() {

		this.currentPage = 1;
		this.i = 0;
		this.totalPage = 10;
		this.loadedDatas = [];
		this.radioChannels =[];

		this.setState({
			loaded:false,
			failed:false,
		});
		this.loadRadioChannels();

	}
	
	componentDidMount(){

		this.subscription2 = DeviceEventEmitter.addListener('ChannelsChangeEvent', (event) => {

			Device.getDeviceWifi().callMethod("get_channels",{"all":0}).then((result)=>{

				const channels = result.result.chs;
				if(channels != undefined) {
					this.radioChannels = channels;
				}
			}).catch(error=>{
        console.log('error-82 -'+JSON.stringify(error));
      });
		});
  }

	componentWillUnmount(){
				this.subscription2.remove();
	}

	renderHeaderRefresh(){
		return <View/>
	}
	
	onRefresh(){
		this.loadDatas();
	}
	
	loadedAllData(){
		return this.currentPage >= this.totalPage;
	}

	sheetBtnHandler(index){

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

	//跳转至专辑列表也
	onRowPress(radioData, favored) {

		Device.getDeviceWifi().callMethod("get_channels",{"all":0}).then((result)=>{

				const channels = result.result.chs;
				if(channels != undefined){
						var isfavored = false;
						var chs = channels;
						for(var k=0; k<chs.length; k++){
						var tmp = chs[k];
						if(tmp.id == radioData.id && tmp.t == 0){
							isfavored = true;
							break;
						}
						}


						this.props.navigation.navigate('PlayPage', {
							title: '',
							type: 0,
							favored: isfavored,
							radioInfo: radioData,
						});
				}
		}).catch(error=>{
			console.log('error-159 -'+JSON.stringify(error));
		});

	}
	
	//跳转至专辑列表也
	onRowPress2(albumData, favored) {

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
							title: albumData.album_title,
							albumInfo: albumData,
							favored: isfavored,
							isFromFind: true,
						});
				}
			}).catch(error=>{
        console.log('error-189 -'+JSON.stringify(error));
      });

	}

	renderRow(sourceData){

			var rowData = sourceData.item;
			if(rowData== undefined || rowData.id == undefined || rowData.id == 'null'){
				return <View key={JSON.stringify(rowData)}/>
			}

			var favored = false;
			for(var i=0; i<this.radioChannels.length; i++) {

				var tmp = this.radioChannels[i];
				if(tmp.id == rowData.id){
					favored = true;
				}
			}

			var isAlbum = false;
			if(this.props.type == 0){
				isAlbum = rowData.kind == 'album'? true : false;
			} else if(this.props.type == 1){
				isAlbum = true;
			} else{
				isAlbum = false;
			}


			if(!isAlbum){
				return (
						<CommonCell
							key={JSON.stringify(rowData)}
							islive={true}
							radioInfo={rowData}
							dataId={rowData.id}
							onRowPress={this.onRowPress.bind(this,rowData, favored)}
							thumbSource={rowData.cover_url_small}
							text1={rowData.radio_name}
							text2={rowData.program_name + ' 直播中'}
							text3={'累计收听 ' + rowData.radio_play_count}
							favored={favored}/>

				);
			} else {
					return (
						<CommonCell
								key={JSON.stringify(rowData)}
									dataId={rowData.id}
									onRowPress={this.onRowPress2.bind(this,rowData, favored)}
									thumbSource={rowData.cover_url_small}
									text1={rowData.album_title}
									text2={rowData.album_intro}
									text3={'播放' + rowData.play_count + ' 共' + rowData.include_track_count + '集'}
									favored={favored}/>
				);
			}

	}

	rendSeparator(rowData, sectionID, rowID, highlightRow) {
			return (<View   key={rowID + sectionID} style={styles.separator} />);
	}

	onInfinite(){

		this.currentPage += 1;
		this.loadDatas();
	}

	loadDatas(){

		var type = this.props.type;

		switch (type){
			case 0:
				this.loadAllLives();
				break;
			case 1:
				this.loadDlives();
				break;
			case 2:
				this.loadLives();
				break;
			default:
				break;
		}

	}
		
  loadAllLives(){
  		var params={
    		q: this.props.queryStr,
            count:Constants.PageCount.size,
            page: this.currentPage,
         };

	      XimalayaSDK.requestXMData(XMReqType.XMReqType_SearchAll, params, (result, error) => {

	      	if(error && error != null) {

		          	if(this.i > 3) {
									this.i = 0;
									//MHPluginSDK.showFailTips('网络连接不稳定...');

									var no = -1;
									if(error.error_no != undefined){
										no = error.error_no;
									}

									this.setState({
										loaded: true,
										failed: true,
										error_no: no,
									});

								} else {
									this.i++;
									this.loadDatas();
								}

						return;
	        }


	          this.i = 0;

	      	  var c = 0;
	          if(!error && result.album_list != undefined && result.album_list.albums != undefined ) {

	          		c += result.album_list.total_count;
	          	   this.totalPage = result.album_list.total_page;

	          	   for(var k=0; k<result.album_list.albums.length; k++) {
	          	   		this.loadedDatas.push(result.album_list.albums[k]);
	          	   }

	          }

	          if(!error && result.radio_list != undefined && result.radio_list.radios != undefined ){
	          		c += result.radio_list.total_count;
	          	   var p = result.radio_list.total_page;
	          	   if(p > this.totalPage) this.totalPage = p;

	          	   for(var k=0; k<result.radio_list.radios.length; k++) {
	          	   		this.loadedDatas.push(result.radio_list.radios[k]);
	          	   }

	          }

	          	 if(c > 0) this.props.setCount(this.props.type, c);

	            this.setState({
	            		failed:false,
	                    loaded: true,
	                    dataSource:this.loadedDatas,
	            });


	       });
  }

  loadLives(){
  		var params={
    		q: this.props.queryStr,
            count:Constants.PageCount.size,
            page: this.currentPage,
         };

	      XimalayaSDK.requestXMData(XMReqType.XMReqType_SearchRadios, params, (result, error) => {

	          if(!error && result.radios != undefined ) {
	          	   if(result.total_count > 0) this.props.setCount(this.props.type, result.total_count);
	          	   this.i = 0;

	          	   this.totalPage = result.total_page;

	          	   for(var k=0; k<result.radios.length; k++) {
	          	   		this.loadedDatas.push(result.radios[k]);
	          	   }

	          	   this.setState({
	          	   		failed:false,
	                    loaded: true,
	                    dataSource:this.loadedDatas,
	               });

	          } else {

								if(this.i > 3) {

									this.i = 0;
									var no = -1;
									if(error != null && error.error_no != undefined){
										no = error.error_no;
									}
									this.setState({
										loaded: true,
										failed: true,
										error_no: no,
									});

								} else {
									this.i++;
									this.loadDatas();
								}

	        }

	      });
  }

  loadDlives(){
  		var params={
    		q: this.props.queryStr,
            count:Constants.PageCount.size,
            page: this.currentPage,
         };

	      XimalayaSDK.requestXMData(XMReqType.XMReqType_SearchAlbums, params, (result, error) => {

	          if(!error && result.albums != undefined ) {
	          	   if(result.total_count > 0) this.props.setCount(this.props.type, result.total_count);
	          	   this.i = 0;
	          	   this.totalPage = result.total_page;
	          	   for(var k=0; k<result.albums.length; k++) {
	          	   		this.loadedDatas.push(result.albums[k]);
	          	   }

	          	   this.setState({
	          	   		failed:false,
	                  loaded: true,
	                  dataSource: this.loadedDatas,
	               });

	          } else {

								if(this.i > 3) {
									this.i = 0;

											var no = -1;
											if(error != null && error.error_no != undefined){
												no = error.error_no;
											}
											this.setState({
												loaded: true,
												failed: true,
												error_no: no,
											});
								} else {
									this.i++;
									this.loadDatas();
								}

	          }

	      });
  }

  renderEmptyRow(){
		
  		return (
	        <View style={{height:screenHeight*4/5, justifyContent:'center',alignItems:'center'}}>
	            <FailView style={{flex:1, paddingBottom:65}} text1='暂无搜索结果' text2='' />
	        </View>
        )
  }

  renderSeparator(rowData, sectionID, rowID, highlightRow) {
    return (<View key={rowID+sectionID} style={styles.separator} />);
  }

  loadRadioChannels() {

		Device.getDeviceWifi().callMethod("get_channels",{"all":0}).then((result)=>{

			const channels = result.result.chs;
			if(result.channels != undefined){
				this.radioChannels= result.channels;
				this.loadDatas();
			} else {
				this.radioChannels= [];
				this.loadDatas();
			}
		}).catch(error=>{
			console.log('error-488 -'+JSON.stringify(error));
		});
	}




	render(){

		if(!this.state.loaded) {
	    return <LoadingView style={{flex:1}}/>
		}

		if(this.state.failed) {
	
			if(this.state.error_no == 100) {
				return (
					<View style={{flex:1}}>
						<FailView
							style={{flex:1, paddingBottom:65}} text1='暂无搜索结果'
							text2='' />
					</View>
				)
			}
			return(
					<View style={{flex:1}}>
						<FailView
							onPress={this.componentWillMount.bind(this,0)}
							style={{flex:1, paddingBottom:65}} text1='糟糕 发生错误了'
							text2='点击屏幕重试' />
					</View>
			);

		}

		return (
			<View style={{flex:1}}>
							<FlatList
								ref = {(list) => {this.list= list}}
								style={styles.list}
								data={this.state.dataSource}
								refreshing={!this.state.loaded}
								renderItem={this.renderRow.bind(this)}
								ItemSeperatorComponent={this.renderSeparator.bind(this)}
								ListHeaderComponent={()=>{return this.renderHeaderRefresh()}}
								onRefresh={()=>{this.onRefresh()}}
								onEndReached={()=>{this.onInfinite()}}
							/>
			</View>
		);
	}

}


var styles = StyleSheet.create({
	btnTextStyle:{
		fontSize: 10,
	},
	btnStyle :{
	  borderRadius:10,
	  height:20,
	  borderWidth: 1/PixelRatio.get(),
	  borderColor: 'rgb(4,188,169)',
	  width:70,
	},
	sectionHeader:{
	  flexDirection:'row',
	  height:40,
	  alignItems:'center',
	  justifyContent:'space-between',
	  paddingRight:13,
	  backgroundColor:Constants.TintColor.rgb255,
	},
	header_text: {
	  color: 'rgb(153,153,153)',
	  marginLeft:12,
	  fontSize: 11,
	},
	separator:{
		height:1/PixelRatio.get(),
		marginLeft:12,
		backgroundColor:Constants.TintColor.rgb243,
	},
});

export default withNavigation(SingleSearchRs);
