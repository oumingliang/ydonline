---
title: 悦动在线小程序总结
date: 2018-11-18 19:40:49
tags:  小程序
toc: true
---

## 1. 项目规划

本项目为基于微信手机应用平台的一款运动互动型小程序，**实现了用户即时运动步数群内PK与个人动态的发布**，**小程序前端采用原生框架，后端采用基于Node的koa2框架，数据库采用MYSQL，对象存储采用七牛云，服务器采用阿里ECS，域名采用CA认证。**

运行效果如下

<video id="video" controls="" preload="none" poster="https://image.catac.cn/%E6%82%A6%E5%8A%A8%E5%9C%A8%E7%BA%BF%E6%BC%94%E7%A4%BA%E8%A7%86%E9%A2%91.mp4">
<source id="mp4" src="https://image.catac.cn/%E6%82%A6%E5%8A%A8%E5%9C%A8%E7%BA%BF%E6%BC%94%E7%A4%BA%E8%A7%86%E9%A2%91.mp4" type="video/mp4">
</video>


## 2. 支撑技术点分析

### 2.1 七牛云存储

在这个项目中，有个功能为动态发布，允许用户上传图片，动态发布后，所有人可在动态广场看到该动态，存储图片有很多方式，例如通过表单将文件转为为二级制发送给后端，然后存数据库中，但是，这样我就要多写很多代码，所有我决定将图片存储到图床，我数据库中保存图片链接即可，图床有很多，不一一描述了，我这次用的是七牛云，个人认证成功后将获得一定空间的免费存储空间。

建立存储空间（ydonline），选定存储区域(华北)。

