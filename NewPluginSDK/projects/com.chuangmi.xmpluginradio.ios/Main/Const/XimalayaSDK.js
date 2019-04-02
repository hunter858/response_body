//
//  喜马拉雅SDK
//  MiHome
//
//  Created by Woody on 5/8/14.
//  Copyright (c) 2015年 小米移动软件. All rights reserved.
//

'use strict';

import React,{component} from 'react' ;
import xmly from 'miot/native/xmly'


/**
 * 喜马拉雅请求类型
 **/
var XMReqType = {
  //点播接口
  /** 喜马拉雅内容分类 */
  XMReqType_CategoriesList:0,
  /** 获取专辑或声音的标签 */
  XMReqType_TagsList:1,
  //根据分类和标签获取某个分类某个标签下的热门专辑列表/最新专辑列表/最多播放专辑列表
  XMReqType_AlbumsList:2,
  /** 根据专辑ID获取专辑下的声音列表，即专辑浏览 */
  XMReqType_AlbumsBrowse:3,
  /** 批量获取专辑列表 */
  XMReqType_AlbumsBatch:4,
  /** 根据专辑ID列表获取批量专辑更新提醒信息列表 */
  XMReqType_AlbumsUpdateBatch:5,
  /** 根据分类和标签获取某个分类下某个标签的热门声音列表 */
  XMReqType_TracksHot:6,
  /** 批量获取声音 */
  XMReqType_TracksBatch:7,
  /** 根据上一次所听声音的id，获取从那条声音开始往前一页声音。 */
  XMReqType_TrackGetLastPlay:8,

  /** 获取某个分类下的元数据列表 */
  XMReqType_MetadataList:9,
  /** 获取某个分类的元数据属性键值组合下包含的热门专辑列表/最新专辑列表/最多播放专辑列表 */
  XMReqType_MetadataAlbums:10,


//直播接口
  /** 获取直播省份列表 */
  XMReqType_LiveProvince:11,
  /** 获取直播电台列表 */
  XMReqType_LiveRadio:12,
  /** 获取直播节目列表 */
  XMReqType_LiveSchedule:13,
  /** 获取当前直播的节目 */
  XMReqType_LiveProgram:14,
  XMReqType_LiveCity:15,
  XMReqType_LiveRadioOfCity:16,
  XMReqType_LiveRadioByID:17,

  /** 获取直播电台分类 */
  XMReqType_LiveRadioCategories:18,
  /** 根据分类获取直播电台数据 */
  XMReqType_LiveGetRadiosByCategory:19,

//搜索接口
  /** 搜索获取专辑列表 */
  XMReqType_SearchAlbums:20,
  /** 搜索获取声音列表 */
  XMReqType_SearchTracks:21,
  /** 获取最新热搜词 */
  XMReqType_SearchHotWords:22,
  /** 获取某个关键词的联想词 */
  XMReqType_SearchSuggestWords:23,
  /** 搜索获取电台列表 */
  XMReqType_SearchRadios:24,
  /** 获取指定数量直播，声音，专辑的内容 */
  XMReqType_SearchAll:25,
  /** 搜索获取主播列表 */
  XMReqType_SearchAnnouncers:26,


//推荐接口
  /** 获取某个专辑的相关推荐。 */
  XMReqType_AlbumsRelative:27,
  //获取某个声音列表的相关专辑
  XMReqType_TracksRelativeAlbum:28,
  /** 获取下载听模块的推荐下载专辑 */
  XMReqType_AlbumsRecommendDownload:29,
  //猜你喜欢
  XMReqType_AlbumsGuessLike:30,
  //获取运营人员在发现页配置的分类维度专辑推荐模块的列表
  XMReqType_DiscoveryRecommendAlbums:31,
  //获取运营人员为某个分类配置的标签维度专辑推荐模块列表
  XMReqType_CategoryRecommendAlbums:32,

  //榜单接口
  /** 根据榜单类型获取榜单首页的榜单列表 */
  XMReqType_RankList:33,
  /** 根据rank_key获取某个榜单下的专辑列表 */
  XMReqType_RankAlbum:34,
  /** 根据rank_key获取某个榜单下的声音列表 */
  XMReqType_RankTrack:35,
  /** 获取直播电台排行榜 */
  XMReqType_RankRadio:36,
//听单接口
  /** 获取精品听单列表 */
  XMReqType_ColumnList:37,
  /** 获取某个听单详情，每个听单包含听单简介信息和专辑或声音的列表 */
  XMReqType_ColumnDetail:38,

//焦点图接口
  /** 获取榜单的焦点图列表 */
  XMReqType_RankBanner:39,
  /** 获取发现页推荐的焦点图列表 */
  XMReqType_DiscoveryBanner:40,
  /** 获取分类推荐的焦点图列表 */
  XMReqType_CategoryBanner:41,



    // /** 喜马拉雅内容分类 */
    // XMReqType_CategoriesList : 0,
    // /** 运营人员在首页推荐的专辑分类 */
    // XMReqType_CategoriesHumanRecommend : 1,
    // /** 获取专辑或声音的标签 */
    // XMReqType_TagsList : 2,
    // /** 根据分类和标签获取某个分类某个标签下的热门专辑列表 */
    // XMReqType_AlbumsHot : 3,
    // // XMReqType_AlbumsList:3,
    // /** 根据专辑ID获取专辑下的声音列表，即专辑浏览 */
    // XMReqType_AlbumsBrowse : 4,
    // /** 批量获取专辑列表 */
    // XMReqType_AlbumsBatch : 5,
    // /** 获取全量专辑数据 */
    // XMReqType_AlbumsAll : 6,
    // /** 根据专辑ID列表获取批量专辑更新提醒信息列表 */
    // XMReqType_AlbumsUpdateBatch : 7,
    // /** 获取某个专辑的相关推荐。 */
    // XMReqType_AlbumsRelative : 8,
    // /** 获取下载听模块的推荐下载专辑 */
    // XMReqType_AlbumsRecommendDownload : 9,
    // //猜你喜欢
    // XMReqType_AlbumsGuessLike : 10,
    // //获取某个主播下的专辑列表
    // XMReqType_AlbumsByAnnouncer : 11,
    // /** 根据分类和标签获取某个分类下某个标签的热门声音列表 */
    // XMReqType_TracksHot : 12,
    // /** 批量下载声音 */
    // XMReqType_TracksDownBatch : 13,
    // /** 批量获取声音 */
    // XMReqType_TracksBatch : 14,
    // /** 根据上一次所听声音的id，获取从那条声音开始往前一页声音。 */
    // XMReqType_TrackGetLastPlay : 15,
    // /** 搜索获取专辑列表 */
    // XMReqType_SearchAlbums : 16,
    // /** 搜索获取声音列表 */
    // XMReqType_SearchTracks : 17,
    // /** 获取最新热搜词 */
    // XMReqType_SearchHotWords : 18,
    // /** 获取某个关键词的联想词 */
    // XMReqType_SearchSuggestWords : 19,
    // /** 搜索获取电台列表 */
    // XMReqType_SearchRadios : 20,
    // /** 获取指定数量直播，声音，专辑的内容 */
    // XMReqType_SearchAll : 21,
    // /** 搜索获取直播省份列表 */
    // XMReqType_LiveProvince : 22,
    // /** 搜索获取直播电台列表 */
    // XMReqType_LiveRadio : 23,
    // /** 搜索获取直播节目列表 */
    // XMReqType_LiveSchedule : 24,
    // /** 搜索获取当前直播的节目 */
    // XMReqType_LiveProgram : 25,
    // XMReqType_LiveCity : 26,
    // XMReqType_LiveRadioOfCity : 27,
    // XMReqType_LiveRadioByID : 28,
    // /** 根据榜单类型获取榜单首页的榜单列表 */
    // XMReqType_RankList : 29,
    // /** 根据rank_key获取某个榜单下的专辑列表 */
    // XMReqType_RankAlbum : 30,
    // /** 根据rank_key获取某个榜单下的声音列表 */
    // XMReqType_RankTrack : 31,
    // /** 获取直播电台排行榜 */
    // XMReqType_RankRadio : 32,
    // /** 获取精品听单列表 */
    // XMReqType_ColumnList : 33,
    // /** 获取某个听单详情，每个听单包含听单简介信息和专辑或声音的列表 */
    // XMReqType_ColumnDetail : 34,
    // /** 获取榜单的焦点图列表 */
    // XMReqType_RankBanner : 35,
    // /** 获取发现页推荐的焦点图列表 */
    // XMReqType_DiscoveryBanner : 36,
    // /** 获取分类推荐的焦点图列表 */
    // XMReqType_CategoryBanner : 37,
};

