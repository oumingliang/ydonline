/**
 * 远光党建/九三社员之家
 * 用户状态管理、登录、鉴权等服务
 * 
 * 注意：
 * 服务依赖于app对象，勿在对象未初始化前引用（典型的是app.js中调用）
 *
 * Created at     : 2018-07-03 17:11:56 
 * Last modified  : zhouzhiming@ygsoft.com
 */
import regeneratorRuntime from '../packages/regenerator/runtime'
import WXP from '../packages/api-promise/wxp'
import http from 'http'
import encrypt from 'encryption'
import msgUtil from '../utils/messageUtil'

const app = getApp()
// 统一初始化Session，后续代码不再对Session及其子对象做空值防御
const initSession = () => {
  if (!app.__globalData) {
    app.__globalData = {
      // 微信用户信息
      wxUserInfo: null,
      // 真实用户信息
      realityUserInfo: null
    }
  }
  return app.__globalData
}
const session = initSession()

/**
 * 在确定用户已登录的前提下（典型如非首页中的调用），可通过这2个方法获取、设置用户登录的上下文
 * 返回对象的结构与wx.getUserInfo()中userInfo对象的结构相同
 * 
 * nickName	String	用户昵称
 * avatarUrl	String	用户头像，最后一个数值代表正方形头像大小（有0、46、64、96、132数值可选，0代表132*132正方形头像），用户没有头像时该项为空。若用户更换头像，原有头像URL将失效。
 * gender	String	用户的性别，值为1时是男性，值为2时是女性，值为0时是未知
 * city	String	用户所在城市
 * province	String	用户所在省份
 * country	String	用户所在国家
 * language	String	用户的语言，简体中文为zh_CN
 */
const getWxUserInfoSync = () => session.wxUserInfo
const setWxUserInfoSync = (wxUserInfo = {}) => session.wxUserInfo = wxUserInfo

/**
 * 获取用户登录信息，返回数据的结构与getWxUserInfoSync()一致
 * 注意，微信的授权体系，该方法为异步访问
 */
const getWxUserInfo = async () => {
  if (getWxUserInfoSync()) {
    return getWxUserInfoSync()
  } else {
    // 根据微信小程序2018-4-30的更新，getUserInfo()以后将不会弹出授权窗口，所以增加这个检查
    let res = await WXP.getSetting()
    if (res.authSetting['scope.userInfo']) {
      let info = await WXP.getUserInfo()
      session.userInfo = info.userInfo
      return info.userInfo
    } else {
      // 未获得微信用户授权读取个人资料
      return null
    }
  }
}

/**
 * 读、写（正常是不需要写的）客户端缓存着的与微信用户绑定的93用户真实信息
 * 对象结构与服务端userVo结构相同
 */
const getRealityUserInfoSync = () => session.realityUserInfo
const setRealityUserInfoSync = (userInfo) => session.realityUserInfo = userInfo

/**
 * 小程序登录
 * 服务端将产生并返回sessionId，以后所有http请求自动在header上附带该id用以鉴权
 * 如果该微信用户的OpenID已经通过手机关联过93用户，将会同时返回用户对象realityUserInfo
 * 
 * 数据流梗概：
 * 1.客户端登录（产生res.code）->
 * 2.APP服务端（持有appid\appsecret）->  
 * 3.微信服务（appid+appsecret+res.code换取sessionKey、openid、unionid）-> 
 * 4.APP服务端（存储微信服务返回的openId、unionid等，产生自定义的sessionId）-> 
 * 5.客户端登录完成（持有sessionId，每次请求发回服务端）
 * 
 * 返回数据结构：
 * {
 *   sessionId,       用于鉴权的sessionId
 *   realityUserInfo  与服务端userVo结构相同
 * }
 */
const login = async() => {
  let res = await WXP.login()
  let token = await http.request({
    url: "/restful/login/wechatMpLogin",
    data: {
      code: res.code
    }
  })
    http.HEADERS.sessionCode = res.code
  // 将服务器返回的Set-Cookie命令内容保留起来，后续请求放到Cookie中带回，模拟浏览器Cookie的效果
  let cookies = token.header["Set-Cookie"]
  if (cookies) {
    http.setCookies(cookies)
  }
  // 保存服务器返回的Session和关联用户状态信息
  let result = token.data.result
  if (result && result.sessionId) {
    http.HEADERS.sessionId = result.sessionId
      //console.log(`用户微信Session创建成功，code=${res.code}，sessionId=${http.HEADERS.sessionId}`);
    if (result.bind) {
      //console.log(`93用户绑定成功：${result.userVo.userName}`);
      session.realityUserInfo = result.userVo
    }
  } else {
    // 即使93用户没有关联，也应该产生sessionID，没有的话视同服务端异常
    // msgUtil.throwException("ERROR", "服务端登录验证异常，请重试", {
    //   response: res,
    //   token
    // })
    // wx.showModal({
    //   title: '提示',
    //   content: result.data.errorMsg,
    //   showCancel: false
    // })
  }
}


