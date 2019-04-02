import React,{component} from 'react' ;
import {
  View,
  Animated,
  StyleSheet,
  ScrollView,
  Text,
  DeviceEventEmitter,
  Platform,
  Dimensions,
  ViewPropTypes,
  ListView,
} from 'react-native';
import Button  from '../View/Button';
import TitleButton from '../View/TitleButton';
import {XimalayaSDK,XMReqType}  from '../Const/XimalayaSDK';
import CommonBtn  from '../View/CommonBtn';
import PropTypes from 'prop-types';
import {Device,DeviceEvent,Host,Package,Service} from 'miot';
import {
  APPBAR_HEIGHT,APPBAR_MARGINBOTTOM,APPBAR_MARGINTOP,isIPX ,
  ratio,NavigatorBarHeight,screenWidth,screenHeight} from '../ConstDefine';
const WINDOW_WIDTH = Dimensions.get('window').width;


class ScrollableTabBar extends React.Component{

  static propTypes= {
    goToPage: PropTypes.func,
    activeTab: PropTypes.number,
    tabs:  PropTypes.array,
    backgroundColor:  PropTypes.string,
    activeTextColor:  PropTypes.string,
    inactiveTextColor:  PropTypes.string,
    scrollOffset:  PropTypes.number,
    style: ViewPropTypes.style,
    tabStyle: ViewPropTypes.style,
    tabsContainerStyle: ViewPropTypes.style,
    textStyle: Text.propTypes.style,
    renderTab:  PropTypes.func,
    underlineStyle: ViewPropTypes.style,
  }



  constructor(props){
    super(props);
    this._tabsMeasurements = [];
    var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

    this.state =  {
      _leftTabUnderline: new Animated.Value(0),
      _widthTabUnderline: new Animated.Value(0),
      _containerWidth:screenWidth,
      clicked:false,
      dataSource: ds,
    };
    this.province_code=0;
    this.provinceInfos=[];
  
  }

  componentWillMount(){
    //加载省市
    XimalayaSDK.requestXMData(XMReqType.XMReqType_LiveProvince, {}, (result, error) => {
      if(!error) {
        this.provinceInfos=JSON.parse(JSON.stringify(result));
        this.province_code=this.provinceInfos[0].province_code;
        this.setState({
        dataSource: this.state.dataSource.cloneWithRows(result),
        })
      }
    });
  }

  componentDidMount() {

  }


  necessarilyMeasurementsCompleted(position, isLastTab) {
    return this._tabsMeasurements[position] &&
      (isLastTab || this._tabsMeasurements[position + 1]) &&
      this._tabContainerMeasurements &&
      this._containerMeasurements;
  }

  updateTabPanel(position, pageOffset) {
    const containerWidth = this._containerMeasurements.width;
    const tabWidth = this._tabsMeasurements[position].width;
    const nextTabMeasurements = this._tabsMeasurements[position + 1];
    const nextTabWidth = nextTabMeasurements && nextTabMeasurements.width || 0;
    const tabOffset = this._tabsMeasurements[position].left;
    const absolutePageOffset = pageOffset * tabWidth;
    let newScrollX = tabOffset + absolutePageOffset;

    newScrollX -= (containerWidth - (1 - pageOffset) * tabWidth - pageOffset * nextTabWidth) / 2;
    newScrollX = newScrollX >= 0 ? newScrollX : 0;

    if (Platform.OS === 'android') {
      this._scrollView.scrollTo({x: newScrollX, y: 0, animated: false, });
    } else {
      const rightBoundScroll = this._tabContainerMeasurements.width - (this._containerMeasurements.width);
      newScrollX = newScrollX > rightBoundScroll ? rightBoundScroll : newScrollX;

      if(position==30){//最后一个省份需要多偏移50
        newScrollX=newScrollX+50;
      }
      this._scrollView.scrollTo({x: newScrollX, y: 0, animated: false, });
    }

  }

  updateTabUnderline(position, pageOffset, tabCount) {
    const lineLeft = this._tabsMeasurements[position].left;
    const lineRight = this._tabsMeasurements[position].right;

    if (position < tabCount - 1) {
      const nextTabLeft = this._tabsMeasurements[position + 1].left;
      const nextTabRight = this._tabsMeasurements[position + 1].right;

      const newLineLeft = (pageOffset * nextTabLeft + (1 - pageOffset) * lineLeft);
      const newLineRight = (pageOffset * nextTabRight + (1 - pageOffset) * lineRight);

      this.state._leftTabUnderline.setValue(newLineLeft);
      this.state._widthTabUnderline.setValue(newLineRight - newLineLeft);
    } else {
      this.state._leftTabUnderline.setValue(lineLeft);
      this.state._widthTabUnderline.setValue(lineRight - lineLeft);
    }
  }

  _btnOnPress(page,onPressHandler){

    // onPressHandler(page);
    this.province_code=this.provinceInfos[page].province_code;
    //定时器
    this.timer = setTimeout(() => {

       DeviceEventEmitter.emit('provinceChangeEvent', {
        province_code: this.provinceInfos[page].province_code,
        province_name: this.provinceInfos[page].province_name,
      });
    },
    200);

  }

  componentWillUnmount() {
     this.timer && clearTimeout(this.timer);
  }

