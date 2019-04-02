'use strict';

import React,{component} from 'react' ;
import CommonBtn from '../View/LBCommonBtn';
import {Device,DeviceEvent,Host,Package,Service} from 'miot';
import { TitleBarBlack,TitleBarWhite,LoadingDialog } from 'miot/ui';
import {
  APPBAR_HEIGHT,APPBAR_MARGINBOTTOM,APPBAR_MARGINTOP,isIPX ,
  ratio,NavigatorBarHeight,screenWidth,screenHeight} from '../ConstDefine';
import {
TouchableHighlight,
View,
Image,
StyleSheet,
PixelRatio,
Text,
PanResponder,
} from 'react-native';


var h=262;
class ToneEqualizerSetting extends React.Component{
  
  constructor(props){
    super(props);
    this._maxH= 262;
    this.HALF_HEIGHT  = Math.floor(0.5*this._maxH+8.5);
    this._height  = this.HALF_HEIGHT;
    this._height2  = this.HALF_HEIGHT;
    this._height3  = this.HALF_HEIGHT;
    this._height4  = this.HALF_HEIGHT;
    this._height5  = this.HALF_HEIGHT;
    this._height6  = this.HALF_HEIGHT;
    this._height7  = this.HALF_HEIGHT;
    this._height8  = this.HALF_HEIGHT;
    this._initailHeight  = this.HALF_HEIGHT;
    this. _initailHeight2  = this.HALF_HEIGHT;
    this._initailHeight3  = this.HALF_HEIGHT;
    this._initailHeight4  = this.HALF_HEIGHT;
    this._initailHeight5  = this.HALF_HEIGHT;
    this._initailHeight6  = this.HALF_HEIGHT;
    this._initailHeight7  = this.HALF_HEIGHT;
    this._initailHeight8  = this.HALF_HEIGHT;
    this.volume  =  12;
    this.volume2  =  12;
    this.volume3  =  12;
    this.volume4  =  12;
    this.volume5  =  12;
    this.volume6  =  12;
    this.volume7  =  12;
    this.volume8  =  12;
    
    this._minH  = 0;
    this.standardTextStyle  = {};
    this.rockTextStyle  = {};
    this.customTextStyle  = {};



    this.state = {
      styleH: {height:0.5*this._maxH},
      styleH2: {height:0.5*this._maxH},
      styleH3: {height:0.5*this._maxH},
      styleH4: {height:0.5*this._maxH},
      styleH5: {height:0.5*this._maxH},
      styleH6: {height:0.5*this._maxH},
      styleH7: {height:0.5*this._maxH},
      styleH8: {height:0.5*this._maxH},
      bottom:{bottom:0.5*this._maxH+8.5},
      bottom2:{bottom:0.5*this._maxH+8.5},
      bottom3:{bottom:0.5*this._maxH+8.5},
      bottom4:{bottom:0.5*this._maxH+8.5},
      bottom5:{bottom:0.5*this._maxH+8.5},
      bottom6:{bottom:0.5*this._maxH+8.5},
      bottom7:{bottom:0.5*this._maxH+8.5},
      bottom8:{bottom:0.5*this._maxH+8.5},
      standardSelected:false,
      rockSelected:false,
      customSelected:false,
      visLoading:false,
      message:'',
    }
  }

