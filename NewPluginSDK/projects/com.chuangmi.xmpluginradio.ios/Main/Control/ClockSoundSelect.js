'use strict';

import React,{component} from 'react' ;
import { TitleBarBlack,TitleBarWhite,LoadingDialog } from 'miot/ui';
import Constants  from '../../Main/Constants';
import LoadingView  from '../View/LoadingView';
import NoWifiView  from '../View/NoWifiView';
import {Device,DeviceEvent,Host,Package,Service} from 'miot';
import {
  APPBAR_HEIGHT,APPBAR_MARGINBOTTOM,APPBAR_MARGINTOP,isIPX ,
  ratio,NavigatorBarHeight,screenWidth,screenHeight} from '../ConstDefine';


import {
  Image,
  TouchableHighlight,
  StyleSheet,
  ListView,
  Text,
  View,
  PixelRatio,
  DeviceEventEmitter,
} from 'react-native';



class ClockSoundSelect extends React.Component{

    static navigationOptions = ({ navigation }) => {
        return {
        header:
        <View >
            <TitleBarWhite
              title={navigation.state["params"] ? navigation.state.params.title : Device.name}
              style={{ backgroundColor:'#805e5f' }}
              onPressLeft={() => {
                  navigation.pop();
              }}
              rightText='保存'
              onPressRight={() => {
                DeviceEventEmitter.emit('SaveClockSound', {});

              }}/>
          </View>
        };
    };

    constructor(props){
      super(props);
      var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
      var params =  this.props.navigation.state.params;
      this.state = {
        failed:false,
        loaded:false,
        dataSource: ds,
        channel:params.channel,
        voice:params.voice,
      };

      this.voice = this.state.voice;
      this.programs = [];
      this.count = 0;
      this.channel = {};
      this.voice = '';
      this.programs = [];
      this.finished = 0;
      this.m3u8 = 0;
    }

    componentWillMount(){


      var k = JSON.parse(this.state.channel);
      if(k.id != undefined) {
        this.channel = k;
      } else {
        this.channel = {};
      }

      this.newCacheLoad();
    }

    componentDidMount(){
      this.subscription = DeviceEventEmitter.addListener('SaveClockSound',(notification) => {

          DeviceEventEmitter.emit('ClockSoundSaved', {data: {channel: this.channel, voice: this.voice}});
          this.props.navigation.pop();
      });
    }

    componentWillUnmount(){
       this.subscription.remove();
    }

    newCacheLoad() {

      Host.file.readFile(Service.account.ID + '===' +  Device.deviceID + 'cacheDataSource').then((content) => {
            
        if (content != null) {
              // js中字符串转对象
              if(content!=''){
                var dataCache = JSON.parse(content);
              }else{
                var dataCache=content;
              }

              if (dataCache._dataBlob == null) {
                this.setState({
                  failed: true,
                  loaded: true,
                });
              } else {
                
                this.programs=dataCache._dataBlob.s1;
                this.programs=this.addKindToPrograms(this.programs);
                this.setState({
                  failed: false,
                  loaded: true,
                  dataSource: this.state.dataSource.cloneWithRows(this.programs),

                });
              }
        }else{
          this.setState({
            failed: false,
            loaded: true,});
        }



      });

    }

    addKindToPrograms(programs){

      var first={};
      first.kind='resume';
      first.id=0;
      first.album_title='继续上次播放';
      var goodMorning={};
      goodMorning.kind='local';
      goodMorning.id=1;
      goodMorning.album_title='Good Morning';
      var newPrograms=[];
      newPrograms.push(first);
      newPrograms.push(goodMorning);
      var index=2;
      for(var i=0;i<programs.length;i++){
        if(programs[i].kind==null){
          if(programs[i].type==1&&programs[i].albumInfo.album_title!=''){
              programs[i].kind='album';
              programs[i].id=programs[i].albumInfo.id;
              newPrograms[index]=programs[i];
              index++;
          }else if(programs[i].type==0&&programs[i].radioInfo.radio_name!=''){
            programs[i].kind='radio';
            programs[i].id=programs[i].radioInfo.id;
            newPrograms[index]=programs[i];
            index++;
          }else if(programs[i].type==Constants.Channels_Type.M3U8_TYPE){
            programs[i].kind='m3u8';
            programs[i].id=programs[i].radioInfo.id;
            newPrograms[index]=programs[i];
            index++;
          }else{

          }

        }
      }
      return newPrograms;
    }


    onRowPress(rowData){

      //针对 继续上次播放和good Morning
      if(rowData.kind=='local'){
        this.channel = {};
        this.voice = rowData.album_title;
        return ;
      }
      if(rowData.kind=='resume'){
        this.channel = {};
        this.voice = rowData.album_title;
        return ;
      }

    	var isAlbum = rowData.kind == 'album'? true : false;
    	if(isAlbum) {

            this.channel = {
               url: 'http://api.ximalaya.com/openapi-gateway-app/albums/browse',
               type:1,
               id: rowData.id,
            };

            this.voice = rowData.albumInfo.album_title;

    	} else {

		     var tmp = rowData.radioInfo.rate64_aac_url;
		     var idx = tmp.indexOf('?');
		     if(idx != -1) {
		       tmp = tmp.substring(0, idx);
		     }

		    this.channel = {
		         id: rowData.id,
		         type:rowData.kind == 'm3u8'?Constants.Channels_Type.M3U8_TYPE:0,
		         url: tmp,
		    };

		    this.voice = rowData.radioInfo.radio_name;
	    }
    }

