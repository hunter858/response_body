'use strict';

// 推荐页面
import React,{component} from 'react' ;
import {Device,DeviceEvent,Host,Package,Service} from 'miot';
import {
  APPBAR_HEIGHT,APPBAR_MARGINBOTTOM,APPBAR_MARGINTOP,isIPX ,
  ratio,NavigatorBarHeight,screenWidth,screenHeight} from '../ConstDefine';
import Constants from '../Constants';
import {XimalayaSDK,XMReqType} from '../Const/XimalayaSDK';
import CommonCell from '../View/CommonCell';
import Swiper from 'react-native-swiper';
import {withNavigation} from 'react-navigation';

import LoadingView from '../View/LoadingView'
import FailView from '../View/FailView'



import {
  Image,
  ListView,
  TouchableHighlight,
  StyleSheet,
  Text,
  PixelRatio,
  View,
  DeviceEventEmitter,
  TouchableWithoutFeedback,
  LayoutAnimation,
  ScrollView,
  ProgressViewIOS,
  TouchableOpacity,
  TextInput,
} from 'react-native';

class Recommend extends React.Component{


  constructor(props){
    super(props);
    this.state =  {
        dataSource: [],
        loaded: false,
        failed: false,
        categoriesLoaded: false,
        oldSectionDatas: [],
        newSectionDatas: [],
        tmpArray: [],
        contentOffsetTmp: 0,
        queryStr:'',
        showQuery: false,
        xmError:false,
    }

  }

  componentWillMount() {
    
    this.errorInfo='';//接口错误信息
    this.i = 0;
    this._sectionDatas=[];
    this._hotAlbums=[];
    this._radioFavorPrograms=[];
    this.loadRadioChannels();
}

  componentDidMount(){

  

    // 检测ChannelsChangeEvent的事件
    // 借用DeviceEventEmitter的事件侦听处理机制，在A、与B页面的ComponentDidMount时，添加侦听器，在ComponentWillUnmount时删除侦听器
    // 是类似于通知传值得实现方式
     this.subscription2 = DeviceEventEmitter.addListener('ChannelsChangeEvent', (event) => {
      Device.getDeviceWifi().callMethod("get_channels",{"all":0}).then((result)=>{

          const channels = result.result.chs;
          if(channels!= undefined) {
            this._radioFavorPrograms = channels;
          }
      }).catch(error=>{
        console.log('error-74 -'+JSON.stringify(error));
      });
    });

    // 更改定制推荐的实行
	  this.subscription = DeviceEventEmitter.addListener('RecommondChangeEvent', (event) => {

	  		this.setState({
	  			loaded:false,
          failed:false,
	  			dataSource:[],
	  		});

        // 生命周期方法可以主动调用
        this.componentWillMount();
    });
  }

  // 页面退出的时候从DOM中移除，pop的时候会移除，push的时候不会
  componentWillUnmount(){

		this.subscription.remove();
    this.subscription2.remove();
	}

  loadRadioChannels() {

    // 从设备中读出已经收听的分类

    Device.getDeviceWifi().callMethod("get_channels",{"all":0}).then((result)=>{

        const channels = result.result.chs;
        if(channels != undefined){
            this._radioFavorPrograms= channels;
            this.loadHotAlbums();
        }
        else {

          Host.file.readFile(Service.account.ID + '===' + Device.deviceID + 'cacheDataSource').then((content) => {

             if (content != null) {
                if(content!=''){
                  var dataCache = JSON.parse(content);
                  this._radioFavorPrograms=dataCache._dataBlob.s1;
                  this.loadHotAlbums();
                }else{

                  this._radioFavorPrograms= [];
                  this.loadHotAlbums();
                }

             }
             else{
               this._radioFavorPrograms= [];
               this.loadHotAlbums();
             }
           });
           
        }
    }).catch(error=>{
      this.setState({failed:true,loaded: true});
      console.log('error-135 -'+JSON.stringify(error));
    });
  }