  componentWillMount () {

    this._panResponder1 = PanResponder.create({
            onStartShouldSetPanResponder: this._handleStartShouldSetPanResponder.bind(this),
            onStartShouldSetPanResponderCapture: this.onStartShouldSetPanResponderCapture.bind(this),
            onMoveShouldSetPanResponder: this._handleMoveShouldSetPanResponder.bind(this),
            onMoveShouldSetPanResponderCapture: this.onMoveShouldSetPanResponderCapture.bind(this),
            onPanResponderGrant: this._handlePanResponderGrant.bind(this),
            onPanResponderMove: this._handlePanResponderMove.bind(this),
            onPanResponderRelease: this._handlePanResponderEnd.bind(this),
            onPanResponderTerminate: this._handlePanResponderEnd.bind(this),
      });
    this._panResponder2 = PanResponder.create({
              onStartShouldSetPanResponder: this._handleStartShouldSetPanResponder2.bind(this),
              onStartShouldSetPanResponderCapture: this.onStartShouldSetPanResponderCapture.bind(this),
              onMoveShouldSetPanResponder: this._handleMoveShouldSetPanResponder.bind(this),
              onMoveShouldSetPanResponderCapture: this.onMoveShouldSetPanResponderCapture.bind(this),
              onPanResponderGrant: this._handlePanResponderGrant2.bind(this),
              onPanResponderMove: this._handlePanResponderMove2.bind(this),
              onPanResponderRelease: this._handlePanResponderEnd2.bind(this),
              onPanResponderTerminate: this._handlePanResponderEnd2.bind(this),
        });
    this._panResponder3 = PanResponder.create({
                onStartShouldSetPanResponder: this._handleStartShouldSetPanResponder3.bind(this),
                onStartShouldSetPanResponderCapture: this.onStartShouldSetPanResponderCapture.bind(this),
                onMoveShouldSetPanResponder: this._handleMoveShouldSetPanResponder.bind(this),
                onMoveShouldSetPanResponderCapture: this.onMoveShouldSetPanResponderCapture.bind(this),
                onPanResponderGrant: this._handlePanResponderGrant3.bind(this),
                onPanResponderMove: this._handlePanResponderMove3.bind(this),
                onPanResponderRelease: this._handlePanResponderEnd3.bind(this),
                onPanResponderTerminate: this._handlePanResponderEnd3.bind(this),
          });
    this._panResponder4 = PanResponder.create({
                onStartShouldSetPanResponder: this._handleStartShouldSetPanResponder4.bind(this),
                onStartShouldSetPanResponderCapture: this.onStartShouldSetPanResponderCapture.bind(this),
                onMoveShouldSetPanResponder: this._handleMoveShouldSetPanResponder.bind(this),
                onMoveShouldSetPanResponderCapture: this.onMoveShouldSetPanResponderCapture.bind(this),
                onPanResponderGrant: this._handlePanResponderGrant4.bind(this),
                onPanResponderMove: this._handlePanResponderMove4.bind(this),
                onPanResponderRelease: this._handlePanResponderEnd4.bind(this),
                onPanResponderTerminate: this._handlePanResponderEnd4.bind(this),
          });
    this._panResponder5 = PanResponder.create({
                  onStartShouldSetPanResponder: this._handleStartShouldSetPanResponder5.bind(this),
                  onStartShouldSetPanResponderCapture: this.onStartShouldSetPanResponderCapture.bind(this),
                  onMoveShouldSetPanResponder: this._handleMoveShouldSetPanResponder.bind(this),
                  onMoveShouldSetPanResponderCapture: this.onMoveShouldSetPanResponderCapture.bind(this),
                  onPanResponderGrant: this._handlePanResponderGrant5.bind(this),
                  onPanResponderMove: this._handlePanResponderMove5.bind(this),
                  onPanResponderRelease: this._handlePanResponderEnd5.bind(this),
                  onPanResponderTerminate: this._handlePanResponderEnd5.bind(this),
            });
    this._panResponder6 = PanResponder.create({
                    onStartShouldSetPanResponder: this._handleStartShouldSetPanResponder6.bind(this),
                    onStartShouldSetPanResponderCapture: this.onStartShouldSetPanResponderCapture.bind(this),
                    onMoveShouldSetPanResponder: this._handleMoveShouldSetPanResponder.bind(this),
                    onMoveShouldSetPanResponderCapture: this.onMoveShouldSetPanResponderCapture.bind(this),
                    onPanResponderGrant: this._handlePanResponderGrant6.bind(this),
                    onPanResponderMove: this._handlePanResponderMove6.bind(this),
                    onPanResponderRelease: this._handlePanResponderEnd6.bind(this),
                    onPanResponderTerminate: this._handlePanResponderEnd6.bind(this),
              });
    this._panResponder7 = PanResponder.create({
                        onStartShouldSetPanResponder: this._handleStartShouldSetPanResponder7.bind(this),
                        onStartShouldSetPanResponderCapture: this.onStartShouldSetPanResponderCapture.bind(this),
                        onMoveShouldSetPanResponder: this._handleMoveShouldSetPanResponder.bind(this),
                        onMoveShouldSetPanResponderCapture: this.onMoveShouldSetPanResponderCapture.bind(this),
                        onPanResponderGrant: this._handlePanResponderGrant7.bind(this),
                        onPanResponderMove: this._handlePanResponderMove7.bind(this),
                        onPanResponderRelease: this._handlePanResponderEnd7.bind(this),
                        onPanResponderTerminate: this._handlePanResponderEnd7.bind(this),
                  });
    this._panResponder8 = PanResponder.create({
                                    onStartShouldSetPanResponder: this._handleStartShouldSetPanResponder8.bind(this),
                                    onStartShouldSetPanResponderCapture: this.onStartShouldSetPanResponderCapture.bind(this),
                                    onMoveShouldSetPanResponder: this._handleMoveShouldSetPanResponder.bind(this),
                                    onMoveShouldSetPanResponderCapture: this.onMoveShouldSetPanResponderCapture.bind(this),
                                    onPanResponderGrant: this._handlePanResponderGrant8.bind(this),
                                    onPanResponderMove: this._handlePanResponderMove8.bind(this),
                                    onPanResponderRelease: this._handlePanResponderEnd8.bind(this),
                                    onPanResponderTerminate: this._handlePanResponderEnd8.bind(this),});
    //获取均衡器信息  获取均衡器信息--参数范围为[0-24]，APP和固件转换为[(-12)-(+12)]
    this.setState({message:'加载中...',visLoading:true})
    Device.getDeviceWifi().callMethod('get_equalizer_info',{}).then((json)=>{
        if (json.code==0&&json.result != undefined) {
          var audioControlProps = json.result;
          this.eqtype=audioControlProps['eq_type'];
          if(this.eqtype==1){//标准
            this.reSetEqtype(0);
          }else if(this.eqtype==2){//摇滚
            this.reSetEqtype(1);
          }else if(this.eqtype==4){//自定义
            this.custom(audioControlProps);
          }
        }else{

          this.setState({message:'获取均衡器信息失败',visLoading:false})

        }
    }).catch(error=>{
      console.log('error-186 -'+JSON.stringify(error));
      this.setState({message:'获取均衡器信息失败',visLoading:false})
    });
  }