    _renderRow(rowData) {

        var isAlbum = rowData.kind == 'album'? true : false;
        var text = '';
        var selected = false;
        var id = rowData.id;
        
            if(isAlbum) {
              
                text = rowData.albumInfo.album_title;
            } else {
              if(rowData.kind=='local') {
                text = rowData.album_title+'(该选项网络异常闹钟也会响起)';
                if(this.voice=='Good Morning'){
                  selected = true;
                }
              }else if(rowData.kind=='resume'){
                text = rowData.album_title;
                if(this.voice=='继续上次播放'){
                  selected = true;
                }

              }else {
              	text = rowData.radioInfo.radio_name;
              }
            }

            if(this.channel.id != undefined && this.channel.id == id){
            	selected = true;
            }

        	return (<TouchView key={id} text={text} selected={selected} id={id} onRowPress={()=>{
            this.onRowPress(rowData)}
          }/>);


    }

    _rendSeparator(rowData) {
      return (<View key={rowData.id} style={styles.separator} />);
    }

    render(){

      if(this.state.netInfo == 'none' || this.state.netInfo == 'unknown'){
        return <NoWifiView />
      }

      if(!this.state.loaded) {
        return <LoadingView style={{flex:1}}/>
      }

      return (
        <View style={{flex:1, marginTop:0, backgroundColor:Constants.TintColor.rgb235}}>
            <ListView
              initialListSize={20}
              automaticallyAdjustContentInsets={false}
              showsVerticalScrollIndicator={false}
              renderRow={this._renderRow.bind(this)}
              renderSeparator={this._rendSeparator.bind(this)}
              dataSource={this.state.dataSource} />
        </View>
      );
    }

	  resortPrograms(programs){


      Device.getDeviceWifi().callMethod("get_channels",{"all":0}).then((result)=>{

          const channels = result.result.chs;
  		 	  if(channels != undefined){
  		 	  	  var rs = [];
              var first={};
              first.kind='resume';
              first.id=0;
              first.album_title='继续上次播放';
              var goodMorning={};
              goodMorning.kind='local';
              goodMorning.id=1;
              goodMorning.album_title='Good Morning';
              rs.push(first);
              rs.push(goodMorning);
	            for(var i=0; i<channels.length; i++) {
      					 	var tmp = channels[i];
      					 	var type = tmp.t;
      					 	var id = tmp.id;

      					 	for(var j=0; j<programs.length; j++){
      					 		var tmp1 = programs[j];
      							if(tmp1 == undefined || tmp1.kind == undefined){
      								continue;
      							}
                    //m3u8电台
                    if(tmp1.kind == 'm3u8'){
                      var channelType =Constants.Channels_Type.M3U8_TYPE;
                      
                    }else{
                      var channelType = tmp1.kind == 'album'? 1 : 0;
                    }
      					 		var channelId = tmp1.id;

      					 		if(channelId == id && channelType == type) {
                      
        					 			rs.push(tmp1);
        					 			break;

      					 		}
      					 	}
	               }

                this.setState({
                    loaded: true,
                    dataSource: this.state.dataSource.cloneWithRows(rs),
                  });

	           }

  		 });

	  }

}

class TouchView extends React.Component{

    constructor(props){
        super(props);
        this.state = {
        	selected: false,
        }
    }

    componentWillMount(){
    	this.setState({
    		selected: this.props.selected,
    	});
    }


    componentDidMount(){
    	this.sc =  DeviceEventEmitter.addListener('ClockSoundChange', (event) => {
    		var id = event.data.id;
    		if(id != this.props.id) {
    			this.setState({
    				selected: false,
    			});
    		}
    	});
    }

    componentWillUnmount(){
    	this.sc.remove();
    }


    _onPress(){

    	if(this.state.selected) return;
    	DeviceEventEmitter.emit('ClockSoundChange', {data : {id: this.props.id}});
    	this.props.onRowPress();
    	this.setState({
    		selected: !this.state.selected,
    	});
    }

    render(){

      var imgView = null;
      if(this.state.selected){
        imgView = (<Image style={styles.image}  resizeMode='stretch' source={require('../../Resources/checkMask.png')}/>);
      }

      return (
        <TouchableHighlight onPress={()=>{this._onPress()}}>
          <View style={styles.container}>
            <Text style={styles.text} numberOfLines={1}>{this.props.text}</Text>
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
    overflow:'hidden',
	},
	text2:{
		position:'absolute',
		top:15,
		right:80,
		fontSize: 13,
		color:'rgb(130,130,130)',
	},
	image: {
		marginLeft:30,
		width:15,
		height:15,
	},
	separator: {
		height:1/PixelRatio.get(),
	},
});

module.exports = ClockSoundSelect;