/**
 * 喜马拉雅SDK封装类
 **/

class XimalayaSDK extends React.Component{
    
    static register(callback) {
        xmly.registry(null,null,1).then((result)=>{
            if(callback != null){
                callback(result);
            }
        }).catch((error)=>{
            console.log('registry-error:'+JSON.stringify(error));
        });
    }

  /**
   * 请求数据
   **/
  static requestXMData(reqType, params, callback) {
      xmly.request(reqType, params).then((result, error) => {
          if (callback != undefined) {
              callback(result, error);
          }
      }).catch(error=>{
          callback(undefined,error);
        //   console.log();
      });
  }

  static setPlayMode(playMode) {
      xmly.setPlayMode(playMode);
  }

  static setVolume(volume) {
      xmly.setVolume(volume);
  }

  static playWithTrack(track, playlist) {
      xmly.playWithTrack(track, playlist);
  }

  static pauseTrackPlay() {
      xmly.pauseTrackPlay();
  }

  static resumeTrackPlay() {
      xmly.resumeTrackPlay();
  }

  static stopTrackPlay() {
      xmly.stopTrackPlay();
  }

  static replacePlayList(playlist) {
      xmly.replacePlayList(playlist);
  }

  static playNextTrackWithCallback(callback) {
      xmly.playNextTrackWithCallback(callback);
  }