  render (){

    return (
      <View style={{marginTop:0,flexDirection:'column'}}>

            <LoadingDialog 
              title={this.state.message}
              cancelable={true}
              timeout={3000}
              onDismiss={() => {
                this.setState({visLoading: false});
              }}
              visible={this.state.visLoading}/>
            <View style={{flexDirection:'row',marginLeft:25,marginRight:25,marginTop:38,alignItems:'center',justifyContent:'center'}}>
              <CommonBtn
                ref={component => this.standardSelected = component}
                onPress={()=>{this._onPressHandler(0)}}
                unselectText='标准'
                selectText='标准'
                selected={this.state.standardSelected}
                style={[styles.leftBtnStyle]}/>
              <CommonBtn
                ref={component => this.rockSelected = component}
                onPress={()=>{this._onPressHandler(1)}}
                unselectText='摇滚'
                selectText='摇滚'
                selected={this.state.rockSelected}
                style={[styles.centerBtnStyle]}/>
              <CommonBtn
                ref={component => this.customSelected = component}
                onPress={()=>{this._onPressHandler(2)}}
                unselectText='自定义'
                selectText='自定义'
                selected={this.state.customSelected}
                style={[styles.rightBtnStyle]}/>
            </View>
          <View style={{marginTop:70,flexDirection:'row',marginLeft:10}}>
            <View style={styles.db}>
                  <Text style={[{marginTop:0},styles.textStyle1]}>+12dB</Text>
                  <Text style={[{marginTop:95},styles.textStyle1]}>0dB</Text>
                  <Text style={[{marginTop:115},styles.textStyle1]}>-12dB</Text>
                  <Text style={[{marginTop:35},styles.textStyle1]}>Hz</Text>
            </View>
            <View style={{flex:1,flexDirection:'row',justifyContent:'space-around',marginRight:20}}>

                <View style={[styles.top1]}>
                      <View style={styles.volumeProgress}>
                            <View style={[styles.volumep, this.state.styleH]} />
                      </View>
                      <View
                          style={[{width:40,height:40,backgroundColor:'transparent',alignItems:'center'},this.state.bottom]} {...this._panResponder1.panHandlers} >
                          <View style={styles.thumb}/>
                      </View>
                      <View style={{alignItems:'center',justifyContent:'center'}}>
                        <Text style={styles.textStyle1}>63</Text>
                      </View>
                </View>
                <View style={styles.top2}  >
                        <View style={styles.volumeProgress}>
                              <View style={[styles.volumep, this.state.styleH2]} />
                        </View>
                        <View
                          style={[{width:40,height:40,backgroundColor:'transparent',alignItems:'center'},this.state.bottom2]} {...this._panResponder2.panHandlers} >
                          <View style={styles.thumb}/>
                        </View>
                        <View style={{alignItems:'center'}}>
                          <Text style={styles.textStyle1}>125</Text>
                        </View>
                </View>
                <View style={styles.top3}  >
                      <View style={styles.volumeProgress}>
                            <View style={[styles.volumep, this.state.styleH3]} />
                      </View>
                      <View
                          style={[{width:40,height:40,backgroundColor:'transparent',alignItems:'center'},this.state.bottom3]} {...this._panResponder3.panHandlers} >
                          <View style={styles.thumb}/>
                      </View>
                      <View>
                        <Text style={styles.textStyle1}>250</Text>
                      </View>
              </View>
              <View style={styles.top4}  >
                      <View style={styles.volumeProgress}>
                            <View style={[styles.volumep, this.state.styleH4]} />
                      </View>
                      <View
                        style={[{width:40,height:40,backgroundColor:'transparent',alignItems:'center'},this.state.bottom4]} {...this._panResponder4.panHandlers} >
                        <View style={styles.thumb}/>
                      </View>
                      <View>
                        <Text style={styles.textStyle1}>500</Text>
                      </View>
              </View>
              <View style={styles.top5}  >
                    <View style={styles.volumeProgress}>
                          <View style={[styles.volumep, this.state.styleH5]} />
                    </View>
                    <View
                        style={[{width:40,height:40,backgroundColor:'transparent',alignItems:'center'},this.state.bottom5]} {...this._panResponder5.panHandlers} >
                        <View style={styles.thumb}/>
                    </View>
                    <View>
                      <Text style={styles.textStyle1}>1250</Text>
                    </View>
            </View>
            <View style={styles.top6}  >
                    <View style={styles.volumeProgress}>
                          <View style={[styles.volumep, this.state.styleH6]} />
                    </View>
                    <View
                      style={[{width:40,height:40,backgroundColor:'transparent',alignItems:'center'},this.state.bottom6]} {...this._panResponder6.panHandlers} >
                      <View style={styles.thumb}/>
                    </View>
                    <View>
                      <Text style={styles.textStyle1}>3150</Text>
                    </View>
            </View>
            <View style={styles.top7}  >
                  <View style={styles.volumeProgress}>
                        <View style={[styles.volumep, this.state.styleH7]} />
                  </View>
                  <View
                      style={[{width:40,height:40,backgroundColor:'transparent',alignItems:'center'},this.state.bottom7]} {...this._panResponder7.panHandlers} >
                      <View style={styles.thumb}/>
                  </View>
                  <View>
                    <Text style={styles.textStyle1}>6300</Text>
                  </View>
            </View>
            <View style={styles.top8}  >
                  <View style={styles.volumeProgress}>
                        <View style={[styles.volumep, this.state.styleH8]} />
                  </View>
                  <View
                      style={[{width:40,height:40,backgroundColor:'transparent',alignItems:'center'},this.state.bottom8]} {...this._panResponder8.panHandlers} >
                      <View style={styles.thumb}/>
                  </View>
                  <View>
                    <Text style={styles.textStyle1}>12500</Text>
                  </View>
            </View>


        </View>
        </View>
        <TouchableHighlight style={[styles.listenBtn3,{marginTop:40,marginLeft:22.5,marginRight:22.5}]} onPress={()=>{this.onPress_ReSet()}} underlayColor={'rgba(0,0,0,0.4)'}>
            <Text style={{marginTop:13,textAlign:'center',flex:1,fontSize:14,color :'rgba(0,0,0,0.8)'}}>重置</Text>
        </TouchableHighlight>
  </View>
    );
  }

  onMoveShouldSetPanResponderCapture(evt, gestureState) {

    return false;
  }

  onStartShouldSetPanResponderCapture(evt, gestureState) {

    return false;
  }

  _handleStartShouldSetPanResponder(e , gestureState )  {

    if(this.volume < 0 ){

      return false;
    }
    return true;
  }

  _handleStartShouldSetPanResponder2(e , gestureState )  {

  if(this.volume2 < 0){
    return false;
  }
  return true;
  }

  _handleStartShouldSetPanResponder3(e , gestureState )  {

  if(this.volume3 < 0){
    return false;
  }
  return true;
  }

  _handleStartShouldSetPanResponder4 (e , gestureState )  {

  if(this.volume4 < 0 ){
    return false;
  }
  return true;
  }

  _handleStartShouldSetPanResponder5 (e , gestureState )  {

  if(this.volume5 < 0){
    return false;
  }
  return true;
  }

  _handleStartShouldSetPanResponder6 (e , gestureState )  {

  if(this.volume6 < 0){
    return false;
  }
  return true;
  }

  _handleStartShouldSetPanResponder7 (e , gestureState )  {

    if(this.volume7 < 0){
      return false;
    }
    return true;
  }

  _handleStartShouldSetPanResponder8 (e , gestureState )  {
    if(this.volume8 < 0){
      return false;
    }
    return true;
  }



