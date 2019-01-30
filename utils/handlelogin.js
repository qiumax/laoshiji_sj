const app = getApp()

// 开始login
function login(callback) {
  wx.showLoading()
  wx.login({
    success(res) {
      if (res.code) {
        // 登录成功，获取用户信息
        getUserInfo(res.code, callback)
      } else {
        // 否则弹窗显示
        showToast('get code error')
      }
    },
    fail() {
      showToast('login fail')
    }
  })
}

// 获取用户信息
function getUserInfo(code, callback) {
  wx.getUserInfo({
    // 获取成功，全局存储用户信息，开发者服务器登录
    success(res) {
      console.log('wxuserinfo')
      console.log(res.userInfo)

      // 全局存储用户信息
      wx.setStorageSync('UserInfo', res.userInfo)
      postLogin(code, res.userInfo, callback)
    },
    // 获取失败，弹窗提示一键登录
    fail() {
      wx.hideLoading()
      wx.setStorageSync(UserInfo, '')
      //登陆状态
      wx.setStorageSync('loginstate', '')
      showLoginModal()
    }
  })
}

// 服务端登录
  function postLogin(code, userinfo, callback) {
    wx.request({
      url: app.globalData.host+"/wx/getWxUserInfo",
      data: {
        code: code,
        refer_id: wx.getStorageSync('share_userid'),//分享 二维码对应的用户id
        nickname: userinfo.nickName,
        avatar: userinfo.avatarUrl,
        city: userinfo.city,
        province: userinfo.province,
        country: userinfo.country,
        gender: userinfo.gender
      },
      method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      header: {
        'content-type': 'application/json'
      }, // 设置请求的 header
      success: function (res) { 
        wx.hideLoading()
        console.log(res)
        if (!res.data.err) {
          // 登录成功，
          wx.setStorageSync('user_id', res.data.user_id);
          wx.setStorageSync('session_key', res.data.session_key);
          wx.setStorageSync('s_id', res.data.s_id);
          wx.setStorageSync('name', userinfo.nickName);
          wx.setStorageSync('avatar', userinfo.avatarUrl);
          wx.setStorageSync('phone', res.data.phone);
          //登陆状态
          wx.setStorageSync('loginstate', 'login in')
 
          callback && callback()
        }
        else
        {
          showToast('postLogin error')
        }
      },
      fail: function (res) {
        console.log(res)
        showToast('postlogin fail' + code)
      },
      complete: function () {
        // complete
      }
    })
    
}

function getDriverInfo(callback){

  wx.request({
    url: app.globalData.host + "/api/user/getDriverInfo",
    data: {
      'user_id': wx.getStorageSync('user_id'),
      's_id': wx.getStorageSync('s_id')
    },
    method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
    header: {
      'content-type': 'application/json'
    }, // 设置请求的 header
    success: function (res) {
      console.log(res)
      callback && callback()
    }
  })
}

// 显示toast弹窗
function showToast(content = '登录失败，请稍后再试') {
  wx.showToast({
    title: content,
    icon: 'none'
  })
}


// 判断是否登录
function isLogin(callback) {
  //wx.setStorageSync('loginstate', 'login in')

  //登陆状态
  let loginstate = wx.getStorageSync('loginstate')
  console.log(loginstate)
  if (loginstate) {
    // 如果有存储的登录态，暂时认为他是登录状态
    callback && callback()
  } else {
    // 如果没有登录态，弹窗提示一键登录
    showLoginModal()
  }
}

// 判断是否登录
function isLogin_true() {
 // wx.setStorageSync('loginstate', 'login in')
  
  //登陆状态
  let loginstate = wx.getStorageSync('loginstate')
  console.log(loginstate)
  if (loginstate) {
    // 如果有存储的登录态，暂时认为他是登录状态
    return true;
  } else {
    // 如果没有登录态，弹窗提示一键登录
    return false;
  }
}

// 接口调用失败处理，
function handError(res, callback) {
  var userinfo = wx.getStorageSync('UserInfo')
  // 规定err=expired代表未登录和登录态失效
  if (res.data.err == 'expired') {
      login(callback)
  } else if (res.data.err) {
    // 弹窗显示错误信息
    showToast(res.data.err)
  }
}


// 显示一键登录的弹窗
function showLoginModal() {
  wx.navigateTo({
      url: '/pages/login/index',
  })
     
}


//位置授权
function getUserLocation(callback) {
  wx.getSetting({
    success: (res) => {
      if (res.authSetting['scope.userLocation'] != undefined && res.authSetting['scope.userLocation'] != true) {
        //未授权
        wx.showModal({
          title: '请求授权当前位置',
          content: '需要获取您的地理位置，请确认授权',
          success: function (res) {
            if (res.cancel) {
              //取消授权
              wx.showToast({
                title: '拒绝授权',
                icon: 'none',
                duration: 1000
              })

            } else if (res.confirm) {
              //确定授权，通过wx.openSetting发起授权请求
              wx.openSetting({
                success: function (res) {
                  if (res.authSetting["scope.userLocation"] == true) {
                    wx.showToast({
                      title: '授权成功',
                      icon: 'success',
                      duration: 1000,
                      success(res) {
                        setTimeout(function () {
                          callback && callback()
                        }, 2000);
                      }
                    })
                    //再次授权，调用wx.getLocation的API
                    
                  } else {
                    wx.showToast({
                      title: '授权失败',
                      icon: 'none',
                      duration: 1000
                    })
                  }
                }
              })
            }
          }
        })
      }
      else if (res.authSetting['scope.userLocation'] == undefined) {
        //用户首次进入页面,调用wx.getLocation的API
        callback && callback()
      }
      else {
        //console.log('授权成功')
        //调用wx.getLocation的API
        callback && callback()
      }
    }
  })

}

module.exports = {
  login: login,
  getUserInfo: getUserInfo,
  showToast: showToast,
  isLogin: isLogin,
  handError: handError,
  showLoginModal: showLoginModal,
  isLogin_true: isLogin_true,
  getUserLocation: getUserLocation

}
