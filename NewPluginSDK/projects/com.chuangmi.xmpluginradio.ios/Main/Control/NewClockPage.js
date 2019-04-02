'use strict';

// 创建新闹钟
import React,{component} from 'react' ;
import  {XimalayaSDK,XMReqType}  from '../Const/XimalayaSDK';
import Constants  from '../../Main/Constants';
import NoWifiView  from '../View/NoWifiView';
import Slider  from 'react-native-slider';
import { TitleBarBlack,TitleBarWhite,LoadingDialog } from 'miot/ui';
import {Device,DeviceEvent,Host,Package,Service} from 'miot';
import {
  APPBAR_HEIGHT,APPBAR_MARGINBOTTOM,APPBAR_MARGINTOP,isIPX ,
  ratio,NavigatorBarHeight,screenWidth,screenHeight} from '../ConstDefine';
import {withNavigation} from 'react-navigation';
import {LocalizedStrings} from '../../Main/MHLocalizableString';
import CustomerTitleBar from '../View/CustomerTitleBar';




import {
  ImageBackground,
  ListView,
  StyleSheet,
  ScrollView,
  Text,
  View,
  DatePickerIOS,
  TouchableHighlight,
  PixelRatio,
  DeviceEventEmitter,
  LayoutAnimation,
  Alert,
  TouchableOpacity,
} from 'react-native';


class NewClockPage extends React.Component{

  static navigationOptions = ({ navigation }) => {
    return {
    header:null
    };
  };

  static defaultProps = {

    timeZoneOffsetInMinutes: (-1) * (new Date()).getTimezoneOffset(),
  }

  // 初始化方法，返回this.state
  constructor(props){
      super(props);

      var parmas = this.props.navigation.state.params;
      this.state = {
        date: new Date(),
        maxdate: null,
        closeText:'',
        repeatText:'永不',
        voice:'',
        newDate:new Date(),
        clockCounts: 0,
        startTime:'07:30',
        endTime:'08:00',
        timeFlag:1,
        showVolume:false,
        visLoading:false,
        message:'',
        /* 后加*/
        edit:parmas.edit,
        data:parmas.data,
      };
      this.startID =-100;
      this.closeID =-100;

      this.paramsVolume = 10;
      this.volume=10;
      this.onSlidingCompleted=false;
      this.startTime = new Date();
      this.closeTime = new Date();
      this.repeats = [];
      this.repeats2 = [];
      this.radioProps = {};
      this.channel = {};
      this.saving = false;
      // 月 日 时 分 秒
      this._date = new Date();
      this._closedate=new Date();
      this._date.setTime('1481671843000');
      this._closedate.setTime('1481673643000');
      this.tag = this.genTag();
  }