  static playPrevTrackWithCallback(callback) {
      xmly.playPrevTrackWithCallback(callback);
  }

  static setAutoNexTrack(status) {
      xmly.setAutoNexTrack(status);
  }

  static playListWithCallback(callback) {
      xmly.playListWithCallback(callback);
  }

  static nextTrackWithCallback(callback) {
      xmly.nextTrackWithCallback(callback);
  }

  static prevTrackWithCallback(callback) {
      xmly.prevTrackWithCallback(callback);
  }

  static seekToTime(percent) {
      xmly.seekToTime(percent);
  }

  static clearCacheSafely() {
      xmly.clearCacheSafely();
  }

  static setTrackPlayMode(trackPlayMode) {
      xmly.setTrackPlayMode(trackPlayMode);
  }

  static currentTrackWithCallback(callback) {
      xmly.currentTrackWithCallback(callback);
  }

  static startLivePlayWithRadio(radio) {
      xmly.startLivePlayWithRadio(radio);
  }

  static pauseLivePlay() {
      xmly.pauseLivePlay();
  }

  static resumeLivePlay() {
      xmly.resumeLivePlay();
  }

  static stopLivePlay() {
      xmly.stopLivePlay();
  }

  static startHistoryLivePlayWithRadio(radio, program) {
      xmly.startHistoryLivePlayWithRadio(radio, program);
  }

  static startHistoryLivePlayWithRadioInProgramList(radio, program, list) {
      xmly.startHistoryLivePlayWithRadioInProgramList(radio, program, list);
  }

  static seekHistoryLivePlay(duration, callback) {
      xmly.seekHistoryLivePlay(duration, callback);
  }

  static playNextProgram() {
      xmly.playNextProgram();
  }

  static playPreProgram() {
      xmly.playPreProgram();
  }

  static forceClearCacheDataForPath(cachePath, callback) {
      xmly.forceClearCacheDataForPath(cachePath, callback);
  }

  static currentPlayingRadioWithCallback(callback) {
      xmly.currentPlayingRadioWithCallback(callback);
  }

   static currentPlayingProgramWithCallback(callback) {
      xmly.currentPlayingProgramWithCallback(callback);
  }
}

  /**
   * 原生SDK当中的delegate方法将通过RN的事件通知的方式传递到插件js中，
   * 下列的event名称对应着delegate的名称，注册demo：
     var {DeviceEventEmitter} = React;
     var subscription = DeviceEventEmitter.addListener(
       XimalayaSDK.kEventLivePlayerDelegate,
       (body) => {
         if (body.method == "XMLiveRadioPlayerDidFailWithError")
         {
           console.log(body.error);
         }
       }
     );
   * 其中delegate的具体方法名规则为：如原生delegate方法签名只有一段，则直接使用方法名字符串；如原生delegate方法签名不只一段，则用And连接各段并采用camel case：而body中的参数名直接使用原生参数名
   * 比如- (void)XMLiveRadioPlayerNotifyCacheProgress:(CGFloat)percent
   * 在js中body.method为"XMLiveRadioPlayerNotifyCacheProgress"
   * 参数为body.percent
   * 而- (void)XMLiveRadioPlayerNotifyPlayProgress:(CGFloat)percent currentTime:(NSInteger)currentTime
   * 在js中body.method为"XMLiveRadioPlayerNotifyPlayProgressAndCurrentTime"
   * 参数为body.percent和body.currentTime
   **/
// XimalayaSDK.kEventTrackPlayerDelegate = "MHEventXimalayaTrackPlayerDelegate";
// XimalayaSDK.kEventLivePlayerDelegate = "MHEventXimalayaLivePlayerDelegate";

module.exports.XMReqType = XMReqType;
module.exports.XimalayaSDK = XimalayaSDK;
