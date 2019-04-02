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
import { TitleBarBlack,TitleBarWhite } from 'miot/ui';
import MoreMenu from './Control/MoreMenu';
import Setting from './Control/Setting';
import SceneMain from './SceneMain';

/*入口*/
import NewMainPage from './Control/NewMainPage';
import AlbumPage from './Control/AlbumPage';
// import Demo from './Control/Demo';

/*demo*/
import AnimateViewPage from './Control/AnimateViewPage';
import AlbumsInSomeCategory from './Control/AlbumsInSomeCategory';
import Interest from './Control/Interest';
import SearchPage from './Control/SearchPage';
import ClockSetting from './Control/ClockSetting';
import M3U8PlayerSetting from './Control/M3U8PlayerSetting';
import NewClockPage from './Control/NewClockPage';
import AboutPage from './Control/AboutPage';
import TimerSetting from './Control/TimerSetting';
import LightControlSetting from './Control/LightControlSetting';
import DefaultMainPage from './Control/DefaultMainPage';
import AudioControlSetting from './Control/AudioControlSetting';
import ClockSoundSelect from './Control/ClockSoundSelect';
import FindProgram from './Control/FindProgram';
import LightControlSettingList from './Control/LightControlSettingList';
import NewClockCloseTime from './Control/NewClockCloseTime';
import RadioTypes from './Control/RadioTypes';
import PlayPage from './Control/PlayPage';
import Yeelight from './Control/Yeelight';
import RepeatDaySelectPage from './Control/RepeatDaySelectPage';
import ToneEqualizerSetting from './Control/ToneEqualizerSetting';
import NewSortProgram from './Control/NewSortProgram';
import Demo from './Control/Demo';




const RootStack = createStackNavigator(
  {
    Home: NewMainPage,
    moreMenu:MoreMenu,
    Setting:Setting,
    NewSortProgram:NewSortProgram,
    Demo:Demo,
    DefaultMainPage:DefaultMainPage,
    AlbumPage:AlbumPage,
    AboutPage:AboutPage,
    SceneMain:SceneMain,
    AnimateViewPage:AnimateViewPage,
    AlbumsInSomeCategory:AlbumsInSomeCategory,
    Interest:Interest,
    SearchPage:SearchPage,
    ClockSetting:ClockSetting,
    M3U8PlayerSetting:M3U8PlayerSetting,
    NewClockPage:NewClockPage,
    TimerSetting:TimerSetting,
    LightControlSetting:LightControlSetting,
    AudioControlSetting:AudioControlSetting,
    ClockSoundSelect:ClockSoundSelect,
    FindProgram:FindProgram,
    LightControlSettingList:LightControlSettingList,
    NewClockCloseTime:NewClockCloseTime,
    PlayPage:PlayPage,
    Yeelight:Yeelight,
    RadioTypes:RadioTypes,
    RepeatDaySelectPage:RepeatDaySelectPage,
    ToneEqualizerSetting:ToneEqualizerSetting,

  },
  {

    initialRouteName: 'Home',
    navigationOptions: ({ navigation }) => {
      return {
        header: <TitleBarWhite title={navigation.state.params ? navigation.state.params.title : ''} style={{ backgroundColor: '#805e5f' }}
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
