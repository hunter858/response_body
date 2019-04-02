'use strict';

import React from 'React';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  PixelRatio,
} from 'react-native';

var deviceWidth = Dimensions.get('window').width;
import Constants from'../../Main/Constants';
import PropTypes from 'prop-types';

var styles = StyleSheet.create({
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:'#805e5f',
  },
  tabs: {
    height: 44,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems:'center',
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderBottomColor: '#c6c6c6',
    backgroundColor:Constants.TintColor.navBar,
  },
});

var propTypes = {
  goToPage: PropTypes.func,
  activeTab: PropTypes.number,
  tabs: PropTypes.array
}

class CustomeTabBar extends React.Component{



  renderTabOption(name, page) {
    var isTabActive = this.props.activeTab === page;

    return (
      <TouchableOpacity style={[styles.tab]} key={name} onPress={() => this.props.goToPage(page)}>
        <View style={styles.tab}>
           <Text style={{color: isTabActive ? 'rgb(255,255,255)' : 'rgba(255,255,255,0.4)', fontWeight: isTabActive ? 'bold' : 'normal'}}>{name}</Text>
        </View>
      </TouchableOpacity>
    );
  }
  
  static propTypes = propTypes;

  render() {
    var numberOfTabs = this.props.tabs.length;
    var tabUnderlineStyle = {
      position: 'absolute',
      width: (deviceWidth / numberOfTabs),
      height: 0,//底部横线高度为0
      backgroundColor: Constants.TintColor.tabBarColor,
      bottom: 0,
    };

    var left = this.props.scrollValue.interpolate({
      inputRange: [0, 1], outputRange: [0, deviceWidth / numberOfTabs]
    });

    return (
      <View style={styles.tabs}>
        {this.props.tabs.map((tab, i) => this.renderTabOption(tab, i))}
        <Animated.View style={[tabUnderlineStyle]} />
      </View>
    );
  }
}

module.exports = CustomeTabBar;
