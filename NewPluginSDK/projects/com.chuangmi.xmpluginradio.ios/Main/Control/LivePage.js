'use strict';

import React,{component} from 'react' ;
import CommonCell from '../View/CommonCell';
import Label from '../View/Label';
import {Device,DeviceEvent,Host,Package,Service} from 'miot';
import {
  APPBAR_HEIGHT,APPBAR_MARGINBOTTOM,APPBAR_MARGINTOP,isIPX ,
  ratio,NavigatorBarHeight,screenWidth,screenHeight} from '../ConstDefine';
import Constants from '../../Main/Constants';
import {XimalayaSDK,XMReqType} from '../Const/XimalayaSDK';
import LoadingView from '../View/LoadingView';
import FailView from '../View/FailView';
import {withNavigation} from 'react-navigation';


import {
	ImageBackground,
	ListView,
	FlatList,
  TouchableHighlight,
  StyleSheet,
  Text,
  DeviceEventEmitter,
  ActionSheetIOS,
  PixelRatio,
  View,
} from 'react-native';

class LivePage extends React.Component{

	constructor(props){
    super(props);

		this.state = {
			failed:false,
			loaded: false,
			xmError:false,
			dataSource: [],
		}
  }

	topOnPress(index) {
		//跳转页面
		this.props.navigation.navigate('RadioTypes', {
			title: '直播',
			activeTab: index,
		});
	}


	loadedAllData(){
		return this.currentPage >= 100/ Constants.PageCount.size;
	}
	
	//跳转至专辑列表也
	onRowPress(radioData, favored) {
		/*
				type: 0,
				favored: true,
				radioInfo: this.props.rowData.radioInfo,
				tartTime: this.props.rowData.startTime,
				endTime: this.props.rowData.endTime,
		*/

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
								type: 0,
								favored: isfavored,
								radioInfo: radioData,
						});

				}
		}).catch(error=>{
			console.log('error-88 -'+JSON.stringify(error));
		});


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
		}

	}

	renderHeader(){

		return(
				<View>
						<View style={styles.topContainer}>
								<TopBtn  key={0} source={require('../../Resources/liveLocalNew.png')} text='本地台' onPress={()=>{this.topOnPress(0)}}/>
								<TopBtn  key={1} source={require('../../Resources/liveCountryNew.png')} text='国家台' onPress={()=>{this.topOnPress(1)}}/>
								<TopBtn  key={2} source={require('../../Resources/liveProvinceNew.png')} text='省市台' onPress={()=>{this.topOnPress(2)}}/>
								<TopBtn  key={3} source={require('../../Resources/liveNetNew.png')} text='网络台' onPress={()=>{this.topOnPress(3)}}/>
						</View>
						<View style={styles.sectionHeader}>
								<ImageBackground source={require('../../Resources/icon_radio.png')} style={styles.header_img}/>
								<Text style={styles.header_text}>热门电台</Text>
						</View>
				</View>
		);
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

			var favored = false;
			for(var i=0; i<this.radioChannels.length; i++) {
				var tmp = this.radioChannels[i];
				if(tmp.type==1){
					if(tmp.albumInfo&&tmp.albumInfo.id == rowData.id){
						favored = true;
						break;
					}
				}else{
					if(tmp.radioInfo&&tmp.radioInfo.id == rowData.id){
						favored = true;
						break;
					}
				}

			}

			var item = rowData.item;

			return (
					<CommonCell
						style={{width:screenWidth,height:64,backgroundColor:'#ff0'}}
						key={item.id}
						islive={true}
						radioInfo={item}
						dataId={item.id}
						onRowPress={()=>this.onRowPress(item, favored)}
						thumbSource={item.cover_url_small}
						text1={item.radio_name}
						text2={item.program_name + ' 直播中'}
						text3={''+item.radio_play_count}
						favored={favored}/>
			);

	}

	onInfinite(){

			this.currentPage += 1;
			this.loadHotRadios();
	}


	loadHotRadios(){
			var params={
				radio_count:Constants.PageCount.size * this.currentPage,
			};
			var self = this;

			XimalayaSDK.requestXMData(XMReqType.XMReqType_RankRadio, params, (result) => {

					if(result != undefined) {
								if(this.list) {
									this.list.hideFooter();
								}
								self.loadedRadios = result;
								this.setState({
										failed:false,
										loaded: true,
										xmError:false,
										dataSource: result,
								});

					} 
					else {
						if(error&&error.error_no&&error.error_desc){
							this.errorInfo='error_no:'+JSON.stringify(error.error_no)+'  '+JSON.stringify(error.error_desc);
							this.state.xmError=true;
						}
						if(this.i > 3) {
									this.i = 0;
									this.setState({failed: true,loaded: true});
						} else {
							this.i++;
							this.loadHotRadios();
						}
					}

			});
	}

  _rendSeparator(rowData, sectionID, rowID, highlightRow) {
    return (<View key={rowID+sectionID} style={styles.separatorView} />);
  }

	loadRadioChannels() {

		Device.getDeviceWifi().callMethod("get_channels",{"all":0}).then((result)=>{

					const channels = result.result.chs;
					if(channels != undefined){
						this.radioChannels= channels;
						this.loadHotRadios();
					} else {
						//内存缓存没有，从文件里面获取
						Host.file.readFile(Service.account.ID + '===' + Device.deviceID + 'cacheDataSource')
						.then(( content) => {

							if ( content != null) {

								if(content!=''){
									var dataCache = JSON.parse(content);
									this.radioChannels=dataCache._dataBlob.s1;
									this.loadHotRadios();
								}else{
									this.radioChannels= [];
									this.loadHotRadios();
								}

							}else{
								this.radioChannels= [];
								this.loadHotRadios();
							}
						});

					}
		}).catch(error=>{
			console.log('error-256 -'+JSON.stringify(error));
			this.setState({failed:true,loaded:true});
		});
	}

	componentDidMount(){

        this.subscription = DeviceEventEmitter.addListener('ChannelsChangeEvent', (event) => {

					Device.getDeviceWifi().callMethod("get_channels",{"all":0}).then((result)=>{

							const channels = result.result.chs;
          		if(channels != undefined) {
          			this.radioChannels = channels;
          		}
          }).catch(error=>{
						console.log('error-271 -'+JSON.stringify(error));
					});
				});
	}

	componentWillUnmount(){
		
		this.loadedRadios = [];
		this.radioChannels = [];
		this.subscription.remove();
	}

	componentWillMount() {

		this.currentPage = 1;
		this.totalPage = 100;
		this.loadedRadios = [];
		this.radioChannels =[];
		this.i= 0;
		this.errorInfo= '';//接口错误信息
		this.setState({
			failed: false,
			loaded: false,
			xmError:false,
		});
		this.loadRadioChannels();
	}

	render(){

		if(!this.state.loaded) {
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
						onPress={this.componentWillMount.bind(this, 0)}
						style={{flex:1,paddingBottom:65}} text1='糟糕 发生错误了'
						text2='点击屏幕重试' />
				</View>
			);
		}


		return (
			<View style={{flex:1, overflow:'hidden',backgroundColor:'#ffffff'}}>
					{this.renderHeader()}
					<FlatList
					 	style={styles.list}
						data={this.state.dataSource}
						refreshing={!this.state.loaded}
						renderItem={this.renderRow.bind(this)}
						ItemSeparatorComponent={this._rendSeparator.bind(this)}
						extraData={this.state}
						onEndReached={()=>{this.onInfinite()}}
					/>
			</View>);
	}

}

