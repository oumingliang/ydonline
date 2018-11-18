export class URL {
  constructor(url = HOST) {
    this.scheme = null; // http://
    this.domain = null; // baidu.com
    this.path = null; // /a/b/c
    this.query = null; // ?id=1
    this.anchor = null; // #abc
    this.appname = null; // 为了93专门增加的，插入到domain和path之间，如“/93home”
    this.url = url;

    //在字符串中查找指定的字符,如果不存在返回字符串长度
    function findIndex(str, chars) {
      var r = str.length;
      for (var i = 0; i < chars.length; i++) {
        var j = str.indexOf(chars[i]);
        if (j >= 0 && r > j)
          r = j;
      }
      return r;
    }

    if (url.length > 0) {
      let scheme = /^([^:/]+:\/\/|\/\/)/.exec(url) || "";
      if (scheme && scheme.length > 0) {
        this.scheme = scheme[0];
        url = url.substr(this.scheme.length);
        this.domain = url.substr(0, findIndex(url, ["/", "\\", "?", "#"])).replace(/[\/\\]$/g, "");
        if (this.domain.indexOf(".") == -1) {
          throw new Error('The "url" argument is invalid. because "domian" doesn\'t exist. from string : "' + arguments[0] + '"');
        }
        url = url.substr(this.domain.length);
      }
      this.path = url.substr(0, findIndex(url, ["?", "#"])).replace(/[?#]$/g, "");
      url = url.substr(this.path.length);
      this.path = this.path.replace(/(\\|\/)+/g, "/");
      this.query = url.substr(0, findIndex(url, ["#"]));
      url = url.substr(this.query.length);
      this.anchor = url;
    }
  }

  toString() {
    let path = this.path;
    if (this.scheme == null || this.scheme === "" || this.domain == null || this.domain !== "") {
      //处理url中的 \..
      function backtrack(path) {
        while (path !== (path = path.replace(/((\/|^)[^\/]+\/\.\.)|^\/\.\.|^\.\./g, ""))) {}
        return path;
      }

      path = backtrack(path);
      if (path.charAt(0) !== "/") {
        path = "/" + path;
      }
    }
    return [this.scheme, this.domain, this.appname, path, this.query, this.anchor === "#" ? "" : this.anchor].join("");
  };
}