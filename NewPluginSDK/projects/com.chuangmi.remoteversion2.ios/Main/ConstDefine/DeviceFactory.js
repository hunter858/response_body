'use strict'

'use strict';

import React,{Component} from 'react';
import {DEVICE_MODEL,SIMPLE_DEVICE_MODEL} from '../ConstDefine/IRV2PublicDefine';

export default class DeviceFactory extends React.Component{

  constructor(props, context) {
    super(props, context);
    this.state={
    };
  }

  /* 1.通过类型获取插件 Model*/
  GetDeviceModel_WithType(type){

    var  remoterElement ;
    switch(type){
        case 1:         /* 机顶盒 */
        remoterElement = SIMPLE_DEVICE_MODEL.STB;
        break;
        case 2:         /* 电视 */
        remoterElement = SIMPLE_DEVICE_MODEL.TV;
        break;
        case 3:        /* 电视盒子 */
        remoterElement = SIMPLE_DEVICE_MODEL.BOX ;
        break;
        case 4:         /* DVD */
        remoterElement =  SIMPLE_DEVICE_MODEL.DVD;
        break;
        case 5:         /* 空调 */
        remoterElement = SIMPLE_DEVICE_MODEL.AC;
        break;
        case 6:         /* 投影仪 */
        remoterElement = SIMPLE_DEVICE_MODEL.Pro;
        break;
        case 7:        /* 音箱 */
        remoterElement = SIMPLE_DEVICE_MODEL.PA;
        break;
        case 8:        /* 风扇 */
        remoterElement = SIMPLE_DEVICE_MODEL.FAN;
        break;
        case 9:         /* 单反 */
        remoterElement = SIMPLE_DEVICE_MODEL.SLR;
        break;
        case 10:        /* 灯泡 */
        remoterElement = SIMPLE_DEVICE_MODEL.Light;
        break;
        case 11:       /* 空气净化器 */
        remoterElement = SIMPLE_DEVICE_MODEL.AirCleaner;
        break;
        case 12:        /* 热水器 */
        remoterElement = SIMPLE_DEVICE_MODEL.WaterHeater;
        break;
        default:
        remoterElement = SIMPLE_DEVICE_MODEL.GeneralDevice;
        break;
    }
    return remoterElement;
  }

  /* 2.通过类型获取插件 Model*/
  GetDeviceModel_WithModel(deviceModel){
    if(deviceModel =='miir.tv.ir01'){
      /* 1.米家电视红外遥控 */
      return DEVICE_MODEL.TV;
    }
    else if(deviceModel =='miir.tvbox.ir01'){
      /* 2.米家电视盒子红外遥控 */
      return DEVICE_MODEL.BOX;
    }
    else if(deviceModel =='miir.aircondition.ir01'){
      /* 3.米家空调红外遥控-01*/
      return DEVICE_MODEL.AC;
    }
    else if(deviceModel =='miir.aircondition.ir02'){
      /* 4.米家空调红外遥控-02 */
      return DEVICE_MODEL.AC2;
    }
    else if(deviceModel =='miir.stb.ir01'){
      /* 5.米家机顶盒红外遥控 */
      return DEVICE_MODEL.STB;
    }
    else if(deviceModel =='miir.fan.ir01'){
      /* 6.米家风扇红外遥控 */
      return DEVICE_MODEL.FAN;
    }
    else if(deviceModel =='miir.dvd.ir01'){
      /* 7.米家DVD红外遥控 */
      return DEVICE_MODEL.DVD;
    }
    else if(deviceModel =='miir.projector.ir01'){
      /* 8.米家投影仪红外遥控 */
      return DEVICE_MODEL.Pro;
    }
    else if(deviceModel =='miir.waterheater.ir01'){
      /* 9.米家热水器红外遥控 */
      return DEVICE_MODEL.WaterHeater;
    }
    else if(deviceModel =='miir.airpurifier.ir01'){
      /* 10.米家空气净化器红外遥控 */
      return DEVICE_MODEL.AirCleaner;
    }
    else if(deviceModel =='miir.light.ir01'){
      /* 11.米家灯泡红外遥控 */
      return DEVICE_MODEL.Light;
    }
    else if(deviceModel =='miir.camera.ir01'){
      /* 12.米家单反红外遥控 */
      return DEVICE_MODEL.SLR;
    }
    else if(deviceModel =='miir.wifispeaker.ir01'){
      /* 13.米家音箱红外遥控 */
      return DEVICE_MODEL.PA;
    }
    else if(deviceModel =='miir.remote.ir01'){
       /* 14.米家通用红外遥控 */
       return DEVICE_MODEL.GeneralDevice;
    }
    
  }