  componentWillMount(){

      if(this.state.edit == undefined ) {
        Device.getDeviceWifi().callMethod('get_prop',{}).then((json) => {

             if ((json.code==0) && json.result != undefined) {
                 this.radioProps = json.result;
                 this.getProgramInfo(this.radioProps);
              }
          }).catch(error=>{
            console.log('error-148 -'+JSON.stringify(error));
          });
      }

      Host.file.readFile(Service.account.ID + '===' + Device.deviceID + '::clockCounts').then((content)=>{
            
        if( content != '') {
          var k  = parseInt(content);
          LayoutAnimation.linear();
          this.setState({
            clockCounts: k,
          });
        }
      });

      // 编辑状态
      if(this.state.edit != undefined ) {

            var kdata = this.state.data;
            this.volume =  kdata.volume;
            this.tag = kdata.tag;
            this.startID = kdata.id;

            var kstart = this.genDateAccordingUTCString(kdata.utc);
            this._date = kstart;
            this.setState({
                newDate: kstart,
                startTime:Constants.DateUtils.getHourAndSecond(kstart),
            });

            if(kdata.closeId != undefined) {
                this.closeID = kdata.closeId;
                var kend = this.genDateAccordingUTCString(kdata.closeUtc);
                this.setState({
                    // maxdate: kend,
                    // closeText: Constants.DateUtils.getHourAndSecond(kend),
                    endTime: Constants.DateUtils.getHourAndSecond(kend),
                });
                this.closeTime = kend;
            }

            if(kdata.week != undefined ) {

                var kweeks = kdata.week.split(',');
                var txt = ['周一 ', '周二 ', '周三 ', '周四 ', '周五 ', '周六 ', '周日 ' ];
                var txt2 = [1, 2, 3,4,5,6,0];
                var ktxt = '';


                for(var k=0; k<txt2.length; k++) {
                    var tmp = txt2[k];
                    var found = false;
                    for(var j=0; j<kweeks.length; j++) {
                        var tmp2 = kweeks[j];
                        if(parseInt(tmp2) == tmp) {
                           found = true;
                           break;
                        }
                    }
                    this.repeats.push(found);
                    if(found) {
                       var index = tmp - 1;
                       if(index < 0) index = 6;
                       ktxt += txt[index];
                    }
                }

                if(kweeks.length == 7) ktxt='每天';

                this.repeats2 = kdata.week.split(',');
                this.setState({
                  repeatText: ktxt,
                });

            }

            if(kdata.channel == undefined){
              if(kdata.action!=null&&kdata.action=='local'){
                this.setState({
                    voice: 'Good Morning',
                });
              }else if(kdata.action!=null&&kdata.action=='resume'){
                this.setState({
                    voice: '继续上次播放',
                });
              }
              return;
            };

            this.channel = kdata.channel;

            if(kdata.channel.t == 0) {

                //获取直播电台信息
                XimalayaSDK.requestXMData(XMReqType.XMReqType_LiveRadioByID, {ids: kdata.channel.id+''}, (result, error) => {

                      if(!error && result.radios != undefined ) {
                            //获取当前直播节目的直播时间
                            var radioInfo = result.radios[0];
                            var tmp = radioInfo.rate64_aac_url;
                            var idx = tmp.indexOf('?');
                            if(idx != -1) {
                              tmp = tmp.substring(0, idx);
                            }

                            this.channel = {
                                  id: radioInfo.id,
                                  type:0,
                                  url: tmp,
                            };

                            this.setState({
                                voice: radioInfo.radio_name,
                            });

                        }

                });
            }
            else if(kdata.channel.t == 1){
                
              //根据id获取专辑信息
                XimalayaSDK.requestXMData(XMReqType.XMReqType_AlbumsBatch, {ids: kdata.channel.id + ''}, (result, error) => {
                      if(!error && result!= undefined && result != null && result.length > 0) {

                            var albumInfo = result[0];
                              this.channel = {
                                url: 'http://api.ximalaya.com/openapi-gateway-app/albums/browse',
                                type:1,
                                id: albumInfo.id,
                            };
                            this.setState({
                                voice: albumInfo.album_title,
                            });
                      }  else {

                            this.channel = {
                                url: 'http://api.ximalaya.com/openapi-gateway-app/albums/browse',
                                type:1,
                                id: kdata.channel.id,
                            };

                      }
                });
            }
            else if(kdata.channel.t == Constants.Channels_Type.M3U8_TYPE){
              this.channel = {
                  id: kdata.channel.id,
                  type:Constants.Channels_Type.M3U8_TYPE,
                  url: '',
              };
              //获取m3u8的名称
              var name='M3U8 自定义电台';
              Host.file.readFile(Service.account.ID + '===' + Device.deviceID+ '::M3U8_NAME'+':'+kdata.channel.id).then((content)=>{
                  
                  if(content != '') {
                    name= String(content);
                  }
                  this.setState({voice:name,});
              });
            }

      }
  }


