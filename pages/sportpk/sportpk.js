// pages/sportpk/sportpk.js

import sportsource from "../../api/sportSource"
import loginsource from "../../api/loginSource"
import regeneratorRuntime from '../../packages/regenerator/runtime'
import date from "../../utils/date"
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    todaysportcount:0,
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    openGid:'',
    openid:'',
    openGidlist:[],
    sharegroupdata:[]
  },

  getUserInfo: function (e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },

  getfirstgroupsport: async function () {
    var that = this;
    let openGidlist = wx.getStorageSync('openGidlist');
    if (openGidlist.Gidlist != undefined || openGidlist.Gidlist != null) {
      if (openGidlist.Gidlist.length > 0) {
        for (let i in openGidlist.Gidlist) {
          let data = await sportsource.getgroupsport(openGidlist.Gidlist[i]);
          console.log(data);
          let sharegroupdata = that.data.sharegroupdata;
          sharegroupdata.push(data.data.rows);
          that.setData({ sharegroupdata: sharegroupdata })
        }

      }
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (opt) {
    var that =this;
    var nowDate = new Date();
    var year = nowDate.getFullYear();
    var month = nowDate.getMonth() + 1 < 10 ? "0" + (nowDate.getMonth() + 1)
      : nowDate.getMonth() + 1;
    var day = nowDate.getDate() < 10 ? "0" + nowDate.getDate() : nowDate
      .getDate();
    var dateStr = year + "-" + month + "-" + day;
   
      var value = wx.getStorageSync('openGidlist')
      if (value!=undefined||value!=null) {
       console.log(value);
        if (value.date != dateStr || value.Gidlist == undefined || value.Gidlist==null){
          wx.setStorageSync('openGidlist', { date: dateStr, Gidlist: [] });
        }
      }
  
    // 如果本地没有，就发送login请求
    var openidvalue = wx.getStorageSync('openid');
    var session_key = wx.getStorageSync('session_key');
    if (openidvalue == undefined || openidvalue == null || session_key == undefined || session_key == null ){
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
            that.setData({ openid: data.openid})
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
   else{
      that.setData({ openid: wx.getStorageSync('openid') })
   }


    wx.showShareMenu({
      withShareTicket: true
    })

   
  
  
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this;
    var nowDate = new Date();
    var year = nowDate.getFullYear();
    var month = nowDate.getMonth() + 1 < 10 ? "0" + (nowDate.getMonth() + 1)
      : nowDate.getMonth() + 1;
    var day = nowDate.getDate() < 10 ? "0" + nowDate.getDate() : nowDate
      .getDate();
    var dateStr = year + "-" + month + "-" + day;
    var that = this;
    that.getfirstgroupsport();
    wx.getWeRunData({
      success: function (res) {
        console.log(res);
        let session_key = wx.getStorageSync("session_key");
        console.log(session_key);
        sportsource.getsportdata(res, session_key).then(function (data) {
          console.log(data);
          that.setData({ todaysportcount: data.data.stepInfoList[30].step });
        })
       
      }
    })

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

setTimeout(function(){
    if (app.globalData.shareTicket != undefined || app.globalData.shareTicket!=null) {
      console.log("--------------------");
      console.log("shareTicket" + app.globalData.shareTicket);
      console.log("--------------------");
      wx.getShareInfo({
        shareTicket: app.globalData.shareTicket,
        success: function (res) {
          var encryptedData = res.encryptedData;
          var iv = res.iv;
          console.log(encryptedData + iv);
          let session_key = wx.getStorageSync("session_key");
          sportsource.getsportdata(res, session_key).then(function (data) {
            console.log(data);
            let openGid = data.data.openGId;
            that.setData({ openGid: openGid });
            let openid = that.data.openid;
            let todaysportcount = that.data.todaysportcount;
            let avatarUrl = that.data.userInfo.avatarUrl;
            let nickname = that.data.userInfo.nickName;
            // let openGidlist = that.data.openGidlist;
            let openGidlist = wx.getStorageSync('openGidlist');
            openGidlist.Gidlist.push(openGid);
            openGidlist.Gidlist = [...new Set(openGidlist.Gidlist)]
            wx.setStorageSync('openGidlist', { date: dateStr, Gidlist: openGidlist.Gidlist });
            sportsource.creategroupsport({
              openGid,
              openid,
              todaysportcount,
              avatarUrl,
              nickname
            }).then(function () {
              console.log("--------------------");
              console.log("链接进来 执行了creategroupsport");
              console.log("--------------------");
            })

          })

        }
      })
    }}, 1000)

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.setData({ sharegroupdata:[]});
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
    onShareAppMessage: function () {
      var nowDate = new Date();
      var year = nowDate.getFullYear();
      var month = nowDate.getMonth() + 1 < 10 ? "0" + (nowDate.getMonth() + 1)
        : nowDate.getMonth() + 1;
      var day = nowDate.getDate() < 10 ? "0" + nowDate.getDate() : nowDate
        .getDate();
      var dateStr = year + "-" + month + "-" + day;
      var that=this;
      return {
        title: '我已经运动了' + this.data.todaysportcount+'步，你敢来PK吗？',
        path: 'pages/sportpk/sportpk',
        success: function (res) {
          var shareTickets = res.shareTickets;
          if (shareTickets.length == 0) {
            return false;
          }
          console.log('shareTickets'+shareTickets[0]);

          wx.getShareInfo({
            shareTicket: shareTickets[0],
            success: function (res) {
              var encryptedData = res.encryptedData;
              var iv = res.iv;
              console.log(res);
              let session_key = wx.getStorageSync("session_key");
              sportsource.getsportdata(res, session_key).then(function (data) {
                console.log(data);
                let openGid = data.data.openGId;
                that.setData({ openGid: openGid});
                let openid = that.data.openid;
                let todaysportcount = that.data.todaysportcount;
                let avatarUrl = that.data.userInfo.avatarUrl;
                let nickname = that.data.userInfo.nickName;
                if (todaysportcount == undefined || todaysportcount==null){
                  wx.showToast({
                    title: '请重新打开运动权限',
                    duration: 2000
                  })
                  return
                }
                if (avatarUrl == undefined || avatarUrl == null || nickname == undefined || nickname==null) {
                  wx.showToast({
                    title: '请先点击头像登录',
                    duration: 2000
                  })
                  return
                }


                // let openGidlist = that.data.openGidlist;
                let openGidlist = wx.getStorageSync('openGidlist');
                openGidlist.Gidlist.push(openGid);
                openGidlist.Gidlist = [...new Set(openGidlist.Gidlist)]
                console.log("---------------------------------------");
                console.log('openGidlist.Gidlist' + openGidlist.Gidlist);
                 console.log("---------------------------------------");
                wx.setStorageSync('openGidlist', { date: dateStr, Gidlist: openGidlist.Gidlist});
                sportsource.creategroupsport({
                   openGid,
                   openid,
                   todaysportcount,
                   avatarUrl,
                   nickname
                   }).then(function(){
                     that.setData({ sharegroupdata: [] });
                     that.getfirstgroupsport();
                   })

              })

            }
          })
        },
        fail: function (res) {
          // 转发失败
        }
      }
    }
   

  
})