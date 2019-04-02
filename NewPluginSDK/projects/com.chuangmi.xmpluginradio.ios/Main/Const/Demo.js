var React = require('react-native');
var {
  Image,
  ListView,
  TouchableHighlight,
  StyleSheet,
  Text,
  View,
} = React;

var DemoPage = React.createClass({

  propTypes: {
    params1:React.PropTypes.object,
    params2:React.PropTypes.bool,
    params3:React.PropTypes.func,
    params4:React.PropTypes.number,
  },
  getDefaultProps() {
      return {
      params1:'Default_one',
      params2:'Default_two',
      params3:'Default_three',
      params4:'Default_four',
      };
  },
  getInitialState() {
      return {
        params1:'one',
        params2:'two',
        params3:'three',
        params4:'four',
    }
  },
  componentWillMount: function() {

  },
  componentDidMount: function(){

  },
  componentWillUnmount: function(){

  },
  attributeOne:10,
  attributeTwo:[],

  /* 这两个一般在方法里通过this调用 比如（ this.attributeOne ）*/
  render:function(){

    return(
    <View style={{flex:1,backgroundColor:'#ffffff'}}>
      <Text>{this.state.params1}</Text>
      <Text>{this.state.params2}</Text>
      <Text>{this.state.params3}</Text>
      <Text>{this.state.params4}</Text>
    </View>)
  },
  loadData: function(){
    /*
    获取数据等一堆操作
    */
  },

});

module.exports = DemoPage;