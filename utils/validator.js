/* 
* Created at     : 17:07 2018/8/22
* Created by     : zhaoxixiong@ygsoft.com
* Last modified  : zhaoxixiong@ygsoft.com
*/

const strategies = {
  isEmpty: function (value, message) {
    if (!!!value) {
      return message;
    }
  },
  minLength: function (value, length, message) {
    var targetLen = value.length;
    if (targetLen < length) {
      return message;
    }
  },
  maxLength: function (value, length, message) {
    var targetLen = value.length;
    if (targetLen > length) {
      return message;
    }
  },
  isChinese: function (value, message) {
    var chineseReg = /[\u4e00-\u9fa5]/g; // 中文
    if (!chineseReg.test(value)) {
      return message;
    }
  },
  numberRange: function (value, min, max, message) {
    console.log(value, min, max);
    if (value * 1 < min * 1 || value * 1 > max * 1) {
      return message;
    }
  }
}

class Validator {
  constructor() {
    this.cache = [];
  }

  add(value, rules) {
    for (let i = 0, item; item = rules[i++];) {
      this.cache.push(() => {
        let strategyArray = item["strategy"].split(":");
        const strategy = strategyArray.shift();
        strategyArray.unshift(value);
        strategyArray.push(item.message ? item.message : "输入内容不合法！");
        return strategies[strategy](...strategyArray);
      })
    }
  }

  check() {
    for (let i = 0, item; item = this.cache[i++];) {
      const message = item();
      if (!!message) {
        this.cache.length = 0;
        return message;
      }
    }
    this.cache.length = 0;
  }
}

export default Validator

