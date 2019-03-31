const sessionCache = require("../common/sessionCache")
const util = require("../utils/util")

const login = (success, failed) => {
  const activeUser = sessionCache.get('activeUser')
  const userInfo = sessionCache.get("userInfo")
  if (activeUser && activeUser.name == userInfo.nickName) {
    typeof success === 'function' && success(activeUser)
  }
  else {
    if (userInfo){
      wx.login({
        success: function (res) {
          wx.cloud.callFunction({
            // 云函数名称
            name: 'login',
            // 传给云函数的参数
            data: {
              code: res.code
            },
          }).then(res => {
            if (res.result && res.result.openid) {
              const db = wx.cloud.database()

              const insertData = {
                createdAt: util.formatTime(new Date()),
                loginAt: util.formatTime(new Date()),
                name: userInfo.nickName,
                img: userInfo.avatarUrl,
                openid: res.result.openid
              }

              db.collection('users').where({
                "openid":res.result.openid
              }).get({
                success: res => {
                  if (res && res.data && res.data.length > 0){
                    sessionCache.set('activeUser', res.data[0])
                    success(res.data[0])
                  }
                  else{
                    db.collection('users').add({
                    data: insertData,
                    success: res => {
                      insertData._id = res._id
                      insertData._openid = res._openid
                      sessionCache.set('activeUser', insertData)
                      success(insertData)
                    },
                    fail: err => {
                      failed("请先授权！")
                    }
                   })
                  }
                },
                fail: err => {
                  failed("请先授权！")
                }
              })     
            }
            else {
              failed("请先授权！")
            }
          }).catch(console.error)
        },
        fail: function (res) {
          failed("请先授权！")
        }
      })
    }
    else{
      failed("请先授权！")
    }
   
  }
}


module.exports = {
  login
}