  /* 2.通过类型获取插件 Model (不含页面 )*/
  GetSimpleDeviceModel_WithModel(deviceModel){
    if(deviceModel =='miir.tv.ir01'){
      /* 1.米家电视红外遥控 */
      return SIMPLE_DEVICE_MODEL.TV;
    }
    else if(deviceModel =='miir.tvbox.ir01'){
      /* 2.米家电视盒子红外遥控 */
      return SIMPLE_DEVICE_MODEL.BOX;
    }
    else if(deviceModel =='miir.aircondition.ir01'){
      /* 3.米家空调红外遥控-01*/
      return SIMPLE_DEVICE_MODEL.AC;
    }
    else if(deviceModel =='miir.aircondition.ir02'){
      /* 4.米家空调红外遥控-02 */
      return SIMPLE_DEVICE_MODEL.AC2;
    }
    else if(deviceModel =='miir.stb.ir01'){
      /* 5.米家机顶盒红外遥控 */
      return SIMPLE_DEVICE_MODEL.STB;
    }
    else if(deviceModel =='miir.fan.ir01'){
      /* 6.米家风扇红外遥控 */
      return SIMPLE_DEVICE_MODEL.FAN;
    }
    else if(deviceModel =='miir.dvd.ir01'){
      /* 7.米家DVD红外遥控 */
      return SIMPLE_DEVICE_MODEL.DVD;
    }
    else if(deviceModel =='miir.projector.ir01'){
      /* 8.米家投影仪红外遥控 */
      return SIMPLE_DEVICE_MODEL.Pro;
    }
    else if(deviceModel =='miir.waterheater.ir01'){
      /* 9.米家热水器红外遥控 */
      return SIMPLE_DEVICE_MODEL.WaterHeater;
    }
    else if(deviceModel =='miir.airpurifier.ir01'){
      /* 10.米家空气净化器红外遥控 */
      return SIMPLE_DEVICE_MODEL.AirCleaner;
    }
    else if(deviceModel =='miir.light.ir01'){
      /* 11.米家灯泡红外遥控 */
      return SIMPLE_DEVICE_MODEL.Light;
    }
    else if(deviceModel =='miir.camera.ir01'){
      /* 12.米家单反红外遥控 */
      return SIMPLE_DEVICE_MODEL.SLR;
    }
    else if(deviceModel =='miir.wifispeaker.ir01'){
      /* 13.米家音箱红外遥控 */
      return SIMPLE_DEVICE_MODEL.PA;
    }
    else if(deviceModel =='miir.remote.ir01'){
       /* 14.米家通用红外遥控 */
       return SIMPLE_DEVICE_MODEL.GeneralDevice;
    }
    
  }

  /*4. 网关插件 存在多个 */
  isGateWay_Plugin(modeleString){
    var result = false;

    if    (modeleString =='chuangmi.remote.v2'){
      result = true;
    }
    else if(modeleString =='chuangmi.remote.h102a02'){
      result = true;
    }
    else if(modeleString =='chuangmi.remote.h102a03'){
      result = true;
    }
    else if(modeleString =='chuangmi.remote.h102b01'){
      result = true;
    }
    else if(modeleString =='chuangmi.remote.h102b02'){
      result = true;
    }
    else if(modeleString =='chuangmi.remote.h102b03'){
      result = true;
    }

    return result;
  }

}