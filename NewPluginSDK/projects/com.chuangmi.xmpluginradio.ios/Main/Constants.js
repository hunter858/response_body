'use strict';
import React,{Component} from 'react';
import { DeviceEventEmitter } from 'react-native'
// var MHPluginSDK = require('NativeModules').MHPluginSDK;
// var MHPluginFS = require('NativeModules').MHPluginFS;

var DeviceModel={
  v601:'chuangmi.radio.v1',
  v603:'chuangmi.radio.v2',
};

var Channels_Type={
    M3U8_TYPE:4,
};

// 字体颜色定义
var TextColor = {

 	transparent:'transparent',
 	rgb51: 'rgb(51,51,51)',
 	rgb127:'rgb(127,127,127)',
 	rgb153:'rgb(153,153,153)',
 	rgb255:'rgb(255,255,255)',
 	rgb217:'rgb(217,217,217)',
 	rgb184:'rgb(184,184,184)',
 	rgb0:'rgb(0,0,0)',

};

 //字体大小定义
 var FontSize = {

 	fs30:15,
 	fs25:12.5,
 	fs20:10,
 	fs17:9,
 	fs33:16,
 	fs23:12,
  fs22:11,
  fs54:27,
 };

 // 背景颜色定义
 var TintColor = {
 	transparent:'transparent',
 	switchBar:'#1ad605',
  navBar:'#805e5f',
  tintColor:'rgba(255,255,255,0.9)',
  titleTextColor:'rgba(255,255,255,0.9)',
 	rgb235:'rgb(235,235,235)',
 	rgb255:'rgb(255,255,255)',
 	rgb229:'rgb(229,229,229)',
 	rgb224:'rgb(224,224,224)',
 	rgb0:'rgb(0,0,0)',
 	rgb243:'#ECECEC',
 	rgb208:'rgb(208,208,208)',
 	rgb237:'rgb(237,237,237)',
  tabBarColor:'#cd3f3f',
  f8:'#f8f8f8',
 };

var PageCount = {
	size:20,
};

var StrollView={
  index:0,
};


var Event ={
	radio_status:'playAndPause', // 0--pause, 1--play
	radio_props:'radio_props',
	radio_progress:'radio_progress',
};

//数字太大进行单位转换
class PlayCountsUtils extends  React.Component{
  static getPlayCount(playCount){
    var text='';
    if (playCount > 10000) {
      var w = Math.floor(playCount / 10000);
      var q = Math.floor((playCount - 10000*w) / 1000);
      if (q > 0) {
        text =w + '.' + q + '万次';
      } else {
        text = w + '万次';
      }

    } else {
      text =playCount+ '次';
    }
    return text;

  }
};

class Channels extends React.Component{

	static sheetTitle() {
		return '请选择需要的操作';
	}

	static addInfo() {
		return '收藏节目已达到上限(35个)';
	}

	static  deleteInfo(){
		return '收藏节目至少保留1个';
	}

	static addFailInfo() {
		return '收藏节目失败';
	}

	static  deleteFailInfo(){
		return '取消节目失败';
	}

  static  addM3U8Info(){
    return '增加节目成功';
  }

  static  addM3U8FailInfo(){
    return '增加节目失败';
  }


	static addItem(item) {

		DeviceEventEmitter.emit('ChannelsChangeEvent', {});
		// MHPluginSDK.getDevicePropertyFromMemCache(['channels'], (result)=>{

    //       if(result.channels != undefined){
    //       	 var chs = result.channels;
    //       	 chs.splice(0,0,item);
	  //     	 MHPluginSDK.setDevicePropertyToMemCache({
	  //              channels : chs,
	  //        });

	  //     	 MHPluginSDK.getDevicePropertyFromMemCache(['newChannels'], (result)=>{
	  //             if(result.newChannels != undefined) {
	  //             	 result.newChannels.push(item);
	  //             	 MHPluginSDK.setDevicePropertyToMemCache({
		// 	               newChannels : result.newChannels,
		// 	         });
	  //             	 MHPluginSDK.sendEvent('BadgeChangeEvent', {data: result.newChannels.length});
	  //             }
    //          });

	  //        MHPluginSDK.sendEvent('ChannelsChangeEvent', {});
    //       }
    // });
	}

	static deleteItem(item) {
		// MHPluginSDK.getDevicePropertyFromMemCache(['channels'], (result)=>{

    //       if(result.channels != undefined){
    //       	 var chs = result.channels;
    //       	 for(var k=0; k<chs.length; k++){
    //       	 	var tmp = chs[k];
    //       	 	if(tmp.id == item.id && tmp.t == item.t){
    //       	 		chs.splice(k,1);
    //       	 		break;
    //       	 	}
    //       	 }

    //       	 MHPluginSDK.getDevicePropertyFromMemCache(['newChannels'], (result)=>{
	  //             if(result.newChannels != undefined) {
	  //             	var newchs = result.newChannels;
	  //             	for(var m=0; m<newchs.length; m++){
	  //             		var vp = newchs[m];
	  //             		if(vp.id == item.id && vp.t == item.t){

	  //             			newchs.splice(m, 1);
	  //             			 MHPluginSDK.setDevicePropertyToMemCache({
		// 			               newChannels : newchs,
		// 			         });
	  //             			MHPluginSDK.sendEvent('BadgeChangeEvent', {data: newchs.length});
	  //             			break;
	  //             		}
	  //             	}
	  //             }
    //          });


	  //     	 MHPluginSDK.setDevicePropertyToMemCache({
	  //              channels : chs,
	  //        });
	  //        MHPluginSDK.sendEvent('ChannelsChangeEvent', {});
    //       }
		//     });
		DeviceEventEmitter.emit('ChannelsChangeEvent', {});
	}


};

