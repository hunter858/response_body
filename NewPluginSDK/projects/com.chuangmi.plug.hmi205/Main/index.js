/**
 * The examples provided by Facebook are for non-commercial testing and
 * evaluation purposes only.
 *
 * Facebook reserves all rights not expressly granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NON INFRINGEMENT. IN NO EVENT SHALL
 * FACEBOOK BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN
 * AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
'use strict';

import React from 'react';

import {
  View, Text, AppRegistry, Button,
  TouchableHighlight,
  TouchableOpacity,
  Platform,
  Dimensions,
  Animated,
  StyleSheet,
  PixelRatio,
  DeviceEventEmitter,
  Image,
} from 'react-native';
import { Package, Entrance, PackageEvent } from "miot";
import { createStackNavigator } from 'react-navigation';
import ImageCapInsetDemo from './ImageCapInsetDemo' // working but no title displayed
import { TitleBarBlack,TitleBarWhite } from 'miot/ui';
import MoreMenu from './Control/MoreMenu';
import NewPlugMainPage from './Control/NewPlugMainPage';
import NewPowerPage from './Control/NewPowerPage';
import NewUsbPage from './Control/NewUsbPage';
import NewPowerCostPage from './Control/NewPowerCostPage';
import PowerCostPage from './Control/PowerCostPage';
import LedSetting from './Control/LedSetting';
import SceneMain from './SceneMain';

/*入口*/
import MainPage from './Control/MainPage';
import MainLaunchPage from './Control/MainLaunchPage';
import PlugMainPageHMI202B02 from './Control/PlugMainPageHMI202B02';
import PlugMainPageHMI202C from './Control/PlugMainPageHMI202C';
import PlugMainPageHMI205 from './Control/PlugMainPageHMI205';
import PlugMainPageHMI206 from './Control/PlugMainPageHMI206';

/*demo*/
import AnimateViewPage from './Control/AnimateViewPage';



function jumpRootIndex() {

  var RootControl;
  if(Package.models=='chuangmi.plug.v3'){          /*米家智能插座增强版*/
    RootControl = MainLaunchPage;
    // RootControl = PlugMainPageHMI202B02;
    // RootControl = PlugMainPageHMI202C;
    // RootControl = PlugMainPageHMI205;
    // RootControl = PlugMainPageHMI206;
    
  }else if(Package.models=='chuangmi.plug.m1'){    /*米家智能插座基础版*/
    RootControl = MainPage;

  }else if(Package.models=='chuangmi.plug.v1'){    /*小米智能插座*/
    RootControl = MainPage;

  }else if(Package.models=='chuangmi.plug.hmi205'){ /*小米智能插座基础版*/
    RootControl = PlugMainPageHMI205;

  }else if(Package.models=='chuangmi.plug.hmi206'){ /*小米智能插座分销版*/
    RootControl = PlugMainPageHMI206;

  }else if(Package.models=='chuangmi.plug.m3'){     /*小米米家智能插座WiFi版*/
    RootControl = MainPage;

  }else{
    RootControl = MainPage;
  }
  return RootControl;
}


const RootStack = createStackNavigator(
  {
    Home: jumpRootIndex(),
    SceneMain:SceneMain,
    MainPage:MainPage,
    PlugMainPageHMI202B02:PlugMainPageHMI202B02,
    PlugMainPageHMI202C:PlugMainPageHMI202C,
    PlugMainPageHMI205:PlugMainPageHMI205,
    PlugMainPageHMI206:PlugMainPageHMI206,
    moreMenu:MoreMenu,
    newPlugMainPage:NewPlugMainPage,
    PowerCostPage:PowerCostPage,
    NewPowerPage:NewPowerPage,
    NewUsbPage:NewUsbPage,
    NewPowerCostPage:NewPowerCostPage,
    LedSetting:LedSetting,
    ImageCapInsetDemo: ImageCapInsetDemo,
  },
  {
    // ThirdPartyDemo
    initialRouteName: 'Home',
    navigationOptions: ({ navigation }) => {
      return {
        header: <TitleBarBlack title={navigation.state.params ? navigation.state.params.title : ''} style={{ backgroundColor: '#fff' }}
          onPressLeft={() => {
            navigation.goBack();
          }} />,
      };
    },
  }
);
export default class App extends React.Component {
  render() {
    return <RootStack />;
  }

}
