'use strict';

import React from 'react';
import {
  StyleSheet,
  Text,
  ListView,
  View,
  Image,
  TouchableHighlight,
  Component,
  StatusBar,
  PixelRatio,
  ActionSheetIOS,
} from 'react-native';
import { Host, DeviceEvent ,Device} from "miot";
import { TitleBarBlack } from 'miot/ui';
import {LocalizedStrings} from '../../Main/MHLocalizableString';


export default class MoreMenu extends React.Component {

  constructor(props,context){
    super(props,context);


    var ds = new ListView.DataSource({
      rowHasChanged: (r1, r2)=>r1!==r2,
      sectionHeaderHasChanged: (s1, s2) => s1 !== s2
    });
    this._createMenuData();
    this.state = {
      dataSource: ds.cloneWithRowsAndSections(this._menuData),
      title:Device.name,
    };

    var self = this;
    var eventHandler = function(event){

        var ds = new ListView.DataSource({
          rowHasChanged: (r1, r2)=>r1!==r2,
          sectionHeaderHasChanged: (s1, s2) => s1 !== s2
        });
        self.setState ( {
          dataSource: ds.cloneWithRowsAndSections(this._menuData),
          title:event.name
        });
    }.bind(this);
    this._deviceNameChangedListener = DeviceEvent.deviceNameChanged.addListener(eventHandler);

  }

  _createMenuData(){
    var commonMenuData = [];
    var featureMenuData = [];
    var resetMenuData = [];
      // this.props.navigation.title

      var currentTitle  = this.props.navigation.state.params.title; 
      commonMenuData = [
        {
          'name':LocalizedStrings.deviceName,
          'subtitle':Device.name,
          'func': () => {
            Host.ui.openChangeDeviceName();
          }
        },
        {
          'name':LocalizedStrings.locationManagement,
          'func': () => {
            Host.ui.openRoomManagementPage();
          }
        },
        {
          'name': LocalizedStrings.shareDevice,
          'func': () => {
            Host.ui.openShareListBar('小米智能家庭', '小米智能家庭', { uri: 'https://avatars3.githubusercontent.com/u/13726966?s=40&v=4' }, 'https://iot.mi.com/new/index.html');
          }
        },
        {
          'name': LocalizedStrings.ifttt,
          'func': () => {
            Host.ui.openIftttAutoPage();
          }
        },
        {
          'name': LocalizedStrings.firmwareUpgrate,
          'func': () => {
            Host.ui.openDeviceUpgradePage();
          }
        },
        {
          'name': LocalizedStrings.feedback,
          'func': () => {
            Host.ui.openHelpPage();
          }
        },
        {
          'name': LocalizedStrings.addToDesktop,
          'func': () => {
            Host.ui.openAddToDesktopPage();
          }
        },
        {
          'name': LocalizedStrings.licenseAndPolicy,
          'func': () => {
              Host.ui.privacyAndProtocolReview("license","https://www.baidu.com","privacy","https://www.baidu.com");
          }
        },

      ];

      featureMenuData = [
        {
          'name': LocalizedStrings.ios_sting_5,
          'func': () => {
            this.props.navigation.navigate('LedSetting',{'title':LocalizedStrings.ios_sting_5});
          }
        }
      ];

      resetMenuData = [
        {
          'name': LocalizedStrings.resetDevice,
          'func': () => {
            Host.ui.openDeleteDevice();
          }
        },
      ];

    var featureSetting = LocalizedStrings.featureSetting;
    var commonSetting = LocalizedStrings.commonSetting;
    this._menuData = {};
    this._menuData[featureSetting] = featureMenuData;
    this._menuData[commonSetting] = commonMenuData;
    this._menuData[""] = resetMenuData;
  }


  componentDidMount(){
    var self = this;
    this.deviceTimeZonelistenter = DeviceEvent.deviceTimeZoneChanged.addListener((val)=>{
      console.log("deviceTimeZoneChanged", val);
    });
  }

  componentWillUnmount() {
    this._deviceNameChangedListener.remove();
    this.deviceTimeZonelistenter.remove();
  }

  render() {
    return (
      <View style={styles.container}>
        <ListView style={styles.list} dataSource={this.state.dataSource} renderRow={this._renderRow.bind(this)} renderSectionHeader={this._renderSectionHeader.bind(this)}/>
      </View>
    );
  }

  _renderSectionHeader(sectionData,sectionID){
    return (
      <View>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>{sectionID}</Text>
        </View>
      </View>
    );
  }

  _renderRow(rowData, sectionID, rowID) {

    if (sectionID != '') {
      return (
        <TouchableHighlight  onPress={() => this._pressRow(sectionID,rowID)}>
          <View style={{backgroundColor:'#ffffff'}}>
            <View style={styles.rowContainer}>
              <Text style={styles.title}>{rowData.name}</Text>
              {
                <Text style= {styles.subtitle}>{(rowData&&(rowData.subtitle))?(Device.name):(rowData.subtitle)}</Text>
              }
              <Image style={styles.subArrow} source={require('../../Resources/sub_arrow.png')} />
            </View>
            <View style={rowID != this._menuData[sectionID].length - 1?styles.separator:{}}></View>
          </View>
        </TouchableHighlight>
      );
    }else {
      return (
        <TouchableHighlight  onPress={() => this._pressRow(sectionID,rowID)}>
          <View style={{backgroundColor:'#ffffff'}}>
            <View style={styles.rowContainer}>
              <Text style={styles.reset}>{rowData.name}</Text>
            </View>
          </View>
        </TouchableHighlight>
      );
    }

  }
  _pressRow(sectionID,rowID) {

    this._menuData[sectionID][rowID].func();
  }

};

var styles = StyleSheet.create({
  container: {
    flex: 1,
    borderTopColor: '#f1f1f1',
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgb(244,244,244)',
    marginBottom: 0,
    marginTop: 0,
  },
  rowContainer: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    flex: 1,
    backgroundColor:'#ffffff',
    height:50,
    marginLeft:20,
    marginRight:20,
    alignItems:'center'
  },
  list: {
    alignSelf: 'stretch',
  },
  title: {
    fontSize: 16,
    flex: 1,
  },
  reset: {
    fontSize: 16,
    flex: 1,
    color:'rgb(251,0,0)',
    textAlign:'center'
  },
  subArrow: {
    width: 9,
    height: 18,
  },
  separator: {
    height: 1 / PixelRatio.get(),
    backgroundColor: '#e5e5e5',
    marginLeft: 20,
  },
  sectionHeader:{
    height: 30,
    backgroundColor: 'rgb(235,235,236)',
    justifyContent: 'center',
    marginLeft:0,
  },
  sectionHeaderText:{
    fontSize:14,
    marginLeft:10,
  },
  subtitle: {
    fontSize: 14,
    flex: 1,
    color:'rgb(138,138,138)',
    textAlign:"right",
    marginRight:5
  },
});