  _handleMoveShouldSetPanResponder (e , gestureState ){


  if(gestureState.dx == 0 || gestureState.dy == 0 ) {
    return false;
  }
  return true;
  }

  _handlePanResponderGrant (e , gestureState ){

      if(this.volume != 0) {
        this._height = this.volume * this._maxH / 24;
        this._initailHeight = this._height;
      }

      var sty = {
        height: this._height,
      };
      var sty1 = {
        bottom: this._height+8.5,
      };

    this.setState({
        styleH: sty,
        bottom:sty1,
    });
  }

  _handlePanResponderGrant2 (e , gestureState ) {

      if(this.volume2 != 0) {
        this._height2 = this.volume2 * this._maxH / 24;
        this._initailHeight2 = this._height2;
      }

      var sty = {
        height: this._height2,
      };
      var sty1 = {
        bottom: this._height2+8.5,
      };

    this.setState({
        styleH2: sty,
        bottom2:sty1,
    });
  }

  _handlePanResponderGrant3 (e , gestureState ) {

      if(this.volume3 != 0) {
        this._height3 = this.volume3 * this._maxH / 24;
        this._initailHeight3 = this._height3;
      }

      var sty = {
        height: this._height3,
      };
      var sty1 = {
        bottom: this._height3+8.5,
      };

    this.setState({
        styleH3: sty,
        bottom3:sty1,
    });
  }

  _handlePanResponderGrant4 (e , gestureState ) {

      if(this.volume4 != 0) {
        this._height4 = this.volume4 * this._maxH / 24;
        this._initailHeight4 = this._height4;
      }

      var sty = {
        height: this._height4,
      };
      var sty1 = {
        bottom: this._height4+8.5,
      };

    this.setState({
        styleH4: sty,
        bottom4:sty1,
    });
  }

  _handlePanResponderGrant5 (e , gestureState ) {

      if(this.volume5 != 0) {
        this._height5 = this.volume5 * this._maxH / 24;
        this._initailHeight5 = this._height5;
      }
      // alert(this._height5);
      var sty = {
        height: this._height5,
      };
      var sty1 = {
        bottom: this._height5+8.5,
      };

    this.setState({
        styleH5: sty,
        bottom5:sty1,
    });
  }

  _handlePanResponderGrant6 (e , gestureState ) {

      if(this.volume6 != 0) {
        this._height6 = this.volume6 * this._maxH / 24;
        this._initailHeight6 = this._height6;
      }

      var sty = {
        height: this._height6,
      };
      var sty1 = {
        bottom: this._height6+8.5,
      };

    this.setState({
        styleH6: sty,
        bottom6:sty1,
    });
  }

  _handlePanResponderGrant7 (e , gestureState ) {

      if(this.volume7 != 0) {
        this._height7 = this.volume7 * this._maxH / 24;
        this._initailHeight7 = this._height7;
      }

      var sty = {
        height: this._height7,
      };
      var sty1 = {
        bottom: this._height7+8.5,
      };

    this.setState({
        styleH7: sty,
        bottom7:sty1,
    });
  }

  _handlePanResponderGrant8 (e , gestureState ) {

      if(this.volume8 != 0) {
        this._height8 = this.volume8 * this._maxH / 24;
        this._initailHeight8 = this._height8;
      }
      var sty = {
        height: this._height8,
      };
      var sty1 = {
        bottom: this._height8+8.5,
      };

    this.setState({
        styleH8: sty,
        bottom8:sty1,
    });
  }

  _handlePanResponderMove (e , gestureState ) {

    if(this._height >= this._maxH && gestureState.vy < 0) {
      return;
    }

    if(this._height <= this._minH && gestureState.vy > 0) {
      return;
    }
    this.setCustom();
    this._height = this._initailHeight - gestureState.dy;

    if(this._height > this._maxH) {
      this._height = this._maxH;
    }
    if(this._height < this._minH) {
      this._height = this._minH;
    }

    this.currentVolume = Math.floor(this._height / this._maxH  * 24);
    this.volume = this.currentVolume;


      var sty = {
          height: this._height,
      };

      var sty1 = {
          bottom: this._height+8.5,
      };

      this.setState({
        styleH: sty,
        bottom:sty1,
      });

  }

  _handlePanResponderMove2 (e , gestureState ) {

    if(this._height2 >= this._maxH && gestureState.vy < 0) {
      return;
    }

    if(this._height2 <= this._minH && gestureState.vy > 0) {
      return;
    }

    this.setCustom();
    this._height2 = this._initailHeight2 - gestureState.dy;

    if(this._height2 > this._maxH) {
      this._height2 = this._maxH;
    }
    if(this._height2 < this._minH) {
      this._height2 = this._minH;
    }

    this.currentVolume = Math.floor(this._height2 / this._maxH  * 24);
    this.volume2 = this.currentVolume;
    if(this.currentVolume != this.volume2) {


    }

      var sty = {
          height: this._height2,
      };

      var sty1 = {
          bottom: this._height2+8.5,
      };

      this.setState({
        styleH2: sty,
        bottom2:sty1,
      });

  }

  _handlePanResponderMove3 (e , gestureState ) {

    if(this._height3 >= this._maxH && gestureState.vy < 0) {
      return;
    }

    if(this._height3 <= this._minH && gestureState.vy > 0) {
      return;
    }

    this.setCustom();
    this._height3 = this._initailHeight3 - gestureState.dy;

    if(this._height3 > this._maxH) {
      this._height3 = this._maxH;
    }
    if(this._height3 < this._minH) {
      this._height3 = this._minH;
    }

    this.currentVolume = Math.floor(this._height3 / this._maxH  * 24);
    this.volume3 = this.currentVolume;
    if(this.currentVolume != this.volume3) {
    }

      var sty = {
          height: this._height3,
      };

      var sty1 = {
          bottom: this._height3+8.5,
      };

      this.setState({
        styleH3: sty,
        bottom3:sty1,
      });

  }

