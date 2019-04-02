'use strict';

import React from 'react';
import {
    Dimensions,
    StyleSheet,
    View,
    Image,
} from 'react-native';

var deviceWidth = Dimensions.get('window').width;
import PropTypes from 'prop-types';

class NewCustomeTabBar extends React.Component{
    
    render() {

        var oneImage = (this.props.activeTab==0)?(require('../../Resources/plug_press_point.png')):(require('../../Resources/plug_nor_point.png'));
        var twoImage = (this.props.activeTab==1)?(require('../../Resources/plug_press_point.png')):(require('../../Resources/plug_nor_point.png'));

        return (
            <View style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'transparent',
                height: 10,
                bottom: 25,
                position: 'absolute',
                width: deviceWidth
            }}>
                <Image style={{width: 14 / 3, height: 14 / 3, marginRight: 5}}
                       source={oneImage}></Image>
                <Image style={{width: 14 / 3, height: 14 / 3, marginLeft: 5}}
                       source={twoImage}></Image>
            </View>
        );
    }
}

NewCustomeTabBar.propTypes ={ 
    goToPage:PropTypes.func,
    activeTab:PropTypes.number,
    tabs:PropTypes.array,
};

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
});

module.exports = NewCustomeTabBar;