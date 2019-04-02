import React,{component} from 'react' ;
import {Device,DeviceEvent,Host,Package,Service} from 'miot';
import {
  APPBAR_HEIGHT,APPBAR_MARGINBOTTOM,APPBAR_MARGINTOP,isIPX ,
  ratio,NavigatorBarHeight,screenWidth,screenHeight} from '../ConstDefine';
import {XimalayaSDK,XMReqType}  from '../Const/XimalayaSDK';
import {withNavigation} from 'react-navigation';  
import Constants  from '../../Main/Constants';

import {
  Image,
  ListView,
  StyleSheet,
  Text,
  View,
  Switch,
  LayoutAnimation,
  PixelRatio,
  Alert,
  DeviceEventEmitter,
  TouchableHighlight,
  PanResponder,
} from 'react-native';


// var _deleteID = -1;

export default class ClockCell extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      opened: true,
      marginLeft:0,
      bk:'white',
      channelName:'',
    }
    this.panEnable = true;
    this._deleteCounts = 0;
    this._deleteID = -1;
  }

  componentWillMount(){

      this.text1 = '';
      this.text2 = '';

      this._panResponder = PanResponder.create({
            onStartShouldSetPanResponder: this._handleStartShouldSetPanResponder.bind(this),
            onStartShouldSetPanResponderCapture: this.onStartShouldSetPanResponderCapture.bind(this),
            onMoveShouldSetPanResponder: this._handleMoveShouldSetPanResponder.bind(this),
            onMoveShouldSetPanResponderCapture: this.onMoveShouldSetPanResponderCapture.bind(this),
            onPanResponderGrant: this._handlePanResponderGrant.bind(this),
            onPanResponderMove: this._handlePanResponderMove.bind(this),
            onPanResponderRelease: this._handlePanResponderEnd.bind(this),
            onPanResponderTerminate: this._handlePanResponderEnd.bind(this),
      });

      //获取播放节目的名称
      this.getChannelName(this.props.data);

      var date = new Date();
      var utc = this.props.data.utc.split(':');
      date.setUTCHours(utc[0]);
      date.setUTCMinutes(utc[1]);

      if(this.props.data.closeUtc != undefined) {
          var date2 = new Date();
          var utc2 = this.props.data.closeUtc.split(':');
          date2.setUTCHours(utc2[0]);
          date2.setUTCMinutes(utc2[1]);
          this.text1 = '开启时段 ' + Constants.DateUtils.getHourAndSecond(date) + '-' +Constants.DateUtils.getHourAndSecond(date2);
      } else {
          this.text1 = '开启时间 ' + Constants.DateUtils.getHourAndSecond(date);
      }


      if(this.props.data.week != undefined){

        var weeks = this.props.data.week.split(',');
        var txt = ['周一 ', '周二 ', '周三 ', '周四 ', '周五 ', '周六 ', '周日 ' ];
        var txt2 = [1,2,3,4,5,6,0];

        for(var k=0; k<txt2.length; k++) {
                var tmp = txt2[k];
                var found = false;
                for(var j=0; j<weeks.length; j++) {
                    var tmp2 = weeks[j];
                    if(parseInt(tmp2) == tmp) {
                       found = true;
                       break;
                    }
                }

                if(found) {
                   var index = tmp - 1;
                   if(index < 0) index = 6;
                   this.text2 += txt[index];
                }
        }



        if(weeks.length == 7){
              this.text2 = '每天';
        }
      } else {
         this.text2 = '永不';
      }


      var color = 'white';
      if(this.props.data.enable == 'false') {
        color = 'rgb(220,220,220)';
      }

      this.setState({
        opened: this.props.data.enable == 'true',
        bk: color,
      });



  }

  componentDidMount(){

    this.subscription = DeviceEventEmitter.addListener('clockWillDelete', (event) => {
        if(event.data.id != this.props.id) {
            if(this.state.marginLeft == - 70) {

               LayoutAnimation.linear(
                   this.miniCount()
               );

               this.setState({
                  marginLeft: 0,
               });
             }
        }
    });
  }

  componentWillUnmount(){
      
      this.subscription.remove();
  }

  switchValueChange(value){
    var color = value ? 'white' : 'rgb(225,225,225)';

    if(value) {
        Device.getDeviceWifi().callMethod('enable_alarm_clock',{id: this.props.data.id}).then((json) => {
              
            if(json.code==0) {
                if(this.props.data.closeId != undefined){
                Device.getDeviceWifi().callMethod('enable_alarm_clock',{id: this.props.data.closeId}).then((json) => {});
                }
            }
        });

    } else {
        Device.getDeviceWifi().callMethod('disable_alarm_clock', {id: this.props.data.id}).then((json) => {
              
            if(json.code==0){
                if(this.props.data.closeId != undefined){
                Device.getDeviceWifi().callMethod('disable_alarm_clock',{id: this.props.data.closeId}).then((json2) => {});
                }
            }
        });

    }

    this.setState({
       opened: value,
       bk: color,
    });

  }

  _onPressDelete(){

    //   MHPluginSDK.showLoadingTips('正在删除...');

    // if(this.props.deleteCell){ this.props.deleteCell('正在删除...',true)}
    Device.getDeviceWifi().callMethod('del_alarm_clock', {id: this.props.data.id}).then(( json) => {
        

        // if(this.props.deleteCell){ this.props.deleteCell('',false)}
        if(json.code==0){
              if(this.props.data.closeId != undefined){
                Device.getDeviceWifi().callMethod('del_alarm_clock',{id: this.props.data.closeId}).then((json2) => {
                      DeviceEventEmitter.emit('clockUpdate', {});
                });
              } else {
                  DeviceEventEmitter.emit('clockUpdate', {});
              }
        } 

      }).catch(error=>{
        console.log('error-409-'+JSON.stringify(error));
        // if(this.props.deleteCell){ this.props.deleteCell('删除失败',false)}
    });

  }


  getChannelName(kdata){

    if(kdata.action=='local'){//good Morning
        this.setState({channelName:'Good Morning',});
        return;
    }
    if(kdata.action=='resume'){//继续上次播放
        this.setState({channelName:'继续上次播放'});
        return;
    }
    if(kdata.channel==null) return;

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
                         channelName: radioInfo.radio_name,
                     });

                }

           });
    } else if(kdata.channel.t == 1){
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
                         channelName: albumInfo.album_title,
                     });
              }  else {

                    this.channel = {
                        url: 'http://api.ximalaya.com/openapi-gateway-app/albums/browse',
                        type:1,
                        id: kdata.channel.id,
                    };

              }
         });

    }else if(kdata.channel.t == Constants.Channels_Type.M3U8_TYPE){//m3u8
        
        this.channel = {
            id: kdata.channel.id,
            type:Constants.Channels_Type.M3U8_TYPE,
            url: '',
        };
        //获取m3u8的名称
        var name='M3U8 自定义电台';
        Host.file.writeFile(Service.account.ID + '===' + Device.deviceID + '::M3U8_NAME'+':'+kdata.channel.id).then((content)=>{
            
            if(content != '') {
                name= String(content);
            }
            this.setState({channelName:name});
        });
    }

  }


  miniCount(){

    if(this._deleteCounts >= 1) {
        DeviceEventEmitter.emit('ScrollEnabledEvent', {data:{scrollable: true}});
        this._deleteID = -1;
        this._deleteCounts = 0;
    }
  }

  addCount(){

    if(this._deleteCounts <= 0) {
        DeviceEventEmitter.emit('ScrollEnabledEvent', {data:{scrollable: false}});
        this._deleteID = this.props.id;
        this._deleteCounts = 1;
    }

  }

  onMoveShouldSetPanResponderCapture(evt,gestureState) {

    return true;
  }

  onStartShouldSetPanResponderCapture (evt, gestureState) {

    return true;
  }

  _handleStartShouldSetPanResponder(e, gestureState) {

      if(this._deleteCounts > 0 && this._deleteID != this.props.id) {
          DeviceEventEmitter.emit('clockWillDelete', {data:{id: this.props.id}});
          return false;
      }
      return true;
  }

  _handleMoveShouldSetPanResponder(e, gestureState) {

    return false;
  }

  _handlePanResponderGrant(e, gestureState) {

  }

  _handlePanResponderMove(e, gestureState) {

  }

  _handlePanResponderEnd(e, gestureState) {

             if(!this.panEnable) return;//x0
            if((screenWidth-gestureState.x0>50)&&Math.abs(gestureState.dx) < 5 && Math.abs(gestureState.dy) < 5
                    && gestureState.vx == 0 && gestureState.vy == 0 && this.state.marginLeft >= 0){
                  this.panEnable = false;
                  this._onPressEdit();
                  return;
             }

             if(this.state.marginLeft == -70 && gestureState.vx > 0 && gestureState.dx > 10 && Math.abs(gestureState.dy) < 20){

                LayoutAnimation.linear(

                  this.miniCount()
                );

                this.setState({
                   marginLeft: 0
                });

              }

              if(this.state.marginLeft == 0 && gestureState.vx < 0 && gestureState.dx < -10 && Math.abs(gestureState.dy) < 20){

                  LayoutAnimation.linear(

                    this.addCount()
                  );

                  this.setState({
                    marginLeft: -70
                  });

              }
  }

  //闹铃编辑
  _onPressEdit(){
    this.panEnable = true;
    if(this.props.onPressEdit){ this.props.onPressEdit()}
    
      // this.props.navigation.navigate('NewClockPage', {
      //     title:'闹铃编辑',
      //     edit: true,
      //     data: this.props.data,
      // });
  }

  render(){
     return( 
     <View style={{flexDirection:'column'}}>
          <View style={{flexDirection:'row'}} >
                  <View {...this._panResponder.panHandlers} style={[styles.container, {marginLeft: this.state.marginLeft, backgroundColor:Constants.TintColor.rgb255}]}>
                      <View style={{flex:1, justifyContent:'space-between', alignSelf:'stretch', paddingTop:12, paddingBottom:10}}
                            onStartShouldSetResponderCapture={()=>false} onMoveShouldSetResponderCapture={()=>false}>
                            <Text style={styles.text1}>{this.text1}</Text>
                            <Text style={styles.text2}>{this.text2}</Text>
                            <Text style={styles.text2}>{this.state.channelName}</Text>
                      </View>
                      <Switch onValueChange={(value)=>{this.switchValueChange(value)}}
                              onTintColor={Constants.TintColor.switchBar} 
                              value={this.state.opened}
                              tintColor={Constants.TintColor.rgb235}  />
                  </View>
              <TouchableHighlight onPress={()=>{this._onPressDelete()}}>
                    <View style={styles.container2}>
                        <Text style={{color: 'white', fontSize:15}}>删除</Text>
                    </View>
              </TouchableHighlight>
          </View>
          <View style={{height:1/PixelRatio.get(),backgroundColor:'rgba(0,0,0,0.1)'}}></View>
    </View>);
   }

}


var styles = StyleSheet.create({

  text1:{
    fontSize: 16,
    color:'rgba(0,0,0,0.8)',
  },
  text2:{
    fontSize: 13,
    color:'rgba(0,0,0,0.4)',
  },
  text3:{
    fontSize: 15,
    color:'rgba(0,0,0,.2)',
  },
  container:{
    height:80,
    width: screenWidth,
    paddingLeft:15,
    paddingRight:15,
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center'
  },
  container2:{
    height:80,
    width:70,
    backgroundColor:'red',
    justifyContent:'center',
    alignItems:'center'
  },
  separator: {
    height:1/PixelRatio.get(),
  },
});


// export default withNavigation(ClockCell);