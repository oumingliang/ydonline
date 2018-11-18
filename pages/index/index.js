//index.js
//获取应用实例
import regeneratorRuntime from '../../packages/regenerator/runtime'
const app = getApp()
import noticesource from "../../api/noticeSource"
import loginsource from "../../api/loginSource"
Page({
  data: {
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
      pageno:1,
      pagesize:10,
      allnotice:[],
      imageurl: []
  },

  onPullDownRefresh:function(){
    var that = this;
    let pageno = 1;
    let pagesize = this.data.pagesize;
    var allnotice = this.data.allnotice;
    noticesource.findalllnotice(pageno, pagesize).then(function (res) {
      console.log(res);
      if (res.length > 0) {
        allnotice = allnotice.concat(res);
      }
      console.log(allnotice);
      that.setData({ allnotice: Array.from(new Set(allnotice))});
    })

  },



  onLoad: async function () {
    var openidvalue = wx.getStorageSync('openid');
    var session_key = wx.getStorageSync('session_key');
    if (openidvalue == undefined || openidvalue == null || session_key == undefined || session_key == null) {

    wx.login({
      success(res) {
        console.log('code: ' + res.code);
        if (res.code) {
          loginsource.login(res.code).then(function (data) {
            console.log(data);
            wx.setStorage({
              key: 'openid',
              data: data.openid,
            })
            wx.setStorage({
              key: 'session_key',
              data: data.session_key,
            })

          
          })
        } else {
          console.log('登录失败！' + res.errMsg)
        }
      }
    });
    }

    var that = this;
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }

   
  },
  onShow:async function(){
    var that = this;
    let pageno = 1;
    let pagesize = this.data.pagesize;
    this.setData({ pageno:1});
    noticesource.findalllnotice(pageno, pagesize).then(function (res) {
      console.log(res);
      for (let i in res) {
        let image = res[i].photo.split(',');
        res[i].imageurl = image;
      }
      that.setData({ allnotice:  res });
    })
  },

  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  add: function(){
    wx.navigateTo({
      url: '../notice/releaseNotice',
      success:function(){
        console.log('1');
      }
    })
  },
 
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  upper: function () {
    var allnotice = this.data.allnotice;
    var pageno = ++this.data.pageno;
    var pagesize = this.data.pagesize;
    console.log(pageno);
    var that = this;
    this.setData({ pageno: this.data.pageno++ });
    noticesource.findalllnotice(pageno, pagesize).then(function (res) {
      console.log(res);
      for (let i in res) {
        let image = res[i].photo.split(',');
        res[i].imageurl = image;
      }
        if (res.length > 0) {
          allnotice=allnotice.concat(res);
        }
      console.log(allnotice);
      that.setData({ allnotice: Array.from(new Set(allnotice)) });
      })
    }

})
