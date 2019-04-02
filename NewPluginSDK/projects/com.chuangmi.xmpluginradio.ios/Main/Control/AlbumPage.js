'use strict';

import React,{component} from 'react' ;
import {XimalayaSDK,XMReqType}  from '../Const/XimalayaSDK';
import {API_LEVEL,Device,DeviceEvent,Host,Package,Service} from 'miot';
import {
  APPBAR_HEIGHT,APPBAR_MARGINBOTTOM,APPBAR_MARGINTOP,isIPX ,
  ratio,NavigatorBarHeight,screenWidth,screenHeight} from '../ConstDefine';
import Constants  from '../../Main/Constants';
import LoadingView  from '../View/LoadingView';
import FailView  from '../View/FailView';
import NoWifiView  from '../View/NoWifiView';

import icon_play from '../../Resources/icon_play.png';
import icon_time from '../../Resources/icon_time.png';

import {
	image,
	FlatList,
	ImageBackground,
  ListView,
  TouchableHighlight,
  StyleSheet,
  Text,
  PixelRatio,
  View,
  Alert,
  DeviceEventEmitter,
  TouchableWithoutFeedback,
  LayoutAnimation,
  ProgressViewIOS,
  TouchableOpacity,
  PanResponder
} from 'react-native';


/* 搜索页过来，
	传递数据： albumInfo, favored
*/




//专辑页
class AlbumPage extends React.Component{

		constructor(props){
		  super(props);

			var params = 	this.props.navigation.state.params;
			this.state = {
				loaded: false,
				failed:false,
				favored: false,
				dataSource:[],
				/* props*/
				favored:params.favored,
				albumInfo:params.albumInfo,
				from:params.from,
				isFromFind:params.isFromFind,
			};
		}

    componentWillMount() {
    	this.allTracks = [];
    	this.radioProgresses = [];
    	this.currentPage = 1;
			this.asc='asc';
			// 弹窗是否已经显示
			this.actionSheetHasShow= false;
    	this.loadRadioProgresses();
    }
   

    componentDidMount(){

    	this.subscription3 = DeviceEventEmitter.addListener('ChannelsChangeEvent', (event) => {

				Device.getDeviceWifi().callMethod("get_channels",{"all":0}).then((result)=>{
						
							const channels = result.result.chs;
          		if(channels != undefined) {
          			 var isfavored = false;
		             var chs = channels;
		             for(var k=0; k<chs.length; k++){
		              var tmp = chs[k];
		              if(tmp.id == this.state.albumInfo.id && tmp.t == 1){
		                isfavored = true;
		                break;
		              }
		             }
		             if(isfavored != this.state.favored){
		                  this.setState({favored:isfavored});
		             }
          		}
					}).catch(error=>{
						console.log('error-106 -'+JSON.stringify(error));
						});
        });


    }

    componentWillUnmount(){
    	this.subscription3.remove();
      this.subscription2.remove();
    }

    loadRadioProgresses(){
    	//获取收音机中的播放进度
			Device.getDeviceWifi().callMethod("get_all_progress",{}).then((json) => {


	       if (json.code ==0) {
						if(json.result == undefined) {
							this.loadTrackInfos();
							return;
						}
						this.radioProgresses = json.result.progresses;
						this.loadTrackInfos();
	       }

	     }).catch(error=>{
				 
				this.loadRadioProgresses();
				this.loadTrackInfos();
        console.log('error-151 -'+JSON.stringify(error));
      });
    }

    loadTrackInfos() {

    	 XimalayaSDK.requestXMData(XMReqType.XMReqType_AlbumsBrowse,{album_id:this.state.albumInfo.id, count: Constants.PageCount.size, page: this.currentPage, sort:this.asc},
           (result, error) => {

            if(!error && result.tracks !=undefined){

                if(result.album_id == undefined) {
                  return;
                }

               	var tracks = result.tracks;
               	for(var i=0; i<tracks.length; i++) {
               		this.allTracks.push(tracks[i]);
               	}


	             this.setState({
									loaded: true,
									failed:false,
									dataSource: this.allTracks,
	             });

            }else {
                 if(this.i > 3) {
                    this.i = 0;
                    this.setState({failed: true,loaded: true,});
                  } else {
                    this.i++;
                    this.loadTrackInfos();
                  }
            }

        });
    }

