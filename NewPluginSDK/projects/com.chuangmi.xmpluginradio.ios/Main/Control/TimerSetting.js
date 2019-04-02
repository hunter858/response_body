'use strict';
import React,{component} from 'react' ;
import Constants  from '../../Main/Constants';
import NoWifiView  from '../View/NoWifiView';
import {Device,DeviceEvent,Host,Package,Service} from 'miot';
import {
  APPBAR_HEIGHT,APPBAR_MARGINBOTTOM,APPBAR_MARGINTOP,isIPX ,
	ratio,NavigatorBarHeight,screenWidth,screenHeight} from '../ConstDefine';
	
import {
  Image,
  ListView,
  TouchableHighlight,
  StyleSheet,
  Text,
  View,
  Switch,
  PixelRatio,
  LayoutAnimation,
  DeviceEventEmitter
} from 'react-native';


class TimerSetting extends React.Component{

		constructor(props){
		    super(props);

        this.state = {
        	opened: true,
        	progress:-1,
        	duration: 0,
					timerSeconds: 0,
					netInfo:null,
        }
    }

		loadClocks(){

			Device.getDeviceWifi().callMethod('get_alarm_clock',{params:{start: this.start}}).then(( json) => {

					if ((json.code==0)&&json.result!= undefined && json.result.clocks != undefined) {

							var clocks = json.result.clocks;

							for(var k=0; k<clocks.length; k++){
									var tmp = clocks[k];
									if(tmp.action == 'pause' && tmp.tag == 255) {
										this.clockData = tmp;
										var now = new Date().getTime() / 1000;
										var unixTimestamp = tmp.next;
										var left = (unixTimestamp - now) * 1000;

										if(left > 0){
											this.startInterval(left);
										}
										break;
									}
							}

							if(this.clockData.id != undefined){
								this.id = this.clockData.id;
								return;
							}

							if(clocks.length >= 5 ) {
									this.start += 5;
									this.loadClocks();
							}
					}
			}).catch(error=>{
        console.log('error-71 -'+JSON.stringify(error));
      });
		}

    componentWillMount(){
			this.id = -1;
			this.start = 0 ;
			this.clockData = {};
			this.loadClocks();
			this.inter = -100;

			Host.file.readFile(Service.account.ID + '===' + Device.deviceID + '::timerIsOn').then((content)=>{
				 
				var isOn = true;
    	 	if(content != '') {
    	 		var datas = JSON.parse(content);
    	 		isOn = datas.on;
    	 		//if(isOn) this.doInit();
    	 	}
    	 	this.setState({opened: isOn});
    	});

			Device.getDeviceWifi().callMethod('get_prop',{}).then(( json) => {

          if (((json.code==0)) && (json.result != undefined)) {
             	var radioProps = json.result;
							var type = radioProps.current_player;
							if(type == 2){

								LayoutAnimation.linear();
								this.setState({
									progress: radioProps.current_progress,
									duration: radioProps.current_duration,
								});

								this.subscription = DeviceEventEmitter.addListener(Constants.Event.radio_props, (event) => {

									var radioProps = event.data;
									var type = radioProps.current_player;
									if(type == 2){

											LayoutAnimation.linear();
											this.setState({
												progress: radioProps.current_progress,
												duration: radioProps.current_duration,
											});

									} else {
											LayoutAnimation.linear();
											this.setState({
												progress: -1,
												duration: 0,
											});
									}

								});

							}

           }
      }).catch(error=>{
        console.log('error-132 -'+JSON.stringify(error));
      });
    }

    componentWillUnmount(){
    	if(this.inter > 0) {
				this.clearInterval(this.inter);
				this.inter = -100;
			}
    	if(this.subscription) this.subscription.remove();
    }

    switchValueChange(value){

    	this.clearAndSetTimer(0);
    	LayoutAnimation.linear();
    	this.setState({
    		opened: value,
    		timerSeconds: 0,
    	});
			Host.file.writeFile(Service.account.ID + '===' + Device.deviceID + '::timerIsOn', "" + JSON.stringify({on: value})).then((result)=>{});
    }

