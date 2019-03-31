const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function generalBillName(loginUserName) {
  var date = new Date()
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  return loginUserName + '-' + year + '-' + month +'-' + day
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function copy(oldObject) {
  let newObject = {}
  newObject = JSON.parse(JSON.stringify(oldObject))
  return newObject
}

module.exports = {
  formatTime,
  copy,
  generalBillName
}