  _handlePanResponderMove4 (e , gestureState ) {

    if(this._height4 >= this._maxH && gestureState.vy < 0) {
      return;
    }

    if(this._height4 <= this._minH && gestureState.vy > 0) {
      return;
    }

    this.setCustom();
    this._height4 = this._initailHeight4 - gestureState.dy;

    if(this._height4 > this._maxH) {
      this._height4 = this._maxH;
    }
    if(this._height4 < this._minH) {
      this._height4 = this._minH;
    }

    this.currentVolume = Math.floor(this._height4 / this._maxH  * 24);
    this.volume4 = this.currentVolume;
    if(this.currentVolume != this.volume4) {
    }

      var sty = {
          height: this._height4,
      };

      var sty1 = {
          bottom: this._height4+8.5,
      };

      this.setState({
        styleH4: sty,
        bottom4:sty1,
      });

  }

  _handlePanResponderMove5 (e , gestureState ) {

    if(this._height5 >= this._maxH && gestureState.vy < 0) {
      return;
    }

    if(this._height5 <= this._minH && gestureState.vy > 0) {
      return;
    }

    this.setCustom();
    this._height5 = this._initailHeight5 - gestureState.dy;

    if(this._height5 > this._maxH) {
      this._height5 = this._maxH;
    }
    if(this._height5 < this._minH) {
      this._height5 = this._minH;
    }

    this.currentVolume = Math.floor(this._height5 / this._maxH  * 24);
    this.volume5 = this.currentVolume;
    if(this.currentVolume != this.volume5) {
    }

      var sty = {
          height: this._height5,
      };

      var sty1 = {
          bottom: this._height5+8.5,
      };

      this.setState({
        styleH5: sty,
        bottom5:sty1,
      });

  }

  _handlePanResponderMove6 (e , gestureState ) {

    if(this._height6 >= this._maxH && gestureState.vy < 0) {
      return;
    }

    if(this._height6 <= this._minH && gestureState.vy > 0) {
      return;
    }

    this.setCustom();
    this._height6 = this._initailHeight6 - gestureState.dy;

    if(this._height6 > this._maxH) {
      this._height6 = this._maxH;
    }
    if(this._height6 < this._minH) {
      this._height6 = this._minH;
    }

    this.currentVolume = Math.floor(this._height6 / this._maxH  * 24);
    this.volume6 = this.currentVolume;
    if(this.currentVolume != this.volume6) {
    }

      var sty = {
          height: this._height6,
      };

      var sty1 = {
          bottom: this._height6+8.5,
      };

      this.setState({
        styleH6: sty,
        bottom6:sty1,
      });

  }

  _handlePanResponderMove7 (e , gestureState ) {

    if(this._height7 >= this._maxH && gestureState.vy < 0) {
      return;
    }

    if(this._height7 <= this._minH && gestureState.vy > 0) {
      return;
    }

    this.setCustom();
    this._height7 = this._initailHeight7 - gestureState.dy;

    if(this._height7 > this._maxH) {
      this._height7 = this._maxH;
    }
    if(this._height7 < this._minH) {
      this._height7 = this._minH;
    }

    this.currentVolume = Math.floor(this._height7 / this._maxH  * 24);
    this.volume7 = this.currentVolume;
    if(this.currentVolume != this.volume7) {
    }

      var sty = {
          height: this._height7,
      };

      var sty1 = {
          bottom: this._height7+8.5,
      };

      this.setState({
        styleH7: sty,
        bottom7:sty1,
      });

  }

  _handlePanResponderMove8 (e , gestureState ) {
    if(this._height8 >= this._maxH && gestureState.vy < 0) {
      return;
    }

    if(this._height8 <= this._minH && gestureState.vy > 0) {
      return;
    }

    this.setCustom();
    this._height8 = this._initailHeight8 - gestureState.dy;

    if(this._height8 > this._maxH) {
      this._height8 = this._maxH;
    }
    if(this._height8 < this._minH) {
      this._height8 = this._minH;
    }

    this.currentVolume = Math.floor(this._height8 / this._maxH  * 24);
    this.volume8 = this.currentVolume;

      var sty = {
          height: this._height8,
      };

      var sty1 = {
          bottom: this._height8+8.5,
      };

      this.setState({
        styleH8: sty,
        bottom8:sty1,
      });

  }

  _handlePanResponderEnd (e , gestureState ) {
    //设置均衡器
    this._initailHeight = this._initailHeight - gestureState.dy;

    if(this._initailHeight > this._maxH) {
      this._initailHeight = this._maxH;
    }
    if(this._initailHeight < this._minH) {
      this._initailHeight = this._minH;
    }
    this.set_equalizer_info();
  }

  _handlePanResponderEnd2 (e , gestureState ) {
    //设置均衡器

    this._initailHeight2 = this._initailHeight2 - gestureState.dy;

    if(this._initailHeight2 > this._maxH) {
      this._initailHeight2 = this._maxH;
    }
    if(this._initailHeight2 < this._minH) {
      this._initailHeight2 = this._minH;
    }
    this.set_equalizer_info();
  }

  _handlePanResponderEnd3 (e , gestureState ) {
    //设置均衡器
    this._initailHeight3 = this._initailHeight3 - gestureState.dy;

    if(this._initailHeight3 > this._maxH) {
      this._initailHeight3 = this._maxH;
    }
    if(this._initailHeight3 < this._minH) {
      this._initailHeight3 = this._minH;
    }
    this.set_equalizer_info();
  }

  _handlePanResponderEnd4 (e , gestureState ) {
    //设置均衡器

    this._initailHeight4 = this._initailHeight4 - gestureState.dy;

    if(this._initailHeight4 > this._maxH) {
      this._initailHeight4 = this._maxH;
    }
    if(this._initailHeight4 < this._minH) {
      this._initailHeight4 = this._minH;
    }
    this.set_equalizer_info();
  }
  _handlePanResponderEnd5 (e , gestureState ) {
    //设置均衡器

    this._initailHeight5 = this._initailHeight5 - gestureState.dy;

    if(this._initailHeight5 > this._maxH) {
      this._initailHeight5 = this._maxH;
    }
    if(this._initailHeight5 < this._minH) {
      this._initailHeight5 = this._minH;
    }
    this.set_equalizer_info();
  }

