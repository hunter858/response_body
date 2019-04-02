import React,{Component} from 'react';
import {
  StyleSheet,
  Dimensions,
  View,
  Text,
  Modal,
}  from 'react-native';;

var screenWidth = Dimensions.get('window').width;
var screenHeight = Dimensions.get('window').height;

export default class MessageToast extends React.Component{
  constructor(props) {
    super(props);
    this.state={
      isShowMessage:false,
      showMessage:undefined,
    };
  }

  render(){

      return(
        <Modal 
        animationType="slide"
        visible={this.state.isShowMessage}
        transparent={true}
        onRequestClose={()=>this.setState({modalVisible:false})} >
            <View style={styles.containerAll} >
                  <View style={styles.MessageView} >
                        <View style={styles.MessageContentView}>
                            <Text style={styles.MessageText}>{this.state.showMessage}</Text>
                        </View>
                  </View>
            </View>
        </Modal>
      );

  }

  /* 显示弹窗 */
  showMessage(message){
    if((message ==undefined) ||(message ==null)){
      return;
    }
    if(message.length<6){
      /* 过短-加宽处理*/
      message = '   '+message+'   ';
    }


    var self = this;
    this.toastTimer =  setTimeout(
      () =>  {
        this.setState({showMessage:message,isShowMessage:true})
      },
      0
    );
    this.toastTimer =  setTimeout(
      () =>  {
        this.setState({showMessage:'',isShowMessage:false})
      },
      1200
    );
  }

}

var styles = StyleSheet.create({

  containerAll:{
    flex:1,
    flexDirection:'column',
    width:screenWidth,
    height:screenHeight,
  },
  MessageView:{
    flex:1,
    width:screenWidth,
    height:screenHeight/3,
    marginTop:screenHeight*(2/3),
    marginBottom:0,
    justifyContent:'center',
    alignItems:'center',
    alignSelf:'center',
  },
  MessageContentView:{
    alignItems:'center',
    alignSelf:'center',
    padding:10,
    backgroundColor:'#25292e',
    borderRadius:3,    
  },
  MessageText:{
    color:'#ffffff',
    textAlign:'center',
    fontSize:15,
  },
});