  componentDidMount(){

    this.subscription0 = DeviceEventEmitter.addListener(Constants.Event.radio_props, (event) => {
          var radioProps = event.data;
          if(this.radioProps.current_program == undefined || radioProps.current_program != this.radioProps.current_program) {
              this.radioProps = radioProps;
              this.getProgramInfo(this.radioProps);
          }
    });

    this.subscription = DeviceEventEmitter.addListener('CloseTimeSaved',(notification) => {

          var time = notification.data.time;
          this.closeTime.setTime(time);
          this.setState({
              maxdate: this.closeTime,
              closeText: Constants.DateUtils.getHourAndSecond(this.closeTime),
          });
    });

    this.subscription2 = DeviceEventEmitter.addListener('RepeatDaySaved',(notification) => {

            this.repeats = notification.data.repeates;
            var count = 0;
            var str = '';
            var txt = ['周一 ', '周二 ', '周三 ', '周四 ', '周五 ', '周六 ', '周日' ];
            this.repeats2 = [];
            for(var k=0; k<this.repeats.length; k++){
              var tmp = this.repeats[k];
              if(tmp) {
                count++;
                str += txt[k];
                var p = k+1;
                if(p == 7) p = 0;
                this.repeats2.push(p);
              }
            }

            if(count == 0){
              str = '永不';
            } else if(count == 7) {
              str = '每天';
            }

            this.setState({
              repeatText: str,
            });

    });

    this.subscription3 = DeviceEventEmitter.addListener('ClockSoundSaved',(notification) => {

        this.channel = notification.data.channel;
        //如果为Good morning
        if(notification.data.voice&&notification.data.voice=='Good Morning'){
          if(this.state.timeFlag==1){

            this._closedate.setTime(this._date.getTime()+60000);
            this.setState({
              endTime:Constants.DateUtils.getHourAndSecond(this._closedate),
              voice: notification.data.voice,
            });
          }else{
            this._date.setTime(this._closedate.getTime()-60000);
            this.setState({
              startTime:Constants.DateUtils.getHourAndSecond(this._date),
              voice: notification.data.voice,
            });

          }

        }else {
          this.setState({
              voice: notification.data.voice,
          });
        }

    });


    this.subscription4 = DeviceEventEmitter.addListener('SaveNewClock',(notification) => {

      /*volume: 10,
      closeTime: new Date(),
      repeats:[],   // [false, false, true, false]
      repeats2:[],  // [1, 2, 3, 4, 5]
      radioProps:{},
      channel:{},*/

      if(this.saving) {
            return;
      }

      if(this.state.clockCounts >= 18 && this.state.edit == undefined) {
          Alert.alert(
            '提示',
            '设置的闹铃数量已达上限',
            [
              {text: '确认', onPress: () => {}, style: 'cancel'},
            ]
          );
          return;
      }


      this.saving = true;
      var clockUTC = this._date.getUTCHours() + ':' + this._date.getUTCMinutes();

      var params = {
          utc: clockUTC,
          zone: 480,
          volume: this.volume,
          tag: this.tag,
      };

      if(this.channel.id != undefined){
          params.action = 'play';
          params.channel = this.channel;
      } 
      else {
          if(this.state.voice=='Good Morning'){
            params.action = 'local';
          }else{
            params.action = 'resume';
          }
      }

      if(this.repeats2.length > 0) {
        params.week = this.repeats2.join(',');
      }

      if(this.state.edit != undefined && this.startID != -100) {
          params.id = this.startID;
      }

      this.setState({message:'正在保存...',visLoading:true});
      Device.getDeviceWifi().callMethod('set_alarm_clock', params).then((success, json) => {
                
                this.saving = false;
                if(this.state.closeText != '开启后闹钟会定时关闭，可不设置'){
                      var p = {
                          utc: this._closedate.getUTCHours() + ':' + this._closedate.getUTCMinutes(),
                          zone:480,
                          action:'pause',
                          tag: this.tag,
                      };
                      //good Morning 暂停需要增加 status=0
                      if(this.state.voice=='Good Morning'){
                        p.status ='0';
                      }
                      if(this.repeats2.length > 0) {
                        p.week = this.repeats2.join(',');
                      }

                      if(this.state.edit != undefined && this.closeID != -100) {
                          p.id = this.closeID;
                      }
                      Device.getDeviceWifi().callMethod('set_alarm_clock', p).then((json2) => {
                          
                          this.setState({visLoading:false});
                          if(json2.code==0){
                            DeviceEventEmitter.emit('clockUpdate', {});
                            this.props.navigation.pop();
                          } else {

                            this.saving = false;
                            this.setState({message:'设置闹铃失败',visLoading:true});
                            if(json2.result != undefined && json2.result.id != undefined) {
                                Device.getDeviceWifi().callMethod('del_alarm_clock',{id: json2.result.id}).then((json) => {
                                    this.props.navigation.pop();
                                }).catch(error=>{
                                  console.log('error-446 -'+JSON.stringify(error));
                                });
                            }
                          }

                      }).catch(error=>{
                        console.log('error-450 -'+JSON.stringify(error));
                      });

                } else {

                  this.setState({message:'',visLoading:false});
                  DeviceEventEmitter.emit('clockUpdate', {});
                  this.props.navigation.pop();
                }
               
      }).catch(error=>{
        
        this.saving = false;
        this.setState({message:'设置闹铃失败...',visLoading:false});
        console.log('error-459 -'+JSON.stringify(error));
      });

    });
  }

  componentWillUnmount(){
    if(this.subscription0)
      this.subscription0.remove();
      this.subscription.remove();
      this.subscription2.remove();
      this.subscription3.remove();
      this.subscription4.remove();
  }

