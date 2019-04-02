'use strict'

import React,{Component} from 'react';
import {
    PanResponder,
    StyleSheet,
    Text,
    View,
    Image,
    ListView,
    ImageBackground,
    TouchableOpacity,
    Dimensions,
    DeviceEventEmitter,
    StatusBar,
    Platform,
    PixelRatio,
    TouchableWithoutFeedback,
    TouchableHighlight,
    ART,
    PickerIOS,
} from 'react-native';
const {Group, Transform,Path, Shape, Surface} = ART;
import Chart from '../../CommonModules/Chart/Chart.js';
import {
  APPBAR_HEIGHT,APPBAR_MARGINBOTTOM,APPBAR_MARGINTOP,isIPX ,
  ratio,NavigatorBarHeight,screenWidth,screenHeight} from '../ConstDefine';


const RATIO = screenWidth / 375.0;
const TITLES = ['时', '日', '月'];
const BAR_WIDTH = 30;//柱的宽度
const X_AXIS_WIDTH = 60;//x轴坐标的宽度
const CHART_LEFT = -30;//之所以设置为-30，是为了不显示y轴坐标
var interval;


export default class PowerCostPage extends React.Component{
  constructor(props, context) {
    super(props, context);
    this.state = {
      selectedIndex: 0,
      dataPoint: 0,
      hourData: [],
      dayData: [],
      monthData: [],
      switchingTimes:0,
      openTime:0,
      cumulativeEconomizePower:0,
      totalPower:0,
    };
    // 每3000毫秒获取一次电量
    interval=setInterval(() => {
        this.getPower();
    }, 3000);
  }
  componentWillMount(){
    this.getPower();//获取功率
  }

  componentDidMount() {

  }

  componentWillUnmount(){
    clearInterval(interval);
  }

  //获取设备功率
  getPower(){

    Device.getDeviceWifi().callMethod('get_power', [])
    .then((response)=>{
        
        this.setState({
          totalPower: this.state.totalPower++,
        });
    })
    .catch((err)=>{
        console.log("getPower err"+JSON.stringify(err));
    });

    // MHPluginSDK.callMethod('get_power', [], {}, (success, json) => {
    //     this.setState({
    //         totalPower: ++this.state.totalPower,//模拟动态情况
    //     });
    //     if (success && json.result) {

    //         this.setState({
    //             totalPower: this.state.totalPower++,
    //         });
    //     }

    // });
  }