/**
 * 激活93社员之家登录页面
 */
const goSigninPage = (userId,source) => {
  var pages = getCurrentPages() //获取加载的页面
  var currentPage = pages[pages.length - 1] //获取当前页面的对象
  wx.setStorage({
    key: 'myCurrentPage',
    data: currentPage,
  })
  wx.redirectTo({
    url: '/components/login/index?userId=' + userId+'&source='+source,
  })
}

/**
 * 通过分享页面进入，需要加载首页后再进入分享页面
 */
const goFirstPage = () => {
  // var pages = getCurrentPages() //获取加载的页面
  // var currentPage = pages[pages.length - 1] //获取当前页面的对象
  // if(pages.length==1){
  //   wx.reLaunch({
  //     url: "../../pages/index/index"
  //   })
  //   wx.setStorage({
  //     key: 'myCurrentPage',
  //     data: currentPage,
  //   })
  // }
  
}


/**
 * 分享页面调用——生成分享的路径
 * title：分享页面的标题，可以为NULL（小程序名称）
 * imageUrl:分享页面分享后的显示图片，可以为NULL（默认当前页面截图）
 * goPage:分享页面的路径要用"/pages"开头
 * params:分享页面需要的参数｛参数1：value,参数2：value｝
 */
const newSharePage = (title,imageUrl,goPage, params) => {
  let newPath = "/pages/index/index?newPath="+goPage;
  for (let o in params) {
    newPath = newPath + '&' + o + "=" + params[o]
  }
  return {
    title: title,
    path: newPath,
    imageUrl: imageUrl
    // ,
    // success: function () {
    //   wx.showToast({
    //     title: '分享成功',
    //     icon: "success"
    //   })
    // }
  }
}

/**
 * 首页调用——用来跳转到分享页面
 */
const newGoSharePage = (options) => {
  if (options.newPath){
    let newUrl = options.newPath;
    let optionIndex = 0;
    for (let o in options) {
      if (optionIndex == 0) {
        newUrl = newUrl + '?' + o + "=" + options[o]
      } else {
        newUrl = newUrl + '&' + o + "=" + options[o]
      }
      optionIndex = optionIndex + 1
    }
    wx.navigateTo({
      url: newUrl
    })
  }
}


/**
 * 激活93社员之家登录页面
 */
const getSession = () => {
      return http.HEADERS;
        }

/**
 * 93用户登录，将微信用户与93用户绑定
 * 
 * 用户名一般是手机号码
 * 密码将在客户端DES加密后传回服务端
 */
const signin = async (mobile, password, inviterUserId,source) => {
  let userInfo = getWxUserInfoSync()
  let newres = await WXP.login()
  //console.log(`微信用户"${userInfo.nickName}"（${mobile}）进行93用户绑定`)
  let res = await http.request({
    url: '/restful/login/wechatMpBind',
    data: {
      code: newres.code,
      mobile:mobile,
      password: encrypt.encryptUsingMD5(password),
      userInfo: JSON.stringify(userInfo),
      sharedUserId: inviterUserId || '',
      source: source || ''
    }
  })

  if (res.data.errorCode === 1) {
    msgUtil.showMessage(res.data.errorMsg)
    // msgUtil.throwException("INFO", res.data.errorMsg, res)
  } else {
    if (res.data.status==1){
      setRealityUserInfoSync(res.data.result.userVo)
      //console.log("用户绑定已成功");
      return true
    }else{
      msgUtil.showMessage(res.data.errorMsg)
      return false
    }
  }
}

/**
 * 93用户解绑定，解除微信与93用户的绑定关系
 * 此服务不需要传入用户信息，根据请求中在Header中附带的sessionId定位用户
 */
const signout = async () => {
  // 清理服务端绑定
  let res = await http.request({
    url: '/restful/login/wechatMpLoginOut'
  })
  setWxUserInfoSync(null)
  wx.redirectTo({
    url: '/components/login/index'
  })
  // 清理客户端绑定
  setRealityUserInfoSync(null)
  //console.info(`用户已注销，SessionId:${http.HEADERS.sessionId}在服务端已标志失效`)
  msgUtil.showMessage(res.data.result)
}


export default {
  getWxUserInfoSync,
  setWxUserInfoSync,
  getWxUserInfo,
  getRealityUserInfoSync,
  setRealityUserInfoSync,
  login,
  signin,
  signout,
  goSigninPage,
  getSession,
  goFirstPage,
  newSharePage,
  newGoSharePage
}