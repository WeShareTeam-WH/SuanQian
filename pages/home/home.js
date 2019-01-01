Page({
  data: {
    userinfos: [{
      userId:1,
      userName: 'Simon',
      useMoney: 12.11
    },
    {
      userId: 2,
      userName: 'Lowrence',
      useMoney: 20.5
    },
    {
      userId: 3,
      userName: 'Tom',
      useMoney: 26.22
    }],
    resultData: [],
    showView: false
  },
  addUserItem: function() {
    var userInfos = this.data.userinfos;
    var userId = userInfos[userInfos.length -1].userId + 1;
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
  calculation: function() {
    var userInfos = this.data.userinfos;
    // Step1: get ave value
    var totalAmount = 0;
    var userNumber = userInfos.length;
    for(var i in userInfos) {
      var userInfo = userInfos[i];
      totalAmount += parseFloat(userInfo.useMoney);
    }
    var avg = totalAmount/userNumber;
    console.log("totalAmount:%s,userNumber:%s,avg:%s", totalAmount, userNumber, avg);

    // Step2: get positives and negatives
    var positives = {}
    var negatives = {}
    for (var i in userInfos) {
      var userInfo = userInfos[i];
      var userId = userInfo.userId;
      var userName = userInfo.userName;
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

    // Step3: get result
    var result = ''
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
      if (matchPersons) {
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
          var posSortList = Object.values(mores).sort(function (a, b) {
            return b - a;
          });
          var negSortList = Object.values(less).sort(function (a, b) {
            return a-b;
          });
          result += this.multiOffset(posSortList, negSortList, mores, less)
        } else {
          var negSortList = Object.values(mores).sort(function (a, b) {
            return a - b;
          });
          var posSortList = Object.values(less).sort(function (a, b) {
            return b - a;
          });
          result += this.multiOffset(posSortList, negSortList, less, mores)
        }
      }
    }

    // Step4: show Result
    this.setData({
      showView: true
    })
  },
  showResult: function() {
    
  },
  multiOffset: function (posSortList, negSortList, posRecords, negRecords) {
    var result = ''
    var maxValue = posSortList[0][1]
    var minValue = negSortList[0][1]
    if (maxValue > -minValue) {
      var maxPerson = posSortList[0][0]
      var minPersons = [negSortList[0][0]]
      var index = len(negSortList) - 1
      var minValueSum = minValue
      while (index > 0) {
        minValueSum += negSortList[index][1]
        if (-(minValueSum) < maxValue) {
          minPersons.append(negSortList[index][0])
          index -= 1
        } else {
          break;
        }
      }

      //minPersons = []   
      var minLastPerson=negSortList[index][0]
      var diff=-(minValueSum) - maxValue

      for (var k in minPersons) {
        var minPerson = minPersons[k];
        result += minPerson + ' handle ' + negRecords[minPerson].toFixed(2) + ' on ' + maxPerson + '\n'
        negRecords.pop(minPerson)
      }

      result+= minLastPerson + ' handle ' + (negSortList[index][1] + diff).toFixed(2) + ' on ' + maxPerson + '\n'
      posRecords.pop(maxPerson)
      negRecords[minLastPerson] = -diff
    } else {
      minPerson = negSortList[0][0]
      maxPersons=[posSortList[0][0]]
      index = len(posSortList) - 1
      maxValueSum=maxValue
      while (index > 0) {
        maxValueSum += posSortList[index][1];
        if (maxValueSum < -minValue) {
          maxPersons.append(posSortList[index][0])
          index -= 1
        } else {
          break;
        }       
      }
      //maxPersons = []
      maxLastPerson=posSortList[index][0]
      diff=maxValueSum + minValue

      for (var z in maxPersons) {
        var maxPerson = maxPersons[z]
        result += maxPerson + ' handle ' + posRecords[maxPerson].toFixed(2) + ' on ' + minPerson + '\n'
        posRecords.pop(maxPerson)
      }

      result+= maxLastPerson + ' handle ' + (posSortList[index][1] - diff).toFixed(2) + ' on ' + minPerson + '\n'
      negRecords.pop(minPerson)
      posRecords[maxLastPerson] = diff
    }
    return result;
  },
  offset: function (mores, less, matchPersons, lessPerson) {
    var comb = {}
    this.dfs(mores, 0, comb, '', 0)
    var resultData = [];
    for (var i in comb) {
      var userId = i.substr(1);
      var amount = comb[i];
      for (var j in less) {
        var id = j;
        var payoff = less[j];
        if (-amount == payoff) {
          matchPersons.push(userId);
          lessPerson.push(id);
          var userIdList = userId.split(',');
          for(var i in userIdList) {
            var uId = userIdList[i];
            resultData.push({
              fromUserName: this.getUserInfoByUserId(uId).userName,
              toUserName: this.getUserInfoByUserId(id).userName,
              money: mores[uId].toFixed(2)
            })
          }
        }
      }
    }
    this.setData({
      resultData: resultData
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
  dfs: function (source, index, comb, persons, amount) {
    if (index < Object.keys(source).length){
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
    for(var i in userInfos) {
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
  onLoad: function (options) {

  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})