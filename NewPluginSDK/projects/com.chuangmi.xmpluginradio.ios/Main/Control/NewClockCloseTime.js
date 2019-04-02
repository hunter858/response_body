'use strict';

// 设置闹铃关闭时间页面
import React,{component} from 'react' ;
import Constants from '../../Main/Constants';
import {
  APPBAR_HEIGHT,APPBAR_MARGINBOTTOM,APPBAR_MARGINTOP,isIPX ,
  ratio,NavigatorBarHeight,screenWidth,screenHeight} from '../ConstDefine';

import {
  Image,
  StyleSheet,
  Text,
  View,
  DatePickerIOS,
  DeviceEventEmitter,
} from 'react-native';



class NewClockCloseTime extends React.Component{

    constructor(props){
      super(props);
      this.state = {
        date: new Date(),
      };
    }
    
    onDateChange(date){
      this.setState({date: date});
    }

    getDefaultProps () {
      return {
        timeZoneOffsetInMinutes: (-1) * (new Date()).getTimezoneOffset(),
      };
    }

    componentWillMount(){

      this.mindate = new Date();
      this.mindate.setTime(this.props.minTime);

      var dd = new Date();

      if(this.props.minTime > this.props.closeTime){
         dd.setTime(this.props.minTime);
      } else {
         dd.setTime(this.props.closeTime);
      }

       this.setState({
          date: dd,
       });

    }

    componentDidMount(){
      this.subscription = DeviceEventEmitter.addListener('SaveCloseTime',(notification) => {

          DeviceEventEmitter.emit('CloseTimeSaved', {data: {time: this.state.date.getTime()}});
          this.props.navigation.pop();
      });
    }

    componentWillUnmount(){
       this.subscription.remove();
    }

    render(){
      return (
        <View style={{flex:1, paddingTop:64+APPBAR_MARGINTOP, backgroundColor:Constants.TintColor.rgb235}}>
          <View style={styles.picker} >
            <DatePickerIOS
                    minimumDate={this.mindate}
                    date={this.state.date}
                    onDateChange={this.onDateChange}
                    timeZoneOffsetInMinutes={this.props.timeZoneOffsetInMinutes}
                    mode='time'/>
          </View>
        </View>
      );
    }
}

var styles = StyleSheet.create({
   picker:{
     backgroundColor:'white',
     height: 220,
     alignItems:'center'
   },
});


module.exports = NewClockCloseTime;
