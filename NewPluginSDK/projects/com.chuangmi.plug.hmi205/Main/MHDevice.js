//
//  设备控制类
//
//  Created by linbing on 5/8/17.
//  Copyright (c) 2017年 chuangmi. All rights reserved.
//

'use strict';

import React,{Component} from 'react';
import {Device,Host} from 'miot';21

export default class MHDevice extends React.Component{

  /**
  *获取设备温度
  */
  static getStatusRequestPayload(){

    Device.getDeviceWifi().callMethod("get_prop", ["power", "temperature"])
    .then((json)=>{
        
    })
    .catch((err)=>{ console.log("getStatusRequestPayload err"+JSON.stringify(err));
    });
  }

  /**
   * 大插座设备开
   **/
  static setPowerOn() {

    Device.getDeviceWifi().callMethod("set_on", [])
    .then((json)=>{
        
    })
    .catch((err)=>{ console.log("setPowerOn err"+JSON.stringify(err));
    });
  }

  /**
   * 大插座设备关
   **/
  static setPowerOff() {
      
      Device.getDeviceWifi().callMethod("set_off", [])
      .then((json)=>{
          
      })
      .catch((err)=>{ console.log("setPowerOff err"+JSON.stringify(err));
      });
  }

  /**
   * 设备usb开
   **/
  static setSubPowerOn() {

      Device.getDeviceWifi().callMethod("set_usb_on", [])
      .then((json)=>{
          
      })
      .catch((err)=>{ console.log("setPowerOff err"+JSON.stringify(err));
      });
  }

  /**
   * 设备usb关
   **/
  static setSubPowerOff() {

      Device.getDeviceWifi().callMethod("set_usb_off", [])
      .then((json)=>{
          
      })
      .catch((err)=>{ console.log("setSubPowerOff err"+JSON.stringify(err));
      });
  }

  /**
   * 小插座开关
   **/
  static setPower(value) {

      Device.getDeviceWifi().callMethod("set_power", [value])
      .then((json)=>{
          
      })
      .catch((err)=>{ console.log("setSubPowerOff err"+JSON.stringify(err));
      });
  }

  /*
  *打开定时开关页面
  *
  */
  static openTimerSettingPage(){
    Host.ui.openTimerSettingPageWithVariousTypeParams("set_power", "on", "set_power", "off");
  }
}
