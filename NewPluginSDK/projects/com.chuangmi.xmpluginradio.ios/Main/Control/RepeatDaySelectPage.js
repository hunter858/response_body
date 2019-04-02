'use strict';

import React,{component} from 'react' ;
import Constants from '../../Main/Constants';
import { TitleBarBlack,TitleBarWhite,LoadingDialog } from 'miot/ui';
import {
  APPBAR_HEIGHT,APPBAR_MARGINBOTTOM,APPBAR_MARGINTOP,isIPX ,
  ratio,NavigatorBarHeight,screenWidth,screenHeight} from '../ConstDefine';
import {
  Image,
  TouchableHighlight,
  StyleSheet,
  Text,
  View,
  PixelRatio,
  DeviceEventEmitter,
} from 'react-native';


class RepeatDaySelectPage extends React.Component{

	static navigationOptions = ({ navigation }) => {
			return {
			header:
					<View>
					<TitleBarWhite
							title={navigation.state["params"] ? navigation.state.params.title : Device.name}
							style={{ backgroundColor:'#805e5f' }}
							onPressLeft={() => {
									navigation.pop();
							}}
							rightText="保存"
							onPressRight={() => {
								DeviceEventEmitter.emit('SaveRepeatDay', {});
							}}/>
					</View>
			};
	};

	componentWillMount(){

		this.repeates =[false,false,false,false,false,false,false];

		var repeates = 	this.props.navigation.state.params.repeates;
		var k = JSON.parse(repeates);
		if(k.length == 7) {
			this.repeates = k;
		} else {
			this.repeates = [false,false,false,false,false,false,false];
		}
	}

	componentDidMount(){
      this.subscription = DeviceEventEmitter.addListener('SaveRepeatDay',(notification) => {
          DeviceEventEmitter.emit('RepeatDaySaved', {data: {repeates: this.repeates}});
          this.props.navigation.pop();
      });
  }

	componentWillUnmount(){
			this.subscription.remove();
	}

	onPress(index, selected){
		this.repeates[index-1] = selected;
	}

	render(){
		return (
			<View style={{flex:1, paddingTop:0, backgroundColor:Constants.TintColor.rgb235}}>
				<View style={styles.separator} />
				<TouchView onPress={this.onPress.bind(this)} text='每周一' index={1} selected={this.repeates[0]}/>
				<View style={styles.separator} />
				<TouchView onPress={this.onPress.bind(this)} text='每周二' index={2} selected={this.repeates[1]}/>
				<View style={styles.separator} />
				<TouchView onPress={this.onPress.bind(this)} text='每周三' index={3} selected={this.repeates[2]}/>
				<View style={styles.separator} />
				<TouchView onPress={this.onPress.bind(this)} text='每周四' index={4} selected={this.repeates[3]}/>
				<View style={styles.separator} />
				<TouchView onPress={this.onPress.bind(this)} text='每周五' index={5} selected={this.repeates[4]}/>
				<View style={styles.separator} />
				<TouchView onPress={this.onPress.bind(this)} text='每周六' index={6} selected={this.repeates[5]}/>
				<View style={styles.separator} />
				<TouchView onPress={this.onPress.bind(this)} text='每周日' index={7} selected={this.repeates[6]}/>
				<View style={styles.separator} />
			</View>
		);
	}
}

class TouchView extends React.Component{

	constructor(props){
	  super(props);
		this.state = {
			selected: false,
		}
  }

	componentWillMount(){
		this.setState({
			selected: this.props.selected,
		});
	}

	_onPress(){

		this.props.onPress(this.props.index, !this.state.selected);

		this.setState({
			selected: !this.state.selected,
		});
	}

	render(){

	  var imgView = null;
	  if(this.state.selected){
	  	imgView = (<Image style={styles.image}  resizeMode='stretch' source={require('../../Resources/checkMask.png')}/>);
	  }

	  return (
			<TouchableHighlight onPress={()=>{this._onPress()}}>
				<View style={styles.container}>
					<Text style={styles.text}>{this.props.text}</Text>
					{imgView}
				</View>
			</TouchableHighlight>
		);
	}
}


var styles = StyleSheet.create({

	container:{
		height: 44,
		backgroundColor:'white',
		paddingLeft:15,
		paddingRight:15,
		flexDirection:'row',
		justifyContent:'space-between',
		alignItems:'center'
	},
	text:{
		fontSize: 15,
		color:'rgb(51,51,51)',
	},
	text2:{
		position:'absolute',
		top:15,
		right:80,
		fontSize: 13,
		color:'rgb(130,130,130)',
	},
	image: {
		width:15,
		height:15,
	},
	separator: {
		height:1/PixelRatio.get(),
	},
});

module.exports = RepeatDaySelectPage;
