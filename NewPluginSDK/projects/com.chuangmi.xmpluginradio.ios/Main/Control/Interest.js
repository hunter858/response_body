'use strict';
// 定制推荐页面
import React,{component} from 'react' ;
import {Device,DeviceEvent,Host,Service} from 'miot';
import {
  APPBAR_HEIGHT,APPBAR_MARGINBOTTOM,APPBAR_MARGINTOP,isIPX ,
  ratio,NavigatorBarHeight,screenWidth,screenHeight} from '../ConstDefine';
import {XimalayaSDK,XMReqType} from '../Const/XimalayaSDK';
import Constants from '../../Main/Constants';
import InterestCommonBtn from '../View/InterestCommonBtn';
import NoWifiView from '../View/NoWifiView';
import LoadingView from '../View/LoadingView';



import {
  Image,
  FlatList,
  ListView,
  TouchableHighlight,
  StyleSheet,
  Text,
  PixelRatio,
  View,
  ActionSheetIOS,
  TouchableWithoutFeedback,
  LayoutAnimation,
  DeviceEventEmitter,
  TouchableOpacity,
} from 'react-native';

/*
  type: 0--首次推荐  1-－更改定制推荐 2-－省市切换
*/


class Interest extends React.Component{

    constructor(props){
      super(props);

      var params = this.props.navigation.state.params;
      var dataSource = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
      this.state = {
        loaded: false,
        dataSource: dataSource,
        type:params.type,
        province_code:params.province_code,
      }
      this.selectedCategories = [];
      this.savedCategories = [];
      this.province_code = 0;
    }

    componentWillMount() {

   
      var self = this;
      if(this.state.type == 0) {
          //根据id获取专辑信息
        XimalayaSDK.requestXMData(XMReqType.XMReqType_CategoriesList, {}, (result, error) => {

            if(!error) {

              result.push({
                category_name: 'hidden'
              });

              result.push({
                category_name: 'hidden'
              });

              this.setState({
                loaded: true,
                dataSource:this.state.dataSource.cloneWithRows(result),
              });

            } else {
              this.componentWillMount();
            }
        });
      } 
      else if(this.state.type == 1) {

        //根据id获取专辑信息
        XimalayaSDK.requestXMData(XMReqType.XMReqType_CategoriesList, {}, (result, error) => {

            if(!error) {

              result.push({
                category_name: 'hidden'
              });

              result.push({
                category_name: 'hidden'
              });

              Host.file.readFile(Service.account.ID + '===' + Device.deviceID).then((content)=>{


                    if(content!=''){
                      var datas = JSON.parse(content);
                      for(var i=0; i<datas.length; i++) {

                        this.savedCategories.push(datas[i]);
                      }
                    }
                    self.setState({
                      loaded: true,
                      dataSource:this.state.dataSource.cloneWithRows(result),
                    });
              });

            } else{
              this.componentWillMount();
            }
        });

      }
      else if(this.state.type ==2 ) {

        this.province_code = this.state.province_code;
        XimalayaSDK.requestXMData(XMReqType.XMReqType_LiveProvince, {}, (result, error) => {
              if(!error) {

                        result.push({
                          category_name: 'hidden'
                        });

                        result.push({
                          category_name: 'hidden'
                        });

                        this.setState({
                            loaded: true,
                            dataSource:this.state.dataSource.cloneWithRows(result),
                        });


              } else {
                this.componentWillMount();
              }
        });

      }

    }

    componentDidMount(){
      // 添加监听器
      // 不用subscription定义
      this.subscription = DeviceEventEmitter.addListener('InterestRightBtnPress',(notification) => {
          ActionSheetIOS.showActionSheetWithOptions({
            options: ['定时关闭', '特色闹铃', '取消'],
            cancelButtonIndex: 2,
            title: Constants.Channels.sheetTitle(),
          },
          (buttonIndex) => {
             this.sheetBtnHandler(buttonIndex);
          });
      });
    }

    // 移除监听
    componentWillUnmount(){
       this.subscription.remove();
    }

    sheetBtnHandler(index){
      if (index == 0) {

        this.props.navigation.navigate('TimerSetting', {
          title:'定时关闭',
        });

      } 
      else if(index == 1){

        this.props.navigation.navigate('ClockSetting', {
          title:'特色闹铃',
        });
      }

    }


    _cellPressHandler (selected, rowData){


       if(this.state.type == 2) {

          this.province_code = rowData.province_code;
          DeviceEventEmitter.emit('provinceChangeEvent', {data : {

              province_code: rowData.province_code,
              province_name: rowData.province_name,
          }});
          this.props.navigation.pop();
          return;
       }

        var index = -1;
        //检查是否已经存在
        for (var i=0; i<this.selectedCategories.length; i++) {
          var tmp = this.selectedCategories[i];
          if (tmp.id == rowData.id) {
            index = i;
            break;
          }
        }

        if(index >= 0) {
          this.selectedCategories.splice(index, 1);
        } else {
          this.selectedCategories.push(rowData);
        }

        if(this.selectedCategories.length == 0) {
            this.listenBtn.setDisabled();
        } else {
            this.listenBtn.setEnabled();
        }
    }