  _handlePanResponderEnd6 (e , gestureState ) {
    //设置均衡器
    this._initailHeight6 = this._initailHeight6 - gestureState.dy;

    if(this._initailHeight6 > this._maxH) {
      this._initailHeight6 = this._maxH;
    }
    if(this._initailHeight6 < this._minH) {
      this._initailHeight6 = this._minH;
    }
    this.set_equalizer_info();
  }

  _handlePanResponderEnd7 (e , gestureState ) {
    //设置均衡器

    this._initailHeight7 = this._initailHeight7 - gestureState.dy;

    if(this._initailHeight7 > this._maxH) {
      this._initailHeight7 = this._maxH;
    }
    if(this._initailHeight7 < this._minH) {
      this._initailHeight7 = this._minH;
    }
    this.set_equalizer_info();
  }

  _handlePanResponderEnd8 (e, gestureState) {
    //设置均衡器

    this._initailHeight8 = this._initailHeight8 - gestureState.dy;

    if(this._initailHeight8 > this._maxH) {
      this._initailHeight8 = this._maxH;
    }
    if(this._initailHeight8 < this._minH) {
      this._initailHeight8 = this._minH;
    }
    this.set_equalizer_info();
  }

  initailHeight(){
    this._initailHeight = this._initailHeight - gestureState.dy;

    if(this._initailHeight > this._maxH) {
      this._initailHeight = this._maxH;
    }
    if(this._initailHeight < this._minH) {
      this._initailHeight = this._minH;
    }
  }

  initailHeight2(){
    this._initailHeight2 = this._initailHeight2 - gestureState.dy;

    if(this._initailHeight2 > this._maxH) {
      this._initailHeight2 = this._maxH;
    }
    if(this._initailHeight2 < this._minH) {
      this._initailHeight2 = this._minH;
    }
  }

  initailHeight3(){
    this._initailHeight3 = this._initailHeight3 - gestureState.dy;

    if(this._initailHeight3 > this._maxH) {
      this._initailHeight3 = this._maxH;
    }
    if(this._initailHeight3 < this._minH) {
      this._initailHeight3 = this._minH;
    }
  }

  initailHeight4(){
    this._initailHeight4 = this._initailHeight4 - gestureState.dy;

    if(this._initailHeight4 > this._maxH) {
      this._initailHeight4 = this._maxH;
    }
    if(this._initailHeight4 < this._minH) {
      this._initailHeight4 = this._minH;
    }
  }

  initailHeight5(){
    this._initailHeight5 = this._initailHeight5 - gestureState.dy;

    if(this._initailHeight5 > this._maxH) {
      this._initailHeight5 = this._maxH;
    }
    if(this._initailHeight5 < this._minH) {
      this._initailHeight5 = this._minH;
    }
  }

  initailHeight6(){
    this._initailHeight6 = this._initailHeight6 - gestureState.dy;

    if(this._initailHeight6 > this._maxH) {
      this._initailHeight6 = this._maxH;
    }
    if(this._initailHeight6 < this._minH) {
      this._initailHeight6 = this._minH;
    }
  }

  initailHeight7(){
    this._initailHeight7 = this._initailHeight7 - gestureState.dy;

    if(this._initailHeight7 > this._maxH) {
      this._initailHeight7 = this._maxH;
    }
    if(this._initailHeight7 < this._minH) {
      this._initailHeight7 = this._minH;
    }
  }

  initailHeight8 (){
    this._initailHeight8 = this._initailHeight8 - gestureState.dy;

    if(this._initailHeight8 > this._maxH) {
      this._initailHeight8 = this._maxH;
    }
    if(this._initailHeight8 < this._minH) {
        this._initailHeight8 = this._minH;
    }
  }

  set_equalizer_info (){
    var params = {
      params:{
          '63hz':parseInt(this.volume),
          '125hz' :parseInt(this.volume2),
          '250hz':parseInt(this.volume3),
          '500hz':parseInt(this.volume4),
          '1250hz' :parseInt(this.volume5),
          '3150hz' :parseInt(this.volume6),
          '6300hz' :parseInt(this.volume7),
          '12500hz' :parseInt(this.volume8),
          'eqtype':4,
      }

    };


    this.setState({message:'正在设置...',visLoading:true});
    Device.getDeviceWifi().callMethod('set_equalizer_info', params).then((json) => {

      if ( json.code==0) {
        this.setState({message:'设置成功',visLoading:false});
      }else{
        this.setState({message:'设置失败',visLoading:false});
      }
    }).catch(error=>{
      this.setState({message:'',visLoading:false});
      console.log('error-1118 -'+JSON.stringify(error));
    });
  }

  setCustom (){
    this.eqtype=4;
    this.customSelected.setState({
      selected:true,
    });
    this.rockSelected.setState({
        selected:false,
      });
    this.standardSelected.setState({
        selected:false,
      });
  }