  // 推荐页面加载分类下面的几个专辑
  loadHotAlbums(){
    // 读出来的是存储在小米收音机中的分类
    Host.file.readFile(Service.account.ID + '===' + Device.deviceID).then((content)=>{

      if(content != '') {
            this._sectionDatas = JSON.parse(content);
            // 如果小于三个还是加载原数组
            if (this._sectionDatas.length <= 3) {
                //  console.log('数组个数小于三个的时候调用');
                this.loadHeadAlbum(this._sectionDatas);
            }
            else {

                // 如果分类个数大于三个，取出前三个，放入新的数组，第一次的时候只加载三个
                this.state.newSectionDatas = [];
                for (var i = 0; i < 3; i++) {
                  this.state.newSectionDatas.push(this._sectionDatas[i]);
                  //  console.log('!!!!!!!!!!!新的数组保存三个数据' + JSON.stringify(this.state.newSectionDatas));
                }
                this.loadHeadAlbum(this.state.newSectionDatas);
                // 将后面数据放入一个新数组
                for (var i = 3; i < this._sectionDatas.length; i++) {
                  this.state.oldSectionDatas.push(this._sectionDatas[i]);
                  //  console.log('!!!!!!!!!!!原有的数据提出来放到后面' + JSON.stringify(this.state.oldSectionDatas));
                }
          }

      }
      else {
        
        var array=[];
        var firstProgram={};
        firstProgram.id=2;
        firstProgram.category_name='音乐';
        var secondProgram={};
        secondProgram.id=12;
        secondProgram.category_name='相声评书';
        array.push(firstProgram);
        array.push(secondProgram);
        this._sectionDatas=array;
        //保存到文件中
        Host.file.writeFile(Service.account.ID + '===' + Device.deviceID, "" + JSON.stringify(this._sectionDatas))
        .then((success)=>{});
        this.loadHeadAlbum(array);
        //没有推荐就默认推荐两个
      }
    });
  }

  // 加载热门专辑方法
  loadHeadAlbum(albumArray) {


    // 遍历数组，获取推荐
    for(var i=0; i<albumArray.length; i++) {

         //获取推荐数组
         var tmp = albumArray[i];

         // 获取分类id和count
         var params={
           category_id: tmp.id,
           display_count:3,
         };
        
        // 根据分类取下面的四个热门专辑的四个cell
        XimalayaSDK.requestXMData(XMReqType.XMReqType_CategoryRecommendAlbums, params, (result, error) => {
             // 从喜马拉雅获取推荐的分类列表
             // 如果没有错误，将获取到数组添加到热门专辑中
             if(!error) {

                  this.i = 0;
                  this._hotAlbums.push(result[0]);

                  // 在全部遍历完了之后统一进行setState
                  // 开始显示一个singleView上的内容，listView上有4个cell
                  // 又解析又render比较耗时
                  this.setState({
                       failed: false,
                       loaded: true,
                       xmError:false,
                       dataSource: this._hotAlbums,
                  });
             } else {

                if(error&&error.error_no&&error.error_desc){
                  this.errorInfo='error_no:'+JSON.stringify(error.error_no)+'  '+JSON.stringify(error.error_desc);
                  this.state.xmError=true;
                }
                 if(this.i > 3) {
                       this.i = 0;
                       this.setState({
                            failed: true,
                            loaded: true,
                       });
                 } 
                 else {
                   this.i++;
                   this.loadHotAlbums();
                 }
             }

        });

    }
  }


  //跳转至专辑列表也
  onRowPress(albumData, favored) {

    Device.getDeviceWifi().callMethod("get_channels",{"all":0}).then((result)=>{
        
      const channels = result.result.chs;
        if(channels != undefined){
          var isfavored = false;
          var chs = channels;
          for(var k=0; k<chs.length; k++){
            var tmp = chs[k];
            if(tmp.id == albumData.id && tmp.t == 1){
              isfavored = true;
              break;
            }
          }

        this.props.navigation.navigate('AlbumPage', {
            albumInfo: albumData,
            favored: isfavored,
            isFromFind: true,
            title: albumData.album_title,
        });
      }


    }).catch(error=>{
      console.log('error-289 -'+JSON.stringify(error));
    });

  }