    _reSortVoice() {

    	  var sortMethod = this.asc == 'asc' ? 'desc' : 'asc';

    		// MHPluginSDK.showLoadingTips("加载中，请稍候...");

    		XimalayaSDK.requestXMData(XMReqType.XMReqType_AlbumsBrowse,
  								 {album_id:this.state.albumInfo.id, count: Constants.PageCount.size, page: 1,sort:sortMethod},
  								 (result, error) => {

  				// MHPluginSDK.dismissTips();
  				if(!error) {

  						if(this.asc == 'asc') {
  							this.asc = 'desc';
  						} else {
  							this.asc = 'asc';
  						}

  						this.allTracks = [];
  						this.currentPage = 1;
							var tracks = result.tracks;
							for(var i=0; i<tracks.length; i++) {
								this.allTracks.push(tracks[i]);
							}
							this.setState({
										loaded: true,
										failed:false,
										dataSource: this.allTracks,
							});
  				}

  			});

    }

    sheetBtnHandler(index){

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

    onRowPress(trackInfo,progress) {

			var self  = this;
        // 传递数据： albumInfo, favored
				Device.getDeviceWifi().callMethod("get_channels",{"all":0}).then((result)=>{
					const channels = result.result.chs;

          if(channels != undefined){
             var isfavored = false;
             var chs = channels;
             for(var k=0; k<chs.length; k++){
								var tmp = chs[k];
								if(tmp.id == this.state.albumInfo.id && tmp.t == 1){
									isfavored = true;
									break;
								}
             }

						if(self.state.from && self.state.from == 'playpage'){

								var vdata = {
													type: 1,
													favored:  isfavored,
													albumInfo: self.state.albumInfo,
													trackInfo: trackInfo,
													trackProgress:0,
													trackProgress2: progress,
												};
								DeviceEventEmitter.emit('AlbumPageBackToPlayPageEvent', {data : vdata});
								self.props.navigation.pop();
								return;
						}



						self.props.navigation.navigate('PlayPage', {
							title: '',
							type: 1,
							favored:  isfavored,
							albumInfo: self.state.albumInfo,
							trackInfo: trackInfo,
							trackProgress:0,
							trackProgress2: progress,
						});
            

          }
       	}).catch(error=>{
					console.log('error-336 -'+JSON.stringify(error));
				});




    }

		_rendRow(rowData, sectionID, rowID) {

			var p = -1;
			for(var i=0; i<this.radioProgresses.length; i++) {

				var tmp = this.radioProgresses[i];

				if(this.state.albumInfo.id == tmp.id && rowData.item.id == tmp.sub){
					p = tmp.progress;
				}
			}

				return (
					<TrackCellView   
						key={rowID+sectionID}
						style={styles.trackRowStyle}
						trackData={rowData.item}
						albumId={this.state.albumInfo.id}
						progress={p}
						albumName={this.state.albumInfo.album_title}  
						onRowPress={()=>{this.onRowPress(rowData.item,p)}}/>
				);

		}

		_rendSeparator(rowData, sectionID, rowID, highlightRow) {
	    return (<View key={rowID+sectionID} style={styles.separator} />);
	  }


  	_favorBtnPressHandler() {

  		var id = this.state.albumInfo.id;

     	 if(!this.state.favored){

				Device.getDeviceWifi().callMethod("get_channels",{"all":0}).then((result)=>{
							
							const channels = result.result.chs;
              if(channels != undefined){
                 var chs = channels;
                 if(chs.length >= 35) {
                    Alert.alert(
                        '提示',
                        Constants.Channels.addInfo(),
                        [
                          {text: '确认', onPress: () => {}, style: 'cancel'},
                        ]
                     );

                 } else {
                      var params = {
                        params:{
                              chs:[{
                                url: 'http://api.ximalaya.com/openapi-gateway-app/albums/browse',
                                type:1,
                                id: this.state.albumInfo.id,
                              }],
                            }
                        };

                      this.item = {
                        id: this.state.albumInfo.id,
                        t:1,
                      };

                      // MHPluginSDK.showLoadingTips('加载中...');
											Device.getDeviceWifi().callMethod('add_channels', params).then((json) => {

													// MHPluginSDK.dismissTips();
													if(json.code==0){
														Constants.Channels.addItem(this.item);
														this.setState({favored: true,});
													} else {
														// MHPluginSDK.showFailTips(Constants.Channels.addFailInfo());
													}
                      }).catch(error=>{
												console.log('error-480 -'+JSON.stringify(error));
											});

                }
              }
            });


      } else {


				Device.getDeviceWifi().callMethod("get_channels",{"all":0}).then((result)=>{
							
							const channels = result.result.chs;
              if(channels != undefined){
                  var chs = channels;
                  if(chs.length <=1) {
                      Alert.alert(
                        '提示',
                        Constants.Channels.deleteInfo(),
                        [
                          {text: '确认', onPress: () => {}, style: 'cancel'},
                        ]
                     );

                  } else {

                       this.item = {
													id: this.state.albumInfo.id,
													t:1,
												};
                        // MHPluginSDK.showLoadingTips('加载中...');
												Device.getDeviceWifi().callMethod("remove_channels",{params:{tens:[{id:this.state.albumInfo.id, t:1}]}}).then((json) => {
													
													// MHPluginSDK.dismissTips();
                          if(json.code==0){
														
														Constants.Channels.deleteItem(this.item);
                            this.setState({favored: false,});
                          } else {
                            //  MHPluginSDK.showFailTips(Constants.Channels.deleteFailInfo());
                          }
                        });
                  }
              }
            }).catch(error=>{
							console.log('error-526 -'+JSON.stringify(error));
						});

      }

  	}

    renderFooter(){
    	return (
			<View style={{width:screenWidth,height:125,flexDirection:'column',alignItems:'center',alignSelf:'center',justifyContent:'center'}}>
				<Text>已全部加载</Text>
			</View>
			);
    }

    onInfinite(){

    	//loadData
    	 this.currentPage += 1;

    	 XimalayaSDK.requestXMData(XMReqType.XMReqType_AlbumsBrowse,
                                       {album_id:this.state.albumInfo.id, count: Constants.PageCount.size, page: this.currentPage, sort:this.asc},
           (result, error) => {

            if(!error&&result.tracks!=undefined){

               	var tracks = result.tracks;
               	for(var i=0; i<tracks.length; i++) {
               		this.allTracks.push(tracks[i]);
               	}

                // if(this.list) {
                // 	this.list.hideFooter();
                // }


	             this.setState({
	                 dataSource:this.allTracks,
	             });

            }else {
                // MHPluginSDK.showFailTips("获取专辑预览tracks信息失败...");
                // if(this.list){
                //  this.list.hideFooter();
                // }
            }

        });

		}
		
    renderHeaderRefresh(){
    	return <View/>
    }

    loadedAllData(){
    	return this.currentPage * Constants.PageCount.size >= this.state.albumInfo.include_track_count;
    }


		render() {

			if(this.state.netInfo == 'none' || this.state.netInfo == 'unknown'){
				return <NoWifiView />
			}

			if (!this.state.loaded) {
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


		return	(
			<View style={{backgroundColor:Constants.TintColor.rgb255, paddingTop:0,flexDirection:'column', flex:1}}>
					<TopView 
						playCount={this.state.albumInfo.play_count} 
						thumbSource={this.state.albumInfo.cover_url_middle}
						albumName={this.state.albumInfo.album_title}
						favorBtnPressHandler={()=>{this._favorBtnPressHandler()}}
						favored={this.state.favored}
						albumIntroduce={this.state.albumInfo.album_intro}>
					</TopView>

			  <View style={styles.centerContainer}>
			  		<Text style={styles.trackCounts}>{'共' + this.state.albumInfo.include_track_count + '集'}</Text>
			  		<SortButton style={{alignItems:'center'}} sortHandler={()=>{this._reSortVoice()}}/>
			  </View>
							<FlatList
							ref = {(list) => {this.list= list}}
              style={styles.list}
							data={this.state.dataSource}
              refreshing={!this.state.loaded}
              renderItem={this._rendRow.bind(this)}
              ItemSeparatorComponent={this._rendSeparator.bind(this)}
              extraData={this.state}
              keyExtractor={this._keyExtractor}
              ListHeaderComponent={()=>{return this.renderHeaderRefresh()}}
							onEndReached={()=>{this.onInfinite()}}
							ListFooterComponent={this.renderFooter.bind(this)}
            />
	        </View>
		)}

}


class SortButton extends React.Component{

	constructor(props){
	  super(props);
		this.state = {
			asc: true,
		}
	}

	_onPress() {

		this.setState({
			asc: !this.state.asc,
		});
		this.props.sortHandler(this.state.asc);
	}

	render() {

		var sourceImg = this.state.asc ? require('../../Resources/asc.png') :require('../../Resources/desc.png');
		return(
			<TouchableWithoutFeedback onPress={()=>{this._onPress()}}>
				<View style={styles.sortBtn}>
					<ImageBackground ref='img' style={styles.sortBtnImg} source={sourceImg}/>
					<Text style={styles.sortText}>排序</Text>
				</View>
			</TouchableWithoutFeedback>
		);
	}

}


class PanView extends  React.Component{


	_pressIn() {
		this.refs.image.setNativeProps({
			source: this.props.pressOutImage,
		});
	}

	_pressOut() {
		this.refs.image.setNativeProps({
			source: this.props.pressInImage,
		});
	}

	constructor(props){
		  super(props);
      this.state = {
        height: 33,
        top:0
			};
			this._textH =0;
			this._minH= 0;
			this._maxH=0;
			this._previousHeight= 33;
			this._previousTop =0;
  }
	

  _onLayout(e){
  	this._textH = e.nativeEvent.layout.height;
  	this._minH = 33;
  	this._maxH = this._textH + this._minH;
  }

  _panPress(){
        LayoutAnimation.linear();
      if(this.state.top == 0) {
          this.thumb.setSource(require('../../Resources/pan_up.png'));
          this.setState({
              height: this._maxH,
              top: this._textH,
          });
          this.props.callback(true);

      } else {
         this.thumb.setSource(require('../../Resources/pan_down.png'));
          this.setState({
              height: this._minH,
              top: 0,
          });
          this.props.callback(false);
      }

  }

	render() {

		return(
        <View style={[{height: this.state.height, overflow:'hidden'}]}>
					<Text onLayout={(event)=>{this._onLayout(event)}} style={styles.text3}>{this.props.text}</Text>
          <TouchableWithoutFeedback onPress={()=>{this._panPress()}} style={{backgroundColor:'transparent'}}>
            <View  style={{position:'absolute', paddingTop:10, left:0, top:this.state.top,backgroundColor:'transparent', height: 33, width:screenWidth, justifyContent:'center', alignItems:'center'}}>
              <Thumb2 ref={(component) => {this.thumb = component}} />
            </View>
          </TouchableWithoutFeedback>
        </View>
		);
	}

}

class Thumb2 extends React.Component{

	constructor(props){
	  super(props);
		this.state = {
			source:require('../../Resources/pan_down.png'),
		}
	}

	setSource(s){
		this.setState({
			source:s
		});
	}

  render(){
		return (<ImageBackground style={styles.panImage} source={this.state.source}/>);
	}
}


class TopView extends React.Component{

		constructor(props){
		  super(props);
			this.state = {
				index:0,
				favored: this.props.favored?(this.props.favored):false,
			};
			this.flag1=false;
		}

	  _onLayout(event){

	  	  var width = event.nativeEvent.layout.width;
	  	  var  kk = Math.floor(40 * width / 253.5);
	  	  this.setState({
	  	  	 index: kk,
	  	  });
	  }

    componentWillReceiveProps(nextProps) {
	    if(nextProps.favored != this.state.favored){

	      this.setState({
	         favored: nextProps.favored,
	      });
	    }
		}

		changeText(value){
			this.flag1=value;
			this.forceUpdate();
		}

		render() {

			var text='';

			if (this.props.playCount > 10000) {
				var w = Math.floor(this.props.playCount / 10000);
				var q = Math.floor((this.props.playCount - 10000*w) / 1000);
				if (q > 0) {
					text = '播放: ' + w + '.' + q + '万次';
				} else {
					text = '播放: ' + w + '万次';
				}

			} else {
				text =  '播放: ' + this.props.playCount+ '次';
			}

			var panview = null;
			var text1 = this.props.albumIntroduce;
			var text2 = '';

			if(text1.length > 22) {
				text2 = text1.substring(22);
				text1 = text1.substring(0,22);
				panview = (
					<PanView
							text={''}
							callback={(value)=>{this.changeText(value)}}
							pressInImage={require('../../Resources/pan_down.png')}
							pressOutImage={require('../../Resources/pan_down_high.png')}/>
				);
			} else {
				panview = (
					<View style={{height:10, width:20}} />
				);
			}
			var showText=this.flag1?this.props.albumIntroduce:text1;
			return(

				<View style={{backgroundColor:'transparent'}}>
						<ImageBackground  style={{}} source={require('../../Resources/list_top_bg.png')} >
							<View style={styles.topContainer}>
								<ImageBackground style={styles.trackCoverSource} imageStyle={{borderRadius:30,}} source={require('../../Resources/holder_middle.png')} resizeMode='stretch'>
									<ImageBackground style={styles.trackCoverSource} imageStyle={{borderRadius:30,}}  source={{uri:this.props.thumbSource}}></ImageBackground>
								</ImageBackground>
								<View style={{marginTop:16,alignItems:'center'}}>
									<Text style={styles.albumText}>{text}</Text>
								</View>
								<View style={{marginLeft:20,marginRight:20, marginTop:13,alignItems:'center'}}>
									<Text style={styles.albumIntroduce} 
									onLayout={(event)=>{this._onLayout(event)}}  
									numberOfLines={0}>简介:{showText}</Text>
								</View>
							</View>
							{panview}
						</ImageBackground>
				</View>
			);


		}
}


class TrackCellView extends React.Component{

	constructor(props){
		super(props);

		this.state = {
			playing: false,
			trackProgress: this.props.progress?this.props.progress:0,
		}
	}

	_onRowPress() {
		var p = this.state.trackProgress >= 0 ? this.state.trackProgress : 0;
		this.props.onRowPress(this.props.trackData,p);
	}

	_onPress(){

        this.__isfavored = 1;
				Device.getDeviceWifi().callMethod("get_channels",{"all":0}).then((result)=>{

						const channels = result.result.chs;
            if(channels != undefined){
               var chs = channels;
               for(var k=0; k<chs.length; k++){
                var tmp = chs[k];
                if(tmp.id == this.props.albumId){
                  this.__isfavored = 0;
                  break;
                }
               }
            }
         }).catch(error=>{
						console.log('error-975-'+JSON.stringify(error));
					});


       var p = this.state.trackProgress >= 0 ? this.state.trackProgress : 0;

       var localProps = {
            current_status: 'pause',
            current_player: 1,
            current_program: this.props.albumId,
            current_sub: this.props.trackData.id,
            current_progress: p,
         };


			if(!this.state.playing) {


				var tmp = this.props.trackData.play_url_64_m4a;
				var idx = tmp.indexOf('?');
				if(idx != -1) {
					tmp = tmp.substring(0, idx);
				}

					var params = {

						params:{
							url: 'http://api.ximalaya.com/openapi-gateway-app/albums/browse',
							type:1,
							id: this.props.albumId,
							voice: tmp,
							try: this.__isfavored,
						}

					};

					this.havePlayed = true;
					Device.getDeviceWifi().callMethod('play_voice', params).then((json) => {
							
							localProps.current_status = 'run';
							DeviceEventEmitter.emit('LocalRadioPropsEvent', {data: localProps});
							DeviceEventEmitter.emit(Constants.Event.radio_status, {data : {status:1, trackId:this.props.trackData.id}});

									this.setState({playing: !this.state.playing,});

									if(this.state.trackProgress > -1) {

										var params = {params:{
																			to: this.state.trackProgress,
																		}
																	};
										Device.getDeviceWifi().callMethod('drag', params).then((success, json) => {

										});

										this._updateProgress();
									}

					}).catch(error=>{
						console.log('error-1034 -'+JSON.stringify(error));
					});


			} 
			else {
				Device.getDeviceWifi().callMethod('pause', {}).then((success, json) => {

							localProps.current_status = 'pause';
							DeviceEventEmitter.emit('LocalRadioPropsEvent', {data: localProps});
							DeviceEventEmitter.emit(Constants.Event.radio_status, {data : {status:0, trackId:this.props.trackData.id}});
				}).catch(error=>{
					console.log('error-1046 -'+JSON.stringify(error));
				});

			}




	}

	componentDidMount(){


		this.subscription = DeviceEventEmitter.addListener(Constants.Event.radio_props, (event) => {

            var radioProps = event.data;
            	if(radioProps.current_status == 'run' && radioProps.current_program == this.props.albumId && radioProps.current_sub == this.props.trackData.id) {

		    		  	if(this.state.trackProgress > -1) {
							     this.setState({
			    		  	 	 playing:true,
			    		  	 	 trackProgress:radioProps.current_progress,
			    		  	 });
							this._updateProgress();
						} else{
							this.setState({
								playing: true,
							});
						}

	    		} else {
	    			this.setState({
	    				playing: false,
	    			});
	    		}
        });

		this.subscription2 = DeviceEventEmitter.addListener(Constants.Event.radio_status, (event) => {

			var status = event.data.status;
			var id = event.data.trackId;
			if(this.props.trackData.id != id) {

				if(status==1 && this.state.playing) {
					this.setState({
						playing: false,
					});
				}

			}

		});

	}

	getRadioProps(){
		Device.getDeviceWifi().callMethod('get_prop', {}).then((json) => {

	          if ( (json.code==0)&& json.result) {

	          			var radioProps = json.result;
									if(!radioProps.current_status == 'run') {

										this.setState({playing:false,});

									} else {

										if(radioProps.current_program !== this.props.albumId || radioProps.current_sub !== this.props.trackData.id) {
											
											this.setState({playing:false,});
										} else {

												if(radioProps.current_progress >= this.props.trackData.duration){
													
													this.setState({play: false,trackProgress:0,});
												} else {

													this.setState({trackProgress:radioProps.current_progress,});
												}

										}
								}

	          }
		}).catch(error=>{
			console.log('error-1135 -'+JSON.stringify(error));
		});
	}

	//同步服务器播放进度
	_updateProgress() {

		this.updateTimer = 	setInterval(()=>{this.getRadioProps()},6000);

	}

	componentWillMount() {

		this.havePlayed = false;

	}

	componentWillReceiveProps(nextProps) {

	}

	shouldComponentUpdate(nextProps, nextState) {

	  if(this.props.progress != nextProps.progress) {
	  		this.setState({
				trackProgress: nextProps.progress,
			});
	  }
	  return true;
	}

	componentWillUnmount() {
		this.updateTimer&&clearInterval(this.updateTimer);
		this.subscription.remove();
		this.subscription2.remove();
	}

	render() {

		var trackPlaySource = this.state.playing ? require('../../Resources/track_pause.png') : require('../../Resources/track_play.png');
		var tmpView;

		var backStyle={
			backgroundColor: 'transparent',
		};

		if(this.state.trackProgress > 0){
			tmpView = (
				<View style={{flexDirection:'row', alignItems:'center', marginTop:12}}>
					<Text style={styles.trackDescText1}>{Constants.DateUtils.transformProgress(this.state.trackProgress)}</Text>
					<ProgressViewIOS style={styles.progressViewIOS} progress={this.state.trackProgress/this.props.trackData.duration}
									 trackTintColor={Constants.TintColor.rgb224}
									 progressTintColor='rgb(0,255,217)'
									 ref='progressViewIOS'/>
					<Text style={styles.trackDescText}>{Constants.DateUtils.transformProgress(this.props.trackData.duration)}</Text>
				</View>
			);

		} else {

			var txt = Constants.DateUtils.genLength(this.props.trackData.duration);
      var text='';
      if (this.props.trackData.play_count!=undefined&&this.props.trackData.play_count > 10000) {
        var w = Math.floor(this.props.trackData.play_count / 10000);
        var q = Math.floor((this.props.trackData.play_count - 10000*w) / 1000);
        if (q > 0) {
          text =w + '.' + q + '万次';
        } else {
          text =w + '万次';
        }

      } else if(this.props.trackData.play_count!=null||this.props.trackData.play_count!=undefined){
        text = this.props.trackData.play_count+ '次';

      }
			tmpView = (

				<View style={{marginTop:10,flexDirection:'row',alignItems:'center'}}>
          <ImageBackground style={{marginRight:5,width:8,height:10}} source={icon_play}></ImageBackground>
					<Text style={styles.trackDescText}>{text}</Text>
          <ImageBackground style={{marginRight:5,width:10,height:10}} source={icon_time}></ImageBackground>
          <Text style={styles.trackDescText}>{txt}</Text>
				</View>

			);

		}

		return(

			<TouchableWithoutFeedback onPress={()=>{this._onRowPress()}}>
			  <View style={[styles.trackCellView, backStyle]}>
			   <TouchableWithoutFeedback onPress={()=>{this._onPress()}}>
				<ImageBackground style={styles.trackThumbShadow}  imageStyle={{borderRadius:5}} source={require('../../Resources/holder_small.png')} resizeMode='stretch'>
					<ImageBackground style={styles.trackThumbSource} imageStyle={{borderRadius:5,}} source={{uri: this.props.trackData.cover_url_small}}>
							<ImageBackground ref='palyBtn' style={styles.trackPlay} source={trackPlaySource} />
					</ImageBackground>
				</ImageBackground>
				</TouchableWithoutFeedback>
				<View style={styles.trackRightContainer}>
					<Text style={styles.trackTitle} numberOfLines={1}>{this.props.trackData.track_title}</Text>
					{tmpView}
				</View>
				</View>
			</TouchableWithoutFeedback>

		);
	}

}

var styles = StyleSheet.create({

	text2:{
		fontSize: 12,
		marginLeft: 12,
		marginRight: 12,
		color:Constants.TextColor.rgb127,
	},
  text3:{
		fontSize: 12,
		marginLeft: 12,
		marginRight: 12,
		color:'white',
	},
	favorBtn: {
		width: 50,
		height:23,
		justifyContent:'center',
		alignItems:'center'
	},
	trackRowStyle:{
		height:70,
		backgroundColor:Constants.TintColor.rgb255,
	},
	progressViewIOS:{
		height:2,
		flex:1,
		marginLeft:6,
		marginRight:6,
	},
	trackDescText:{
		color: 'rgba(0,0,0,0.6)',
		fontSize:Constants.FontSize.fs22,
    marginRight:25,
	},
  trackDescText1:{
    color: 'rgba(0,0,0,0.6)',
    fontSize:Constants.FontSize.fs22,
  },
	trackTitle:{
		marginTop: 20,
		color:Constants.TextColor.rgb51,
		fontSize:Constants.FontSize.fs30,
	},
	trackRightContainer:{
		flex:1,
		alignSelf:'stretch',
    paddingRight:30,
	},
	trackPlay:{
		height:26,
		width:26,
		borderRadius:13,
		alignSelf:'center',
		backgroundColor:'transparent',
	},
	trackThumbSource:{
		height:50,
		width:50,
		alignSelf:'center',
		alignItems:'center',
		justifyContent:'center',
		backgroundColor:'transparent',
	},
  trackCoverSource:{
    height:60,
    width:60,
    alignSelf:'center',
    alignItems:'center',
    justifyContent:'center',
    backgroundColor:'transparent',
  },
	trackThumbShadow:{
		height: 50,
		width: 50,
		borderRadius:5,
		alignItems:'center',
		justifyContent:'center',
		marginRight:16,
		marginLeft:12,
	},
	trackCellView:{
		height:80,
		backgroundColor:'rgb(253, 254, 255)',
		flexDirection:'row',
		alignItems:'center',
	},
	footer:{
	  height:75,
 	},
	list:{
		flex:1,
		marginTop:0,
		marginBottom:0,
  },
	bottomView:{
		position:'absolute',
		bottom:0,
		left:0,
		height: 65,
		width: screenWidth,
  },
	sortText:{
		fontSize: Constants.FontSize.fs21,
		color:Constants.TextColor.rgb127,
	},
	sortBtnImg:{
		height: 16,
		width:16,
		borderRadius: 8,
		marginRight: 4,
	},
	sortBtn: {
		flexDirection:'row',
		position:'absolute',
		right:12,
		top:15,
	},
	trackCounts:{
		marginLeft:12,
		fontSize: Constants.FontSize.fs21,
		color:Constants.TextColor.rgb127,
	},
	centerContainer:{
		height: 44,
		flexDirection:'row',
		justifyContent:'flex-start',
		alignItems:'center',
		marginTop:0,
		marginBottom:0,
	},
	albumIntroduce:{
		marginLeft:20,
    marginRight:20,
		fontSize: Constants.FontSize.fs25,
		color:'white',
	},
	albumName:{
		fontSize: Constants.FontSize.fs33,
		color:Constants.TextColor.rgb51,
		marginTop:25,
		width:150,
	},
	albumText:{
		color:Constants.TextColor.rgb255,
		fontSize:Constants.FontSize.fs30,
	},
	albumDesc:{
		height:13,
		width:80,
		position:'absolute',
		backgroundColor:Constants.TintColor.rgb0,
		opacity:0.6,
		bottom:0,
		alignItems:'center',
		justifyContent:'center',
	},
	thumbShadow:{
		height: 80,
		width: 80,
		alignItems:'center',
		justifyContent:'center',
		marginTop:12,
		marginRight:12,
		marginLeft:10,
	},
	thumb:{
		height:80,
		width:80,
		alignSelf:'center',
		backgroundColor:'transparent',
	},
  topContainer:{
  	 marginBottom:5,
     marginTop:10,
  	 flexDirection:'column',
  },
  panImage:{
  	width:10,
  	height:10,
  },
  separator:{
    height:0.8,
    marginLeft:12,
		backgroundColor:Constants.TintColor.rgb243,
		// backgroundColor:'rgb(244,244,244)',
  },
  top:{
    flex:1,
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:'transparent',
  },

});

module.exports = AlbumPage;
