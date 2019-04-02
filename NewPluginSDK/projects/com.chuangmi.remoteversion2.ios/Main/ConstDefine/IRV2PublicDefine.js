'use strict'
import React,{Component} from 'react';
import {LocalizedStrings} from '../../Main/MHLocalizableString';

// /* 2.机顶盒*/
// var TopBox = require('../../MainV2/AllRemoter/TopBoxRemote');
// /* 3.空调 */
// var NewAirBoxRemote = require('../../MainV2/AllRemoter/NewAirBoxRemote');
// /* 3.1 无状态空调*/
// var AirStatelessBoxRemote = require('../../MainV2/AllRemoter/AirStatelessBoxRemote');
// /* 4.风扇 */
// var ElectricFanBox = require('../../MainV2/AllRemoter/ElectricFanBoxRemote');
// /* 5.智能盒子 */
// var TopBox = require('../../MainV2/AllRemoter/TopBoxRemote');
// /* 6.功放 */
// var SoundBox = require('../../MainV2/AllRemoter/SoundBoxRemote');
// /* 7.DVD */
// var DVDBox = require('../../MainV2/AllRemoter/DVDBoxRemote');
// /* 8.投影仪 */
// var ProjectorBox = require('../../MainV2/AllRemoter/ProjectorBoxRemote');
// /* 9.相机 */
// var CameraBox = require('../../MainV2/AllRemoter/CameraBoxRemote');
// /* 10.灯泡 */
// var LightBox = require('../../MainV2/AllRemoter/LightBoxRemote');
// /* 10.空气净化器 */
// var AirPurifierBox = require('../../MainV2/AllRemoter/AirPurifierBoxRemote');
// /* 11.电视 */
// var TVBox = require('../../MainV2/AllRemoter/TVBoxRemote');
// /* 12.热水器 */
// var HeaterBox = require('../../MainV2/AllRemoter/HeaterBoxRemoter');
// /* 11.卫星电视机顶盒 */
// var SatelliteTVBox = require('../../MainV2/AllRemoter/SatelliteTVBoxRemote');

// var CustomerRemote = require('../../MainV2/AllRemoter/CustomerRemote');
// var New_studyRemoter = require('../../MainV2/AllStudyRemoter/New_studyRemoter');


const _IRV2_MSG = {
  RemoterListChanged:"RemoterListChanged",
  MatchRemoterReturn:"MatchRemoterReturn",
};





/*
* public int STB = 1; //机顶盒
* public int TV  = 2; //电视
* public int BOX = 3; //网络盒子
* public int DVD = 4; //DVD
* public int AC  = 5; //空调
* public int PRO = 6; //投影仪
* public int PA  = 7; //功放
* public int FAN = 8; //风扇
* public int SLR = 9; //单反相机
* public int Light = 10; //开关灯泡
* public int AIR_CLEANER = 11;// 空气净化器
* public int WATER_HEATER = 12;// 热水器
*/

const _IRV2_DEVICE_TYPE = {
  DEVICE_TYPE_UNKNOWN:0,         //通用设备
  DEVICE_TYPE_TOPBOX:1,          //机顶盒
  DEVICE_TYPE_TV:2,              //电视
  DEVICE_TYPE_BOX:3,             //网络盒子
  DEVICE_TYPE_DVD:4,             //DVD
  DEVICE_TYPE_AIR_CONDITIONER:5, //空调
  DEVICE_TYPE_PROJECTOR:6,        //投影仪
  DEVICE_TYPE_PA:7,               //功放
  DEVICE_TYPE_FAN:8,              //风扇
  DEVICE_TYPE_CAMERA:9,           //相机
  DEVICE_TYPE_IPTV_LIGHT:10,      //灯泡
  DEVICE_TYPE_PURIFIER:11,        //空气净化器
  DEVICE_TYPE_HEATER:12,          //热水器
};

