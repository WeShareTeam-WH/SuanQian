Page({
  data: {
    userinfos: [{
        userId: 1,
        userName: 'Simon',
        useMoney: 3
      },
      {
        userId: 2,
        userName: 'Lowrence',
        useMoney: 5
      },
      {
        userId: 3,
        userName: 'Tom',
        useMoney: 0
      },
      {
        userId: 4,
        userName: 'Joseph',
        useMoney: 0
      }
    ],
    resultData: [],
    total: 0,
    avg: 0,
    showView: false,
    showResult: false
  },
  addUserItem: function() {
    var userInfos = this.data.userinfos;
    var userId = userInfos[userInfos.length - 1].userId + 1;
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
    var userinfos= [{
      userId: 1,
      userName: '',
      useMoney: ''
      },
      {
        userId: 2,
        userName: '',
        useMoney: ''
      },
      {
        userId: 3,
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
  calculation: function() {
    var userInfos = this.data.userinfos;
    // Step1: get ave value
    var totalAmount = 0;
    var userNumber = 0;
    for (var i in userInfos) {
      var userInfo = userInfos[i];
      var useMoney = 0;
      if (userInfo.useMoney !== '') {
        useMoney = userInfo.useMoney;
        userNumber += 1;
      }
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
    // var result = ''
    this.resultData = []
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
          var negSortList = Object.keys(less).map(function (key) {
            return [key, less[key]]
          })
          negSortList.sort(function (first, second) {
            return first[1] - second[1];
          })

          var newPosRecords = {};
          var newNegRecords = {};
          this.multiOffset(posSortList, negSortList, mores, less, newPosRecords, newNegRecords)
          mores = newPosRecords
          less = newNegRecords
        } else {
          var negSortList = Object.keys(mores).map(function (key) {
            return [key, mores[key]]
          })
          negSortList.sort(function (first, second) {
            return first[1] - second[1];
          })

          var posSortList = Object.keys(less).map(function (key) {
            return [key, less[key]]
          })
          posSortList.sort(function (first, second) {
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
      avg: avgVal.toFixed(2)
    }) 
  },
  multiOffset: function (posSortList, negSortList, posRecords, negRecords, newPosRecords, newNegRecords) {
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
        // result += minPerson + ' handle ' + negRecords[minPerson].toFixed(2) + ' on ' + maxPerson + '\n'
        this.resultData.push({
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

      // result += minLastPerson + ' handle ' + (negSortList[index][1] + diff).toFixed(2) + ' on ' + maxPerson + '\n'
      this.resultData.push({
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
      // posRecords.pop(minLastPerson)
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
      //maxPersons = []
      var maxLastPerson = posSortList[index][0]
      var diff = maxValueSum + minValue

      var removePersonsKeys = []
      for (var z in maxPersons) {
        var maxPerson = maxPersons[z]
        // result += maxPerson + ' handle ' + posRecords[maxPerson].toFixed(2) + ' on ' + minPerson + '\n'
        this.resultData.push({
          fromUserName: this.getUserInfoByUserId(minPerson).userName,
          toUserName: this.getUserInfoByUserId(maxPerson).userName,
          money: posRecords[maxPerson].toFixed(2)
        })

        removePersonsKeys.push(maxPerson)
        // posRecords.pop(maxPerson)
      }
      var posKeyList = Object.keys(posRecords);
      for (var q in posKeyList) {
        var key = posKeyList[q];
        if (!removePersonsKeys.includes(key)) {
          newPosRecords[key] = posRecords[key];
        }
      }

      // result += maxLastPerson + ' handle ' + (posSortList[index][1] - diff).toFixed(2) + ' on ' + minPerson + '\n'
      this.resultData.push({
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
      // negRecords.pop(minPerson)
      newPosRecords[maxLastPerson] = diff
    }
    // return result;
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
            this.resultData.push({
              fromUserName: this.getUserInfoByUserId(id).userName,
              toUserName: this.getUserInfoByUserId(uId).userName,
              money: mores[uId].toFixed(2)
            })
          }
        }
      }
    }
    this.setData({
      resultData: this.resultData
    })
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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})