'use strict';

// 找节目界面
var React = require('react-native');
var ScrollableTabView = require('react-native-scrollable-tab-view');
var Dimensions = require('Dimensions').get('window');
var PageMixin = require('./PageMixin');
var Constants = require('./Constants');
var Carousel = require('react-native-carousel');
var subscription;
import TabNavigator from 'react-native-tab-navigator';

var {
  Image,
  ListView,
  TouchableHighlight,
  StyleSheet,
  Text,
  View,
  DeviceEventEmitter,
  TouchableWithoutFeedback,
  LayoutAnimation,
  ProgressViewIOS,
  TouchableOpacity,
} = React;


class CustomTabNavigator extends React.Component{

  render(){
    return (
    <TabNavigator>
          <TabNavigator.Item
            selected={true}
            title="Home"
            renderIcon={() => <Image/>}
            renderSelectedIcon={() => <Image/>}
            badgeText="1"
            onPress={() => this.setState({ selectedTab: 'home' })}>
            <Text>Home</Text>
          </TabNavigator.Item>
          <TabNavigator.Item
            selected={false}
            title="Profile"
            renderIcon={() => <Image/>}
            renderSelectedIcon={() => <Image/>}
            renderBadge={() => <View />}
            onPress={() => this.setState({ selectedTab: 'profile' })}>
            <Text>Profile</Text>
          </TabNavigator.Item>
    </TabNavigator>
)
  }

}

var styles = StyleSheet.create({
  controllerView:{
    paddingTop:65,
    height: Dimensions.height,
    width:Dimensions.width,
    backgroundColor:Constants.TintColor.rgb237,
    alignItems:'stretch'
  },

  scrollableTablView:{
    flex:1,
    paddingBottom:65,
    alignItems:'stretch'
  },

  bottomView:{
    position:'absolute',
    bottom:0,
    left:0,
    height: 65,
    width: Dimensions.width,
    backgroundColor:Constants.TintColor.transparent,
  },
  container: {
      width: Dimensions.width,
      height: Dimensions.height,
      marginTop:65,
      flex: 1,
      alignItems: 'stretch',
      backgroundColor: 'transparent',
    },
});


module.exports = CustomTabNavigator;
