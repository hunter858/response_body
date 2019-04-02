'use strict'
import React,{Component} from 'react';
import {Device,Service} from 'miot'

export default class MIRequestServer extends React.Component{


  /* 3.3.1 添加遥控器 */
static Post_AddRemoter(param ,success,failure){
  console.log('param:' +JSON.stringify(param));

  Device.getDeviceWifi().callMethodFromCloud('/v2/irdevice/controller/add',param)
  .then((response)=>{
    success(response);
  })
  .catch(error=>{
    failure(response);
  });
}


/* 3.3.2 删除遥控器 */
static Post_DeleteRemoter(param ,success,failure){
  
  Service.ircontroller.controllerDel(param)
  .then((response)=>{
    console.log('Post_DeleteRemoter:' +JSON.stringify(response));
    success(response);
  })
  .catch(error=>{
    failure(response);
  });  
}

/* 3.3.3 修改遥控器 */
static Post_UpdateRemoter(param ,success,failure){
  
}

/* 3.3.4 获取添加的遥控器列表 */
static Post_getAllRemoter(param ,success,failure){
  console.log('param:' +JSON.stringify(param)); 
  // Device.getDeviceWifi().callMethod('/v2/irdevice/controllers',param)
  Service.ircontroller.getList(param)
  .then((response)=>{
    console.log('Post_getAllRemoter:' +JSON.stringify(response));
    success(response);
  })
  .catch(error=>{
    failure(response);
  });  

}



static Post_uploadAllKeyCode(param ,success,failure){
  
  console.log('param:' +JSON.stringify(param));
  Device.getDeviceWifi().callMethodFromCloud('/v2/irdevice/controller/keys/set',param)
  .then((response)=>{
    // console.log('Post_uploadAllKeyCode:' +JSON.stringify(response));
    success(response);
  })
  .catch(error=>{
    failure(response);
  });
}

/* 3.4.1 添加自定义按键 */

static Post_AddCustomerKey(param ,success,failure){

  console.log('param:' +JSON.stringify(param));
  Device.getDeviceWifi().callMethodFromCloud('/v2/irdevice/controller/key/add',param)
  .then((response)=>{
    console.log('Post_AddCustomerKey:' +JSON.stringify(response));
    success(response);
  })
  .catch(error=>{
    failure(response);
  });     
}

/* 3.4.2 修改按键 */

static Post_UpdateCustomerKey(param ,success,failure){
    
  var param  = {
    "did": "ir.1234.1",
    "key_id": 10000001,
    "name": "⾃自定义按键2",
    "code": "3078,3078,3078,4538,548,1686,548"
    };

  console.log('param:' +JSON.stringify(param));
  var response = { "did": "ir.1234.1"};
  success(response);
  failure(response);
}

/* 3.4.3 删除自定义按键 */
static Post_DeleteCustomerKey(param ,success,failure){
    
    var param  = {
      "did": "ir.1234.1",
      "key_id": 10000001
      };
    var response =   {
        "code": 0,
        "message": "ok",
        "result": {
            "id": 10000001
        }
      };
    console.log('param:' +JSON.stringify(param));
    Device.getDeviceWifi().callMethodFromCloud('/v2/irdevice/controller/key/del',param)
    .then((response)=>{
      console.log('Post_DeleteCustomerKey:' +JSON.stringify(response));
      success(response);
    })
    .catch(error=>{
      failure(response);
    });  
}


/* 3.4.4 获取遥控器所有按键  */
static Post_GetAllRemoterkey(param ,success,failure){

  console.log('param:' +JSON.stringify(param));
  Device.getDeviceWifi().callMethodFromCloud('/v2/irdevice/controller/keys',param)
  .then((response)=>{
    console.log('Post_GetAllRemoterkey:' +JSON.stringify(response));
    success(response);
  })
  .catch(error=>{
    failure(response);
  });  
}

/* 3.4.5  发送按键 */
static Post_SendkeyCode(param ,success,failure){
    
  console.log('param:' +JSON.stringify(param));
  Device.getDeviceWifi().callMethodFromCloud('/v2/irdevice/controller/key/click',param)
  .then((response)=>{
    console.log('Post_SendkeyCode:' +JSON.stringify(response));
    success(response);
  })
  .catch(error=>{
    failure(response);
  });
}



/* 3.4.6  对码发送按键 */
static Post_SendMatchkeyCode(param ,success,failure){
    
 
  console.log('param:' +JSON.stringify(param));
  Device.getDeviceWifi().callMethodFromCloud('/v2/irdevice/send_key',param)
  .then((response)=>{
    console.log('Post_SendMatchkeyCode:' +JSON.stringify(response));
    success(response);
  })
  .catch(error=>{
    failure(response);
  });
}



/* 3.4.3 上传遥控器状态 */


/* 3.1.9 获取遥控器列表 */

static Post_QueryAllRemoterList(param ,success,failure){
  console.log('param:' +JSON.stringify(param));
  var response =  
  {
      "code": 0,
      "message": "ok",
      "result": {
          "controllers":
              [
                {"did": "133xd3.1",
                "name": "客厅电视", 
                "model": "mijia.tv.ir01"},
                {  "did": "133xd3.1",
                "name": "客厅电视", 
                "model": "mijia.tv.ir01"},
                {  "did": "133xd3.1",
                "name": "客厅电视", 
                "model": "mijia.tv.ir01"},   
              ] 
        }
  };

  success(response);

}






/* 4.1.1  获取红外设备类型列表 */
static Post_GetDeviceTypeList(param ,success,failure){


  console.log('param:' +JSON.stringify(param));
  Device.getDeviceWifi().callMethodFromCloud('/v2/ircode/categories',param)
  .then((response)=>{
    console.log('Post_GetDeviceTypeList:' +JSON.stringify(response));
    success(response);
  })
  .catch(error=>{
    failure(response);
  });
}

/* 4.1.2   获取特定设备类型下的品牌列表 */

static Post_GetBrandListWithType(param,success,failure){


  console.log('param:' +JSON.stringify(param));
  Device.getDeviceWifi().callMethodFromCloud('/v2/ircode/category/brands',param)
  .then((response)=>{
    console.log('Post_GetBrandListWithType:' +JSON.stringify(response));
    success(response);
  })
  .catch(error=>{
    failure(response);
  });  

}




/* 4.2.1   获取特定设备类型遥控器所有按键 */
static Post_GetAllRemoteCodeWithType(param ,success,failure){

  console.log('param:' +JSON.stringify(param));
  Device.getDeviceWifi().callMethodFromCloud('/v2/ircode/controller/keys',param)
  .then((response)=>{
    console.log('Post_GetAllRemoteCodeWithType:' +JSON.stringify(response));
    success(response);
  })
  .catch(error=>{
    failure(response);
  });  

}

/* 4.2.2   获取特定类型特定品牌的遥控器的红外码列表 */
static Post_GetSpecialCodeWithTypeAndBrand(param,success,failure){
    console.log('param:' +JSON.stringify(param));
    Device.getDeviceWifi().callMethodFromCloud('/v2/ircode/category/brand/controllers',param)
    .then((response)=>{
      console.log('Post_GetSpecialCodeWithTypeAndBrand:' +JSON.stringify(response));
      success(response);
    })
    .catch(error=>{
      failure(response);
    });  

}



/* 4.3.1.   查询所有的省级地区列表 */
static Post_GetAllProvinceList(param ,success,failure){
   
  console.log('param:' +JSON.stringify(param));
  Device.getDeviceWifi().callMethodFromCloud('/v2/ircode/area/provinces/china',param)
  .then((response)=>{
    console.log('Post_GetAllProvinceList:' +JSON.stringify(response));
    success(response);
  })
  .catch(error=>{
    failure(response);
  });  
}

/* 4.2.3.   查询市级地区列表（指定地区） */
static Post_GetAllCityList(param ,success,failure){
  
  Device.getDeviceWifi().callMethodFromCloud('/v2/ircode/area/province/cities',param)
  .then((response)=>{
    console.log('Post_GetAllCityList:' +JSON.stringify(response));
    success(response);
  })
  .catch(error=>{
    failure(response);
  });  
}



/* 4.2.3.   查询运营商列表 */
static Post_GetAllOperatorList(param ,success,failure){
  console.log('param:' +JSON.stringify(param));
  Device.getDeviceWifi().callMethodFromCloud('/v2/ircode/sps',param)
  .then((response)=>{
    console.log('Post_GetAllOperatorList:' +JSON.stringify(response));
    success(response);
  })
  .catch(error=>{
    failure(response);
  });  
}

/* 4.2.4.   查询区级地区列表（指定市） */
static Post_GetAllAreaList(param ,success,failure){
  
  console.log('param:' +JSON.stringify(param));
  Device.getDeviceWifi().callMethodFromCloud('/v2/ircode/area/city/areas',param)
  .then((response)=>{
    console.log('Post_GetAllAreaList:' +JSON.stringify(response));
    success(response);
  })
  .catch(error=>{
    failure(response);
  });  
}

/* 4.2.3.   查询遥控器ID列表 (指定运营商)*/
static Post_GetRemoterIdListWithOperator(param ,success,failure){
  
  console.log('param:' +JSON.stringify(param));
  Device.getDeviceWifi().callMethodFromCloud('/v2/ircode/sp/controllers',param)
  .then((response)=>{
    console.log('Post_GetRemoterIdListWithOperator:' +JSON.stringify(response));
    success(response);
  })
  .catch(error=>{
    failure(response);
  });  
}

/* 4.3.1    查询IPTV列表品牌 */
static Post_GetIPTVBrandList(param ,success,failure){

  Device.getDeviceWifi().callMethodFromCloud('/v2/ircode/iptv/brands',param)
  .then((response)=>{
    console.log('Post_GetIPTVBrandList:' +JSON.stringify(response));
    success(response);
  })
  .catch(error=>{
    failure(response);
  });  
}

/* 4.2.3.   获取IPTV品牌红外列表 */
static Post_GetIPTV_AllCode(param ,success,failure){

  console.log('param:' +JSON.stringify(param));
  Device.getDeviceWifi().callMethodFromCloud('/v2/ircode/iptv/brand/controllers',param)
  .then((response)=>{
    console.log('Post_GetIPTV_AllCode:' +JSON.stringify(response));
    success(response);
  })
  .catch(error=>{
    failure(response);
  });  
}

/* 4.4.1.   获取空调遥控器功能 （设备页）*/
static Post_GetAirConditionerMatchFunction(param ,success,failure){
  
  console.log('param:' +JSON.stringify(param));              
  Device.getDeviceWifi().callMethodFromCloud('/v2/ircode/controller/functions',param)
  .then((response)=>{
    console.log('Post_GetAirConditionerMatchFunction:' +JSON.stringify(response));
    success(response);
  })
  .catch(error=>{
    failure(response);
  });  
 
}

/* 4.4.1.2   获取空调遥控器功能（对码过程）*/
static Post_GetAirDeviceConditionerFunction(param ,success,failure){
  
  console.log('param:' +JSON.stringify(param));              
  Device.getDeviceWifi().callMethodFromCloud('/v2/irdevice/controller/functions',param)
  .then((response)=>{
    console.log('Post_GetAirDeviceConditionerFunction:' +JSON.stringify(response));
    success(response);
  })
  .catch(error=>{
    failure(response);
  });  
 
}


/* 4.5 查询城市定位服务 /ircode/area/area_id*/

static Post_GetCurrentCityInfo(param ,success,failure){
  
  console.log('param:' +JSON.stringify(param));                
  Device.getDeviceWifi().callMethodFromCloud('/v2/ircode/area/area_id',param)
  .then((response)=>{
    console.log('Post_GetCurrentCityInfo:' +JSON.stringify(response));
    success(response);
  })
  .catch(error=>{
    failure(response);
  });
}

/* 4.6 查询当前城市定位的运营商*/

static Post_GetCurrentCityOperatorList(param ,success,failure){
  
  console.log('param:' +JSON.stringify(param));
  Device.getDeviceWifi().callMethodFromCloud('/v2/ircode/area/lineups',param)
  .then((response)=>{
    console.log('Post_GetCurrentCityOperatorList:' +JSON.stringify(response));
    success(response);
  })
  .catch(error=>{
    failure(response);
  });
}


}
