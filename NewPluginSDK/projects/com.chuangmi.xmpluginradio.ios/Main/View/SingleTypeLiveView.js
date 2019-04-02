'use strict';

import React,{component} from 'react' ;
import Constants  from '../../Main/Constants';
import {XimalayaSDK,XMReqType} from '../Const/XimalayaSDK';
import CommonCell  from '../View/CommonCell';
import LoadingView  from '../View/LoadingView';
import ScrollableTabBar from '../View/ScrollableTabBar';
import CustomeTabBar from '../View/CustomeTabBar';
import FailView  from '../View/FailView';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import {Device,DeviceEvent,Host,Package,Service} from 'miot';
import {
  APPBAR_HEIGHT,APPBAR_MARGINBOTTOM,APPBAR_MARGINTOP,isIPX ,
  ratio,NavigatorBarHeight,screenWidth,screenHeight} from '../ConstDefine';
import {withNavigation} from 'react-navigation';

import {
  Image,
	ListView,
	FlatList,
  TouchableHighlight,
  StyleSheet,
  Text,
  PixelRatio,
  DeviceEventEmitter,
  ActionSheetIOS,
  View,
} from 'react-native';

class SingleTypeLiveView extends React.Component{

		constructor(props){
			super(props);
			this.state = {
					loaded: false,
					failed:false,
					dataSource:[],
				}
		}

		componentWillMount() {

			this.i=0;
			this.province_code=110000;
			this.province_name='';
			this.localProvinceCode='';

			this.currentPage = 1;
			this.i = 0;
			this.totalPage = 10;
			this.loadedRadios = [];
			this.radioChannels =[];
			if(this.props.type == 4) {
				 this.loadCurrentProvinceInfo();
			} else {
				 this.loadRadioChannels();
			}

		}

		componentDidMount(){
			this.subscription = DeviceEventEmitter.addListener('provinceChangeEvent', (event) => {

						this.province_code = event.province_code,
						this.province_name = event.province_name,
						this.currentPage = 1;
						this.loadedRadios=[];
						this.loadHotRadios();

					});

					this.subscription2 = DeviceEventEmitter.addListener('ChannelsChangeEvent', (event) => {
						Device.getDeviceWifi().callMethod("get_channels",{"all":0}).then((result)=>{

								const channels = result.result.chs;
								if(channels != undefined) {
									this.radioChannels = channels;
								}
						}).catch(error=>{
							console.log('error-81 -'+JSON.stringify(error));
						});
					});
		}

		componentWillUnmount(){
			this.subscription.remove();
			this.subscription2.remove();
		}

		render(){

			if(!this.state.loaded) {
				return <LoadingView style={{flex:1}}/>
			}

			if(this.state.failed) {
				if(this.props.type == 4){//如果是本地则提示用户去打开GPS
						return(
							<View style={{flex:1}}>
									<FailView
										onPress={this.componentWillMount.bind(this, 0)}
										style={{flex:1, paddingBottom:65}} text1='页面加载失败'
										text2='请确认是否允许米家访问GPS' />
							</View>
							);
						}
						return(
							<View style={{flex:1}}>
								<FailView
									onPress={this.componentWillMount.bind(this, 0)}
									style={{flex:1, paddingBottom:65}} text1='糟糕 发生错误了'
									text2='点击屏幕重试' />
							</View>
				);
			}


			var text = '当前省市   ' + this.province_name;

			var pview = null;
			var marginStyle= {marginTop:0};
			if(this.props.type == 2) {
				marginStyle={marginTop:50};
			}

			return (
			<View style={{flex:1,backgroundColor:Constants.TintColor.rgb255}}>
					<FlatList
						ref = {(list) => {this.list= list}}
						style={[styles.list,marginStyle]}
						data={this.state.dataSource}
						refreshing={!this.state.loaded}
						renderItem={this.renderRow.bind(this)}
						ItemSeperatorComponent={this._renderSeparator.bind(this)}
						onEndReached={()=>{this.onInfinite()}}
						ListFooterComponent={this.renderFooter.bind(this)}
					/>
					{this.showPrevie()}
			</View>);
		}

