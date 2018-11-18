//index.js
//获取应用实例
import regeneratorRuntime from '../../packages/regenerator/runtime'
const app = getApp()
import noticesource from "../../api/noticeSource"
Page({
  data: {
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    pageno: 1,
    pagesize: 10,
    allnotice: [],
    imageurl:[]
  },
  onLoad: async function () {
   
  },
  onShow: async function () {
    //  this.upper();
    var that=this;
    let pageno = this.data.pageno >= 2 ? this.data.pageno - 1 : this.data.pageno;
    let pagesize = this.data.pagesize;
    var allnotice = this.data.allnotice;
    wx.getStorage({
      key: 'openid',
      success: function(res) {
        console.log(res.data);
       noticesource.findmynotice(pageno, pagesize,res.data).then(function(resp){
         console.log("resp"+resp);
         for(let i in resp){
           let image = resp[i].photo.split(',');
           resp[i].imageurl=image;
         }
         if (resp.length > 0) {
           allnotice = allnotice.concat(resp);
         }
         console.log(allnotice);
         that.setData({ allnotice: Array.from(new Set(allnotice)) });
        //  that.setData({ allnotice :resp});
        //  console.log(resp.photo);
        //  that.setData({ imageurl: resp.photo.split(',')});
       });
    }
    
  })
  },

  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  add: function () {
    wx.navigateTo({
      url: '../notice/releaseNotice',
      success: function () {
        console.log('1');
      }
    })
  },

  getUserInfo: function (e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  upper: function () {


  //   var allnotice = this.data.allnotice;
  //   var pageno = ++this.data.pageno;
  //   var pagesize = this.data.pagesize;
  //   console.log(pageno);
  //   var that = this;
  //   this.setData({ pageno: this.data.pageno++ });
  //   wx.getStorage({
  //     key: 'openid',
  //     success: function (res) {
  //       console.log(res.data);
  //       noticesource.findmynotice(pageno, pagesize, res.data).then(function (res) {
  //     if (res.length > 0) {
  //       allnotice.concat(res);
  //     }
  //         that.setData({ allnotice: Array.from(new Set(allnotice)) });
  //   })
  // }})

    var that = this;
    var pageno = ++this.data.pageno;
    let pagesize = this.data.pagesize;
    var allnotice = this.data.allnotice;
    this.setData({ pageno: this.data.pageno++ });
    wx.getStorage({
      key: 'openid',
      success: function (res) {
        console.log(res.data);
        noticesource.findmynotice(pageno, pagesize, res.data).then(function (resp) {
          console.log("resp" + resp);
          for (let i in resp) {
            let image = resp[i].photo.split(',');
            resp[i].imageurl = image;
          }
          if (resp.length > 0) {
            allnotice = allnotice.concat(resp);
          }
          console.log(allnotice);
          that.setData({ allnotice: Array.from(new Set(allnotice)) });
  
        });
      }

    })



  }
})