  //自定义类型的初始化
  custom (audioControlProps){
    this.volume = audioControlProps['63hz'];
    this.volume2 = audioControlProps['125hz'];
    this.volume3= audioControlProps['250hz'];
    this.volume4= audioControlProps['500hz'];
    this.volume5 = audioControlProps['1250hz'];
    this.volume6 = audioControlProps['3150hz'];
    this.volume7 = audioControlProps['6300hz'];
    this.volume8 = audioControlProps['12500hz'];

    var sty = {
        height: Math.floor(this.volume/24*this._maxH),
    };
    var bottom = {
        bottom: sty.height+8.5,
    };
    var sty2 = {
        height: Math.floor(this.volume2/24*this._maxH),
    };
    var bottom2 = {
        bottom: sty2.height+8.5,
    };
    var sty3 = {
        height: Math.floor(this.volume3/24*this._maxH),
    };
    var bottom3 = {
        bottom: sty3.height+8.5,
    };
    var sty4 = {
        height: Math.floor(this.volume4/24*this._maxH),
    };
    var bottom4 = {
        bottom: sty4.height+8.5,
    };
    var sty5 = {
        height: Math.floor(this.volume5/24*this._maxH),
    };
    var bottom5 = {
        bottom: sty5.height+8.5,
    };
    var sty6 = {
        height: Math.floor(this.volume6/24*this._maxH),
    };
    var bottom6 = {
        bottom: sty6.height+8.5,
    };
    var sty7 = {
        height: Math.floor(this.volume7/24*this._maxH),
    };
    var bottom7 = {
        bottom: sty7.height+8.5,
    };
    var sty8 = {
        height: Math.floor(this.volume8/24*this._maxH),
    };
    var bottom8 = {
        bottom: sty8.height+8.5,
    };

    this._initailHeight=sty.height;
    this._initailHeight2=sty2.height;
    this._initailHeight3=sty3.height;
    this._initailHeight4=sty4.height;
    this._initailHeight5=sty5.height;
    this._initailHeight6=sty6.height;
    this._initailHeight7=sty7.height;
    this._initailHeight8=sty8.height;

    this.standardSelected.setState({
      selected:false,
    });
    this.rockSelected.setState({
      selected:false,
    });
    this.customSelected.setState({
      selected:true,
    });
    this.setState({
      styleH:sty,
      bottom:bottom,
      styleH2:sty2,
      bottom2:bottom2,
      styleH3:sty3,
      bottom3:bottom3,
      styleH4:sty4,
      bottom4:bottom4,
      styleH5:sty5,
      bottom5:bottom5,
      styleH6:sty6,
      bottom6:bottom6,
      styleH7:sty7,
      bottom7:bottom7,
      styleH8:sty8,
      bottom8:bottom8,
    });
  }

  //三种类型重置
  reSetEqtype (index){
    var sty = {
        height: Math.floor(0.5*this._maxH),
    };
    var bottom = {
        bottom: sty.height+8.5,
    };
    this.initHeight(sty.height);//初始化高度
    this.reSetHeight(sty.height);
    this.reSetVolume(12);//

    this.standardSelected.setState({
      selected:index==0?true:false,
    });
    this.rockSelected.setState({
      selected:index==1?true:false,
    });
    this.customSelected.setState({
       selected:index==2?true:false,
     });
      this.setState({
        styleH:sty,
        bottom:bottom,
        styleH2:sty,
        bottom2:bottom,
        styleH3:sty,
        bottom3:bottom,
        styleH4:sty,
        bottom4:bottom,
        styleH5:sty,
        bottom5:bottom,
        styleH6:sty,
        bottom6:bottom,
        styleH7:sty,
        bottom7:bottom,
        styleH8:sty,
        bottom8:bottom,
      });
  }

  //8个均衡器的高度
  initHeight (height){
    this._initailHeight=height;
    this._initailHeight2=height;
    this._initailHeight3=height;
    this._initailHeight4=height;
    this._initailHeight5=height;
    this._initailHeight6=height;
    this._initailHeight7=height;
    this._initailHeight8=height;
  }

  //8个均衡器的高度
  reSetHeight (height){
    this._height=height;
    this._height2=height;
    this._height3=height;
    this._height4=height;
    this._height5=height;
    this._height6=height;
    this._height7=height;
    this._height8=height;
  }

  //8个均衡器的声音
  reSetVolume (volume){
    this.volume=volume;
    this.volume2=volume;
    this.volume3=volume;
    this.volume4=volume;
    this.volume5=volume;
    this.volume5=volume;
    this.volume6=volume;
    this.volume7=volume;
    this.volume8=volume;
  }

  getTextStyle (){
    //根据均衡器类型，来显示
    
  }

  _onPressHandler  (index){
    if(index==0){//标准
      this.eqtype=1;
      //   //发送请求
      var params = {
      params:{
          '63hz':0,
          '125hz' :0,
          '250hz':0,
          '500hz':0,
          '1250hz' :0,
          '3150hz' :0,
          '6300hz' :0,
          '12500hz' :0,
          'eqtype':this.eqtype,
      }};

      this.setState({message:'正在设置...',visLoading:true});
      Device.getDeviceWifi().callMethod('set_equalizer_info', params).then((json) => {

          if (json.code==0) {
            this.setState({message:'设置成功',visLoading:false});
            this.reSetEqtype(0);
          }else{
            this.setState({message:'设置失败',visLoading:false});
          }
      }).catch(error=>{
        this.setState({message:'',visLoading:false});
        console.log('error-1344 -'+JSON.stringify(error));
      });

      this.customSelected.setState({
        selected:false,
      });
      this.rockSelected.setState({
        selected:false,
      });
      this.standardSelected.setState({
        selected:true,
      });

    }else if(index==1){//摇滚
    this.eqtype=2;
    //   //发送请求
    var params = {
     params:{
       '63hz':0,
       '125hz' :0,
       '250hz':0,
       '500hz':0,
       '1250hz' :0,
       '3150hz' :0,
       '6300hz' :0,
       '12500hz' :0,
       'eqtype':this.eqtype,
     }};

    this.setState({message:'正在设置...',visLoading:true});
    Device.getDeviceWifi().callMethod('set_equalizer_info', params).then((json) => {

      this.setState({message:'',visLoading:false});
        if (json.code==0) {
          this.reSetEqtype(1);
          this.setState({message:'设置成功',visLoading:false});
        }else{
          this.setState({message:'设置失败',visLoading:false});
        }
    }).catch(error=>{
      this.setState({message:'设置失败',visLoading:false});
      console.log('error-1394 -'+JSON.stringify(error));
    });

    this.customSelected.setState({
       selected:false,
     });
     this.rockSelected.setState({
      selected:true,
    });
    this.standardSelected.setState({
      selected:false,
    });
    }else if(index==2){//自定义
      this.eqtype=4;

      this.customSelected.setState({
         selected:true,
     });
     this.rockSelected.setState({
        selected:false,
      });
      this.standardSelected.setState({
       selected:false,
     });

    }
  }

