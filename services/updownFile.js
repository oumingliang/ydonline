/**
 * 远光党建/九三社员之家
 * 文件上传下载
 */
import regeneratorRuntime from '../packages/regenerator/runtime'
import WXP from '../packages/api-promise/wxp'
import http from 'http'
import encrypt from 'encryption'
import msgUtil from '../utils/messageUtil'

const OFFICEFILE = 'file, doc, xls, ppt, pdf, docx, xlsx, pptx'
const IMGFILE = 'file, jpg, png, gif, jpeg'
const VIDEOFILE = 'file, mp4, avi, mkv, rmvb'

const downloadTask = async (fileId, fileType) => {
  wx.downloadFile({
    url: http.getBaseUrl() + "/restful/fileUploadController/downFile?fileId=" + fileId,
    success: function (res) {
      var filePath = res.tempFilePath
      if (OFFICEFILE.indexOf(fileType)>0){
        wx.openDocument({
          filePath: filePath,
          success: function (res) {
            //console.log('打开文档成功')
          },
          complete(res) {
            wx.hideLoading()
          }
        })
      } else if (IMGFILE.indexOf(fileType) > 0) {
        wx.previewImage({
          urls: [filePath], // 需要预览的图片http链接列表
          success: function (res) {
            //console.log('图片预览成功')
          },
          complete(res) {
            wx.hideLoading()
          }
        })
      } else if (VIDEOFILE.indexOf(fileType) > 0) {
       
        wx.saveVideoToPhotosAlbum({
          filePath: filePath,
          success(res) {
            //console.log(res.errMsg)
          },
          complete(res){
            wx.hideLoading()
            wx.showToast({
              title: '下载成功,已保存到手机相册！',
              icon: 'success',
              duration: 2000
            });
          }
        })
      } else{
        wx.hideLoading()
        wx.showToast({
          title: '无法打开该格式的文件！',
          icon: 'none',
          duration: 1500
        });
      }
    },
  })
}

export default {
  downloadTask
}