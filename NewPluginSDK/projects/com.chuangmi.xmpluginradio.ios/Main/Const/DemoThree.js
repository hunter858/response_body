var React = require('react-native');
var {
  Image,
  ListView,
  TouchableHighlight,
  StyleSheet,
  Text,
  View,
} = React;

class ElementView extends React.Component{
  render(){
    return(
    <View>
        <Text></Text>
    </View>);
  }
}


class CheckLink extends React.Component{
  render(){
    // 这样会把 CheckList 所有的 props 复制到 <aElementView>
    return <ElementView {...this.props}>{'props内容拼接'}{this.props.children}</ElementView>;
  }
}