class TopBtn extends React.Component{

	/*
	 *	onPress, text, source
	 		<Text style={styles.topText}>{this.props.text}</Text>
	 */

	render(){
		return (
			<TouchableHighlight onPress={this.props.onPress} underlayColor='transparent'>
				<View style={{justifyContent:'center', alignItems:'center'}}>
						<ImageBackground style={[styles.topImage, {backgroundColor:'white'}]} source={this.props.source} resizeMode='stretch'/>
            <Label   style={{marginTop:10}} text={this.props.text} textStyle={this.props.textStyle}/>
				</View>
			</TouchableHighlight>
		);
	}

}

var styles = StyleSheet.create({
	list:{

	},
	sectionHeader:{
	     flexDirection:'row',
	     height:44,
	     alignItems:'center',
	     justifyContent:'flex-start',
	     backgroundColor:'#f8f8f8',
	},
	header_img:{
	    marginLeft:12,
	    height:18,
	    width:18,
	},
	header_text: {
	     color:'#282325',
	     marginLeft:10,
       fontSize:15,
	},
	topContainer:{
		height: 114,
		backgroundColor:'white',
		flexDirection:'row',
		alignItems:'center',
		justifyContent:'space-around'
	},
 	separatorView:{
    height:0.5,
    marginLeft:12,
		backgroundColor:Constants.TintColor.rgb243,
  },
	topImage:{
		height: 49,
		width:49,
		justifyContent:'center',
		alignItems:'center'
	},
	topText:{
		marginTop:5,
		fontSize:11,
		color:'rgb(163,163,163)',
	},
});

export default withNavigation(LivePage);