  render(){

    if(this.state.netInfo == 'none' || this.state.netInfo == 'unknown'){ 
      return <NoWifiView />
    }
    var closeView = null;

    if(this.state.clockCounts >= 9 && this.state.edit == undefined) {
        closeView = (
            <View style={{marginTop: 0}}>
                <TouchView text1='重复' text2={this.state.repeatText} onPress={()=>{this.onPress(1)}}/>
            </View>
        );

    }  else if(this.state.clockCounts >= 9 && this.state.edit != undefined && this.state.data.closeId == undefined){
        closeView = (
            <View style={{marginTop: 0}}>
                <TouchView text1='重复' text2={this.state.repeatText} onPress={()=>{this.onPress(1)}}/>
            </View>
        );
    } else {
          closeView = (
            <View style={{marginTop: 0}}>
                <View style={styles.separator} />
                <TouchView text1='重复' text2={this.state.repeatText} onPress={()=>{this.onPress(1)}}/>
            </View>
        );
    }

    var startTime;
    var endTime;
    if(this.state.timeFlag==1){
      startTime=<TimeTouchView onPressed={true} text1='开启时间' clear={()=>{this.clear(0)}} text3={this.state.startTime}  onPress={()=>{this.timeOnPressed(0);}}/>;
      endTime=<TimeTouchView  text1='关闭时间'  clear={()=>{this.clear(1)}} text3={this.state.endTime} onPress={()=>{this.timeOnPressed(1);}}/>;
    }else{
      startTime=<TimeTouchView   text1='开启时间' clear={()=>{this.clear(0)}} text3={this.state.startTime}  onPress={()=>{this.timeOnPressed(0);}}/>;
      endTime=<TimeTouchView  onPressed={true} text1='关闭时间'  clear={()=>{this.clear(1)}} text3={this.state.endTime} onPress={()=>{this.timeOnPressed(1);}}/>;
    }

  //音量百分比
  var volumeView=null;
  if(this.state.showVolume){
    var volumeText=parseInt(this.paramsVolume/31*100)+'%';
    volumeView=(<Text style={[styles.text,{alignItems:'center'}]}>{volumeText}</Text>);
  }

  return (
      <View style={{flex:1, paddingTop:0, paddingBottom: 65,backgroundColor:Constants.TintColor.rgb255}} automaticallyAdjustContentInsets={false} >
        <LoadingDialog 
          title={this.state.message}
          cancelable={true}
          timeout={3000}
          onDismiss={() => {
              this.setState({visLoading: false});
          }}
          visible={this.state.visLoading}
        />
        <View >
          <CustomerTitleBar
            title={this.props.navigation.state["params"] ? this.props.navigation.state.params.title : Device.name}
            style={{ backgroundColor:'#805e5f' }}
            onPressLeft={() => {
                this.props.navigation.pop();
            }}
            rightText='保存'
            onPressRight={() => {
              
              DeviceEventEmitter.emit('SaveNewClock', {});

            }}/>
        </View>
      {closeView}
      <View style={styles.separator} />
      <View>
          <TouchView text1='开机播放电台' text2={this.state.voice} onPress={()=>{this.onPress(2)}}/>
          <View style={styles.separator} />
          {startTime}
          <View style={styles.separator} />
            {endTime}
          <View style={styles.separator} />
          <View>
                <View style={styles.container}>
                  <Text style={styles.text}>开机音量</Text>
                  {volumeView}
                </View>
                <View style={[styles.container]}>
                    <ImageBackground style={styles.image1} resizeMode='stretch' source={require('../../Resources/volumeS.png')}/>
                        <Slider
                          maximumValue={31}
                          minimumValue={1}
                          style={styles.slider}
                          value={this.paramsVolume}
                          touchable={true}
                          thumbTintColor='#ffffff' minimumTrackTintColor='#cd3f3f' maximumTrackTintColor='rgba(0,0,0,.15)'
                          onValueChange={(value)=>{this.onSliding(value)}}
                          thumbStyle={{width:26, height:26, borderRadius:13,borderWidth:1/PixelRatio.get(),borderColor:'rgba(0,0,0,.15)'}}
                          onSlidingStart={this._onSliderStart}
                          trackStyle={{height:6/PixelRatio.get()}}
                          onSlidingComplete={(value)=>{this.onSlidingComplete(value)}}/>
                </View>
                <View style={{height:40,width:screenWidth,backgroundColor:'white'}}></View>
                <View style={styles.separator} />

          </View>
      </View>
      <View style={styles.picker} >
        <DatePickerIOS
            style={{ height:220,width:screenWidth,}}
            date={this.state.newDate}
            onDateChange={(value)=>{this.onDateChange(value)}}
            timeZoneOffsetInMinutes={this.state.timeZoneOffsetInMinutes}
            mode='time'/>
      </View>
      </View>
    );
  }

      
  onDateChange(date){

    //如果是Good Morning,播放时长为1分钟
    if(this.state.voice=='Good Morning'){
      if(this.state.timeFlag==1){//1481671843000 07:30
        // alert(date.getTime());//1482310050000    1482310110000
        this._date.setTime(date.getTime());
        this.setState({
          startTime:Constants.DateUtils.getHourAndSecond(this._date),
          newDate:this._date,
        });
        this._closedate.setTime(date.getTime()+60000);
        this.setState({
          endTime:Constants.DateUtils.getHourAndSecond(this._closedate),
          // newDate:this._closedate,
        });
      }else{
        this._date.setTime(date.getTime()-60000);
        this.setState({
          startTime:Constants.DateUtils.getHourAndSecond(this._date),
          newDate:this._date,
        });

        this._closedate.setTime(date.getTime());
        this.setState({
          endTime:Constants.DateUtils.getHourAndSecond(this._closedate),
          newDate:this._closedate,
        });
      }
    }else{
      if(this.state.timeFlag==1){//1481671843000 07:30


        this._date.setTime(date.getTime());
        this.setState({
          startTime:Constants.DateUtils.getHourAndSecond(this._date),
          newDate:this._date,
          //  this._date = date;
          //  this.setState({date: date});
        });
      }else{
        this._closedate.setTime(date.getTime());
        this.setState({
          endTime:Constants.DateUtils.getHourAndSecond(this._closedate),
          newDate:this._closedate,
          //  this._date = date;
          //  this.setState({date: date});
        });
      }
    }

  }

