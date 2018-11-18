import regeneratorRuntime from '../packages/regenerator/runtime'
import WXP from '../packages/api-promise/wxp'
import http from '../services/http'

const restfulUrl = http.getBaseUrl() + "/opendata";
const groupsport = http.getBaseUrl() + "/groupsport";

const getsportdata = async function (sportdataobj, session_key){
  let token = await http.request({
    url: restfulUrl + "/getsportdata",
    method: "GET",
    data: {
      encryptedData: sportdataobj.encryptedData,
      iv:sportdataobj.iv,
      session_key:session_key
    }
  })
  console.log(token.data);
  return token.data;
}
const creategroupsport = async function (obj) {
  let token = await http.request({
    url: groupsport + "/creategroupsport",
    method: "POST",
    data: obj
  })
  console.log(token.data);
  return token.data;
}
const getgroupsport = async function (openGid) {
  let token = await http.request({
    url: groupsport + "/getgroupsport",
    method: "GET",
    data: {
      openGid
    }
  })
  console.log(token.data);
  return token.data;
}


export default {
  getsportdata,
  creategroupsport,
  getgroupsport
}