const _DEVICE_MODEL ={
  
  GeneralDevice:{ 
    'id':0,
    "name": "UniversalDevice",
    'model':'miir.remote.ir01',
    'China_name':LocalizedStrings.ir_device_type_unknown,
    'iconImage':require('../../Resources/NewDeviceList/device_list_Universal_remote_controller.png'),
    'remoter':'CustomerRemote',
  },
  STB:{
    'id':1,
    "name": "STB",
    'model':'miir.stb.ir01',
    'China_name':LocalizedStrings.ir_device_type_set_top_box_text,
    'iconImage':require('../../Resources/NewDeviceList/device_list_STB.png'),
    'remoter':'SatelliteTVBox',
  },
  TV:{
    "id": 2,
    "name": "TV",
    'model':'miir.tv.ir01',
    'China_name':LocalizedStrings.ir_device_type_tv_text,
    'iconImage':require('../../Resources/NewDeviceList/device_list_tv.png'),
    'remoter':'TVBox',
  },
  BOX:{
    "id": 3,
    "name": "BOX",
    'model':'miir.tvbox.ir01',
    'China_name':LocalizedStrings.ir_device_type_box_text,
    'iconImage':require('../../Resources/NewDeviceList/device_list_box.png'),
    'remoter':'TopBox',
  },
  DVD:{
    "id": 4,
    "name": "DVD",
    'model':'miir.dvd.ir01',
    'China_name':LocalizedStrings.ir_device_type_dvd_text,
    'iconImage':require('../../Resources/NewDeviceList/device_list_dvd.png'),
    'remoter':'DVDBox',
  },
  AC:{
    "id": 5,
    "name": "AC",
    'model':'miir.aircondition.ir01',
    'China_name':LocalizedStrings.ir_device_type_air_conditioner_text,
    'iconImage':require('../../Resources/NewDeviceList/device_list_aircon.png'),
    'remoter':'AirStatelessBoxRemote',
  },
  AC2:{
    "id": 5,
    "name": "AC2",
    'model':'miir.aircondition.ir02',
    'China_name':LocalizedStrings.ir_device_type_air_conditioner_text,
    'iconImage':require('../../Resources/NewDeviceList/device_list_aircon.png'),
    'remoter':'NewAirBoxRemote',
  },
  Pro:{
    "id": 6,
    "name": "Pro",
    'model':'miir.projector.ir01',
    'China_name':LocalizedStrings.ir_device_type_projector_text,
     'iconImage':require('../../Resources/NewDeviceList/device_list_projector.png'),
    'remoter':'ProjectorBox',
  },
  PA:{
    "id": 7,
    "name": "PA",
    'model':'miir.wifispeaker.ir01',
    'China_name':LocalizedStrings.ir_device_type_amplifier,
    'iconImage':require('../../Resources/NewDeviceList/device_list_wifispeaker.png'),
    'remoter':'SoundBox',
  },
  FAN:{
    "id": 8,
    "name": "FAN",
    'model':'miir.fan.ir01',
    'China_name':LocalizedStrings.ir_device_type_fan_text,
    'iconImage':require('../../Resources/NewDeviceList/device_list_fan.png'),
    'remoter':'ElectricFanBox',
  },
  SLR:{
    "id": 9,
    "name": "SLR",
    'model':'miir.camera.ir01',
    'China_name':LocalizedStrings.ir_device_type_camera,
    'iconImage':require('../../Resources/NewDeviceList/device_list_camera.png'),
    'remoter':'CameraBox',
  },
  Light:{
    "id": 10,
    "name": "Light",
    'model':'miir.light.ir01',
    'China_name':LocalizedStrings.ir_device_type_lamp,
    'iconImage':require('../../Resources/NewDeviceList/device_list_light.png'),
    'remoter':'LightBox',
  },
  AirCleaner:{
    "id": 11,
    "name": "AirCleaner",
    'model':'miir.airpurifier.ir01',
    'China_name':LocalizedStrings.ir_device_type_purifier_text,
    'iconImage':require('../../Resources/NewDeviceList/device_list_airpurifier.png'),
    'remoter':'AirPurifierBox',
  },
  WaterHeater:{
    "id": 12,
    "name": "WaterHeater",
    'model':'miir.waterheater.ir01',
    'China_name':LocalizedStrings.ir_device_type_water_heater,
    'iconImage':require('../../Resources/NewDeviceList/device_list_waterheater.png'),
    'remoter':'HeaterBox',
  },

}

const _MODEL_WITH_TYPE={
  0:'miir.remote.ir01',           //米家通用红外遥控
  1:'miir.stb.ir01',              //米家机顶盒红外遥控
  2:'miir.tv.ir01',               //米家电视红外遥控
  3:'miir.tvbox.ir01',            //米家电视盒子红外遥控
  4:'miir.dvd.ir01',              //米家DVD红外遥控
  5:'miir.aircondition.ir01',     //米家空调红外遥控
  6:'miir.projector.ir01',        //米家投影仪红外遥
  7:'miir.wifispeaker.ir01',      //米家音箱红外遥控
  8:'miir.fan.ir01',              //米家风扇红外遥控
  9:'miir.camera.ir01',           //米家单反红外遥控
  10:'miir.light.ir01',           //米家灯泡红外遥控
  11:'miir.airpurifier.ir01',     //米家空气净化器红外遥控
  12:'miir.waterheater.ir01',     //米家热水器红外遥控
}