  genDateAccordingUTCString(str){
        var s = str.split(":");
        var d = new Date();
        d.setUTCHours(parseInt(s[0]), parseInt(s[1]));
        return d;
  }

  genTag(){

    var now = new Date();
    var m = now.getMonth() + 1;
    var d = now.getDate();
    var h = now.getHours();
    var mi = now.getMinutes();
    var s = now.getSeconds();
    return parseInt(this.genTag2(m) + this.genTag2(d) + this.genTag2(h) + this.genTag2(mi) + this.genTag2(s));
  }

  genTag2(m){
    if(m < 10) {
        return '0' + m;
    } else {
      return '' + m;
    }
  }

  getProgramInfo(radioProps){

      var type = radioProps.current_player == 0 ? 0 : 1;
      var id = radioProps.current_program;

      if(type == 0) {

            //获取直播电台信息
            XimalayaSDK.requestXMData(XMReqType.XMReqType_LiveRadioByID, {ids: id+''}, (result, error) => {

                  if(!error && result.radios != undefined ) {
                        //获取当前直播节目的直播时间
                        var radioInfo = result.radios[0];
                        var tmp = radioInfo.rate64_aac_url;
                        var idx = tmp.indexOf('?');
                        if(idx != -1) {
                          tmp = tmp.substring(0, idx);
                        }

                      this.channel = {
                            id: radioInfo.id,
                            type:0,
                            url: tmp,
                      };

                      this.setState({voice: radioInfo.radio_name,});
                  }

            });
      }
      else {
          //根据id获取专辑信息
          XimalayaSDK.requestXMData(XMReqType.XMReqType_AlbumsBatch, {ids: id + ''}, (result, error) => {
                if(!error && result!= undefined && result != null && result.length > 0) {

                      var albumInfo = result[0];
                        this.channel = {
                          url: 'http://api.ximalaya.com/openapi-gateway-app/albums/browse',
                          type:1,
                          id: albumInfo.id,
                      };
                      this.setState({
                          voice: albumInfo.album_title,
                      });
                } else {
                    this.channel = {
                          url: 'http://api.ximalaya.com/openapi-gateway-app/albums/browse',
                          type:1,
                          id: id,
                      };
                }
          });

      }
  }

