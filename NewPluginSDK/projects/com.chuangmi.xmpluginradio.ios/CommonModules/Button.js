/**
 * 通用的Button控件
 *
 * 引用：var Button = require('../CommonModules/Button');
 *
 * 使用演示示例：
 * <Button onPress={this._handlePress} title="测试"
 *   imageNormal="RemoteControlInfo/remote_home_normal.png" imageHighlight="RemoteControlInfo/remote_home_pressed.png"
 *   imageWidth={64} imageHeight={64} titleSize={14}/>
 *
 * 参数说明：
 * title：按钮显示名称，可以省略
 * imageNormal：按钮显示图片，可以省略
 * imageHighlight：按钮显示高亮图片，可以省略
 * imageWidth：按钮显示图片宽度，可以省略，默认54
 * imageHeight：按钮显示图片高度，可以省略，默认54
 * titleSize：按钮显示名称文字大小，可以省略，默认14
 */
 'use strict';

import React,{Component} from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
  Image,
  ImageBackground,
} from 'react-native';

var systemButtonOpacity = 0.2;

export default class Button extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          ...TouchableHighlight.propTypes,
          disabled: PropTypes.bool,
          style: Text.propTypes.style,
          imageName: this.props.imageNormal,
          titleClor:this.props.titleClor,
          imageWidth: 54,
          imageHeight: 54,
          titleSize: 14,
        };
    }

    componentDidMount() {
        if (this.props.imageWidth>0) {
          this.setState({imageWidth: this.props.imageWidth });
        }
        if (this.props.imageHeight>0) {
          this.setState({imageHeight: this.props.imageHeight });
        }

        if (this.props.titleSize>0) {
          this.setState({titleSize: this.props.titleSize });
        }
    }

    componentWillUnmount() {
    }

    render() {
        var viewProps = {
          style: ([styles.base, this.props.style]: ?Array<any>),
        };
        var touchableProps = viewProps;
//{
          // activeOpacity: this._computeActiveOpacity(),
      //  };
        var opacityValue = this.props.opacityValue;

        // 按钮不可用
        if (this.props.enabled == false) {
            touchableProps = {};
            opacityValue = 0.4;
        } else {
            var that = this;
            touchableProps.onPress = this.props.onPress;
            touchableProps.onPressIn = function() {
              if(that.props.imageHighlight!=null){
                that.setState({imageName: that.props.imageHighlight });
              }
            };
            touchableProps.onPressOut = function() {
              if(that.props.imageHighlight!=null){
                that.setState({imageName: that.props.imageNormal});
              }
            };
            touchableProps.onLongPress = this.props.onLongPress;

            opacityValue = 1.0;
        }

        if (this.props.title!=null) {
            return (
              <View {...viewProps}>
                <TouchableHighlight {...touchableProps} underlayColor={this.props.highlightColor ? this.props.highlightColor : "transparent"} style={[{opacity: opacityValue,alignSelf: 'center'}]}>
                  <ImageBackground style={[styles.image, {width: this.state.imageWidth, height: this.state.imageHeight}]} source={this.state.imageName}>
                         </ImageBackground>
                </TouchableHighlight>
                <Text style={[styles.text, {fontSize: this.state.titleSize, color:this.state.titleClor,opacity: opacityValue}]}>{this.props.title}</Text>
              </View>
            );
        } else {
            return (
                <TouchableHighlight {...touchableProps} underlayColor={this.props.highlightColor ? this.props.highlightColor : "transparent"} style={[{opacity: opacityValue,alignSelf: 'center'}]}>
                  <ImageBackground style={[styles.image, {width: this.state.imageWidth, height: this.state.imageHeight}]}
                         source={this.state.imageName}>
                      {this._renderGroupedChildren()}
                  </ImageBackground>
                </TouchableHighlight>
            );
        }

    }

    _renderGroupedChildren() {

      return(
        <View style={styles.group}>
        <Text style={[styles.text, {color:this.state.titleClor}, this.props.style]}></Text>
        </View>
      )
    }

}

var styles = StyleSheet.create({
  text: {
    alignSelf: 'center',
    color: '#000000',
    marginTop: 13,
  },

  disabledText: {
    color: '#dcdcdc',
  },

  group: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  image: {
    alignSelf: 'center',
  },

});