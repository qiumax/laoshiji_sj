wx.stopPullDownRefresh();// pages/jiedan/index.js
var handlogin = require('../../utils/handlelogin.js');
var util = require('../../utils/util.js');
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    hasneed:true,
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
    this.setData({ needlist:[]})
    this.getUserLocation()
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

    this.getUserLocation()
    wx.stopPullDownRefresh()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  gotordertake:function(e){
    var order_id = e.currentTarget.dataset.order_id
    if (order_id)
    {
      wx.navigateTo({
        url: '/pages/orderdetail/index?order_id=' + order_id,
      })
    }

  },

//获取位置授权
  getUserLocation: function () {
    var _this = this;
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
                        duration: 1000
                      })
                      //再次授权，调用wx.getLocation的API
                      _this.uploadlocation();
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
          _this.uploadlocation();
        }
        else {
          console.log('授权成功')
          //调用wx.getLocation的API
          _this.uploadlocation();

        }

      }

    })



  }, 

//更新位置
  uploadlocation:function(){
    var _this =this
    var latitude =0
    var longitude = 0
    wx.getLocation({
      success: function(res) {
        console.log(res)
        latitude = res.latitude
        longitude = res.longitude
        if (!latitude || !longitude)
        {
          wx.showToast({
            title: '获取位置失败，请重试',
            icon:'none'
          })
          _this.updateLocation()
        }
        //更新位置
        handlogin.isLogin(() => {
          wx.request({
            url: app.globalData.host + '/api/driver/updateLocation',
            data: {
              'user_id': wx.getStorageSync('user_id'),
              's_id': wx.getStorageSync('s_id'),
              'latitude': latitude,
              'longitude': longitude
            },
            method: 'POST',
            header: {
              'content-type': 'application/json'
            }, // 设置请求的 header
            success: function (res) {
              console.log(res)
              if (!res.data.err) {
                console.log('upload ok')
                _this.getneeds()
              }
              else {
                handlogin.handError(res, _this.uploadlocation)
              }
            },
            fail: function (res) {
              handlogin.handError(res, _this.uploadlocation)
            }
          })
        })
      },

    })
    
  },

  //获取运单
  getneeds:function(){
    console.log('getneeds')
    var _this = this
    handlogin.isLogin(() => {
      wx.request({
        url: app.globalData.host + '/api/driver/getNeeds',
        data: {
          'user_id': wx.getStorageSync('user_id'),
          's_id': wx.getStorageSync('s_id'),
        },
        method: 'POST',
        header: {
          'content-type': 'application/json'
        }, // 设置请求的 header
        success: function (res) {
          console.log(res)
          if (!res.data.err) {
            if(res.data.length){
              console.log('ok')
              console.log(res.data)
              res.data.forEach((v, k) => {
                res.data[k].time = util.formatDate(v.time)
                res.data[k].arrive_time = util.formatDate(v.arrive_time)
              })
              _this.setData({ 
                needlist: res.data,
                hasneed:true
                })
            }
            else
            {
              _this.setData({ hasneed: false })
            }

          }
          else {
            handlogin.handError(res, _this.getneeds)
          }
        },
        fail: function (res) {
          console.log(res)
          handlogin.handError(res, _this.getneeds)
        }
      })

    })
  },

  //刷新
  refreshneed:function(){
    this.getUserLocation()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})