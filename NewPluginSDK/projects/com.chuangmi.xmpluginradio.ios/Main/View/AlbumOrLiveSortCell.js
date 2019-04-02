// 排序 （专辑 或者 直播 的row cell）

'use strict';

import React,{component} from 'react' ;
import Constants from '../../Main/Constants';

import {
  Image,
  ListView,
  TouchableHighlight,
  StyleSheet,
  Text,
  PixelRatio,
  View,
  TouchableWithoutFeedback,
  LayoutAnimation,
  DeviceEventEmitter,
} from 'react-native';

var THUMB_SIZE = 65; // 缩略图大小
var PLAY_THUMB_SIZE = 10; //直播缩略图中间的播放按钮大小
var TRACK_DESC_HEIGHT = 13;				//   缩略图底部专辑曲目数量描述的高度
var TRACK_DESC_COLOR = 'lightGray';
var MARGIN = 8;
var CELL_HEIGHT = MARGIN * 2 + THUMB_SIZE;// CELL高度


class Thumb extends React.Component{

	constructor(props){
		super(props);
		this.state =  {
			source:this.props.thumbSource?this.props.thumbSource: '',
			fuck: true,
		};
		
	}

	componentWillMount(){
	}


	setThumbSource(source) {
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

					<Image style={styles.thumbShadow} source={require('../../Resources/holder_small.png')} resizeMode='stretch'>
						<Image style={styles.thumb} source={{uri: this.state.source}}>
							{trackElement}
						</Image>
					</Image>

				);
		} else {
				return (
					<View style={[styles.thumbShadow, {justifyContent:'center', alignItems:'center'}]}>
						<Image style={styles.thumb} source={require('../../Resources/holder_small.png')} resizeMode='stretch'>
							<Image style={styles.thumb} source={{uri: this.state.source}}>
								{trackElement}
							</Image>
						</Image>
					</View>
				);

		}

	}

}







class AlbumOrLiveSortCell extends React.Component{

  	_rowPressHandler() {

      

  	}

  	sheetBtnHandler(index){
  		

  	}



  	componentWillReceiveProps(nextProps) {

  		if(nextProps) {

  				var isAlbum = (nextProps.rowData.type == 0 ? false : true);
			    var smallThumbSource = null;
		    	if(!isAlbum ) {

		    		 smallThumbSource = nextProps.rowData.radioInfo.cover_url_small;

		    	} else if (isAlbum ) {
		    		smallThumbSource = nextProps.rowData.albumInfo.cover_url_small;
		    	}

		    	if(this.thumbI) {
		    		this.thumbI.setThumbSource(smallThumbSource);
		    	}

  		}

  	}


    render() {

 

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
    		 if(this.props.rowData.radioInfo.program_name == '') {
    		 	program = '暂无节目单';
    		 }
    		 smallThumbSource = this.props.rowData.radioInfo.cover_url_small;

    		 if(name.length > 14) {
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
    		program ='第' + (this.props.rowData.trackInfo.order_num+1) + '集   ' + text;

    		if(name.length > 14) {
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

	    // var selected = this.props.longPressRow == id ? true : false;
    	// var selector = this.props.editing ? <Selector ref='rowSelector' selected={selected}/> : null;
      var sortIcon=this.props.editing ? <Image style={styles.sortImage} source={require('../../Resources/sort_btn.png')} resizeMode='stretch'/>:null;

    	return(

        <TouchableHighlight
        {...this.props.sortHandlers} style={{backgroundColor: Constants.TintColor.rgb255}} underlayColor={Constants.TintColor.rgb255} onLongPress={this.props.longPressHandler} onPress={()=>{this._rowPressHandler()}}>
    			<View style={styles.rowContainer}>
    				<Thumb ref={(component) => {this.thumbI = component}} showTrack={isAlbum} thumbSource={smallThumbSource}  trackText={this.props.rowData.albumInfo && this.props.rowData.albumInfo.include_track_count}/>
    				<View style={styles.rowTextDesc}>
    					<Text style={styles.rowTextDescTitle} numberOfLines={1}>{name}</Text>
    					<Text style={styles.rowTextDescTrack} numberOfLines={1}>{program}</Text>
    					{progress}
    				</View>
            {sortIcon}
    			</View>
    		</TouchableHighlight>

    	);
    }
}




var styles = StyleSheet.create({
	thumbShadow:{
		height: 65,
		width: 65,
		alignItems:'center',
		justifyContent:'center',
		margin:8,
		marginLeft:10,
	},
	thumb:{
		height:63,
		width:63,
		alignSelf:'center',
		backgroundColor:'transparent',
	},
	rowTextDesc:{
		flex:1,
		alignSelf:'stretch',
		flexDirection:'column',
		paddingRight: 30,
	},
	rowTextDescTitle:{
		marginTop:10,
		color:Constants.TextColor.rgb51,
		fontSize:Constants.FontSize.fs30,
	},
	rowTextDescTrack:{
		marginTop:8,
		color:Constants.TextColor.rgb127,
		fontSize:Constants.FontSize.fs25,
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
		width:19,
		height:19,
	},
	rowContainer:{
		flexDirection:'row',
		alignItems:'center',
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

module.exports = AlbumOrLiveSortCell;
