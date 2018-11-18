/**
 * 由于小程序App.js中的onError不捕获在Promise中的uncatch异常
 * 暂时采用setTimeout这种别扭的方法应对一下
 */
const throwException = (level, message, cause) => {
  console.error(new Error(message))

  setTimeout(() => {
    let str = JSON.stringify({
      level,
      message,
      cause
    })
    throw new Error(`#MSG_S#${str}#MSG_E#`)
  }, 0)
}

/**
 * 在App.js的全局异常处理中调用，从字符串中重新还原异常信息
 */
const getError = (err) => {
  if (err.indexOf("#MSG_S#") > -1) {
    return JSON.parse(err.substring(err.indexOf("#MSG_S#") + 7, err.indexOf("#MSG_E#")))
  } else {
    return {
      level: "ERROR",
      message: err,
      cause: null
    }
  }
}

const showMessage = (msg) => {
  wx.showToast({
    icon: 'none',
    title: msg,
    duration: 3000
  })
}

export default {
  throwException,
  showMessage,
  getError
}