		showPrevie(){
			var pview = <View></View>;	
			if(this.props.type == 2) {

				pview= (
					<View style={styles.container}>
					<ScrollableTabView
						 initialPage={0}
						scrollWithoutAnimation={true}
						renderTabBar={()=> 
								<ScrollableTabBar
									province_code={this.province_code}
									underlineColor='#cd3f3f'
									activeTextColor='#cd3f3f'
									inactiveTextColor='rgba(0, 0, 0, 0.8)'
									underlineHeight={0}
									textStyle={{ fontSize: 15 }}
									style={{paddingRight:50}}
									backgroundColor='#ffffff'
									tabStyle={{paddingLeft:12,paddingRight:12}}
								/>
						}>
						<View tabLabel='北京' style={styles.itemLayout}></View>
						<View tabLabel='天津'  style={styles.itemLayout}></View>
						<View tabLabel='河北' style={styles.itemLayout}></View>
						<View tabLabel='山西'  style={styles.itemLayout}></View>
						<View tabLabel='内蒙古'  style={styles.itemLayout}></View>
						<View tabLabel='辽宁'  style={styles.itemLayout}></View>
						<View tabLabel='吉林'  style={styles.itemLayout}></View>
						<View tabLabel='黑龙江'  style={styles.itemLayout}></View>
						<View tabLabel='上海'  style={styles.itemLayout}></View>
						<View tabLabel='江苏' style={styles.itemLayout}></View>
						<View tabLabel='浙江'  style={styles.itemLayout}></View>
						<View tabLabel='安徽' style={styles.itemLayout}></View>
						<View tabLabel='福建'  style={styles.itemLayout}></View>
						<View tabLabel='江西'  style={styles.itemLayout}></View>
						<View tabLabel='山东'  style={styles.itemLayout}></View>
						<View tabLabel='河南'  style={styles.itemLayout}></View>
						<View tabLabel='湖北'  style={styles.itemLayout}></View>
						<View tabLabel='湖南'  style={styles.itemLayout}></View>
						<View tabLabel='广东'  style={styles.itemLayout}></View>
						<View tabLabel='广西'  style={styles.itemLayout}></View>
						<View tabLabel='海南'  style={styles.itemLayout}></View>
						<View tabLabel='重庆'  style={styles.itemLayout}></View>
						<View tabLabel='四川'  style={styles.itemLayout}></View>
						<View tabLabel='贵州'  style={styles.itemLayout}></View>
						<View tabLabel='云南'  style={styles.itemLayout}></View>
						<View tabLabel='西藏'  style={styles.itemLayout}></View>
						<View tabLabel='陕西'  style={styles.itemLayout}></View>
						<View tabLabel='甘肃'  style={styles.itemLayout}></View>
						<View tabLabel='青海'  style={styles.itemLayout}></View>
						<View tabLabel='宁夏'  style={styles.itemLayout}></View>
						<View tabLabel='新疆'  style={styles.itemLayout}></View>
				</ScrollableTabView>
				</View>);
			}
			return pview;
		}


		renderHeaderRefresh(){
    	return <View/>
		}
		
		renderFooter(){
    	return (
			<View style={{width:screenWidth,height:125,flexDirection:'column',alignItems:'center',alignSelf:'center',justifyContent:'center'}}>
				<Text>已全部加载</Text>
			</View>
			);
		}
		