const _TYPE_WITH_MODEL={
  'miir.remote.ir01':0,           //米家通用红外遥控
  'miir.stb.ir01':1,              //米家机顶盒红外遥
  'miir.tv.ir01':2,               //米家电视红外遥控
  'miir.tvbox.ir01':3,            //米家电视盒子红外遥控
  'miir.dvd.ir01':4,              //米家DVD红外遥控
  'miir.aircondition.ir01':5,     //米家空调红外遥控
  'miir.projector.ir01':6,        //米家投影仪红外遥控
  'miir.wifispeaker.ir01':7,      //米家音箱红外遥控
  'miir.fan.ir01':8,              //米家风扇红外遥
  'miir.camera.ir01':9,           //米家单反红外遥控
  'miir.light.ir01':10,           //米家灯泡红外
  'miir.airpurifier.ir01':11,     //米家空气净化器红外遥控
  'miir.waterheater.ir01':12,     //米家热水器红外遥控
}

const _INSIDE_DEVICE_MODEL ={
  'GeneralDevice':{
    'id':0,
    "name": "UniversalDevice",
    'model':'miir.remote.ir01',
    'china_name':LocalizedStrings.ir_device_type_unknown,
    'iconNormal':require('../../Resources/NewRemoter/others_normal.png'),
    'remoter':'CustomerRemote',
  },
  'STB':{
    'id':1,
    "name": "STB",
    'model':'miir.stb.ir01',
    'china_name':LocalizedStrings.ir_device_type_set_top_box_text,
    'iconNormal':require('../../Resources/NewRemoter/settop_box_normal.png'),
    'remoter':'SatelliteTVBox',
  },
  'TV':{
    "id": 2,
    "name": "TV",
    'model':'miir.tv.ir01',
    'china_name':LocalizedStrings.ir_device_type_tv_text,
    'iconNormal':require('../../Resources/NewRemoter/tv_normal.png'),
    'remoter':'TVBox',
  },
  'BOX':{
    "id": 3,
    "name": "BOX",
    'model':'miir.tvbox.ir01',
    'china_name':LocalizedStrings.ir_device_type_box_text,
    'iconNormal':require('../../Resources/NewRemoter/tvbox_normal.png'),
    'remoter':'TopBox',
  },
  'DVD':{
    "id": 4,
    "name": "DVD",
    'model':'miir.dvd.ir01',
    'china_name':LocalizedStrings.ir_device_type_dvd_text,
    'iconNormal':require('../../Resources/NewRemoter/dvd_normal.png'),
    'remoter':'DVDBox',
  },
  'AC':{
    "id": 5,
    "name": "AC",
    'model':'miir.aircondition.ir01',
    'china_name':LocalizedStrings.ir_device_type_air_conditioner_text,
    'iconNormal':require('../../Resources/NewRemoter/aircon_normal.png'),
    'remoter':'NewAirBoxRemote',
  },
  'Pro':{
    "id": 6,
    "name": "Pro",
    'model':'miir.projector.ir01',
    'china_name':LocalizedStrings.ir_device_type_projector_text,
    'iconNormal':require('../../Resources/NewRemoter/projector_normal.png'),
    'remoter':'ProjectorBox',
  },
  'PA':{
    "id": 7,
    "name": "PA",
    'model':'miir.wifispeaker.ir01',
    'china_name':LocalizedStrings.ir_device_type_amplifier,
    'iconNormal':require('../../Resources/NewRemoter/speaker_normal.png'),
    'remoter':'SoundBox',
  },
  'FAN':{
    "id": 8,
    "name": "FAN",
    'model':'miir.fan.ir01',
    'china_name':LocalizedStrings.ir_device_type_fan_text,
    'iconNormal':require('../../Resources/NewRemoter/fan_normal.png'),
    'remoter':'ElectricFanBox',
  },
  'SLR':{
    "id": 9,
    "name": "SLR",
    'model':'miir.camera.ir01',
    'china_name':LocalizedStrings.ir_device_type_camera,
    'iconNormal':require('../../Resources/NewRemoter/camera_normal.png'),
    'remoter':'CameraBox',
  },
  'Light':{
    "id": 10,
    "name": "Light",
    'model':'miir.light.ir01',
    'china_name':LocalizedStrings.ir_device_type_lamp,
    'iconNormal':require('../../Resources/NewRemoter/irv2_lamp_normal.png'),
    'remoter':'LightBox',
  },
  'AirCleaner':{
    "id": 11,
    "name": "AirCleaner",
    'model':'miir.airpurifier.ir01',
    'china_name':LocalizedStrings.ir_device_type_purifier_text,
    'iconNormal':require('../../Resources/NewRemoter/airpurifier_normal.png'),
    'remoter':'AirPurifierBox',
  },
  'WaterHeater':{
    "id": 12,
    "name": "WaterHeater",
    'model':'miir.waterheater.ir01',
    'china_name':LocalizedStrings.ir_device_type_water_heater,
    'iconNormal':require('../../Resources/NewRemoter/waterheater_normal.png'),
    'remoter':'HeaterBox',
  },

}

