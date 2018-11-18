import regeneratorRuntime from '../packages/regenerator/runtime'
import WXP from '../packages/api-promise/wxp'
import http from '../services/http'

const restfulUrl = http.getBaseUrl() + "/notice";
/*
方法——获取列表

*/
const savenotice = async function (notice) {
  let token = await http.request({
    url: restfulUrl+"/createlist",
    method: "POST",
    data: notice
  })
  // return token.data;
}
  //获取所有动态信息
const findalllnotice = async function (pageno, pagesize) {
    let token = await http.request({
      url: restfulUrl +"/findallnotice",
         method: "GET",
         data: {
           pageno: pageno,
           pagesize: pagesize
         }
      })
  console.log(token.data.data.rows);
  return token.data.data.rows;
}

const findmynotice = async function (pageno, pagesize,openid) {
  let token = await http.request({
    url: restfulUrl + "/findmynotice",
    method: "GET",
    data: {
      openid:openid,
      pageno: pageno,
      pagesize: pagesize
    }
  })
  console.log(token.data.data.rows);
  return token.data.data.rows;
}

const getmynoticeaccount = async function (openid){
  let token = await http.request({
    url: restfulUrl + "/getmynoticeaccount",
    method: "GET",
    data: {
      openid
    }
  })
  return token.data;

}

  
  //获取通知详情
  const queryActivityDetail = async function (activityId) {
      let token = await http.request({
 url: "/restful/wxActivitys/queryActivityDetail",
          method: "GET",
          data: {
 activityId: activityId,
         }
      })
  return token.data;
  }

  
export default {
    savenotice,
  findalllnotice,
  findmynotice,
  getmynoticeaccount,
 queryActivityDetail,
 
}