![](https://image.catac.cn/七牛云列表.PNG)



注册成功后，将获得两组秘钥，这东西很重要，上传文件时，需要知道**uptoken**，uptoken是根据AK与SC生成的，**七牛云开发文档中建议后端生成uptoken值**，但我嫌麻烦，直接在线生成了uptoken，也就是说该uptoken是写死的。 

**uptoken生成地址：http://pchou.qiniudn.com/qiniutool/uptoken.html deadline的时间设置长一些**



![](https://image.catac.cn/七牛云秘钥.PNG)



**引入官方开发文件：qiniuUploader.js**

**小程序端存储图片关键代码：**

```javascript
releaseNotice.js
const qiniuUploader = require("qiniuUploader.js");

function didPressChooesImage(that) {
  initQiniu();
  // 微信 API 选文件
  wx.chooseImage({
    count: 1,
    success: function (res) {
      var filePath = res.tempFilePaths[0];
      // 交给七牛上传
      qiniuUploader.upload(filePath, (res) => {
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

function initQiniu() {
  //配置详解 https://github.com/gpake/qiniu-wxapp-sdk/blob/master/README.md
  var options = {
    region: 'NCN', // 华东区 根据存储区域填写
    //uptokenURL: 'UpTokenURL.com/uptoken',//// 从指定 url 通过 HTTP GET 获取 uptoken，返回的格式必须是 json 且包含 uptoken 字段，例如： {"uptoken": "0MLvWPnyy..."}
    uptoken: getApp().data.qiniu_uptoken,
    domain: getApp().data.qiniu_domain
  };
  qiniuUploader.init(options);
}


---------------------------------------------------------------------------------------  
app.js

App({
  data: {
    qiniu_domain: 'http://pgwn32i53.bkt.clouddn.com/',//七牛图片外链域名
    qiniu_uptoken: 'uxQXOgxXDtF-1uM_V15KQSIky5Xkdww0GhoAksLF:LWUt0HMVbICEDaSOMnMF3YLoUH4=:eyJzY29wZSI6Inlkb25saW5lIiwiZGVhZGxpbmUiOjE4NTU2NzA0MDF9'

  },
})


```



上传文件到指定的存储空间，七牛会返回文件的key值，加上七牛给你的外链域名，这样，你就可以显示文件了。

------



### 2.2 服务器与域名

我买过两次服务器，第一次是阿里的，另外一次也是阿里的。但这次，我买的是windows版云ECS ，首先，明确需求。

1. 远程连接部署项目（安装环境，运行后台，域名解析，外网访问）
2. 进行域名CA认证， 小程序的请求必须得是HTTPS。

在windows 服务器上部署项目 简单， 远程链接时，选择共享本地某个硬盘的资料，连接成功后，把本地的环境软件全部安装上去，本次需要在服务器上安装 node.js、git、mysql这三个软件。

购买SSL证书

https://yundunnext.console.aliyun.com/?p=casnext#/overview/cn-hangzhou

阿里有对单域名免费的证书，时间为1年，于是我为该项目的域名购买了https。

![](https://image.catac.cn/已购SSl.PNG)



点击下载 =>选择 其他

![](https://image.catac.cn/证书下载.PNG)



解压后，里面有两个文件，一个是crt，一个是key，将这两个文件发在后台文件夹下/ssl包下 （可随便命名）

后台加载这两个文件。

```javascript
app.js 关键代码
var app = require('koa'),
    https = require('https');
app=new app();

var options = {
  key: fs.readFileSync('./ssl/key.key'),  //ssl文件路径
  cert: fs.readFileSync('./ssl/crt.crt')  //ssl文件路径
};

// start the server
https.createServer(options, app.callback()).listen(443);
```



这样，后台就跑在htpps下了。

在服务器上运行后台：

![](https://image.catac.cn/运行后台.PNG)



**然后你用自己的电脑打开该域名，你会发现根本连接不上。**

<!--more-->

那么，这是什么鬼？

原来 阿里的windows 服务器 防火墙做了限制，且服务器安全组也做了限制。



1. ![](https://image.catac.cn/阿里云新建入站规则.PNG)



打开防火墙=>高级设置=>入站规则=>新建规则。



![](https://image.catac.cn/填写入站规则1.PNG)



选择端口 =>填写端口

![](https://image.catac.cn/入站填写2.PNG)



本次需要填写三个端口号， 后台的80（http） 443(https)   3306(mysql)



1. 在阿里云控制器那里配置安全组，如下图所示。

   ![](https://image.catac.cn/阿里云安全组.PNG)



   ![](https://image.catac.cn/配置规则.PNG)



填写 那三个端口号， 授权对象那里 填写 0.0.0.0/0



![](https://image.catac.cn/填写安全组.PNG)



做完这一步，大功告成了，你的域名可以被访问了。

![](https://image.catac.cn/https访问测试.PNG)



------



## 3. 数据库设计

数据表有两张，分为动态表与运动数据表，如下图所示。

![](https://image.catac.cn/数据模型.PNG)



## 4. 前端设计与开发

### 4.1 首页

首页主要由动态广场与底部的tabbar组成，动态广场显示状态正常（state==1）的动态，私人动态与禁止动态不能被他人所看见，在数据表设计中，uid其实就是openid。 用户上传了图片后，数据库中保存的是其访问地址，多个地址之间用逗号分隔，形成字符串， 前端拿到图片地址后，将其转成数组。

![](https://image.catac.cn/小程序首页.PNG)



**关键代码如下：**

```javascript
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
```

	

动态页面使用分页加载，每次下拉加载10条，内容展示区使用  scroll-view组件，设置bindscrolltolower="upper"，下拉时触发upper方法。

**关键代码如下：**

```javascript
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
```



### 4.2 动态发布页

动态发布页主要有文本输入框，图片上传区、发布按钮组成。

![](https://image.catac.cn/动态发布页.png)



该页面为重要页面，在发布前，我们需要获取发布者的头像、昵称、openid，如果这三个必要条件缺一的话，我们就会阻止用户发布动态并且提示用户授权登录。

**获取openid关键代码如下：**

```javascript
app.js 

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
```



用户在进入小程序时，我就会让一次后台请求，根据wx.login返回的code解密生成 openid与 session_key，我将其存放在storage中，**其实，我不推荐将session_key放在storage中，按正常开发方式，应该是后台临时存储session_key，并返回一个sessionid给用户，不应该把session_key返回给用户。**但是，我在用koa-session时，一直没有成功，不知道什么鬼！没办法，我只好把session_key返回给用户了。



**上传图片关键代码：**

```javascript
  didPressChooesImage: function () {
    if (this.data.imageurl.length>=4){
      wx.showToast({
        title:"不能超过4张",

      })
      return 
    }
    var that = this;
    didPressChooesImage(that); //没有写错，只是同名，见2.1节
  },
      //删除指定图片
deleteImage: function (e) {
    let index = e.currentTarget.dataset.index;
    var that = this;
    var imagetemp = that.data.imageurl;
    imagetemp.splice(index, 1);
    that.setData({ imageurl: imagetemp });
  },

```



### 4.3 我的页面

我的页面包含了用户的数据统计信息与小程序的推广信息，目前有待完善，从我的页面进去的动态页面只包含用户自己发布的。

![](https://image.catac.cn/我的页面未登陆.png)



	在未登陆时，页面显示默认头像，点击头像，授权个人信息，显示微信头像与昵称。

![](https://image.catac.cn/我的页面.png)



### 4.4 群间运动PK

接下来，重头戏来了，运动数据pk为该小程序的核心功能， 

功能点：

1）获取用户此时的运动步数并展示出来

2）分享自己的运动步数到微信群 并在页面上形成 pk排名区

3）其他用户通过分享进入小程序，系统获取其群id与运动步数 与同一微信群的用户进行pk

4）每次分享或点击分享链接，系统将自动更新该用户的运动步数

5） pk排名区只展示当日的排名情况，晚上12点后自动清空pk区

技术点：

1）获取用户运动步数

2）获取群id

3)  各群之间间运动数据隔离



效果如下图所示

![](https://image.catac.cn/群间pk页获取权限.png)



授权后显示步数。

![](https://image.catac.cn/群间pk页.png)





点击选择一个聊天后，将发布分享到微信群里，分享成功后，前端获取到**ShareTicket**，群内其他人通过该链接进来，前端也会获取到**ShareTicket**，调用   wx.getShareInfo(）将加密数据发送给后端解密，可获得 openGid ，将用户的步数与openGid等信息存储起来，形成了groupsport表。

**保存当日已分享的群id，获取ShareTicket 关键代码：**

```javascript
  
  onLoad: function (opt) {
      //在storage中创建用户的当日分享情况 也就是分享到了哪些群，将这些群id存在一个与日期挂钩的对象中，到了第二天，清空群id.  
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
      //设置开启ShareTicket
  wx.showShareMenu({
      withShareTicket: true
    })
 }
```



**获取个人运动数据**

```javascript
onShow: function () {
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
  }
```



**分享时获取群id**

```javascript
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
```



**刷新群内pk**

```javascript
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
```



**点击分享链接获取shareTicket，通过链接进入小程序的场景值是1044**

```javascript
app.js
onShow (opt){
  console.log("opt.scene" + opt.scene);
  if (opt.scene==1044){
    this.globalData.shareTicket = opt.shareTicket;
  }
},
```



![](https://image.catac.cn/群间分享.jpg)





## 5. 后端开发

后端采用的是koa2，通过sequelize.js实现与mysql的连接。

### 5.1 获取用户openid与session_key

```javascript
function getOpenId(code) {
  console.log(code);
  return new Promise((resolve, reject) => {
      const id = ''; // AppID(小程序ID)
      const secret = '';// AppSecret(小程序密钥)
      let url = `https://api.weixin.qq.com/sns/jscode2session?appid=${id}&secret=${secret}&js_code=${code}&grant_type=authorization_code`;
    axios.get(url).then(function (response) {
        console.log("response.data:"+response.data);
        resolve(response.data);
      })
      .catch(function (error) {
        console.log(error);
        reject(error);
      });

})
}
async function login(ctx) {
  const {code} = ctx.query;
  const data = await getOpenId(code);
  ctx.body = data;

}
```



### 5.2 运动数据与群id数据获取

这两个数据属于隐私数据，需要用算法解密，具体的流程，微信开发手册上有，我就不多说了，需要用到上一步的session_key来解密。

```javascript
//WXBizDataCryptconst：微信提供的解密方法
WXBizDataCryptconst WXBizDataCrypt = require('./WXBizDataCrypt')

var appId = '';
async function getsportdata(ctx) {
  var encryptedData=ctx.query.encryptedData;
  var iv=ctx.query.iv;
  var session_key=ctx.query.session_key;
  console.log("session_key"+session_key);
  var pc = new WXBizDataCrypt(appId,session_key);

  var data = pc.decryptData(encryptedData,iv);

  console.log('解密后 data: ', data);
  ctx.body={
    success:true,
    data:data
  }
}
```



### 5.3 创建与读取运动数据

当用户分享自己的运动数据到微信群内时或者微信群内其他用户通过该链接进入小程序时，后端将获创建或者更新该用户的群内运动数据。

```javascript
const creategroupsport = async function(data){ // 给某个用户创建一条群运动记录
  let nowDate = new Date();
  let year = nowDate.getFullYear();
  let month = nowDate.getMonth() + 1 < 10 ? "0" + (nowDate.getMonth() + 1)
    : nowDate.getMonth() + 1;
  let day = nowDate.getDate() < 10 ? "0" + nowDate.getDate() : nowDate
    .getDate();
  let dateStr = year + "-" + month + "-" + day;
  var countdata = await Todolist.findAndCount({
    where:{openGid:data.openGid,createdate:dateStr,openid: data.openid}
  })
  var count=0;
  if(countdata!=undefined||countdata!=null) {
      count = countdata.count;
  }
  if(count==0) {
    await Todolist.create({
      openGid: data.openGid,
      openid: data.openid,
      todaysportcount: data.todaysportcount,
      createdate: dateStr,
      avatarUrl: data.avatarUrl,
      nickname: data.nickname
    })
  }
  else {
    await Todolist.update({
      todaysportcount: data.todaysportcount,
      avatarUrl: data.avatarUrl,
      nickname: data.nickname,
      openid: data.openid,
    },{
      where:{
        id:countdata.rows[0].id

      }
    })
  }
  return true
}
```



```javascript
//读取群内运动数据
const getgroupsport = async function(openGid){
  console.log('openGid'+openGid);
  let nowDate = new Date();
  let year = nowDate.getFullYear();
  let month = nowDate.getMonth() + 1 < 10 ? "0" + (nowDate.getMonth() + 1)
    : nowDate.getMonth() + 1;
  let day = nowDate.getDate() < 10 ? "0" + nowDate.getDate() : nowDate
    .getDate();
  let dateStr = year + "-" + month + "-" + day;
  const data= await Todolist.findAndCount({
    where:{openGid:openGid,createdate:dateStr},
    order: [
      ['todaysportcount', 'DESC']
    ]
  })
  console.log(data);
  return data;
}
```



### 5.4 动态的获取

对用户发布的动态，后台目前主要有 增，改，查三类方法，我说一下分页查询。

```javascript
const findallnotice = async function(ctx){ // 查询所有
	let pageno=ctx.pageno;
	let pagesize=ctx.pagesize;
	console.log(pageno,pagesize);
 const data= await Todolist.findAndCount({
            where: {state:1},
            offset:(pageno - 1) * pagesize,//开始的数据索引，比如当page=2 时offset=10 ，而pagesize我们定义为10，则现在为索引为10，也就是从第11条开始返回数据条目
            limit:pagesize*1//每页限制返回的数据条数
       })
 console.log(data);
  return data;
}

const findmynotice = async function(ctx){ // 查询自己的
  let pageno=ctx.pageno;
  let pagesize=ctx.pagesize;
  let uid=ctx.openid;
  console.log(pageno,pagesize,uid);
  const data= await Todolist.findAndCount({
    where:{uid:uid},
    offset:(pageno - 1) * pagesize,//开始的数据索引，比如当page=2 时offset=10 ，而pagesize我们定义为10，则现在为索引为10，也就是从第11条开始返回数据条目
    limit:pagesize*1//每页限制返回的数据条数
  })
  console.log(data);
  return data;
}
```



## 6. 总结

我洋洋洒洒写了几千字，看上去举重若轻，但是在实际开发中经常会碰见各种各样的问题，该项目从原型设计与开发到部署都是我独自完成的，中间也踩了一些坑，这个项目最终没能上线，是因为，个人主体账号不能发布关于GUC的小程序。

本文首发于我的个人博客： https://www.catac.cn，转载时请注明来源，

该项目源码地址：https://github.com/oumingliang/ydonline.git

也欢迎各位与我交流，个人QQ:2541511219

