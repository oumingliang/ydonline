/**
 * 远光党建/九三社员之家
 * 文件上传下载
 */
import regeneratorRuntime from '../packages/regenerator/runtime'
import http from 'http'

const attachsUpload = http.getBaseUrl() + "/restful/fileUploadController/attachsUpload";
const fileUploadReturnUrl = http.getBaseUrl() + "/restful/fileUploadController/fileUploadReturn";

/*
type:0返回上传的附件ID 1：返回附件对象
*/
const uploadFile = (type) => {
  var promise = new Promise((resolve, reject) => {
    var fileUploadReturn = (type === 1 ? fileUploadReturnUrl : attachsUpload);
    wx.chooseImage({
      count:1,
      success: function (res) {
        var tempFilePaths = res.tempFilePaths;
        const uploadTask = wx.uploadFile({
          url: fileUploadReturn,
          filePath: tempFilePaths[0],
          name: 'file',
          success: function (res) {
            var data = res.data
            if (type == 0) {
              resolve(data) ;
            } else {
              data = data.replace(/\ufeff/g, "");//重点
              var newData = JSON.parse(data);
              resolve(newData);
            }
          }
        })

        // uploadTask.onProgressUpdate((res) => {
        //   console.log('上传进度', res.progress)
        //   console.log('已经上传的数据长度', res.totalBytesSent)
        //   console.log('预期需要上传的数据总长度', res.totalBytesExpectedToSend)
        // })
      }
    })
  })
 
 return promise;
  
}

export default {
  uploadFile
}