  _rendSeparator(rowData, sectionID, rowID, highlightRow) {
    return (<View key={rowID+sectionID} style={styles.separator} />);
  }


  _rendRow(rowData) {

    // ListView默认一次是把所有的cell加载出来
      var favored = false;

      for(var i=0; i<this._radioFavorPrograms.length; i++) {
        var tmp = this._radioFavorPrograms[i];
        if(tmp.type==1){
          if(tmp.albumInfo&&tmp.albumInfo.id == rowData.id){
            favored = true;
            break;
          }
        }else{
          if(tmp.radioInfo&&tmp.radioInfo.id == rowData.id){
            favored = true;
            break;
          }
        }
      }

      return (
           <CommonCell
              key={rowData.id}
              dataId={rowData.id}
              onRowPress={this.onRowPress.bind(this,rowData, favored)}
              thumbSource={rowData.cover_url_small}
              text1={rowData.album_title}
              text2={rowData.album_intro}
              text3={''+rowData.play_count}
              favored={favored}/>
      );
  }

  //查看更多专辑
  showMore(id, name){


    this.props.navigation.navigate('AlbumsInSomeCategory', {
        categoryId : id,
        categoryName: name,
        title:name,
    });


  }

  // 渲染一个单独的listView
  _renderSingleList(data, index) {

    // 减去临时数组的数据
    this.state.tmpArray = [];

    // 打印传进的参数data和index
    // console.log('正在渲染一个singleView' + JSON.stringify(data) + '所在的索引位置' + index);

      if(data.albums.length <= 0) {
        return null;
      }
      var txt='';
      for(var i=0; i<this._sectionDatas.length; i++) {
              //获取推荐
          var tmp = this._sectionDatas[i];
          if(tmp.id == data.category_id) {
            txt += tmp.category_name;
          }
      }

      var marginTop = 20;
      if(index == 0) marginTop = 0;


      return(
          <View key={index}>
             <View style={[styles.sectionHeader, {marginTop:marginTop}]}>
                <Text style={{color:'#282325',fontSize:Constants.FontSize.fs30,fontWeight:'bold',marginLeft:22 }}>{txt}</Text>
             </View>
             <ListView
              scrollEnabled={false}
              automaticallyAdjustContentInsets={false}
              dataSource={new ListView.DataSource({rowHasChanged:(r1, r2) => true}).cloneWithRows(data.albums)}
              renderSeparator={this._rendSeparator.bind(this)}
              renderRow={this._rendRow.bind(this)} />
             <View  style={styles.footer}>
               <MoreBtn2 style={styles.footerBtn} text='查看全部' onPress={()=>{this.showMore(data.category_id, txt)}}/>
             </View>
         </View>

      );
  }


  _getSectionData(dataBlob, sectionID){

      return dataBlob.category_id;
  }

  _getRowData(dataBlob, sectionID, rowID){
      return dataBlob.albums[rowID];
  }


  _footerBtnPress(){

    this.props.navigation.navigate('Interest', {
      type: 1,
      title: '定制推荐',
    });

  }

  _bannerPressed(){
        
    var albumInfo ={};
    albumInfo.id=232404;
    albumInfo.play_count='16792518';
    albumInfo.album_title="叶蓝怀旧经典";
    albumInfo.album_intro="怀旧老歌，用歌声回忆从前。";
    albumInfo.cover_url_middle="http://fdfs.xmcdn.com/group3/M03/B7/67/wKgDslLKR9KQHKQ2AAgpq7a1ZLg529_mobile_meduim.jpg";
    albumInfo.include_track_count='417';

    //跳转到专辑页面
    this.props.navigation.navigate('AlbumPage', {
      title:albumInfo.album_title,  
      albumInfo: albumInfo,
      favored: true,
    });
  }

  onChangeText(text){

    if(text.length > 30 && this.input){
        //  MHPluginSDK.showFailTips('您输入的字符数量已达上限');
        text = text.substring(0,30);
        this.input.setNativeProps({text: text});
    }


    if(text != '' && this.state.queryStr != ''){
        this.state.queryStr=text;
         
    } else {
        this.state.queryStr=text;
    }
  }

