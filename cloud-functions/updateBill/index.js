// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const updateData = event.updateData
  const billId = event.billId
  console.info(updateData)
  console.info(billId)
  try {
    return await db.collection('bills').doc(billId).update({
      data: updateData
    })
  } catch (e) {
    console.log(e)
  }
}