import React,{component} from 'react' ;
import {
  Image,
  ListView,
  TouchableHighlight,
  StyleSheet,
  Text,
  View,
} from 'react-native';

DemoPage.getDefaultProps = {
  params1:'Default_one',
  params2:'Default_two',
  params3:'Default_three',
  params4:'Default_four',
}

export default class DemoPage extends React.Component{

 static propTypes= {
    params1:React.PropTypes.object,
    params2:React.PropTypes.bool,
    params3:React.PropTypes.func,
    params4:React.PropTypes.number,
  }
  
  /*
  getInitialState 改成 constructor构造方法
  */
 constructor(props){
      super(props);
      this.state = {
        params1:'one',
        params2:'two',
        params3:'three',
        params4:'four',
      },
      this.attributeOne=10;
      this.attributeTwo=[];
  }
  componentWillMount() {

  }
  componentDidMount(){

  }
  componentWillUnmount(){

  }
  render(){

    return(
    <View style={{flex:1,backgroundColor:'#ffffff'}}>
      <Text>{this.state.params1}</Text>
      <Text>{this.state.params2}</Text>
      <Text>{this.state.params3}</Text>
      <Text>{this.state.params4}</Text>
    </View>)
  }

  loadData(){
    /*
    获取数据等一堆操作
    */
  }

}