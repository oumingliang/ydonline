//app.js
import loginsource from "api/loginSource"
App({
  data: {
    qiniu_domain: 'https://image.catac.cn/',//七牛图片外链域名
    //uptoken生成地址：http://pchou.qiniudn.com/qiniutool/uptoken.html deadline的时间设置长一些
    qiniu_uptoken: 'uxQXOgxXDtF-1uM_V15KQSIky5Xkdww0GhoAksLF:LWUt0HMVbICEDaSOMnMF3YLoUH4=:eyJzY29wZSI6Inlkb25saW5lIiwiZGVhZGxpbmUiOjE4NTU2NzA0MDF9'

  },
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
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
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
onShow (opt){
  console.log("opt.scene" + opt.scene);
  if (opt.scene==1044){
    this.globalData.shareTicket = opt.shareTicket;
  }
},
  globalData: {
    userInfo: null
  }
})