    loadedAllData(){
    	return this.currentPage >= this.totalPage;
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
							title: '',					
							type: 0,
							favored: isfavored,
							radioInfo: radioData,
						});
					
          }
			 })
			.catch(error=>{
        console.log('error-258 -'+JSON.stringify(error));
			});

    }

    renderRow(sourceData){


			var rowData = sourceData.item;
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
        	if(tmp.id == rowData.id){
        		favored = true;
        	}
        }


        var k = rowData.program_name + ' 直播中';
        if(rowData.program_name == '') {
        	k = '暂无节目单';
        }

	      return (
					<CommonCell
						key={rowData.id}
						islive={true}
						radioInfo={rowData}
						dataId={rowData.id}
						onRowPress={this.onRowPress.bind(this,rowData, favored)}
						thumbSource={rowData.cover_url_small}
						text1={rowData.radio_name}
						text2={k}
						text3={'' + rowData.radio_play_count}
						favored={favored}/>

	      );

    }

    onInfinite(){

    	 this.currentPage += 1;
    	 this.loadHotRadios();
    }


    firstProvinceChannel(){
      XimalayaSDK.requestXMData(XMReqType.XMReqType_LiveProvince, {}, (result, error) => {

        if(!error) {
                this.i = 0;
                for(var k=0; k<result.length; k++) {
                  var tmp = result[k];
                  if(administrativeArea.indexOf(tmp.province_name) != -1) {


                    this.province_code = tmp.province_code,
                    this.localProvinceCode=tmp.province_code,
										this.province_name = tmp.province_name,
										this.loadRadioChannels();
                    break;
                  }
                }

           } else {
               	 if(this.i > 3) {
										this.i = 0;
										this.setState({failed: true,loaded: true,});
									} else {
										this.i++;
										this.loadCurrentProvinceInfo();
									}
            }

      });
    }

    loadCurrentProvinceInfo(){
        

					Host.locale.getLocation().then((placeMark) => {

							if(placeMark == undefined) {
								this.setState({failed: true,loaded: true});
								return;
							}

			     		XimalayaSDK.requestXMData(XMReqType.XMReqType_LiveProvince, {}, (result, error) => {

			     			if(!error) {
												 this.i = 0;
												 
												for(let item of result.entries()){
												
													let temp = item[1];
													if(placeMark.province.indexOf(temp.province_name) != -1) {

													 this.province_code = temp.province_code,
													 this.localProvinceCode=temp.province_code,
													 this.province_name = temp.province_name,
													 this.loadRadioChannels();
														break;
													}
												}

					         } else {
						          	if(this.i > 3) {
													this.i = 0;
													this.setState({failed: true,loaded: true,});
												} else {
													this.i++;
													this.loadCurrentProvinceInfo();
												}
					        }

			     		});
					})
					.catch(error=>{
							console.log('error-383 -'+JSON.stringify(error));
					});
    }

    loadHotRadios(){
    	var params={
    		radio_type: this.props.type==4?2:this.props.type,//this.props.type==4为本地台，区分省市台，4为了区分省市台
            count:Constants.PageCount.size,
            page: this.currentPage,
         };

         if(this.props.type == 2) {//省市台
         	params.province_code = this.province_code;
         }

         if(this.props.type==4){//本地台
           params.province_code = this.localProvinceCode;
         }

	      XimalayaSDK.requestXMData(XMReqType.XMReqType_LiveRadio, params, (result, error) => {

	          if(!error && result.radios != undefined) {
	          	   this.i = 0;

	          	   this.totalPage = result.total_page;

	          	   for(var k=0; k<result.radios.length; k++) {
	          	   		this.loadedRadios.push(result.radios[k]);
	          	   }

									this.setState({
											failed: false,
											loaded: true,
											dataSource:this.loadedRadios,
									});

	          } else {

		          	if(this.i > 3) {
									this.i = 0;
				       		this.setState({loaded: true,failed:true,});
									 
								} else {
									this.i++;
									this.loadHotRadios();
								}

	          }

	      });
    }

		_renderSeparator(rowData, sectionID, rowID, highlightRow) {
			return (<View key={rowID+sectionID} style={styles.separatorView} />);
		}

   	loadRadioChannels() {

			Device.getDeviceWifi().callMethod("get_channels",{"all":0}).then((result)=>{

					const channels = result.result.chs;
          if(channels != undefined){
           		this.radioChannels= channels;
	            this.loadHotRadios();
          } else {
           		this.radioChannels= [];
	            this.loadHotRadios();
          }
      }).catch(error=>{
        console.log('error-485 -'+JSON.stringify(error));
      });


    }
		
    changeProvince(){

			this.props.navigation.navigate('Interest', {
				title: '切换省市',
				type:2,
				province_code: this.province_code,
			});
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
		width: 70,
	},
	list:{
		paddingBottom:70,
		backgroundColor:'white'
	},
	sectionHeader:{
	  flexDirection:'row',
	  height:40,
	  alignItems:'center',
	  justifyContent:'space-between',
	  paddingRight:12,
	  backgroundColor:Constants.TintColor.rgb255,
	},
	header_text: {
	  color: 'rgb(153,153,153)',
	  marginLeft:12,
	  fontSize: 11,
	},
	separatorView:{
		height:0.5,
		marginLeft:12,
		backgroundColor:Constants.TintColor.rgb243,
	},
  itemLayout:{
    flex:1,
    alignItems:'center',
    justifyContent:'center'
  },
  container: {
    height:50,
    width:screenWidth,
    top:0,
    position:'absolute',
    backgroundColor: '#F5FCFF',
  },
});

export default withNavigation(SingleTypeLiveView);