  onSubmitEditing(){
    //跳转到搜索页面
    this.props.navigation.navigate('SearchPage', {
        queryStr:this.state.queryStr,//需要查询的内容
        showQuery: true,
        title: '搜索',
    });
    this.input.setNativeProps({text: ''});
  }

  render(){

    if (!this.state.loaded) {
      return (<LoadingView style={{flex:1}}/>)
    }

    if(this.state.xmError) {
      return(
        <View style={{flex:1}}>
            <FailView
                onPress={this.componentWillMount.bind(this,0)}
                style={{flex:1, paddingBottom:65}} text1={this.errorInfo}
                text2='页面加载错误,请双击Home键清空后台重试' />
        </View>
      );
    }

    if(this.state.failed) {
        return(
        <View style={{flex:1}}>
              <FailView
                onPress={this.componentWillMount.bind(this,0)}
                style={{flex:1, paddingBottom:65}} text1='糟糕 发生错误了'
                text2='点击屏幕重试' />
        </View>
        );
    }


    // 数组中推荐变了，对整个数组遍历获得一个新的view
    var all = this.state.dataSource; //所有的推荐

    var search=(
        <View style={styles.top}>
              <View style={styles.topContainer}>
                  <Image  style={styles.queryImg} resizeMode='stretch'/>
                  <TextInput  style={styles.input}
                              ref = {(input) => {this.input= input}}
                              multiline={false}
                              placeholder='搜索专辑，电台'
                              clearButtonMode='while-editing'
                              enablesReturnKeyAutomatically={true}
                              returnKeyType='search'
                              autoFocus = {false}
                              onFocus={this.onFocus}
                              maxLength={30}
                              onSubmitEditing={()=>{this.onSubmitEditing()}}
                              onChangeText={(value)=>{this.onChangeText(value)}}/>
              </View>
        </View>);
    var banner=(<Swiper height={240}
          autoplay={true}
          onMomentumScrollEnd={(e, state, context) => console.log('index:', state.index)}
          dot={<View style={{backgroundColor:'#000' , width: 5, height: 5, borderRadius: 4, marginLeft: 3, marginRight: 3, marginTop: 3, marginBottom: 3}} />}
          activeDot={<View style={{backgroundColor:'rgba(255,255,255,.8)' , width: 5, height: 5, borderRadius: 4, marginLeft: 3, marginRight: 3, marginTop: 3, marginBottom: 3}} />}
          paginationStyle={{
            bottom: 6,alignItems:'center'
          }} loop={true}>
          <TouchableWithoutFeedback onPress={()=>{this._bannerPressed()}}>
            <View style={styles.slide} title={<Text numberOfLines={1}></Text>}>
              <Image resizeMode='stretch' style={styles.image} source={require('../../Resources/banner.png')} />
            </View>
          </TouchableWithoutFeedback>
        </Swiper>);


    return (
      <View style={{flex:1}}>
        <ScrollView
          scrollEventThrottle = {16}
          onScroll = {(element)=>{this._onScroll(element)}}
          contentContainerStyle={styles.scrollView}
          automaticallyAdjustContentInsets={false} >
          {search}
          {banner}
          {all.map((data, i) => this._renderSingleList(data, i))}
          <View  style={styles.bottomBtn}>
              <MoreBtn2 style={styles.footerBtn} text='定制推荐' onPress={()=>{this._footerBtnPress()}}/>
          </View>
        </ScrollView>
        </View>
    )
  }