    _goToRecommend() {

      var value = Service.account.ID + '===' + Device.deviceID;
      const DeviceInfo ='DeviceInfo';

      Host.storage.get(DeviceInfo).then((info) => {
        
        var recommended = false;
        var value = Service.account.ID + '===' + Device.deviceID;    //可能有多台设备
        if(info && info.recommends != undefined){
           for(var i=0; i<info.recommends.length; i++) {

              if(info.recommends[i] == value) {
                recommended = true;
                break;
              }

           }
          if(!recommended) {
              info.recommends.push(value);
              Host.storage.set(DeviceInfo,info);
          }
        }else {
          Host.storage.set(DeviceInfo,{recommends:[value]});
        }


      }).catch(error=>{
        console.log('error-257-'+JSON.stringify(error));
      });


      if(this.selectedCategories.length >0) {

            //   console.log('selectedCategories###########' + JSON.stringify(this.selectedCategories));
            // 将信息写入到收音机中
            Host.file.writeFile(Service.account.ID + '===' + Device.deviceID, "" + JSON.stringify(this.selectedCategories)).then((success)=>{

                if(success) {

                    // 如果是更改定制推荐
                    if(this.state.type == 1) {
                      // 发送通知RecommondChangeEvent
                      DeviceEventEmitter.emit('RecommondChangeEvent', {});
                      this.props.navigation.pop();
                      return;
                    }

                    this.props.navigation.navigate('FindProgram', {
                      title:'找节目',
                    });

                }
            });

      }

    }

    _renderRow(rowData) {

        if(rowData.category_name == 'hidden') {
          return <View style={styles.btnStyle}/>
        }

        if(this.state.type == 2) {

          var selected = false;
          if(this.province_code == rowData.province_code) {
            selected = true;
          }

          return(
              <InterestCommonBtn 
                onPress={this._cellPressHandler.bind(this)}
                unselectText={rowData.province_name}
                selectText={rowData.province_name}
                data={rowData}
                selected={selected}
                style={styles.btnStyle}/>
          );
        }

        var selected = false;
        if(this.state.type == 1) {

          for(var i=0; i<this.savedCategories.length; i++) {
            var tmp = this.savedCategories[i];
            if(tmp.id == rowData.id){
                selected = true;
                this.selectedCategories.push(rowData);
            }
          }
        }
        return (
            <InterestCommonBtn 
              onPress={this._cellPressHandler.bind(this)}
              unselectText={rowData.category_name}
              selectText={rowData.category_name}
              data={rowData}
              selected={selected}
              style={styles.btnStyle}/>
        );

    }

    render() {

        if(this.state.netInfo == 'none' || this.state.netInfo == 'unknown'){
            return <NoWifiView />
        }
        if(!this.state.loaded) {
          return <LoadingView style={{flex:1}}/>
        }
        var enabled = false;
        if(this.state.type == 1) {
          enabled = true;
        }

        var bottomBtn = null;
        if(this.state.type < 2) {
          bottomBtn = (
              <View style={styles.bottom}>
                  <InterestCommonBtn 
                    ref = {(btn) => {this.listenBtn= btn}}
                    onPress={()=>{this._goToRecommend()}}
                    unselectText='去收听'
                    selectText='去收听'
                    unselectColor={Constants.TintColor.navBar}
                    unselectPressColor={Constants.TintColor.navBar}
                    unselectTextColor='white'
                    selectTextColor='white'
                    selected={true}
                    enabled={enabled}
                    style={styles.listenBtn}/>
            </View>
          );
        }

        return(
            <View  style={{paddingTop:0, flex:1}}>
                  <View style={styles.top}>
                   <ListView
                      initialListSize={50}
                      automaticallyAdjustContentInsets={false}
                      showsVerticalScrollIndicator={false}
                      renderRow={this._renderRow.bind(this)}
                      dataSource={this.state.dataSource}
                      contentContainerStyle={styles.scrollView} />
                  </View>
                  {bottomBtn}
            </View>
        );

    }

}


var styles = StyleSheet.create({
   btnStyle :{
    borderRadius:5,
    height:35,
    width: (screenWidth - 59) / 3,
    marginBottom:12,
  },
  listenBtn:{
    height:41,
    borderRadius:6,
  },
  text:{
    fontSize:14,
    color:Constants.TextColor.rgb255,
    opacity: 0.9,
  },
   btnText:{
    fontSize:12,
    color:Constants.TextColor.rgb0,
  },
  textContainer :{
    justifyContent:'center',
    alignItems:'center',
    borderRadius:5,
    height:41,
    width:351,
    backgroundColor: Constants.TintColor.navBar,
  },
  scrollView:{
    justifyContent: 'space-between',
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: 15,
    paddingBottom: 85,
    paddingRight: 18,
    paddingLeft: 18,
  },
  top:{
    flex:1,
  },
  bottom:{
    position:'absolute',
    paddingLeft:15,
    paddingRight:15,
    left:0,
    bottom:0,
    height: 73,
    width: screenWidth,
    backgroundColor:Constants.TintColor.rgb235,
    justifyContent:'center',
    alignItems:'stretch',
  },
});

module.exports = Interest;
