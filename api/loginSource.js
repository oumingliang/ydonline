import regeneratorRuntime from '../packages/regenerator/runtime'
import WXP from '../packages/api-promise/wxp'
import http from '../services/http'

const restfulUrl = http.getBaseUrl() + "/login";

const login = async function (code) {
  let token = await http.request({
    url: restfulUrl + "/login",
    method: "GET",
    data: {
     code:code
    }
  })
  console.log(token.data);
  return token.data;
}
export default{
  login
}