  // 滚动事件的监听
  _onScroll  (scrollView) {

    // 滚动的时候，如果当前页面有没有加载完的，那么就在下滑的过程中加载
    if (!this.state.categoriesLoaded) {
      if (contentOffsetY >= contentSizeHeight - 460) {
       
      }
    }

    var contentOffsetY = scrollView.nativeEvent.contentOffset.y;
    var contentSizeHeight = scrollView.nativeEvent.contentSize.height;

    // 只有向下滑动的时候进行渲染
    if (contentOffsetY >= this.state.contentOffsetTmp && this.state.loaded) {


      // 如果还有没有加载完的，在下滑的过程中加载
      if (this.state.oldSectionDatas.length > 0) {

        // 如果剩余数组中没有东西，直接加载
        if (this.state.tmpArray.length == 0) {
          this.state.tmpArray.push(this.state.oldSectionDatas[0]);
          this.state.oldSectionDatas.shift();
          this.loadHeadAlbum(this.state.tmpArray);
        }

        
      } else {
        console.log('所有的分类都已经加载完成');
      }
    }


  }

}


class MoreBtn2 extends React.Component{

  render () {
    return (
      <TouchableOpacity onPress={this.props.onPress}>
              <View style={[this.props.style, {flexDirection:'row', justifyContent:'center', alignItems:'center'}]}>
                  <Text style={{fontSize:13,color:'rgb(0,0,0)'}}>{this.props.text}</Text>
              </View>
      </TouchableOpacity>
    );
  }
}

var styles = StyleSheet.create({

  btnContainerStyle:{
    position:'absolute',
    right:10,
    top:0,
    width:75,
    height:82,
  },
  top:{
    height: 48,
    flexDirection: 'row',
    alignItems:'center',
    justifyContent:'space-between',
    paddingLeft: 13,
    paddingRight: 13,
  },
  statusBtn:{
    width:60,
    height:24,
  },
   cell:{
      flexDirection:'row',
      height:82,
      backgroundColor:Constants.TintColor.rgb255,
      alignItems:'center',
   },
   thumb_shadow:{
      height: 65,
      width: 65,
      alignItems:'center',
      justifyContent:'center',
      margin:8,
      marginLeft:10,
      backgroundColor:'transparent',
   },
   thumb:{
    height:63,
    width:63,
    alignSelf:'center',
    backgroundColor:'transparent',
  },
  rowTextDesc:{
    flexDirection:'column',
    alignItems:'flex-start',
    width:180,
  },
  rowTextTop:{
    marginTop:9,
    color:'rgb(88,88,88)',
    fontSize:Constants.FontSize.fs30,
  },
  rowTextCenter:{
    marginTop:9,
    color:'rgb(163,163,163)',
    height:14,
    fontSize:Constants.FontSize.fs25,
  },
  rowTextBottom:{
    marginTop:9,
    color:'rgb(184,184,184)',
    fontSize:Constants.FontSize.fs20,
  },
  scrollView:{
    backgroundColor:Constants.TintColor.rgb235,
  },
  separator:{
    height:1/PixelRatio.get(),
    marginLeft:12,
    backgroundColor:'rgba(0,0,0,.1)',
  },
  sectionHeader:{
     marginTop:20,
     flexDirection:'row',
     height:44,
     alignItems:'center',
     justifyContent:'flex-start',
     backgroundColor:'#f8f8f8',
  },
  header_img:{
    marginLeft:12,
    height:10,
    width:10,
  },
   header_img2:{
    marginLeft:9,
    height:11,
    width:15,
  },
  header_text: {
     color: Constants.TextColor.rgb184,
     marginLeft:8,
  },
  header_more:{
    position: 'absolute',
    width:40,
    height:40,
    right:15,
  },
   footer:{
      height:39,
  },
  footerBtn:{
    alignSelf:'stretch',
    height:45,
    backgroundColor:Constants.TintColor.rgb255,
  },
   bottomBtn:{
    height:250,
    paddingTop:15,
    paddingLeft:11,
    paddingRight:11,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'transparent'
  },
  image: {
    width:screenWidth,
    flex: 1
  },
  topContainer:{
    flex:1,
    alignItems:'center',
    backgroundColor:'white',
    flexDirection:'row',
    height:28,
    borderRadius:14,
    paddingLeft:8,
    paddingRight:10,
  },
  input:{
    flex:1,
    fontSize:13,
    color:'rgb(127,127,127)',
  },
});

export default withNavigation(Recommend);
