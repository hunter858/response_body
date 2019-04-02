'use strict';

import React,{component} from 'react' ;
import Constants from '../../Main/Constants';

import {
  StyleSheet,
  Text,
  View,
  Button,
  ScrollView,
  PixelRatio,
  TouchableWithoutFeedback,
  TouchableHighlight,
  Alert,
} from 'react-native';

class M3U8PlayerSetting extends React.Component{
 

  onPress() {
    if(this.__saving) return;
    this.__saving = true;
    if(this.name==''||this.name==undefined||this.name==null){
        this.__saving = false;
        // MHPluginSDK.showFailTips("请添加电台名称");
        return;
    }
    if(this.url==''||this.url==undefined||this.url==null){
        this.__saving = false;
        // MHPluginSDK.showFailTips("请添加电台地址");
        return;
    }
    if(!this.isRightUrl(this.url)){
        this.__saving = false;
        // MHPluginSDK.showFailTips("电台地址格式错误");
        return;
    }

    this.creatM3U8ProgramId(this.name, this.url);

  }

  //判断电台格式
  isRightUrl(url){
    if(url==null||url==undefined) return false;
    if((url.indexOf('http://')!=-1||url.indexOf('https://')!=-1)&&url.indexOf('.m3u8')!=-1){
      return true;
    }
    return false;
  }

  creatM3U8ProgramId(name,url){
      var id=Math.floor(Math.random() * 999999);
      Device.getDeviceWifi().callMethod("get_channels",{"all":0}).then((result)=>{

          const channels = result.result.chs;
          if(channels != undefined){
            var chs = channels;
            var hFavored = false;
            for(var k=0; k<chs.length; k++){
                var tmp = chs[k];
                if(tmp.id == id){
                  hFavored = true;
                  break;
                }
            }
            if(chs.length >= 35) {
                this.__saving = false;
                Alert.alert(
                    '提示',
                    Constants.Channels.addInfo(),
                    [
                      {text: '确认', onPress: () => {}, style: 'cancel'},
                    ]
                );

            } else {
            if(hFavored){
              this.creatM3U8ProgramId();
            }else {
              this.onFavorBtnPress(name, url,id);
            }
      }}}
  );
  }

  onFavorBtnPress(name,url,id){
                   var params = {
                     params:{
                           chs:[{
                             url: url,
                             type:Constants.Channels_Type.M3U8_TYPE,
                             id: id,
                           }],
                         }
                     };

                   var item = {
                     id: id,
                     t:Constants.Channels_Type.M3U8_TYPE,
                   };

                  //  MHPluginSDK.showLoadingTips('加载中...');
                  Device.getDeviceWifi().callMethod('add_channels', params).then(( json) => {
                     
                    // MHPluginSDK.dismissTips();
                     this.__saving = false;
                     if(json.code==0){
                       Constants.Channels.addItem(item);
                       //保持到文件中
                       Host.file.writeFile(Service.account.ID + '===' +  Device.deviceID + '::M3U8_NAME'+':'+id, "" +name).then((success)=>{
                         if(success){
                           this.props.navigation.pop();
                         }
                       });

                      
                     } else {

                        //  MHPluginSDK.showFailTips(Constants.Channels.addM3U8FailInfo());
                     }
                   });
  }
  render(){

      return (
        <ScrollView style={styles.container}>
          <View style={{height:80}}>
              {/* <TextField
                label={'电台名称'}
                highlightColor={'#cd3f3f'}
                onChangeText={(text) => { this.name = text;}}
                value={''}
                height={'45'}
                dense={true}
              /> */}
          </View>
          <View style={{height:80,}}>
              {/* <TextField
                label={'电台地址'}
                highlightColor={'#cd3f3f'}
                onChangeText={(text) => { this.url = text;}}
                height={'45'}
                value={''}
                dense={true}
              /> */}
          </View>
          <View style={{marginTop:30,}}>
            <TouchableHighlight style={styles.listenBtn} onPress={()=>{this.onPress()}} underlayColor={'rgba(0,0,0,0.4)'}>
                <Text style={{marginTop:13,textAlign:'center',flex:1,fontSize:14,color :'rgba(0,0,0,0.8)'}}>添加至收听</Text>
            </TouchableHighlight>
          </View>
          <TouchableWithoutFeedback style={{alignItems:'center'}}>
            <Text style={{textAlign:'center',flex:1,fontSize:12,color :'rgba(0,0,0,0.4)',marginTop:20,}}>电台地址:请输入流媒体地址,形式如:http(s)://域名/路径.m3u8</Text>
          </TouchableWithoutFeedback>
      </ScrollView> )}
}

var styles = StyleSheet.create({
  default: {
     height: 10,
     borderWidth: 0.5,
     flex:10,
     borderColor: 'red',
     fontSize: 13,
     padding: 4,
   },
   container: {
     flex: 1,
     flexDirection:'column',
     backgroundColor: '#FFFFFF',
     paddingTop: 50,
     marginLeft: 16,
     marginRight: 16
   },
   listenBtn:{
     height:40,
     borderRadius:20,
     borderWidth:1/PixelRatio.get(),
     borderColor:'rgba(0,0,0,0.4)',
   },
});
module.exports = M3U8PlayerSetting;
