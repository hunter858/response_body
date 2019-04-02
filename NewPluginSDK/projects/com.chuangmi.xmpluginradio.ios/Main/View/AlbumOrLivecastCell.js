// 专辑 或者 直播 的row cell

'use strict';

import React,{component} from 'react' ;
import {API_LEVEL,Device,DeviceEvent,Host,Package,Service} from 'miot';
import Constants from '../../Main/Constants';


import {
	ImageBackground,
  ListView,
  TouchableHighlight,
  StyleSheet,
  Text,
  PixelRatio,
  View,
  ActionSheetIOS,
  TouchableWithoutFeedback,
  LayoutAnimation,
  DeviceEventEmitter,
}from 'react-native';

var THUMB_SIZE = 65; // 缩略图大小
var PLAY_THUMB_SIZE = 10; //直播缩略图中间的播放按钮大小
var TRACK_DESC_HEIGHT = 13;				//   缩略图底部专辑曲目数量描述的高度
var TRACK_DESC_COLOR = 'lightGray';
var MARGIN = 8;
var CELL_HEIGHT = MARGIN * 2 + THUMB_SIZE;// CELL高度


//长按时，展示的选中按钮
class Selector extends React.Component{

	constructor(props){
		super(props);
		this.state={
			selected:false,
		}
	}

	toggleSelectState() {

		this.setState({selected: !this.state.selected,});
	}

	componentWillMount(){

		if(this.props.selected) {
			this.setState({selected: true});
		}

	}


	render() {

		var imageName = '';
		if (this.state.selected) {
			imageName = require('../../Resources/btn_Selected.png');
		} else {
			imageName = require('../../Resources/btn_UnSelected.png');
		}

		return (
				<View>
					<ImageBackground style={styles.selectImage} source={imageName} resizeMode='stretch'/>
				</View>
		);
	}

}

class Thumb extends React.Component{

	constructor(props){
		super(props);
		this.state = {
			source: '',
			fuck: true,
		}
	}

	componentWillMount(){

		this.setState({
			source: this.props.thumbSource,
		});
	}

	setThumbSource (source) {
		if(this.state.source != source) {
			this.setState({
				source:  source,
				fuck: !this.state.fuck,
			});
		}

	}

	render() {

		var trackElement = null;
		var text = '共' + this.props.trackText + '集';

		if (this.props.showTrack) {

			trackElement = (
				<View style={styles.tracKDesc}>
					<Text style={styles.trackDescText}>{text}</Text>
				</View>
			);
		}


		if(this.state.fuck) {
				return (

					<ImageBackground style={styles.thumbShadow} source={require('../../Resources/holder_small.png')} resizeMode='stretch'>
						<ImageBackground style={styles.thumb} source={{uri:this.state.source}}>
							{trackElement}
						</ImageBackground>
					</ImageBackground>

				);
		} else {
				return (
					<View style={[styles.thumbShadow, {justifyContent:'center', alignItems:'center'}]}>
						<ImageBackground style={styles.thumb} source={require('../../Resources/holder_small.png')} resizeMode='stretch'>
							<ImageBackground style={styles.thumb} source={{uri:this.state.source}}>
								{trackElement}
							</ImageBackground>
						</ImageBackground>
					</View>
				);

		}

	}

}

 
var styles = StyleSheet.create({
	thumbShadow:{
		height: 60,
		width: 60,
    borderRadius:5,
		alignItems:'center',
		justifyContent:'center',
		marginLeft:12,
	},
	thumb:{
		height:60,
		width:60,
    borderRadius:5,
		alignSelf:'center',
		backgroundColor:'transparent',
	},
	rowTextDesc:{
		flex:1,
		alignSelf:'stretch',
		flexDirection:'column',
		paddingRight: 30,
    paddingLeft:15,
	},
	rowTextDescTitle:{
		marginTop:21.5,
		color:'#333333',
		fontSize:Constants.FontSize.fs30,
	},
	rowTextDescTrack:{
		marginTop:10,
		color:'rgba(0,0,0,.6)',
		fontSize:13,
	},
	rowTextDescProgress:{
		marginTop:8,
		color:Constants.TextColor.rgb153,
		fontSize:Constants.FontSize.fs20,
	},
	tracKDesc:{
		height:13,
		width:63,
		position:'absolute',
		backgroundColor:Constants.TintColor.rgb0,
		opacity:0.6,
		bottom:0,
		alignItems:'center',
		justifyContent:'center',
	},
	trackDescText:{
		color:Constants.TextColor.rgb255,
		fontSize:Constants.FontSize.fs17,
	},
	selectImage:{
		marginLeft: 20,
		marginRight:13,
		width:29,
		height:29,
	},
  sortImage:{
    marginLeft: 20,
    marginRight:13,
    width:33,
    height:33,
  },
	rowContainer:{
		flexDirection:'row',
		alignItems:'center',
    height:80,
	},
	listenProgress:{
		color:Constants.TextColor.black,
		fontSize:Constants.FontSize.small,
	},
	selector: {
		width:20,
		height:20,
		borderWidth:1,
		borderRadius:10,
		justifyContent:'center',
		alignSelf:'center',
		marginRight:MARGIN,
	}
});

