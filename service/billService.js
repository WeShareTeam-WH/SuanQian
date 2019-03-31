const db = wx.cloud.database()
const sessionCache = require("../common/sessionCache.js")
const util = require("../utils/util.js")

const getBillUserInfo = (success, failed) => {
  let activeUser = sessionCache.get("activeUser")
  var bills = db.collection('bills')
  .where({
    memberid: activeUser._id
  }).get({
    success:res => {
      console.log(res)
    },
    fail: res => {
      console.log(res)
    }
  })
  return {
    dataType: {
      'content-type': 'application/json'
    }
  }
}

const creatOrUpdateBill = (billId, billData, element) => {
  var bills = db.collection('bills')
  if (billId == '-1') {
    bills.add({
      data: billData,
      success(res) {
        billData._id = res.data._id
        //typeof sucessFun === 'function' && sucessFun(billData)
      },
      fail(err) {
        //typeof failFun === 'function' && failFun(err)
        console.error('zzzzzz')
      }
    })
  } else {
    var updateData = {};
    // Step1: get last data for current bill
    return bills.where({
      _id: billId
    })
      .get({
        success(res) {
          const activeUser = sessionCache.get("activeUser")
          updateData.members = []
          let serverMembers = res.data.members;
          let localMembers = billData.members;
          if (serverMembers) {
            // Step2: judge need update data
            if (res.average != billData.average) {
              updateData.average = average;

            }
            updateData = util.copy(res.data)
            updateData.members = []
            let newAddMembers = []
            let newUpdateMembers = []
            serverMembers.forEach((serverItem) => {
              localMembers.forEach((localItem) => {
                if (serverItem.memberId === localItem.memberId) {
                  if (res.data.createdBy === activeUser._id) {
                    newUpdateMembers.push(localItem)
                  }
                  else {
                    newUpdateMembers.push(serverItem)
                  }
                }
              })
            });

            localMembers.forEach((localItem) => {
              let localMemberFound = false
              serverMembers.forEach((serverItem) => {
                if (serverItem.memberId === localItem.memberId) {
                  localMemberFound = true
                }
              })
              if (!localMemberFound) {
                newAddMembers.push(localItem)
              }

            })

            newAddMembers.forEach((item) => {
              updateData.members.push(item)
            })

            newUpdateMembers.forEach((item) => {
              updateData.members.push(item)
            })

            db.collection('bills').doc(res.data._id).update({
              data: updateData,
              success: res => {
                //typeof sucessFun === 'function' && sucessFun(res.data)
                return res.updateData
              },
              fail: err => {
                var s = ''
                console.log('ssss')
                //typeof failFun === 'function' && failFun(err)
              }
            })
          }

        }
      })
  }
}

const getBillInfoByBillId = (billId) => {
  let activeUser = sessionCache.get("activeUser")
  return new Promise (db.collection('bills')
    .where({
      _id: billId
    }).get())
}

module.exports = {
  creatOrUpdateBill,
  getBillUserInfo,
  getBillInfoByBillId
}