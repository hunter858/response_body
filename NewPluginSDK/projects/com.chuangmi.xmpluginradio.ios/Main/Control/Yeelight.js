'use strict';
import React,{component} from 'react' ;
import {Device,DeviceEvent,Host,Package,Service} from 'miot';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    Image,
    Dimensions,
    PanResponder,
    Animated,   //使用Animated组件
    Easing,     //引入Easing渐变函数
} from 'react-native';

var {screenHeight, screenWidth} = Dimensions.get('window');

class RGBText extends React.Component{
  constructor(props) {
    super(props);
  }

  render() {
      return (
          <View style={{height:50,width:100,alignItems:'center',flexDirection:'row',justifyContent:'center'}}>
            <Text style={styles.color1}>{this.props.rgbType}</Text>
            <Text style={styles.color1}>{this.props.value}</Text>
          </View>
      );
  }
}

class Yeelight extends React.Component{
    constructor(props) {
        super(props);
        //使用Animated.Value设定初始化值（缩放度，角度等等）
        this.state = {
            value:0,
            bounceValue: new Animated.Value(1), //你可以改变这个值看
            rotateValue: new Animated.Value(0),//旋转角度的初始值
            centerX:0,
            centerY:0,
            touchX:0,
            touchY:0,
            touchAngle:-361.0,
            touchAngle2:-361.0,
            moveAngle:-361.0,
            isCurTouch:false,
            colorR:props.r,
            colorG:props.g,
            colorB:props.b,
            colorA:props.alhpa,
            id:props.id,
            backgroundColor:'white',
        };
    }

    componentWillMount() {

        // //获取氛围灯信息
        // MHPluginSDK.callMethod("get_led_info", [], {"params":{}}, (success, json) => {
        //   if(success){
        //     alert('获取氛围灯成功'+JSON.stringify(json));
        //   }else{
        //     alert('获取氛围灯失败');
        //   }
        // });
        this._panResponder = PanResponder.create({
          // 要求成为响应者：
          onStartShouldSetPanResponder: (evt, gestureState) => true,
          onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
          onMoveShouldSetPanResponder: (evt, gestureState) => true,
          onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

          onPanResponderGrant: (evt, gestureState) => {
            // 开始手势操作。给用户一些视觉反馈，让他们知道发生了什么事情！
            this.state.centerX = (screenWidth / 2);
            this.state.centerY = (screenHeight / 2);
            this.state.touchX = gestureState.x0;
            this.state.touchY = gestureState.y0;
            var width=gestureState.x0-screenWidth/2;
            var height=gestureState.y0-screenHeight/2;
            var slope =Math.sqrt(width * width + height * height);
            if(gestureState.x0<screenWidth/2){//手指在屏幕左侧
              this.state.touchAngle = 180 + 180/Math.PI*Math.acos(height / slope);
            } else { // 手指在屏幕右侧
              this.state.touchAngle = 180 - 180/Math.PI*Math.acos(height / slope);
            }
            this.state.isCurTouch = true;
          },
          onPanResponderMove: (evt, gestureState) => {
            // 最近一次的移动距离为gestureState.move{X,Y}
            // 从成为响应者开始时的累计手势移动距离为gestureState.d{x,y}
              if(this.state.isCurTouch){
                  var width2=gestureState.moveX-screenWidth/2;
                  var height2=gestureState.moveY-screenHeight/2;
                  var slope2=Math.sqrt(width2 * width2 + height2 * height2);
                  if (gestureState.moveX < screenWidth / 2) { // 手指在屏幕左侧
                      this.state.touchAngle2 = 180 + 180/Math.PI*Math.acos(height2 / slope2);
                  } else { // 手指在屏幕右侧
                      this.state.touchAngle2 = 180 - 180/Math.PI*Math.acos(height2 / slope2);
                  }
                  var moveAngle=this.state.touchAngle2-this.state.touchAngle;
                  this.state.moveAngle=moveAngle;
                  this.state.touchAngle=this.state.touchAngle2;
                  this.startAnimation(moveAngle/360);
                  this.state.curX=478/2+Math.sin(Math.PI/180*(-(this.state.value*360)))*192;
                  this.state.curY=478/2-Math.cos(Math.PI/180*((this.state.value*360)))*192;

            }
          },
          onPanResponderTerminationRequest: (evt, gestureState) => true,
          onPanResponderRelease: (evt, gestureState) => {
          // 用户放开了所有的触摸点，且此时视图已经成为了响应者。
          // 一般来说这意味着一个手势操作已经成功完成。
          var params={};
          params.id=this.props.id;
          params.alhpa=this.props.alhpa;
          params.r=this.props.r;
          params.g=this.props.g;
          params.b=this.props.b;


          Host.file.getRGBAValueFromImageAtPath(require('../../Resources/yeelight.png'),[{x:parseInt(this.state.curX),y:parseInt(this.state.curY)}]).then((success,rgba) =>{
             
            if (success) {

              this.setState({
                colorR:rgba[0][0],
                colorG:rgba[0][1],
                colorB:rgba[0][2],
              });
              params.r=rgba[0][0];
              params.g=rgba[0][1];
              params.b=rgba[0][2];
              params.alhpa=rgba[0][3];

              Device.getDeviceWifi().callMethod("set_led_atmosphere_color", {"params":params}).then((json) => {
                
                if(json.code==0){
                  // MHPluginSDK.showFinishTips('设置成功');
                }else{
                  // MHPluginSDK.showFailTips('设置失败');
                }
              });
            }

            }).catch(error=>{
              console.log('error-150 -'+JSON.stringify(error));

            });
            this.state.isCurTouch = false;
            this.stopAnimation();
          },
          onPanResponderTerminate: (evt, gestureState) => {
            // 另一个组件已经成为了新的响应者，所以当前手势将被取消。
          },
        });
    }