class ArrayUtils extends  React.Component{

  //判断是否存在该频道
  static _isExistChannel(chs,id){
    if(id==''||id==null||id==undefined){
      return true;
    }
    for(var i=0;i<chs.length;i++){
      if(id==chs[i]){
          return true;
      }
    }
    return false;
  }

};


class M3U8Utils extends  React.Component{
  //获取m3u8的名称
  static getProgramName(id){
		/*
    MHPluginFS.readFile(MHPluginSDK.userId + '===' + MHPluginSDK.deviceId + '::M3U8_NAME'+':'+id, (success,content)=>{
          return 'M3U8 自定义电台';
			});
				*/
		}
	
};


class DateUtils extends  React.Component{

  //分钟转小时｜分钟格式
  static minuteTransformTime(minute){
    var seconds = Math.floor(minute*60);
    if(seconds == null) {
      return;
    }
    var h=0,m=0;
    h = Math.floor(seconds / 3600);
    m = Math.floor((seconds - h*3600) / 60);
    return h+'小时' + m + '分钟';
  }


  //关于 wifi播放时间和蓝牙播放时间
  static transformTime(seconds){
    seconds = Math.floor(seconds);
		if(seconds == null) {
			return;
		}
		var h=0,m=0;
		h = Math.floor(seconds / 3600);
		m = Math.floor((seconds - h*3600) / 60);
    return h+'小时' + m + '分钟';
  }

	static transformProgress(seconds) {
		seconds = Math.floor(seconds);

		if(seconds == null) {

			return;
		}

		var h=0,m=0,s=0;
		var sstr = '',

		h = Math.floor(seconds / 3600);

		m = Math.floor((seconds - h*3600) / 60);

		s = seconds - h*3600 - m*60;

		if (s < 10) {
			sstr = '0' + s;
		} else {
			sstr = s + '';
		}

		if (h == 0 ) {

			if(m == 0) {
				return '00:' + sstr;
			} else if(m>0 && m<10) {
				return '0' + m + ':' + sstr;
			} else if (m >= 10) {
				return m+':'+sstr;
			}


		} else if (h > 0 && h<10) {

			if(m<10) {
				return '0'+h+':0' + m + ':' +sstr;
			} else if(m>=10) {
				return '0'+h+':' + m + ':' +sstr;
			}

		} else if(h>=10) {
			if(m<10) {
				return h+':0' + m + ':' +sstr;
			} else if(m>=10) {
				return h+':' + m + ':' +sstr;
			}
		}

    }

    static genLength(seconds) {
    		var h = Math.floor(seconds / 3600);
			var m = Math.floor((seconds - h *3600)/ 60);
			var s = seconds- h *3600 - m * 60;

			var txt = '';
			if(h > 0) {
				if(m>0) {
					if(s>0){
						txt= h+'小时'+m+'分' + s +'秒';
					} else {
						txt= h+'小时'+m+'分';
					}
				} else {
					if(s>0){
						txt= h+'小时' + s +'秒';
					} else {
						txt= h+'小时';
					}
				}
			} else {
				if(m>0) {
					if(s>0){
						txt= m+'分' + s +'秒';
					} else {
						txt= m+'分';
					}
				} else {
					if(s>0){
						txt= s +'秒';
					}
				}
			}


			return txt;
    }

    static getHourAndSecond(date){
    	var h = date.getHours();
    	var m = date.getMinutes();
    	var s1 =  h < 10 ? '0' + h : h;
    	var s2 =  m < 10 ? '0' + m : m;

    	return s1 + ':' + s2;
    }

    static getSecondsBetween(startTime, endTime) {
    	if(startTime != undefined && endTime != undefined) {
    		 var start = startTime.split(":");
           	 var end = endTime.split(":");

             return  (parseInt(end[0]) - parseInt(start[0])) * 3600 + (parseInt(end[1])* 60) - parseInt(start[1]) * 60;
    	}

    	return 0 ;
    }

};



 //外部直接使用TextColor FontSize等变量取值//
exports.Channels_Type = Channels_Type;
exports.StrollView = StrollView;
exports.TextColor = TextColor;
exports.FontSize = FontSize;
exports.TintColor = TintColor;
exports.PageCount = PageCount;
exports.Event = Event;
exports.DeviceModel=DeviceModel;
module.exports.PlayCountsUtils=PlayCountsUtils;
module.exports.M3U8Utils = M3U8Utils;
module.exports.DateUtils = DateUtils;
module.exports.ArrayUtils = ArrayUtils;
module.exports.Channels = Channels;