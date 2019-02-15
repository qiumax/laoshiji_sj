var handlogin = require('../../utils/handlelogin.js');
var util = require('../../utils/util.js');
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: { 
    userinfo:[],
    validstatus:'',
    validstate:1,
    state:0,
    currentorder:[],//当前订单
    hascurrentorder:false,
    day:0,
    distance:0,
    num:0,
    interval: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var _this = this
    _this.setData({phone:wx.getStorageSync('phone')})
  },

  onShow:function(){
    this.setData({
      hascurrentorder: false})
    clearInterval(this.data.interval)
    this.setData({ name: wx.getStorageSync('name') })
    this.setData({ avatar: wx.getStorageSync('avatar') })
    this.setData({ phone: wx.getStorageSync('phone') })
    this.getuserinfo()

  },

//用户信息
  getuserinfo:function(){
    var _this=this
    handlogin.isLogin(() => {
      wx.request({
        url: app.globalData.host + '/api/user/getInfo',
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
            if (res.data.name){
              _this.setData({ userinfo: res.data })
              wx.setStorageSync('userinfo', res.data)
              _this.setData({ name: res.data.name })
              if (res.data.apply_driver_state == 3) {            

                _this.getCurrentOrder()

                _this.getDriverinfo()
              }
              else if (res.data.apply_driver_state == 2) {
                _this.setData({ validstatus: '待面审' })
              }
              else {
                _this.setData({ validstatus: '待初审' })
              }
            }
            else
            {
              _this.setData({ validstatus: '待初审' })
            }
           
          }
          else {
            handlogin.handError(res, _this.getuserinfo)
          }


        },
        fail: function (res) {
          handlogin.handError(res, _this.getuserinfo)
        }

      })

    })
  },

  //
  getDriverinfo:function(){

    var _this = this
    handlogin.isLogin(() => {
      console.log(wx.getStorageSync('user_id'))
      wx.request({
        url: app.globalData.host + '/api/driver/getDriver',
        data: {
          'user_id': wx.getStorageSync('user_id'),
          's_id': wx.getStorageSync('s_id'),
        },
        method: 'POST',
        header: {
          'content-type': 'application/json'
        }, // 设置请求的 header
        success: function (res) {
          console.log(res.data)
          if (!res.data.err && res.data.ok != '0') {
            _this.getUserDriverInfo()
            
            wx.setStorageSync('driver_id', res.data._id)
            if(res.data.day){
              _this.setData({ day: res.data.day.toFixed(2)})
            }
            if (res.data.num) {
              _this.setData({ num: res.data.num })
            }
            if (res.data.distance) {
              _this.setData({ distance: res.data.distance.toFixed(0) })
            }
            if(res.data.star)
            {
              console.log(res.data.star)
              console.log(parseInt(res.data.star) + ".0" )
              _this.setData({ star: parseInt(res.data.star)+".0" })
            }
            if(res.data.state == 0)
            {
              _this.setData({ validstatus: '已下线', state: 2 })
            }
            else
            {
              _this.setData({ validstatus: '已认证', state: 1 })
            }
          }
          else {
            handlogin.handError(res, _this.getDriverinfo)
          }


        },
        fail: function (res) {
          handlogin.handError(res, _this.getDriverinfo)
        }

      })


    })

  },



  getUserDriverInfo:function(){
    handlogin.isLogin(() => {
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
      
      }
    })
    })
  },

  //当前订单
  getCurrentOrder:function(){
    clearInterval(this.data.interval)
    var _this = this
    var orderstatus
    handlogin.isLogin(()=>{
      console.log(wx.getStorageSync('user_id'))
      wx.request({
        url: app.globalData.host + '/api/driver/getCurrentOrder',
        data: {
          'user_id': wx.getStorageSync('user_id'),
          's_id': wx.getStorageSync('s_id'),
        },
        method: 'POST',
        header: {
          'content-type': 'application/json'
        }, // 设置请求的 header
        success: function (res) {
          console.log(res.data)
          if (!res.data.err && res.data.order) {


            var interval = setInterval(function () {
              _this.getCurrentOrder()
            }, app.globalData.refreshtime)

            _this.setData({ interval: interval })

            res.data.order.time = util.formatDateTime(res.data.order.time )
    
            _this.setData({ 
              currentorder: res.data.order,
              hascurrentorder:true })
            //判断状态
            if(res.data.order.need_schedule)
            {
              orderstatus = '抢单中'
            }
            else if (res.data.order.state == app.globalData.ORDER_STATE.TO_GET_CARGO){
              orderstatus = '待取货'
            }
            else if (res.data.order.state == app.globalData.ORDER_STATE.DRIVER_CONFIRM_GET_CARGO) {
              orderstatus = '司机已确认取货'
            }
            else if (res.data.order.state == app.globalData.ORDER_STATE.COMPANY_CONFIRM_GET_CARGO) {
              orderstatus = '运送中'
            }
            else if (res.data.order.state == app.globalData.ORDER_STATE.DRIVER_CONFIRM_DELIVER) {
              orderstatus = '司机确认交货'
            }
            else if (res.data.order.state == app.globalData.ORDER_STATE.COMPANY_TOUSU_DELIVER) {
              orderstatus = '投诉处理中'
            }
            else if (res.data.order.state == app.globalData.ORDER_STATE.PLAT_HANDLE_TOUSU) {
              orderstatus = '投诉处理完成'
            }
            else if (res.data.order.state == app.globalData.ORDER_STATE.COMPANY_CONFIRM_DELIVER) {
              orderstatus = '发货方确认收货'
            }
            else if (res.data.order.state == app.globalData.ORDER_STATE.COMMENTED) {
              orderstatus = '已评价'
            }
            _this.setData({ orderstatus: orderstatus})
           
          }
          else {
            handlogin.handError(res, _this.getCurrentOrder)
          }


        },
        fail: function (res) {
          handlogin.handError(res, _this.getCurrentOrder)
        }

      })


    })
  },


  //待处理运单
  gotodetail:function(){
      //判断当前运单状态
      var _this =this
      var path=''
    //console.log(JSON.stringify(_this.data.currentorder))
      if (_this.data.orderstatus == '抢单中')
      {
        path = '/pages/orderdetail/index?order_id=' + _this.data.currentorder._id+"?orderstatus=qding";
      }
      else{
        path = '/pages/orderdetail/index?order_id=' + _this.data.currentorder._id;
      }
     
      wx.navigateTo({
        url: path,
      })
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    clearInterval(this.data.interval)
    this.getuserinfo()
    wx.stopPullDownRefresh();
  },


  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  //接单
  getorder:function(){
    clearInterval(this.data.interval)
    wx.navigateTo({
      url: '/pages/jiedan/index',
    })
  },

  //认证
  gotovalid:function(){
    clearInterval(this.data.interval)
    wx.navigateTo({
      url: '/pages/renzhen/index',
    })
  },

  getPhoneNumber: function (e) {
    console.log('getphone')
    var _this = this
    //先判断用户是否已经有电话
    var btn_type = e.currentTarget.dataset.type

    if (e.detail.errMsg == 'getPhoneNumber:fail user deny') {
      wx.showToast({
        title: '授权失败，请重试',
        icon: 'none',
        duration: 2000
      })
    } else {//授权成功

      //解密数据
      handlogin.isLogin(() => {
        wx.request({
          url: app.globalData.host + '/api/user/getphone',
          data: {
            'user_id': wx.getStorageSync('user_id'),
            's_id': wx.getStorageSync('s_id'),
            'encryptedData': e.detail.encryptedData,
            'iv': e.detail.iv,
            'session_key': wx.getStorageSync('session_key')
          },
          method: 'POST',
          header: {
            'content-type': 'application/json'
          }, // 设置请求的 header
          success: function (res) {
            console.log(res)
            if (res.data.phoneNumber) {
              var phone = res.data.phoneNumber
              _this.setData({ phone: res.data.phoneNumber })
              //更新
              wx.request({
                url: app.globalData.host + '/api/user/updatePhone',
                data: {
                  'user_id': wx.getStorageSync('user_id'),
                  's_id': wx.getStorageSync('s_id'),
                  'phone': res.data.phoneNumber,
                },
                method: 'POST',
                header: {
                  'content-type': 'application/json'
                }, // 设置请求的 header
                success: function (res) {
                  console.log('update success')
                  wx.setStorageSync('phone', phone)
                  console.log(phone)
                 
                  //进入相应页面

                  clearInterval(_this.data.interval)
                  if (btn_type == 'gotovalid') {
     
                    wx.navigateTo({
                      url: '/pages/renzhen/index',
                    })
                  }
                }
              })
            }
          }
        })

      })

    }
  },

  onHide: function () {
    console.log('hide')
    clearInterval(this.data.interval)
  },

})