    componentDidMount() {
       
    }

    startAnimation(value) {
        if(this.state.value>=1) this.state.value=this.state.value-1;
        this.state.value+=value;
        Animated.parallel([
            Animated.timing(this.state.rotateValue, {
                toValue: this.state.value,  //角度从0变1
                duration: 1,  //从0到1的时间
                easing: Easing.out(Easing.linear),//线性变化，匀速旋转
            }),
            //调用start启动动画,start可以回调一个函数,从而实现动画循环
        ]).start();
    }

    stopAnimation(){
      this.state.rotateValue.stopAnimation(value => {});
    }

    render() {
        return (
            <View style={[styles.container]}>
                <View style={{width:screenWidth,justifyContent:'center',flexDirection:'row'}}>
                  <RGBText style={styles.color1} rgbType='R:' value={this.state.colorR}></RGBText>
                  <RGBText style={styles.color1} rgbType='G:' value={this.state.colorG}></RGBText>
                  <RGBText style={styles.color1} rgbType='B:' value={this.state.colorB}></RGBText>
                </View>
                <Image style={styles.image} source={require('../../Resources/yeelight_tag.png')}>
                <Animated.Image {...this._panResponder.panHandlers}
                                source={require('../../Resources/yeelight.png')}
                                style={{width:478/2,
                                height: 478/2,
                                transform: [
                                //将初始化值绑定到动画目标的style属性上
                                {scale: this.state.bounceValue},
                                //使用interpolate插值函数,实现了从数值单位的映射转换,上面角度从0到1，这里把它变成0-360的变化
                                {rotateZ: this.state.rotateValue.interpolate({
                                inputRange: [0,1],
                                outputRange: ['0deg', '360deg'],
                                })},
                     ]}}>
                </Animated.Image>
                </Image>
            </View>
        );
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    top:{
      justifyContent: 'space-around',
      alignItems: 'center',
      flexDirection:'row',
      width:screenWidth,
      marginBottom:54,
    },
    color1:{
      color:'rgba(0,0,0,0.6)',
      fontSize:14,
    },
    color2:{
      color:'rgba(0,0,0,0.8)',
      fontSize:14,
    },
    image:{
      width:566/2,
      height:565/2,
      alignItems:'center',
      justifyContent:'center',
    }
});
module.exports = Yeelight;