    timerSetting(index){



    	if(index == 0) {

				Device.getDeviceWifi().callMethod('get_prop', {}).then((json) => {

          	if ((json.code==0) && json.result != undefined && json.result.current_player == 2) {
									
								var radioProps = json.result;
								var type = radioProps.current_player;
								if(type == 2 ){
									this.setState({
										progress: radioProps.current_progress,
										duration: radioProps.current_duration,
									});
								}
								var seconds = radioProps.current_duration - radioProps.current_progress;
								this.clearAndSetTimer(seconds);
			     	} else {

								var seconds = this.state.duration - this.state.progress;
								this.clearAndSetTimer(seconds);
			     	}
			 	});
			}  
			else {

    		var seconds = index * 10 * 60;
    		this.clearAndSetTimer(seconds);
    	}
    }
   

    clearAndSetTimer(seconds){

			if(this.inter > 0) {
				this.clearInterval(this.inter);
				this.inter = -100;
			}


    	if(seconds > 0) {
    	 	this.setTimer(seconds);
    	} else {

    	 	if(this.id != -1) {
					Device.getDeviceWifi().callMethod('disable_alarm_clock',{params:{id: this.id}}).then((json) => {
								
						if(json.code==0){
	     	 	 	 	 DeviceEventEmitter.emit('TimerOff', {});
	     	 	 	 }
	     	 	});
     	 	}
    	}



    }

    setTimer(seconds){  // 设置闹钟
	    	var current = new Date();
				var startSeconds =  current.getTime();
				var stopSeconds = startSeconds + seconds * 1000;

				current.setTime(stopSeconds);
				var stopUTC = current.getUTCHours() + ':' + current.getUTCMinutes();
				var params = {
					params:{
						utc: stopUTC,
						zone: 480,
						action: 'pause',
						tag: 255,
					}
				};

				if(this.id != -1) {
					params.params.id = this.id;
				}


				Device.getDeviceWifi().callMethod("set_alarm_clock", params).then((json2) => {

					if(json2.code==0) {

						this.startInterval(seconds * 1000);
							DeviceEventEmitter.emit('TimerOn', {data: seconds});

					} else {
						// MHPluginSDK.showFailTips('定时关闭设置失败');
						if(this.touchView0){
								this.touchView0.setSelected(false);
						}
						if(this.touchView1){
								this.touchView1.setSelected(false);
						}
						if(this.touchView2){
								this.touchView2.setSelected(false);
						}
						if(this.touchView3){
								this.touchView3.setSelected(false);
						}
						if(this.touchView6){
								this.touchView6.setSelected(false);
						}
						if(this.touchView9){
								this.touchView9.setSelected(false);
						}
						this.setState({
							timerSeconds : 0,
						});
					}
			});
    }

    startInterval(millionSecondss){
    	if(this.inter > 0) {
    		this.clearInterval(this.inter);
    		this.inter = -100;
    	}
    	var sds = millionSecondss / 1000;
    	this.setState({
    		timerSeconds : sds,
    	});
    	this.inter = this.setInterval(this.setTimerSeconds, 1000);
    }

    setTimerSeconds(){

    	if(this.state.timerSeconds <= 0) {
    		 this.clearAndSetTimer(0);
    		 if(this.touchView0){
			  	this.touchView0.setSelected(false);
			 }
			 if(this.touchView1){
			  	this.touchView1.setSelected(false);
			 }
			 if(this.touchView2){
			  	this.touchView2.setSelected(false);
			 }
			 if(this.touchView3){
			  	this.touchView3.setSelected(false);
			 }
			 if(this.touchView6){
			  	this.touchView6.setSelected(false);
			 }
			 if(this.touchView9){
			  	this.touchView9.setSelected(false);
			 }

    		return;
    	}

    	var sds = this.state.timerSeconds - 1;
    	this.setState({
    		timerSeconds: sds,
    	});

    }