  render() {
    //tabbar
    var tabbarItems = [];
    for (var i = 0; i < TITLES.length; i++) {
      var tempColor = this.state.selectedIndex == i ? '#90bee4aa' : 'transparent';
      var tabbarItem = (
        <TouchableWithoutFeedback key={i} onPressIn={this._generateOnClickedFunction(i).bind(this)}>
          <View style={[styles.tabbarItem,{backgroundColor:tempColor}]}>
            <Text style={{color:'#f0f0f0bb'}}>{TITLES[i]}</Text>
          </View>
        </TouchableWithoutFeedback>
      );
      tabbarItems.push(tabbarItem);
    }

    var powerCostList = [this.state.hourData, this.state.dayData, this.state.monthData];
    var currentData = powerCostList[this.state.selectedIndex];
    var chartWidth = X_AXIS_WIDTH * currentData.length;
    if (chartWidth < screenWidth - CHART_LEFT) {
      chartWidth =  screenWidth - CHART_LEFT;
    }
    var contentOffsetX = chartWidth - (screenWidth - CHART_LEFT);//让scrollView滑到右边
    return (
      <View style={styles.container}>
        <View style={styles.tabbarContainer}>
          <View style={{flex:1}} />
          {tabbarItems}
        </View>
        <ScrollView
          horizontal={true}
          bounces={false}
          contentInset={{top:0, left:0, bottom:0, right:CHART_LEFT}}
          contentOffset={{x:contentOffsetX, y:0}}
          showsHorizontalScrollIndicator={false} >
          <Chart
            style={[styles.chart, {width: chartWidth}]}
            data={currentData}
            verticalGridStep={2}
            type="bar"
            color="#90bee4"
            showGrid={false}
            axisColor='transparent'
            barWidth={BAR_WIDTH}
            onDataPointPress={this._onDataPointPress.bind(this)}
           />
         </ScrollView>
      
        <View style={[styles.bottom,{flexDirection:'column',backgroundColor:'white'}]}>
        <View style={{width:screenWidth,height:bottomHight/2,flexDirection:'row'}}>
            <View style={{width:screenWidth/2,justifyContent:'center'}}>
            <Text style={[styles.fontBase, {fontSize:14}]}>{'总功率(单位:KWH)'}</Text>
            <Text style={[styles.fontBase, {fontSize:30}]}>{this.state.totalPower}</Text>
            </View>
            <View style={{width:1/PixelRatio.get(),backgroundColor:'#d9d9d9'}}></View>
            <View style={{width:screenWidth/2,justifyContent:'center'}}>
            <Text style={[styles.fontBase, {fontSize:14}]}>{'开启时长'}</Text>
            <Text style={[styles.fontBase, {fontSize:30, marginBottom:5}]}>{this.state.openTime}</Text>
            </View>
          </View>
          <View style={{height:1/PixelRatio.get(),width:screenWidth,backgroundColor:'#d9d9d9'}}></View>
          <View style={{width:screenWidth,height:bottomHight/2,flexDirection:'row'}}>
          <View style={{width:screenWidth/2,justifyContent:'center'}}>
          <Text style={[styles.fontBase, {fontSize:14}]}>{'开关次数'}</Text>
          <Text style={[styles.fontBase, {fontSize:30, marginBottom:5}]}>{this.state.switchingTimes}</Text>
          </View>
          <View style={{width:1/PixelRatio.get(),backgroundColor:'#d9d9d9'}}></View>
          <View style={{width:screenWidth/2,justifyContent:'center'}}>
          <Text style={[styles.fontBase, {fontSize:14}]}>{'累计省电'}</Text>
          <Text style={[styles.fontBase, {fontSize:30, marginBottom:5}]}>{this.state.cumulativeEconomizePower}</Text>
          </View>
        </View>
        </View>
      </View>
    );
  }

  _generateOnClickedFunction(index) {
    var powerCostList = [this.state.hourData, this.state.dayData, this.state.monthData];
    var currentData = powerCostList[this.state.selectedIndex];
    var that = this;
    return function() {
      that.setState({
        selectedIndex: index,
        dataPoint: currentData[0][1],
      });
    }
  }

  _onDataPointPress(e, dataPoint, index) {
    this.setState({
      dataPoint: dataPoint,
    });
  }


 

}

const tabbarContainerHeight = 202 * RATIO;
const bottomHight = 120 * RATIO;
const chartHeight = screenHeight - tabbarContainerHeight - bottomHight;

var styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#267dca',
    },
    tabbarContainer: {
      top: 0,
      width: screenWidth,
      height: tabbarContainerHeight,
      paddingTop: 82,
      // alignItems: 'center',
      flexDirection: 'row',
    },
    tabbarItem: {
      marginRight: 16 * RATIO,
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#90bee455'
    },
    chart: {
      left: CHART_LEFT,//隐藏掉y轴方向的坐标，调用api无法做到隐藏y轴同时保留x轴；
      width: screenWidth - CHART_LEFT,
      height: chartHeight,
      // borderWidth: 1,
    },
    bottom: {
      width: screenWidth,
      height: bottomHight,
      backgroundColor: '#f0f0f0ee',
      justifyContent: 'center',
      alignItems: 'center',
    },
    fontBase: {
      textAlign: 'center',
      color: '#000000ee',
      opacity: 0.9,
    }
});