  onPress_ReSet(){
     //全部为0
     //发送请求
     if(this.eqtype!=4) return;
     var params = {
      params:{
        '63hz':12,
        '125hz':12,
        '250hz':12,
        '500hz':12,
        '1250hz':12,
        '3150hz':12,
        '6300hz':12,
        '12500hz':12,
        'eqtype':4,
      }};
      var sty={
          height: Math.floor(0.5*this._maxH),
      };
      var sty1={
          bottom: sty.height+8.5,
      };

    this.setState({message:'正在设置...',visLoading:true});
    Device.getDeviceWifi().callMethod('set_equalizer_info', params).then((json) => {

      this.setState({message:'设置成功',visLoading:false});
      if (json.code==0) {
         this.setState({
           styleH: sty,
           styleH2: sty,
           styleH3: sty,
           styleH4: sty,
           styleH5: sty,
           styleH6: sty,
           styleH7: sty,
           styleH8: sty,
           bottom: sty1,
           bottom2: sty1,
           bottom3: sty1,
           bottom4: sty1,
           bottom5: sty1,
           bottom6: sty1,
           bottom7: sty1,
           bottom8: sty1,
         });
         this.reSetVolume(12);//
        //  MHPluginSDK.showFinishTips('设置成功');
      }else{
        this.setState({message:'设置失败',visLoading:false});
      }
    }).catch(error=>{
      this.setState({message:'设置失败',visLoading:false});
      console.log('error-1474 -'+JSON.stringify(error));
    });


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
  button:{
    backgroundColor:'red',
    borderRadius:10,
    borderWidth:1/PixelRatio.get(),
    borderColor:'rgba(0,0,0,0.2)',
  },
  listenBtn:{
    flex:1,
    height:40,
    width:90,
    borderRadius:10,
    backgroundColor:'transparent',
    borderWidth:1/PixelRatio.get(),
    borderColor:'rgba(0,0,0,0.4)',
  },
  listenBtn3:{
    height:41,
    borderRadius:20.5,
    borderWidth:1/PixelRatio.get(),
    borderColor:'rgba(0,0,0,0.4)',
  },
  listenBtn1:{
    flex:1,
    width:90,
    marginTop:38,
    marginLeft:22.5,
    backgroundColor:'#f9f7f7',
    borderWidth:1/PixelRatio.get(),
    borderColor:'rgba(0,0,0,0.4)',
  },
  listenBtn2:{
    flex:1,
    width:90,
    marginTop:38,
    marginLeft:22.5,
    marginRight:25,
    backgroundColor:'#f9f7f7',
    borderWidth:1/PixelRatio.get(),
    borderColor:'rgba(0,0,0,0.4)',
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
  text3:{
    fontSize: 15,
    color:'rgb(51,51,51)',
    marginTop:10,
  },
  text4:{
    fontSize: 12,
    color:'rgb(130,130,130)',
    marginLeft: 6,
    marginTop: 12,
  },
  text5:{
    fontSize: 12,
    color:'rgb(127,127,127)',
    marginTop: 7,
  },
  slider:{
     height:300,
     width:10,
     marginLeft:30,
     alignItems:'center',
     backgroundColor:'red',
  },
  sliderlb:{
     height:10,
     width:screenWidth-60,
     marginTop:80,
     backgroundColor:'red',
  },
  slider11:{
     height:10,
     width:screenWidth-60,
     marginTop:80,
     backgroundColor:'transparent',
  },
  slider1:{
     width:40,
     height:300,
     marginLeft:30,
     backgroundColor:'red',
  },
  top1:{
   height:h,
   width:25,
   marginLeft:0,
   marginTop:0,
   justifyContent:'center',
   alignItems:'center',
   backgroundColor:'transparent',

 },
 top2:{
    height:h,
    width:25,
    marginTop:0,
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:'transparent',
  },
  top3:{
    height:h,
    width:25,
    marginTop:0,
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:'transparent',
  },
  top4:{
    height:h,
    width:25,
    marginTop:0,
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:'transparent',
  },
  top5:{
    height:h,
    width:25,
    marginTop:0,
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:'transparent',
  },
  top6:{
    height:h,
    width:25,
    marginTop:0,
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:'transparent',
  },
  top7:{
    height:h,
    width:25,
    marginTop:0,
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:'transparent',
  },
  top8:{
    height:h,
    width:25,
    marginTop:0,
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:'transparent',
  },
 volume:{
    height: h,
    width:  25,
    paddingTop:15,
    alignItems:'center',
    backgroundColor:'transparent',
 },
 volumeProgress:{
    height: h,
    width:5,
    backgroundColor: '#d6d6d6',
    overflow:'hidden',
 },
 volumep:{
   position:'absolute',
   left:0,
   bottom:0,
   height: 0,
   width:5,
   backgroundColor: '#cd3f3f',
},
db:{
  height:262+17,
  flexDirection:'column',
  alignItems:'center',
  justifyContent:'center',
},
slidermargin:{
  marginLeft:60,
},
textStyle:{
  flex:1,
  width:90,
  height:40,
  backgroundColor:'rgba(0,0,0,0.2)',
  fontSize:15,
  textAlign:'center',
  color :'rgba(0,0,0,0.6)',
},
textStyleSelected:{
  flex:1,
  width:90,
  height:40,
  backgroundColor:'#cd3f3f',
  fontSize:15,
  textAlign:'center',
  color :'rgba(255,255,255,0.9)',
},
leftBtnStyle :{
  borderTopLeftRadius:4,
  borderBottomLeftRadius:4,
  height:28,
  width:108,
},
centerBtnStyle :{
  height:28,
  width:108,
},
rightBtnStyle :{
  borderTopRightRadius:4,
  borderBottomRightRadius:4,
  height:28,
  width:108,
},
thumb:{
  width:17,
  height:17,
  borderRadius:8.5,
  backgroundColor:'white',
  borderWidth:1/PixelRatio.get(),
  borderColor:'#d6d6d6',
},
textStyle1:{
  width:40,
  fontSize:12,
  color:'rgba(0,0,0,0.6)',
  textAlign:'center',
},
});

module.exports = ToneEqualizerSetting;
