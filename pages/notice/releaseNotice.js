const qiniuUploader = require("qiniuUploader.js");
import noticesource from "../../api/noticeSource"
//index.js

// 初始化七牛相关参数
function initQiniu() {
  //配置详解 https://github.com/gpake/qiniu-wxapp-sdk/blob/master/README.md
  var options = {
    region: 'NCN', // 华东区 根据存储区域填写
    //uptokenURL: 'UpTokenURL.com/uptoken',//// 从指定 url 通过 HTTP GET 获取 uptoken，返回的格式必须是 json 且包含 uptoken 字段，例如： {"uptoken": "0MLvWPnyy..."}
    //uptoken生成地址：http://pchou.qiniudn.com/qiniutool/uptoken.html deadline的时间设置长一些
    uptoken: getApp().data.qiniu_uptoken,
    domain: getApp().data.qiniu_domain
  };
  qiniuUploader.init(options);
}

//获取应用实例
var app = getApp()
Page({
  data: {
    imageObject: {},
    imageurl: [],
    account:0,
    notice:{},
    openid:""
  },
  onLoad: function () {
    // 查看是否授权
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success: function (res) {
              console.log(res.userInfo)
            }
          })
        }
      }
    })
  },
  bindGetUserInfo: function (e) {
    var that=this;
    console.log(e.detail.userInfo);
    console.log(this.data.notice);
    var photo = 'notice.photo';
    let avatarUrl ='notice.avatarUrl';
    let nickName = 'notice.nickName';
    let openid= wx.getStorageSync('openid');
    console.log(openid);
        if(openid==''||openid==null){
          wx.showToast({
            title: "请先登录",
        
          });
          return
        }
        else{
          let id = 'notice.openid';
          that.setData({[id]: openid})
        }
    
    if (e.detail.userInfo.avatarUrl == "" || e.detail.userInfo.avatarUrl == null || e.detail.userInfo.nickName == '' || e.detail.userInfo.nickName==null){
      wx.showToast({
        title: "请先登录",
      });
      return

    }
    if (this.data.notice.content == undefined || this.data.notice.content == null || this.data.notice.content.length==0){
      wx.showToast({
        title: "不写点什么吗？",
        icon:"none"
      })
        return 
    }
    this.setData({ [avatarUrl]: e.detail.userInfo.avatarUrl});
    this.setData({ [nickName]: e.detail.userInfo.nickName });
    this.setData({ [photo]: this.data.imageurl });
    noticesource.savenotice(this.data.notice).then(function (res) {
    
      wx.showToast({
        title: "发布成功",
        complete:function(){
          let content = 'notice.content';
          that.setData({ [content]: '' });
          that.setData({ imageurl: [] });
          that.setData({ [photo]: '' });
          setTimeout(function(){
            wx.switchTab({
              url: '../index/index'
            })  },1000)
    
        }
      });
     

    });
  },

  detail:function(e){
    let value = e.detail.value;
    let content = 'notice.content';
    if (value != null && value != '') {
      let trimvalue = value.trim();
      if (trimvalue.length > 500) {
        value = substr(value, 0, 499)
      }
      this.setData({ account: trimvalue.length });
    }
    else {
      this.setData({ account: 0 });
    }
    this.setData({ [content]: value });
  },

  deleteImage: function (e) {
    let index = e.currentTarget.dataset.index;
    var that = this;
    var imagetemp = that.data.imageurl;
    imagetemp.splice(index, 1);
    that.setData({ imageurl: imagetemp });
  },

  didPressChooesImage: function () {
    if (this.data.imageurl.length>=4){
      wx.showToast({
        title:"不能超过4张",

      })
      return 
    }
    var that = this;
    didPressChooesImage(that);
  },

  copy: function (e) {
    if (e.currentTarget.dataset.text.length > 0) {
      wx.setClipboardData({
        data: e.currentTarget.dataset.text
      })

    }
  },

  //预览图片
  previewImage: function (e) {
    var current = e.target.dataset.src;
    wx.previewImage({
      current: current, // 当前显示图片的http链接  
      urls: [this.data.imageObject.imageURL]// 需要预览的图片http链接列表  
    })
  }
});

function didPressChooesImage(that) {
  initQiniu();
  // 微信 API 选文件
  wx.chooseImage({
    count: 1,
    success: function (res) {
      var filePath = res.tempFilePaths[0];
      // 交给七牛上传
      qiniuUploader.upload(filePath, (res) => {
        that.setData({
          'imageObject': res
        });

        let imageurl = that.data.imageurl;
        imageurl.push(getApp().data.qiniu_domain + res.key);
        that.setData({
          'imageurl': imageurl
        });
      }, (error) => {
        console.error('error: ' + JSON.stringify(error));
      });
    }
  }
  
  )

}