const restService = require("../../service/restService")
const sessionCache = require("../../common/sessionCache")
const loginService = require("../../service/loginService")
const util = require("../../utils/util")
const app = getApp()

Page({
  data: {
    userinfos: [{
        icon1:'../../source/user.png',
        icon2:'../../source/money.png',
        userId: 1,
        userName: '',
        useMoney: ''
      }
    ],
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    resultData: [],
    total: 0,
    avg: 0,
    showView: false,
    showResult: false,
    currentBillId:"",
    isActive:false
  },

/**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
      sessionCache.set("userInfo", this.data.userInfo)
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
        sessionCache.set("userInfo", this.data.userInfo)
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
          sessionCache.set("userInfo", this.data.userInfo)
        }
      })
    }

    loginService.login((res) =>{
        const activeUser = sessionCache.get("activeUser")
        let userInfos = this.data.userinfos
        userInfos[0].userName = activeUser.name
        userInfos[0].icon1 = activeUser.img
        this.setData({
          userinfos:userInfos
        })
      },(res) =>{
        console.log(res)
        // wx.showToast({
        //   title: '请先授权！',
        //   icon: "none"
        // })
      })
  },

  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
    sessionCache.set("userInfo", this.data.userInfo)
    loginService.login((res) =>{
      const activeUser = sessionCache.get("activeUser")
      let userInfos = this.data.userinfos
      userInfos[0].userName = activeUser.name
      userInfos[0].icon1 = activeUser.img
      this.setData({
        userinfos:userInfos
      })
    },(res) =>{
      console.log(res)
      // wx.showToast({
      //   title: '请先授权！',
      //   icon: "none"
      // })
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '好友喊您算钱了~',
      path:  "pages/home/home?"+ "billId="+this.data.currentBillId,
      //imageUrl:config.url.images+"",
      success: (res)=>{
      },
      fail: function (res) {
        console.log(res);
      }
    }
  },

  addUserItem: function() {
    var userInfos = this.data.userinfos
    var userId = 1
    if (userInfos.length > 0) {
      userId = userId = userInfos[userInfos.length - 1].userId + 1;
    }
    userInfos.push({
      userId: userId,
      userName: '',
      useMoney: ''
    })
    this.setData({
      userinfos: userInfos
    })
  },
  deleteUserItem: function(e) {
    var userId = e.currentTarget.dataset.userId;
    var userInfos = this.data.userinfos;
    var newUserInfos = [];
    for (var i in userInfos) {
      var userInfo = userInfos[i];
      if (userInfo.userId != userId) {
        newUserInfos.push(userInfo);
      }
    }
    this.setData({
      userinfos: newUserInfos
    })
  },
  resetUserItem: function() {
    var userinfos = [{
        userId: 1,
        userName: '',
        useMoney: ''
      }
    ]
    this.setData({
      userinfos: userinfos
    })

    this.setData({
      showView: false,
      showResult: false,
      resultData: []
    })
  },
  isNumber: function(value) {
    var patrn = /^(-)?\d+(\.\d+)?$/;
    if (patrn.exec(value) == null || value === '') {
      return false
    } else {
      return true
    }
  },
  calculation: function() {
    loginService.login((a)=>{},(b)=>{})
    var userInfos = this.data.userinfos;
    // Step1: get ave value
    var totalAmount = 0;
    var userNumber = 0;
    var userCount = 0;  // include empty and invalid row
    for (var i in userInfos) {
      var userInfo = userInfos[i];
      var useMoney = 0;
      userCount++;

      if (userInfo.useMoney === '' && userInfo.userName != '') {
        wx.showToast({
          title: '麻烦输入下成员 "' + userInfo.userName + '" 的金额哦~',
          duration: 2000,
          icon: 'none'
        })
        return
      }

      if (!this.isNumber(userInfo.useMoney) && userInfo.userName != '') {
        wx.showToast({
          title: '成员 "' + userInfo.userName + '" 的金额有点问题哦~',
          duration: 2000,
          icon: 'none'
        })
        return
      }

      if (userInfo.userName == '' && userInfo.useMoney !== '') {
        wx.showToast({
          title: '麻烦输入下第' + (userCount) + '行成员的大名哦~',
          duration: 2000,
          icon: 'none'
        })
        return
      }

      if (userInfo.userName == '' && userInfo.useMoney === '') {
        continue
      }

      useMoney = userInfo.useMoney;
      userNumber += 1;
      totalAmount += parseFloat(useMoney);
    }
    var avg = totalAmount / userNumber;
    console.log("totalAmount:%s,userNumber:%s,avg:%s", totalAmount, userNumber, avg);

    // Step2: get positives and negatives
    var positives = {}
    var negatives = {}
    for (var i in userInfos) {
      var userInfo = userInfos[i];
      var userId = userInfo.userId;
      var userName = userInfo.userName;
      if (userName != '' && userInfo.useMoney !== '') {
        var useMoney = parseFloat(userInfo.useMoney);
        var diff = useMoney - avg;
        if (diff > 0) {
          positives[userId] = diff;
        } else if (diff == 0) {
          // not do nothing
        } else {
          negatives[userId] = diff;
        }
      }
    }

    // Step3: get result
    this.data.resultData = []
    var mores = {}
    var less = {}
    if (Object.keys(positives).length >= Object.keys(negatives).length) {
      mores = positives
      less = negatives
    } else {
      mores = negatives
      less = positives
    }

    while (Object.keys(mores).length > 0) {
      if (Object.keys(mores).length < Object.keys(less).length) {
        var temp = {};
        temp = mores;
        mores = less;
        less = temp;
      }

      var matchPersons = [];
      var lessPerson = [];
      this.offset(mores, less, matchPersons, lessPerson)
      if (matchPersons.length > 0) {
        // remove more person
        for (var i in matchPersons) {
          var moresPerson = matchPersons[i];
          if (moresPerson != '') {
            var persionList = moresPerson.split(',')
            var moresKeyList = Object.keys(mores);
            var newmores = [];
            for (var q in moresKeyList) {
              var key = moresKeyList[q];
              if (!persionList.includes(key)) {
                newmores[key] = mores[key];
              }
            }
            mores = newmores;
          }
        }

        // remove less person
        for (var i in lessPerson) {
          var lessPersonList = lessPerson[i].split(',')
          var lessKeyList = Object.keys(less);
          var newless = [];
          for (var q in lessKeyList) {
            var key = lessKeyList[q];
            if (!lessPersonList.includes(key)) {
              newless[key] = less[key];
            }
          }
          less = newless;
        }

      } else {
        if (Object.values(mores)[0] > 0) {
          var posSortList = Object.keys(mores).map(function(key) {
            return [key, mores[key]]
          })
          posSortList.sort(function(first, second) {
            return second[1] - first[1];
          })
          var negSortList = Object.keys(less).map(function(key) {
            return [key, less[key]]
          })
          negSortList.sort(function(first, second) {
            return first[1] - second[1];
          })

          var newPosRecords = {};
          var newNegRecords = {};
          this.multiOffset(posSortList, negSortList, mores, less, newPosRecords, newNegRecords)
          mores = newPosRecords
          less = newNegRecords
        } else {
          var negSortList = Object.keys(mores).map(function(key) {
            return [key, mores[key]]
          })
          negSortList.sort(function(first, second) {
            return first[1] - second[1];
          })

          var posSortList = Object.keys(less).map(function(key) {
            return [key, less[key]]
          })
          posSortList.sort(function(first, second) {
            return second[1] - first[1];
          })

          var newPosRecords = {};
          var newNegRecords = {};
          this.multiOffset(posSortList, negSortList, less, mores, newPosRecords, newNegRecords)
          less = newPosRecords
          mores = newNegRecords
        }
      }
    }

    // Step4: show Result
    var avgVal = 0;
    if (avg) {
      avgVal = avg
    }

    var showResult = false
    if (this.data.resultData.length > 0) {
      showResult = true
    }
    this.setData({
      showView: true,
      showResult: showResult,
      total: totalAmount.toFixed(2),
      avg: avgVal.toFixed(2),
      resultData: this.data.resultData
    }) 
  },
  multiOffset: function(posSortList, negSortList, posRecords, negRecords, newPosRecords, newNegRecords) {
    var maxValue = posSortList[0][1]
    var minValue = negSortList[0][1]
    if (maxValue > -minValue) {
      var maxPerson = posSortList[0][0]
      var minPersons = [negSortList[0][0]]
      var index = Object.keys(negSortList).length - 1
      var minValueSum = minValue
      while (index > 0) {
        minValueSum += negSortList[index][1]
        if (-(minValueSum) < maxValue) {
          minPersons.push(negSortList[index][0])
          index -= 1
        } else {
          break;
        }
      }

      //minPersons = []   
      var minLastPerson = negSortList[index][0]
      var diff = -(minValueSum) - maxValue

      var removePersonsKeys = []
      for (var k in minPersons) {
        var minPerson = minPersons[k];
        this.data.resultData.push({
          fromUserName: this.getUserInfoByUserId(minPerson).userName,
          toUserName: this.getUserInfoByUserId(maxPerson).userName,
          money: (-negRecords[minPerson]).toFixed(2)
        })

        removePersonsKeys.push(minPerson)
        // negRecords.pop(minPerson)
      }
      var negKeyList = Object.keys(negRecords);
      for (var q in negKeyList) {
        var key = negKeyList[q];
        if (!removePersonsKeys.includes(key)) {
          newNegRecords[key] = negRecords[key];
        }
      }

      this.data.resultData.push({
        fromUserName: this.getUserInfoByUserId(minLastPerson).userName,
        toUserName: this.getUserInfoByUserId(maxPerson).userName,
        money: (-negSortList[index][1] - diff).toFixed(2)
      })

      var posKeyList = Object.keys(posRecords);
      for (var q in posKeyList) {
        var key = posKeyList[q];
        if (maxPerson != key) {
          newPosRecords[key] = posRecords[key];
        }
      }

      newNegRecords[minLastPerson] = -diff
    } else {
      var minPerson = negSortList[0][0]
      var maxPersons = [posSortList[0][0]]
      var index = Object.keys(posSortList).length - 1
      var maxValueSum = maxValue
      while (index > 0) {
        maxValueSum += posSortList[index][1];
        if (maxValueSum < -minValue) {
          maxPersons.push(posSortList[index][0])
          index -= 1
        } else {
          break;
        }
      }

      var maxLastPerson = posSortList[index][0]
      var diff = maxValueSum + minValue

      var removePersonsKeys = []
      for (var z in maxPersons) {
        var maxPerson = maxPersons[z]

        this.data.resultData.push({
          fromUserName: this.getUserInfoByUserId(minPerson).userName,
          toUserName: this.getUserInfoByUserId(maxPerson).userName,
          money: posRecords[maxPerson].toFixed(2)
        })

        removePersonsKeys.push(maxPerson)
      }
      var posKeyList = Object.keys(posRecords);
      for (var q in posKeyList) {
        var key = posKeyList[q];
        if (!removePersonsKeys.includes(key)) {
          newPosRecords[key] = posRecords[key];
        }
      }

      this.data.resultData.push({
        fromUserName: this.getUserInfoByUserId(minPerson).userName,
        toUserName: this.getUserInfoByUserId(maxLastPerson).userName,
        money: (posSortList[index][1] - diff).toFixed(2)
      })
      removePersonsKeys.push(maxLastPerson)
      var negKeyList = Object.keys(negRecords);
      for (var q in negKeyList) {
        var key = negKeyList[q];
        if (maxLastPerson != key) {
          newNegRecords[key] = negRecords[key];
        }
      }

      newPosRecords[maxLastPerson] = diff
    }
  },
  offset: function(mores, less, matchPersons, lessPerson) {
    var comb = {}
    this.dfs(mores, 0, comb, '', 0)
    for (var i in comb) {
      var userId = i.substr(1);
      var amount = comb[i];
      for (var j in less) {
        var id = j;
        var payoff = less[j];
        if (parseFloat(-amount).toFixed(2) == parseFloat(payoff).toFixed(2)) {
          matchPersons.push(userId);
          lessPerson.push(id);
          var userIdList = userId.split(',');
          for (var i in userIdList) {
            var uId = userIdList[i];
            if (mores[uId] > 0) {
              this.data.resultData.push({
                fromUserName: this.getUserInfoByUserId(id).userName,
                toUserName: this.getUserInfoByUserId(uId).userName,
                money: mores[uId].toFixed(2)
              })
            } else {
              this.data.resultData.push({
                fromUserName: this.getUserInfoByUserId(uId).userName,
                toUserName: this.getUserInfoByUserId(id).userName,
                money: (-mores[uId]).toFixed(2)
              })
            }
          }
        }
      }
    }
  },
  getUserInfoByUserId: function(userId) {
    var userInfos = this.data.userinfos
    var userInofResult = [];
    for (var i in userInfos) {
      var userInfo = userInfos[i];
      if (userInfo.userId == userId) {
        userInofResult = userInfo;
        break;
      }
    }
    return userInofResult;
  },
  dfs: function(source, index, comb, persons, amount) {
    if (index < Object.keys(source).length) {
      this.dfs(source, index + 1, comb, persons, amount)
      persons += ',' + Object.keys(source)[index];
      amount += Object.values(source)[index];
      comb[persons] = amount.toFixed(2);
      this.dfs(source, index + 1, comb, persons, amount)
    }
  },
  inputName: function(e) {
    var userName = e.detail.value;
    var userId = e.currentTarget.dataset.userId;
    var userInfos = this.data.userinfos;

    for (var i in userInfos) {
      var userInfo = userInfos[i];
      var id = userInfo.userId;
      if (userId == id) {
        userInfo.userName = userName;
        break;
      }
    }
    this.userInfos = userInfos;
  },
  inputMoney: function(e) {
    var useMoney = e.detail.value;
    var userId = e.currentTarget.dataset.userId;
    var userInfos = this.data.userinfos;
    for (var i in userInfos) {
      var userInfo = userInfos[i];
      var id = userInfo.userId;
      if (userId == id) {
        userInfo.useMoney = useMoney;
        break;
      }
    }
    this.userInfos = userInfos;
  },
  guize: function() {
    wx.showToast({
      title: '程序猿小哥哥们正在兼容更多复杂场景....期待我们下次升级吧',
      duration: 2600,
      icon: 'none'
    })
  },
  
})