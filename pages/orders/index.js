// pages/orders/index.js
var handlogin = require('../../utils/handlelogin.js');
var util = require('../../utils/util.js');
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentId:0,
    orders:[],

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
    this.getOrderList()
    this.failNeedList()
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
    this.getOrderList()
    this.failNeedList()
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },


  getOrderList:function(res){

    var _this = this
    var finish=[]
    var ing=[]
    handlogin.isLogin(() => {
      console.log(wx.getStorageSync('user_id'))
      wx.request({
        url: app.globalData.host + '/api/order/orderList',
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
          if (!res.data.err && res.data.ok != '0') {
            res.data.order.forEach((v,k)=>{
              res.data.order[k].time = util.formatDateTime(v.time)
              if (v.state == app.globalData.ORDER_STATE.COMMENTED || v.state == app.globalData.ORDER_STATE.PLAT_HANDLE_TOUSU)
              {
                finish.push(res.data.order[k])
              }
              else//完成
              {
                ing.push(res.data.order[k])
              }
            })
            console.log(ing)
            console.log(finish)
            _this.setData({
              ing: ing,
              finish:finish
              })
          }
          else {
            handlogin.handError(res, _this.getOrderList)
          }


        },
        fail: function (res) {
          handlogin.handError(res, _this.getOrderList)
        }

      })


    })

  },


  failNeedList: function (res) {

    var _this = this
    var fail = []
    handlogin.isLogin(() => {
      console.log(wx.getStorageSync('user_id'))
      wx.request({
        url: app.globalData.host + '/api/order/failNeedList',
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
          if (!res.data.err && res.data.ok != '0') {
            res.data.order.forEach((v, k) => {
              res.data.order[k].time = util.formatDateTime(v.time)
            })
            _this.setData({
              fail: res.data.order
            })
          }
          else {
            handlogin.handError(res, _this.failNeedList)
          }


        },
        fail: function (res) {
          handlogin.handError(res, _this.failNeedList)
        }

      })


    })

  },

  //导航栏切换
  tabChoice: function (e) {
    var tabid = e.currentTarget.dataset.tabid
    this.setData({ currentId: tabid })
    console.log(tabid)
  },
  gotodetail:function(e){
    var order_id = e.currentTarget.dataset.order_id
    wx.navigateTo({
      url: '/pages/orderdetail/index?order_id=' + order_id
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})