		render(){
			if(this.state.netInfo == 'none' || this.state.netInfo == 'unknown'){
					return <NoWifiView />
			}

			if(!this.state.opened){
				return(
					<View style={{flex:1, paddingTop:0, backgroundColor:Constants.TintColor.rgb235}}>
						<View style={styles.container}>
							<Text style={styles.text}>定时停止播放</Text>
							<Switch 	onValueChange={(value)=>{this.switchValueChange(value)}}
										onTintColor={Constants.TintColor.switchBar} value={this.state.opened}
											tintColor={Constants.TintColor.rgb235}  />
						</View>
					</View>
				);
			}

			var first = null;
			if(this.state.progress > -1) {
				first = (
					<TouchView onPress={()=>{this.timerSetting(0)}} text='播放完当前声音' index={0} ref = {(component) => {this.touchView0= component}}/>
				);
			}

			var txt = null;
			if(this.state.timerSeconds > 0) {
				var txt2 = Constants.DateUtils.transformProgress(this.state.timerSeconds);
				txt = (<Text style={styles.text2}>{txt2}</Text>);
			}

			return (
				<View style={{flex:1, paddingTop:0, backgroundColor:Constants.TintColor.rgb235}}>
					<View style={styles.container}>
						<Text style={styles.text}>定时停止播放</Text>
						<Switch 	
									onValueChange={(value)=>{this.switchValueChange(value)}}
									onTintColor={Constants.TintColor.switchBar} value={this.state.opened}
									tintColor={Constants.TintColor.rgb235}  />
							{txt}
					</View>

					<View style={{backgroundColor:'transparent', marginTop:40}}>
						{/* {first} */}
						<View style={styles.separator} />
						<TouchView onPress={()=>{this.timerSetting(1)}} text='10分钟后' index={1} ref = {(component) => {this.touchView1= component}}/>
						<View style={styles.separator} />
						<TouchView onPress={()=>{this.timerSetting(2)}} text='20分钟后' index={2} ref = {(component) => {this.touchView2= component}}/>
						<View style={styles.separator} />
						<TouchView onPress={()=>{this.timerSetting(3)}} text='30分钟后' index={3} ref = {(component) => {this.touchView3= component}}/>
						<View style={styles.separator} />
						<TouchView onPress={()=>{this.timerSetting(6)}} text='60分钟后' index={6} ref = {(component) => {this.touchView6= component}}/>
						<View style={styles.separator} />
						<TouchView onPress={()=>{this.timerSetting(9)}} text='90分钟后' index={9} ref = {(component) => {this.touchView9= component}}/>
					</View>
				</View>
			);
		}
}

class TouchView extends React.Component{

		constructor(props){
		    super(props);
				this.state = {
					selected: false,
				}
		}

    _onPress(){
    	if(this.state.selected) return;
    	DeviceEventEmitter.emit('TimerChange',{data : {index : this.props.index}});
				this.props.onPress();
				this.setState({
					selected: true,
				});
   		}

		setSelected(value){

				if(this.state.selected == value)	 return;
				this.setState({
					selected: value,
				});
		}

    componentDidMount(){

    	this.sc =  DeviceEventEmitter.addListener('TimerChange', (event) => {
    		var index = event.data.index;
    		if(index != this.props.index) {
    			this.setState({
    				selected: false,
    			});
    		}
    	});
    }

    componentWillUnmount(){
    	this.sc.remove();
    }

		render(){

			var imgView = null;
			if(this.state.selected){
				imgView = (<Image style={styles.image}  resizeMode='stretch' source={require('../../Resources/checkMask.png')}/>);
			}

			return (
				<TouchableHighlight onPress={()=>{this._onPress()}}>
					<View style={styles.container}>
						<Text style={styles.text}>{this.props.text}</Text>
						{imgView}
					</View>
				</TouchableHighlight>
			);
		}
}


var styles = StyleSheet.create({

	container:{
		height: 44,
		backgroundColor:'white',
		paddingLeft:15,
		paddingRight:15,
		flexDirection:'row',
		justifyContent:'space-between',
		alignItems:'center'
	},
	text:{
		fontSize: 15,
		color:'rgb(51,51,51)',
	},
	text2:{
		position:'absolute',
		top:15,
		right:80,
		fontSize: 13,
		color:'rgb(130,130,130)',
	},
	image: {
		width:15,
		height:15,
	},
	separator: {
		height:1/PixelRatio.get(),
	},
});

module.exports = TimerSetting;
