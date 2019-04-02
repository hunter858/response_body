'use strict';

var React = require('react-native');
var MHPluginSDK = require('NativeModules').MHPluginSDK;

var {
  PixelRatio,
  View,
  Image,
  TouchableOpacity,
} = React;



var StatusButtonWithImg = React.createClass({

     getDefaultProps: function() {
        return {
          initialStatus: false,
          // fontSize:23,
          // borderRadius: 5,
          //
          // unselectedViewBackgroundColor: 'white',
          // selectedViewBackgroundColor:'white',
          // selectedTextColor:'white',
          // unselectedTextColor:'black',
          // borderColor:'black',
          onPress:{},
        };
    },

    getInitialState:function(){
      return{
        selected: false,
      }
    },


    _onPress: function() {



        // this.setState({

        //   selected: !this.state.selected,

        // });


       this.props.onPress(!this.state.selected);

    },


    componentWillMount: function() {

      this.setState({

          selected: this.props.initialStatus,

      });

    },

  componentWillReceiveProps: function(nextProps) {
    if(this.state.selected != nextProps.initialStatus){
      this.setState({
         selected: nextProps.initialStatus,
      });
    }
  },

    render: function() {

      var imgUri;
      var img;
      if(this.state.selected) {
          // imgUri=this.props.selectedImg;
          // img=require('../Resources/col_btn_selected@2x.png');
          img={isStatic:!MHPluginSDK.devMode,uri:MHPluginSDK.basePath+this.props.selectedImg};

      } else {
        // img=require('../Resources/col_btn@2x.png');

        // imgUri=this.props.unSelectedImg;
        img={isStatic:!MHPluginSDK.devMode,uri:MHPluginSDK.basePath+this.props.unSelectedImg};

      }
      // var img=require('../Resources/'+imgUri);
      return (

             <TouchableOpacity onPress={this._onPress} style={this.props.containerStyle} activeOpacity={0.5}>
               <View style={[{justifyContent:'center', alignItems:'center', flex:1}]}>
                      {/* <Image style={{width:15,height:13,marginRight:20}} source={{uri:MHPluginSDK.basePath+imgUri}}></Image> */}
                      <Image style={{width:25/3,height:44/3,}} source={img}></Image>

                      {/* <Image style={{width:15,height:13,marginRight:20}} source={img}></Image> */}

                </View>
              </TouchableOpacity>

      );
    }

});

module.exports = StatusButtonWithImg;
