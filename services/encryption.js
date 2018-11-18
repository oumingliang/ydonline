/**
 * 远光党建/九三社员之家
 * 加密、解密服务，处理93服务器、微信服务器敏感信息的加密传输
 * 
 * Created at     : 2018-07-04 14:09:03
 * Last modified  : zhouzhiming@ygsoft.com
 */
import MD5 from "../packages/encrypt/md5"

/**
 * 使用MDS和RSA-1加密
 * 这是93社员之家密文传输的默认方式
 */
const encryptUsingMD5 = (content = "") => MD5.hex_md5(content)

export default {
  encryptUsingMD5
}