  onPress(index){

    if(index == 0){
      this.props.navigation.navigate('NewClockCloseTime', {
        title:'闹铃时间',
        closeTime: this.closeTime.getTime(),
        minTime: this.state.date.getTime(),
      });
      DeviceEventEmitter.emit('SaveCloseTime', {});

    } else if(index == 1) {

      this.props.navigation.navigate('RepeatDaySelectPage', {
        title:'重复',
        repeates: JSON.stringify(this.repeats),
      });
      // DeviceEventEmitter.emit('SaveRepeatDay', {});


    } else {

        if(this.subscription0){
          this.subscription0.remove();
        }

        this.props.navigation.navigate('ClockSoundSelect', {
          title:'闹铃铃声',
          channel: JSON.stringify(this.channel),
          voice: this.state.voice,
        });
        // DeviceEventEmitter.emit('SaveClockSound', {});
    }

  }

  onSlidingComplete(value){
    this.volume = Math.floor(value);
    this.paramsVolume=value;
    this.setState({
      showVolume:false,
    });
  }

  onSliding(value){

  this.paramsVolume=value;
    this.setState({
      showVolume:true,
    });
  }

  clear(index){

    if(this.state.voice=='Good Morning'){
      if(index==0){//1481671843000 07:30对应的值
        this._date.setTime('1481671843000');
        this.setState({
          startTime:'07:30',
        });
        this._closedate.setTime('1481671903000');//
        this.setState({
          endTime:'07:31',
        });
      }else if(index==1){//1481673643000 08:00对应的值
        this._date.setTime('1481673583000');//
        this.setState({
          startTime:'07:59',
        });
        this._closedate.setTime('1481673643000');
        this.setState({
          endTime:'08:00',
        });
      }
    }else{
      if(index==0){//1481671843000 07:30对应的值
        this._date.setTime('1481671843000');
        this.setState({
          startTime:'07:30',
        });
      }else if(index==1){//1481673643000 08:00对应的值
        this._closedate.setTime('1481673643000');
        this.setState({
          endTime:'08:00',
        });
      }
    }

  }

  timeOnPressed(index){
    if(index==0){
      this.setState({
        timeFlag:1,
      });
    }else if(index==1){
      this.setState({
        timeFlag:2,
      });
    }
  }
}

class TouchView extends React.Component{
  render(){
    return (
      <TouchableHighlight onPress={this.props.onPress}>
        <View style={styles.container}>
          <Text style={styles.text}>{this.props.text1}</Text>
          <Text style={styles.text2} numberOfLines={1}>{this.props.text2}</Text>
          <ImageBackground style={styles.image}  resizeMode='stretch' source={require('../../Resources/arrow_right.png')}/>
        </View>
      </TouchableHighlight>
    );
  }
}

class TimeTouchView extends React.Component{


  render(){

    var image=null;
    var textStyle;
    if(this.props.onPressed){
      image=<ImageBackground style={{width:6,height:9}}  resizeMode='stretch' source={require('../../Resources/clock_time_icon.png')}/>;
      textStyle={
        color:'#cd3f3f',
      };
    };
    return (
      <TouchableHighlight onPress={this.props.onPress}>
        <View style={styles.container}>
          {image}
          <Text style={[styles.text,textStyle]}>{this.props.text1}</Text>
          <Text style={{fontSize:13,color:'rgba(0,0,0,.5)',marginLeft:10}}>{this.props.text3}</Text>
          <Text style={styles.text2} numberOfLines={1}>{this.props.text2}</Text>
          <TouchableOpacity onPress={this.props.clear}>
            <View style={{width:46,height:27,borderRadius:5,borderWidth:1/PixelRatio.get(),borderColor:'rgba(0,0,0,.5)',alignItems:'center',justifyContent:'center'}}>
              <Text style={{color:'black',fontSize:13,textAlign:'center'}}>清除</Text>
            </View>
          </TouchableOpacity>
        </View>
      </TouchableHighlight>
    );
  }
}

var styles = StyleSheet.create({
   picker:{
     height: 220,
     width:screenWidth,
     alignItems:'center',
     marginTop:screenWidth<570?0:64,
   },
  container:{
    height: 44,
    backgroundColor:'white',
    paddingLeft:9,
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
    flex:1,
    marginRight:5,
    marginLeft:20,
    textAlign:'right',
    fontSize: 13,
    color:'rgb(130,130,130)',
  },
  image: {
    width:8,
    height:10,
  },
  image1: {
    width:15,
    height:15.5,
  },
  image2: {
    width:25,
    height:25,
  },
  slider:{
    flex:1,
    marginLeft:10,
    marginRight:10,
  },
  separator: {
    height:1/PixelRatio.get(),
    backgroundColor:'rgba(0,0,0,.15)',
  },
});

export default withNavigation(NewClockPage);
// module.exports = NewClockPage;