export default class  AlbumOrLiveCastCell extends React.Component{

  	_rowPressHandler(index){

  		//编辑状态
  		if (this.props.editing) {

  			this.refs.rowSelector.toggleSelectState();
  			this.props.toggleRowSelectStatus(this.props.rowData);

  		} else {
				this.props.rowPressHandler(this.props.rowData,index);
  		}

  	}

  	componentWillReceiveProps(nextProps) {

  		if(nextProps) {

  				var isAlbum = (nextProps.rowData.type == 0 ? false : true);
			    var smallThumbSource = null;
		    	if(!isAlbum ) {

		    		 smallThumbSource = nextProps.rowData.radioInfo.cover_url_small;

		    	} else if (isAlbum ) {
            if(nextProps.rowData.type==Constants.Channels_Type.M3U8_TYPE){
              smallThumbSource = nextProps.rowData.radioInfo.cover_url_small;
            }else{
              smallThumbSource = nextProps.rowData.albumInfo.cover_url_small;
            }
		    	}

		    	if(this.thumbI) {
		    		this.thumbI.setThumbSource(smallThumbSource);
		    	}

  		}

  	}

    componentWillMount(){
		}
		
    render() {

			/*
					type: 1,
						albumInfo: albumInfo,
						trackInfo: result.tracks[0],
						trackProgress: 0,

					type: 0,
						radioInfo: radioInfo,
						startTime: xprogram.start_time,
						endTime: xprogram.end_time,

			*/

      //m3u8
      if(this.props.rowData.type==Constants.Channels_Type.M3U8_TYPE){
        var selected = this.props.longPressRow == this.props.rowData.radioInfo.id ? true : false;
        var selector = this.props.editing ? <Selector ref='rowSelector' selected={selected}/> : null;
        return(

      		<TouchableHighlight style={{backgroundColor: Constants.TintColor.rgb255}} underlayColor={Constants.TintColor.rgb255} onLongPress={this.props.longPressHandler} onPress={()=>{this._rowPressHandler()}}>
      			<View style={styles.rowContainer}>
      				{selector}
              <ImageBackground style={styles.thumbShadow} source={require('../../Resources/m3u8_cover.png')} resizeMode='stretch'>
    					</ImageBackground>
      				<View style={styles.rowTextDesc}>
      					<Text style={styles.rowTextDescTitle} numberOfLines={1}>{this.props.rowData.radioInfo.radio_name}</Text>
      				</View>
      			</View>
      		</TouchableHighlight>
      	);
      }

    	var isAlbum = (this.props.rowData.type == 0 ? false : true);


    	var id = null;
    	var program = null;
    	var smallThumbSource = null;
    	var name = null;
    	var progress; //

    	if(!isAlbum ) {

    		 id = this.props.rowData.radioInfo.id;
    		 name = this.props.rowData.radioInfo.radio_name;
    		 program = this.props.rowData.radioInfo.program_name + ' 直播中';
    		 if(this.props.rowData.radioInfo.program_name == ''||this.props.rowData.radioInfo.program_name == undefined) {
    		 	program = '暂无节目单';
    		 }
    		 smallThumbSource = this.props.rowData.radioInfo.cover_url_small;

    		 if(name&&name.length > 14) {
    			name = name.substr(0, 14) + '...';
	    	}

	    	if(this.props.rowData.startTime != '00:00') {
    		 	progress = <Text style={styles.rowTextDescProgress}>直播时间 {this.props.rowData.startTime} - {this.props.rowData.endTime}</Text>
	    	} else {
	    		progress = <Text style={styles.rowTextDescProgress}>{'累计收听 ' + this.props.rowData.radioInfo.radio_play_count}</Text>
	    	}
    	} else if (isAlbum ) {
    		id = this.props.rowData.albumInfo.id;
    		name = this.props.rowData.albumInfo.album_title;
    		smallThumbSource = this.props.rowData.albumInfo.cover_url_small;
    		var text = this.props.rowData.trackInfo.track_title;
    		// program ='第' + (this.props.rowData.trackInfo.order_num+1) + '集   ' + text;
        program =text;
    		if(name&&name.length > 14) {
    			name = name.substr(0, 14) + '...';
	    	}

	    	if(text.length > 14) {
	    		text = text.substr(0, 14) + '...';
	    	}

    		var tmpStr;
        // 没有获取到收听进度
        // console.log('单行的播放进度' + JSON.stringify(this.props.rowData));
    		if (this.props.rowData.trackProgress != 0) {


    			progress = (
    				<Text style={styles.rowTextDescProgress} numberOfLines={1}>收听进度 <Text style={{color:'rgb(31,215,208)'}}>{Constants.DateUtils.transformProgress(this.props.rowData.trackProgress)}</Text> / {Constants.DateUtils.transformProgress(this.props.rowData.trackInfo.duration)}</Text>
    			);
    		} else {
    			progress = (
    				<Text style={styles.rowTextDescProgress} numberOfLines={1}>未收听</Text>
    			);
    		}
    	}

	    var selected = this.props.longPressRow == id ? true : false;
    	var selector = this.props.editing ? <Selector ref='rowSelector' selected={selected}/> : null;

      if(isAlbum&&name==''&&program==''){//点播节目已下架
          return(
            <TouchableHighlight style={{backgroundColor: Constants.TintColor.rgb255}} underlayColor={Constants.TintColor.rgb255} onLongPress={this.props.longPressHandler} onPress={()=>{this._rowPressHandler(1)}}>
              <View style={styles.rowContainer}>
                {selector}
                <Thumb ref={(component) => {this.thumbI = component}} showTrack={false} thumbSource={''}  trackText={this.props.rowData.albumInfo && this.props.rowData.albumInfo.include_track_count}/>
                <View style={styles.rowTextDesc}>
                  <Text style={styles.rowTextDescTitle} numberOfLines={1}>很遗憾,该点播节目已下架</Text>
                  <Text style={styles.rowTextDescTrack} numberOfLines={1}></Text>
                </View>
              </View>
            </TouchableHighlight>
          );
      }else if(!isAlbum&&name==''&&program=='暂无节目单'){//直播节目已下架)
        return(
          <TouchableHighlight style={{backgroundColor: Constants.TintColor.rgb255}} underlayColor={Constants.TintColor.rgb255} onLongPress={this.props.longPressHandler} onPress={()=>{this._rowPressHandler(1)}}>
            <View style={styles.rowContainer}>
              {selector}
              <Thumb ref={(component) => {this.thumbI = component}} showTrack={false} thumbSource={''}  trackText={this.props.rowData.albumInfo && this.props.rowData.albumInfo.include_track_count} />
              <View style={styles.rowTextDesc}>
                <Text style={styles.rowTextDescTitle} numberOfLines={1}>很遗憾,该直播节目已下架</Text>
                <Text style={styles.rowTextDescTrack} numberOfLines={1}></Text>
              </View>
            </View>
          </TouchableHighlight>
        );
      }else {
        return(

          <TouchableHighlight style={{backgroundColor: Constants.TintColor.rgb255}} underlayColor={Constants.TintColor.rgb255} onLongPress={this.props.longPressHandler} onPress={()=>{this._rowPressHandler(0)}}>
            <View style={styles.rowContainer}>
              {selector}
              <Thumb ref={(component) => {this.thumbI = component}} showTrack={false} thumbSource={smallThumbSource}  trackText={this.props.rowData.albumInfo && this.props.rowData.albumInfo.include_track_count}/>
              <View style={styles.rowTextDesc}>
                <Text style={styles.rowTextDescTitle} numberOfLines={1}>{name}</Text>
                <Text style={styles.rowTextDescTrack} numberOfLines={1}>{program}</Text>
              </View>
            </View>
          </TouchableHighlight>
        );
      }
    }
}