const _SIMPLE_DEVICE_MODEL ={
  
  GeneralDevice:{
    'id':0,
    "name": "UniversalDevice",
    'model':'miir.remote.ir01',
    'China_name':LocalizedStrings.ir_device_type_unknown,
    'iconImage':require('../../Resources/NewDeviceList/device_list_Universal_remote_controller.png'),
  },
  STB:{
    'id':1,
    "name": "STB",
    'model':'miir.stb.ir01',
    'China_name':LocalizedStrings.ir_device_type_set_top_box_text,
    'iconImage':require('../../Resources/NewDeviceList/device_list_STB.png'),
  },
  TV:{
    "id": 2,
    "name": "TV",
    'model':'miir.tv.ir01',
    'China_name':LocalizedStrings.ir_device_type_tv_text,
    'iconImage':require('../../Resources/NewDeviceList/device_list_tv.png'),
  },
  BOX:{
    "id": 3,
    "name": "BOX",
    'model':'miir.tvbox.ir01',
    'China_name':LocalizedStrings.ir_device_type_box_text,
    'iconImage':require('../../Resources/NewDeviceList/device_list_box.png'),
  },
  DVD:{
    "id": 4,
    "name": "DVD",
    'model':'miir.dvd.ir01',
    'China_name':LocalizedStrings.ir_device_type_dvd_text,
    'iconImage':require('../../Resources/NewDeviceList/device_list_dvd.png'),
  },
  AC:{
    "id": 5,
    "name": "AC",
    'model':'miir.aircondition.ir01',
    'China_name':LocalizedStrings.ir_device_type_air_conditioner_text,
    'iconImage':require('../../Resources/NewDeviceList/device_list_aircon.png'),
  },
  AC2:{
    "id": 5,
    "name": "AC2",
    'model':'miir.aircondition.ir02',
    'China_name':LocalizedStrings.ir_device_type_air_conditioner_text,
    'iconImage':require('../../Resources/NewDeviceList/device_list_aircon.png'),
  },
  Pro:{
    "id": 6,
    "name": "Pro",
    'model':'miir.projector.ir01',
    'China_name':LocalizedStrings.ir_device_type_projector_text,
    'iconImage':require('../../Resources/NewDeviceList/device_list_projector.png'),
  },
  PA:{
    "id": 7,
    "name": "PA",
    'model':'miir.wifispeaker.ir01',
    'China_name':LocalizedStrings.ir_device_type_amplifier,
    'iconImage':require('../../Resources/NewDeviceList/device_list_wifispeaker.png'),
  },
  FAN:{
    "id": 8,
    "name": "FAN",
    'model':'miir.fan.ir01',
    'China_name':LocalizedStrings.ir_device_type_fan_text,
    'iconImage':require('../../Resources/NewDeviceList/device_list_fan.png'),
  },
  SLR:{
    "id": 9,
    "name": "SLR",
    'model':'miir.camera.ir01',
    'China_name':LocalizedStrings.ir_device_type_camera,
    'iconImage':require('../../Resources/NewDeviceList/device_list_camera.png'),
  },
  Light:{
    "id": 10,
    "name": "Light",
    'model':'miir.light.ir01',
    'China_name':LocalizedStrings.ir_device_type_lamp,
    'iconImage':require('../../Resources/NewDeviceList/device_list_light.png'),
  },
  AirCleaner:{
    "id": 11,
    "name": "AirCleaner",
    'model':'miir.airpurifier.ir01',
    'China_name':LocalizedStrings.ir_device_type_purifier_text,
    'iconImage':require('../../Resources/NewDeviceList/device_list_airpurifier.png'),
  },
  WaterHeater:{
    "id": 12,
    "name": "WaterHeater",
    'model':'miir.waterheater.ir01',
    'China_name':LocalizedStrings.ir_device_type_water_heater,
    'iconImage':require('../../Resources/NewDeviceList/device_list_waterheater.png'),
  },

}


export const IRV2_MSG = _IRV2_MSG;
export const IRV2_DEVICE_TYPE = _IRV2_DEVICE_TYPE;
export const MODEL_WITH_TYPE = _MODEL_WITH_TYPE;
export const TYPE_WITH_MODEL = _TYPE_WITH_MODEL;
export const DEVICE_MODEL = _DEVICE_MODEL;
export const INSIDE_DEVICE_MODEL = _INSIDE_DEVICE_MODEL;
export const SIMPLE_DEVICE_MODEL = _SIMPLE_DEVICE_MODEL;