  renderTab(name, page, isTabActive) {
    const { activeTextColor, inactiveTextColor, textStyle, } = this.props;
    const textColor = isTabActive ? activeTextColor : inactiveTextColor;
    const fontWeight = isTabActive ? 'bold' : 'normal';

    return <Button
      key={name +'_'+ page}
      accessible={true}
      accessibilityLabel={name}
      accessibilityTraits='button'
      onPress={()=>this._btnOnPress(page)}
    >
      <View style={[styles.tab, this.props.tabStyle]}>
        <Text style={[{color: textColor, fontWeight, }, textStyle, ]}>
          {name}
        </Text>
      </View>
    </Button>;
  }

  measureTab(event,page) {
    // const { x, width, height, } = event.nativeEvent.layout;
    // this._tabsMeasurements[page] = {left: x, right: x + width, width, height, };

  }

  _cellPressHandler (selected, rowData,rowID){
      //更新tabbar
      this.timer = setTimeout(() => {

        this.province_code = rowData.province_code;
         DeviceEventEmitter.emit('provinceChangeEvent', {
          province_code: rowData.province_code,
          province_name: rowData.province_name,
        });
        this.setState({clicked:false});

      },200);
  }


  _onPressed(){
    this.setState({
      clicked:!this.state.clicked,
      dataSource: this.state.dataSource,
    });
  }

  _renderRow(rowData, sectionID, rowID) {

     if(rowData.category_name == 'hidden') {
       return <View style={styles.btnStyle}/>
     }

    var selected = false;
    if(this.province_code == rowData.province_code) {
      selected = true;
    }

    return(
      <CommonBtn 
        onPress={()=>this._cellPressHandler(selected,rowData,rowID)}
        unselectText={rowData.province_name}
        selectText={rowData.province_name}
        selectColor={'#cd3f3f'}
        data={rowData}
        selected={selected}
        style={styles.btnStyle}/>
    );

  }

  render() {
    
    if(this.state.clicked){
      return (
        <View
        style={[styles.container, {backgroundColor: this.props.backgroundColor, }, this.props.style, ]}
        onLayout={(event)=>{this.onContainerLayout(event)}}>
            <ScrollView
              ref={(scrollView) => { this._scrollView = scrollView; }}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              directionalLockEnabled={true}
              bounces={false}
              scrollsToTop={false}>
                {
                  this.props.tabs.map((name, page) => {
                  const isTabActive = this.props.activeTab === page;
                  return this.renderTab(name, page, isTabActive);
                })
                }
            </ScrollView>
            <View style={[styles.tabs, {width: this.state._containerWidth,backgroundColor:'white',height:49,width:screenWidth-49}, ]}></View>
            <TitleButton onPress={()=>{this._onPressed()}} clicked={this.state.clicked} style={{height:49,width:49,position:'absolute',top:0,right:0}}/>
            <View  style={{backgroundColor:'#ffffff',top:49,width:screenWidth,height:350,position:'absolute'}}>
                <ListView
                  initialListSize={50}
                  automaticallyAdjustContentInsets={false}
                  showsVerticalScrollIndicator={false}
                  renderRow={this._renderRow.bind(this)}
                  dataSource={this.state.dataSource}
                  contentContainerStyle={styles.scrollView} />
            </View>
      </View>);
    }else{
      return(
      <View style={[styles.container, {backgroundColor: this.props.backgroundColor, }, this.props.style, ]} onLayout={(event)=>{this.onContainerLayout(event)}}>
        <ScrollView
          ref={(scrollView) => { this._scrollView = scrollView; }}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          directionalLockEnabled={true}
          bounces={false}
          scrollsToTop={false}>
            {this.props.tabs.map((name, page) => {
              const isTabActive = this.props.activeTab === page;
              return this.renderTab(name, page, isTabActive);
            })}
        </ScrollView>
        <TitleButton onPress={()=>{this._onPressed()}} clicked={this.state.clicked} style={{height:49,width:49,position:'absolute',top:0,right:0}}/>
        </View>);
    }

  }

  show_ContentViews(){
    
   
  }


  componentWillReceiveProps(nextProps) {

    if (JSON.stringify(this.props.tabs) !== JSON.stringify(nextProps.tabs) && this.state._containerWidth) {
      this.setState({ _containerWidth: null, });
    }
  }

  onTabContainerLayout(e) {
    this._tabContainerMeasurements = e.nativeEvent.layout;
    let width = this._tabContainerMeasurements.width;
    if (width < WINDOW_WIDTH) {
      width = WINDOW_WIDTH;
    }
    this.setState({ _containerWidth: width, });

  }

  onContainerLayout(e) {
    // this._containerMeasurements = e.nativeEvent.layout;
  }
}

ScrollableTabBar.defaultProps =  {

    scrollOffset: 52,
    activeTextColor: 'navy',
    inactiveTextColor: 'black',
    backgroundColor: null,
    style: {},
    tabStyle: {},
    tabsContainerStyle: {},
    underlineStyle: {},
}

module.exports = ScrollableTabBar;

const styles = StyleSheet.create({
  tab: {
    height: 49,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 20,
    paddingRight: 20,
  },
  container: {
    height: 50,
    borderWidth: 1,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderColor: '#ccc',
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  top:{
    flex:1,
  },
  scrollView:{
    justifyContent: 'space-between',
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: 15,
    paddingBottom: 85,
    paddingRight: 18,
    paddingLeft: 18,
  },
  btnStyle :{
   borderRadius:5,
   height:35,
   width: (screenWidth - 59) / 5,
   marginBottom:12,
 },
});
