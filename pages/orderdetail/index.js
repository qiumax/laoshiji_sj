// pages/orderdetail/index.js
var handlogin = require('../../utils/handlelogin.js');
var util = require('../../utils/util.js');
var QQMapWX = require('../../utils/qqmap-wx-jssdk.js');
var amapFile = require('../../utils/amap-wx.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    windowWidth: 0,
    windowHeight: 0,
    orderinfo:{},
    showdetail:false,
    opacity:1,
    verticalCurrent: 10000,
    interval: 0,
    policy:'REAL_TRAFFIC',
    current_pathid:0,
    pathnum:-1,
    polyline:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    //console.log(options.orderinfo)
    var _this = this;
  
    var order_id = options.order_id
    console.log(options)
    _this.setData({ order_id: order_id})

    // 实例化API核心类
    var qqmapsdk = new QQMapWX({
      key: 'TSFBZ-YAN3U-S2BVJ-4AP4W-XWEQF-GYFRI'
    });

    _this.setData({ qqmapsdk: qqmapsdk })
    var orderinfo = _this.data.orderinfo
    orderinfo.state = 10
    console.log(orderinfo)
    _this.setData({ orderinfo: orderinfo })
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
    clearInterval(this.data.interval)
    var _this = this;

    //计算屏幕宽度
    wx.getSystemInfo({
      success: function (res) {
        _this.setData({ windowWidth: res.windowWidth })
        _this.setData({ windowHeight: res.windowHeight })
      },
    })
    _this.getOrderDetail()
    //_this.direction()


  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    console.log('hide')
    clearInterval(this.data.interval)
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
console.log('unload')
    clearInterval(this.data.interval)
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    clearInterval(this.data.interval)
    this.getOrderDetail()
    wx.stopPullDownRefresh();
  },


//show 起点 终点
  showmarkers: function () {

    var _this = this
    var orderinfo = _this.data.orderinfo
    _this.mapCtx = wx.createMapContext('navi_map');

    console.log(orderinfo)
    //发货地址 收货地址
    _this.mapCtx.includePoints({
      padding: [30, 20, 20, 20],
      points: [{
        latitude: orderinfo.from.location.coordinates[1],
        longitude: orderinfo.from.location.coordinates[0]
      },
      {
        latitude: orderinfo.to.location.coordinates[1],
        longitude: orderinfo.to.location.coordinates[0]
      }]
    })//缩放视野展示所有经纬度

    var marker = {
      id: 1,
      latitude: orderinfo.from.location.coordinates[1],
      longitude: orderinfo.from.location.coordinates[0],
      iconPath: '/images/qidian.png',
      width: 30,
      height: 30
    }
    var marker1 = {
      id: 2,
      latitude: orderinfo.to.location.coordinates[1],
      longitude: orderinfo.to.location.coordinates[0],
      iconPath: '/images/enddian.png',
      width: 30,
      height: 30
    }
    var markers = new Array();
    markers.push(marker);
    markers.push(marker1);
    this.setData({
      markers: markers,
    });


    //路线
    var polyline = []
    //起点到目的的位置
    var pastedpolyline = new Array()
    var pastpoints = new Array()

    var nopastedpolyline = new Array()
    var nopastpoints = new Array()
    pastedpolyline.push({
      longitude: orderinfo.from.location.coordinates[0],
      latitude: orderinfo.from.location.coordinates[1]
    })//起点


     if (_this.data.orderinfo.logs && _this.data.orderinfo.logs.length > 0) {
            //循环经过的点
            var loglength = orderinfo.logs.length
            var lstlongitude = 0
            var lstlatitude = 0
            orderinfo.logs.forEach((v, k) => {
              if (loglength == k + 1)//最后一个取出来
              {
                lstlongitude = v.coordinates[0]
                lstlatitude = v.coordinates[1]
              }
              pastedpolyline.push({
                longitude: v.coordinates[0],
                latitude: v.coordinates[1]
              })
            })
            pastpoints.push({
              'points': pastedpolyline,
              'color': "#3592E1DD",
              'width': 3
            })
            polyline.push(pastpoints[0])


            //logs 最后一个点
            nopastedpolyline.push({
              longitude: lstlongitude,
              latitude: lstlatitude
            })
            nopastedpolyline.push({
              longitude: orderinfo.to.location.coordinates[0],
              latitude: orderinfo.to.location.coordinates[1]
            })//终点

            //判断是否已经收货，司机确认收货
            if (orderinfo.state < app.globalData.ORDER_STATE.DRIVER_CONFIRM_DELIVER) {
              nopastpoints.push({
                'points': nopastedpolyline,
                'color': "#FF0000DD",
                'dottedLine': true,
                'width': 3
              })
            }
            else {
              nopastpoints.push({
                'points': nopastedpolyline,
                'color': "#3592E1DD",
                'width': 3
              })
            }

           // polyline.push(nopastpoints[0])

                _this.setData({
                 polyline: polyline,
                });
    }
     else {
       //起点
       nopastedpolyline.push({
         longitude: orderinfo.from.location.coordinates[0],
         latitude: orderinfo.from.location.coordinates[1]
       })
       nopastedpolyline.push({
         longitude: orderinfo.to.location.coordinates[0],
         latitude: orderinfo.to.location.coordinates[1]
       })//终点

       nopastpoints.push({
         'points': nopastedpolyline,
         'color': "#FF0000DD",
         'dottedLine': true,
         'width': 3
       })

       polyline.push(nopastpoints[0])

        // _this.setData({
        //   polyline: polyline,
        // });

     }
  },

  //确认司机已取货
  confirmGetCargo:function(){
    var _this = this
    handlogin.getUserLocation(() => {
    var order_id = _this.data.orderinfo._id
    //判断司机是否确认
    var state = _this.data.orderinfo.state
    if (state != app.globalData.ORDER_STATE.TO_GET_CARGO){
      wx.showToast({
        icon:'none',
        title: '操作失败',
        duration: 5000,
        success(res) {
          setTimeout(function () {
          }, 2000);

        }
      })
      return false
    }
    var longitude = 0
    var latitude = 0
    wx.getLocation({
      success: function (res) {
        longitude = res.longitude
        latitude = res.latitude
        var driver_confirm_cargo_at = new Array()
        driver_confirm_cargo_at = {
          location: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          time: Date.parse(new Date()) / 1000
        }

        console.log(JSON.stringify(driver_confirm_cargo_at))
        if (order_id) {
          handlogin.isLogin(() => {
            wx.request({
              url: app.globalData.host + '/api/driver/confirmGetCargo',
              data: {
                'user_id': wx.getStorageSync('user_id'),
                's_id': wx.getStorageSync('s_id'),
                'order_id': order_id,
                'driver_confirm_cargo_at': JSON.stringify(driver_confirm_cargo_at)
              },
              method: 'POST',
              header: {
                'content-type': 'application/json'
              }, // 设置请求的 header
              success: function (res) {
                console.log(res)
                if (!res.data.err) {
                  if (res.data.ok == 1) {
                    _this.setData({ showdis: false })
                    _this.setData({ polyline: [] })

                    _this.getOrderDetail()
                    wx.showToast({
                      icon:'none',
                      title: '取货成功！请提醒发货方确认',
                      duration: 5000,
                      success(res) {
                        setTimeout(function () {
                        }, 2000);

                      }
                    })
                  }
                }
                else {
                  handlogin.handError(res, _this.confirmGetCargo)
                }
              },
              fail: function (res) {
                handlogin.handError(res, _this.confirmGetCargo)
              }

            })
          })
        }

      },
      fail: function (res) {
        console.log(res)
        wx.showToast({
          title: '操作失败，请重试！',
          icon: 'none'
        })
      }
    })
    })
  },

  //司机更新位置
  updatelocation:function(){
    var _this = this
    wx.showLoading({
      title: '更新中',
    })
    handlogin.getUserLocation(() => {
    var order_id = _this.data.orderinfo._id
    wx.getLocation({
      success: function(res) {
        var latitude = res.latitude
        var longitude = res.longitude
        var qqapi = _this.data.qqmapsdk
        var city =''
        qqapi.reverseGeocoder({
          location: {
            latitude: latitude,
            longitude: longitude
          },
          success: function (resqq) {
            console.log(resqq);
            city = resqq.result.address_component.province+ resqq.result.address_component.city 
            var log = new Array()
            log = {
       
                address: city,
                coordinates: [longitude, latitude],
                time: Date.parse(new Date()) / 1000
            }

            handlogin.isLogin(() => {
              wx.request({
                url: app.globalData.host + '/api/driver/submitLog',
                data: {
                  'user_id': wx.getStorageSync('user_id'),
                  's_id': wx.getStorageSync('s_id'),
                  'order_id': order_id,
                  'log': JSON.stringify(log)
                },
                method: 'POST',
                header: {
                  'content-type': 'application/json'
                }, // 设置请求的 header
                success: function (res) {
                  wx.hideLoading()
                  console.log(res)
                  if (!res.data.err) {
                    if (res.data.ok == 1) {
                      _this.getOrderDetail()
                      wx.showToast({
                        title: '更新成功！',
                        duration: 5000,
                        success(res) {
                          setTimeout(function () {
                          }, 2000);

                        }
                      })
                    }
                  }
                  else {
                    handlogin.handError(res, _this.updatelocation)
                  }
                },
                fail: function (res) {
                  handlogin.handError(res, _this.updatelocation)
                }

              })
            })
          },
          fail: function (res) {
            console.log(res);

          }
        });
      

      },
      fail:function(res){
        console.log(res)
        wx.showToast({
          title: '操作失败，请稍后再试',
          icon:'none'
        })
      }
    })
    })
  },


  //运单详情
  showdetail:function(){
    console.log('show')
    var _this = this
    //记录
    var logs = new Array()
    if(_this.data.orderinfo.state){
      //发单时间
      logs.push({
        action: '订单已提交',
        time: util.utcformat(_this.data.orderinfo.created_at)
      })
    }
    else
    {
      //发单时间
      logs.push({
        action: '订单已提交',
        time: util.utcformat(_this.data.orderinfo.created_at)
      })
    }
   
   
    var state  = _this.data.orderinfo.state
    console.log(state)
    var i=1
    for(i =1;i<=state;i++)
    {
      console.log(i)
      //已接单
      if (i == app.globalData.ORDER_STATE.TO_GET_CARGO)
      {
        logs.push({
          action: '司机已接单',
          time: util.formatDateTime(_this.data.orderinfo.publish_at)
        })
      }
      //司机已接单
      if (i == app.globalData.ORDER_STATE.DRIVER_CONFIRM_GET_CARGO) {
        logs.push({
          action: '司机已取货',
          time: util.formatDateTime(_this.data.orderinfo.driver_confirm_cargo_at.time)
        })
      }
      //发货方确认已接单
      if (i == app.globalData.ORDER_STATE.COMPANY_CONFIRM_GET_CARGO) {
        logs.push({
          action: '发货方确认已取货',
          time: util.formatDateTime(_this.data.orderinfo.company_confirm_cargo_at.time)
        })
        //地理位置
        var locations = _this.data.orderinfo.logs;
        if (locations.length>0)
        {
          locations.forEach((v,k)=>{
            logs.push({
              action:'到达'+v.address,
              time: util.formatDateTime(v.time)
            })
          })
        }
      }

      //确认收货
      if (i == app.globalData.ORDER_STATE.DRIVER_CONFIRM_DELIVER) {
        logs.push({
          action: '司机已确认交货',
          time: util.formatDateTime(_this.data.orderinfo.driver_confirm_deliver_at.time)
        })

      }


      //判断是否有投诉

      if (i == app.globalData.ORDER_STATE.COMPANY_TOUSU_DELIVER && Object.keys(_this.data.orderinfo.tousu_to_driver).length > 1) {
        logs.push({
          action: '收货方发起投诉',
          time: util.formatDateTime(_this.data.orderinfo.tousu_to_driver.time)
        })
      }

      //投诉处理完成

      if (i == app.globalData.ORDER_STATE.PLAT_HANDLE_TOUSU && Object.keys(_this.data.orderinfo.plat_handle_tousu).length > 1) {
        logs.push({
          action: '投诉处理完成',
          time: util.formatDateTime(_this.data.orderinfo.plat_handle_tousu.time)
        })
      }


      //企业确认收货
      if (i == app.globalData.ORDER_STATE.COMPANY_CONFIRM_DELIVER) {
        logs.push({
          action: '已确认收货',
          time: util.formatDateTime(_this.data.orderinfo.company_confirm_deliver_at.time)
        })
      }

      //已完成
      if (i == app.globalData.ORDER_STATE.COMMENTED) {
    
        if (_this.data.orderinfo.comment_to_driver.time <= _this.data.orderinfo.comment_to_company.time){
          logs.push({
            action: '收货方已评价',
            time: util.formatDateTime(_this.data.orderinfo.comment_to_driver.time)
          })
          logs.push({
            action: '司机已评价',
            time: util.formatDateTime(_this.data.orderinfo.comment_to_company.time)
          })
          logs.push({
            action: '已完成',
            time: util.formatDateTime(_this.data.orderinfo.comment_to_company.time)
          })

        }
        else
        {
          logs.push({
            action: '司机已评价',
            time: util.formatDateTime(_this.data.orderinfo.comment_to_company.time)
          })
          logs.push({
            action: '收货方已评价',
            time: util.formatDateTime(_this.data.orderinfo.comment_to_driver.time)
          })

          logs.push({
            action: '已完成',
            time: util.formatDateTime(_this.data.orderinfo.comment_to_driver.time)
          })
        }
      
    }


    }


    _this.setData({ 
      logs:logs,
      showdetail:true,
      opacity: 0.3,
      backcolor: 'rgba(232, 232, 232, 0.8)'
      })
  },

//关闭详情
  closedetail:function(){
    console.log('close')
    var _this = this
    _this.setData({ 
      showdetail: false,
      opacity:1,
      backcolor: ''
    })

  },

//禁止滑动
  preventTouchMove() {  
  },
  
  //司机确认收货
  confirmDeliver:function(){
    var _this = this
    //先检查是否上传了图片
    if(!_this.data.pics || _this.data.pics.length == 0){
      _this.setData({showUpload:true})
      _this.setData({ showUpload0:true})
      wx.showToast({
        title: '请先上传签收图片',
        icon:'none',
        duration:5000
      })
      return false
    }
  
    handlogin.getUserLocation(() => {
    var order_id = _this.data.orderinfo._id
    var longitude = 0
    var latitude = 0
    wx.getLocation({
      success: function (res) {
        longitude = res.longitude
        latitude = res.latitude
        var driver_confirm_deliver_at = new Array()
        driver_confirm_deliver_at = {
          location: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          time: Date.parse(new Date()) / 1000,
          pics:_this.data.pics
        }

        console.log(JSON.stringify(driver_confirm_deliver_at))
        if (order_id) {
          handlogin.isLogin(() => {
            wx.request({
              url: app.globalData.host + '/api/driver/confirmDeliver',
              data: {
                'user_id': wx.getStorageSync('user_id'),
                's_id': wx.getStorageSync('s_id'),
                'order_id': order_id,
                'driver_confirm_deliver_at': JSON.stringify(driver_confirm_deliver_at)
              },
              method: 'POST',
              header: {
                'content-type': 'application/json'
              }, // 设置请求的 header
              success: function (res) {
                console.log(res)
                if (!res.data.err) {
                  if (res.data.ok == 1) {
                    _this.getOrderDetail()
                    wx.showToast({
                      icon: 'none',
                      title: '已确认交货！请提醒发货方确认',
                      duration: 5000,
                      success(res) {
                        setTimeout(function () {
                        }, 2000);

                      }
                    })
                  }
                }
                else {
                  handlogin.handError(res, _this.confirmDeliver)
                }
              },
              fail: function (res) {
                handlogin.handError(res, _this.confirmDeliver)
              }

            })
          })
        }

      },
      fail: function (res) {
        wx.showToast({
          title: '操作失败，请重试！',
        })
      }
    })
    })
  },


//接单
  confirmorder:function(){
    console.log('apply')
    var _this = this
    handlogin.isLogin(() => {
      wx.request({
        url: app.globalData.host + '/api/driver/applyNeed',
        data: {
          'user_id': wx.getStorageSync('user_id'),
          's_id': wx.getStorageSync('s_id'),
          'need_id': _this.data.orderinfo._id
        },
        method: 'POST',
        header: {
          'content-type': 'application/json'
        }, // 设置请求的 header
        success: function (res) {
          console.log(res)
          if (!res.data.err) {
            if (res.data.ok == 1) {
              _this.getOrderDetail()
              wx.showToast({
                icon: 'none',
                title: '抢单中，请等待抢单结果！',
                duration: 5000,
                success(res) {
                  setTimeout(function () {
                    wx.reLaunch({
                      url: '/pages/member/index',
                    })
                  }, 2000);

                }
              })
            }
            else
            {
              wx.showToast({
                icon: 'none',
                title: '抢单失败！',
                duration: 5000,
                success(res) {
                  setTimeout(function () {
                  }, 2000);

                }
              })
            }
          }
          else {
            handlogin.handError(res, _this.confirmorder)
          }
        },
        fail: function (res) {
          console.log(res)
          wx.showToast({
            title: '操作失败，请重试！',
            icon:'none'
          })
        }
      })

    })

  },

  showmap: function () {
    var _this = this
    console.log('----')
    clearInterval(this.data.interval)
    var orderinfo = this.data.orderinfo
    var strategys = this.data.strategys
    var durations = this.data.durations
    var distances = this.data.distances
    var polylines = this.data.polyline
    var current_pathid = this.data.current_pathid
    
    //判断状态
    if(_this.data.inqding == 0 && _this.data.orderinfo.state >= app.globalData.ORDER_STATE.DRIVER_CONFIRM_GET_CARGO){
      wx.navigateTo({
        url: '/pages/map/index?orderinfo=' + JSON.stringify(orderinfo)
      })
    }
    else
    {
      if (polylines.length > 0) {
        wx.navigateTo({
          url: '/pages/map/index?orderinfo=' + JSON.stringify(orderinfo) + "&distances=" + JSON.stringify(distances) + "&durations=" + JSON.stringify(durations) + "&strategys=" + JSON.stringify(strategys) + "&polylines=" + JSON.stringify(polylines) + "&current_pathid=" + current_pathid
        })
      }

    }


  },


  //评价
  comment:function(){
    clearInterval(this.data.interval)
    var _this = this
    var order_id = _this.data.orderinfo._id
    wx.navigateTo({
      url: '/pages/comment/index?order_id=' + order_id,
    })
  },


//获取订单详情
  getOrderDetail:function(){
    clearInterval(this.data.interval)
    var _this = this
    handlogin.isLogin(()=>{
      wx.request({
        url: app.globalData.host + '/api/order/getOrderDetail',
        data: {
          'user_id': wx.getStorageSync('user_id'),
          's_id': wx.getStorageSync('s_id'),
          'order_id': _this.data.order_id
        },
        method: 'POST',
        header: {
          'content-type': 'application/json'
        }, // 设置请求的 header
        success: function (res) {
          console.log(res)
          if (!res.data.err) {

            //抢单司机是否是本人
            var localdriver = wx.getStorageSync('driver_id')
            if(res.data.order.state>=1){
              console.log(localdriver +'----'+ res.data.order.driver._id)
              if(localdriver != res.data.order.driver._id)
              {
                wx.showToast({
                  title: '抢单失败',
                  icon:'none'
                })
                wx.reLaunch({
                  url: '/pages/member/index',
                })
              }
            }
            var interval = setInterval(function () {
              _this.getOrderDetail()
            }, app.globalData.refreshtime)

            _this.setData({ interval: interval })
            var inqding = 0
            if (res.data.inqding){
              inqding = res.data.inqding
            }

              console.log(res.data.order)
            _this.setData({
              orderinfo: res.data.order,
              inqding: inqding})

            //image
            if (res.data.image) {
              _this.setData({ orderimg: app.globalData.comhost + res.data.image })
            }

            //判断司机是否确认交货
            if (res.data.order.state >= app.globalData.ORDER_STATE.DRIVER_CONFIRM_DELIVER)
            {
              _this.setData({
                showUpload:false,
                showpics:true})
            }
            if (inqding == 0 && res.data.order.state >= app.globalData.ORDER_STATE.DRIVER_CONFIRM_GET_CARGO)
            {
              _this.showmarkers()
            }
            else
            {
              console.log('aa')
              _this.showmarkers()
              _this.setData({ current_pathid:0})
             _this.direction()
            }

          }
          else {
            handlogin.handError(res, _this.getOrderDetail)
          }
        },
        fail: function (res) {
           handlogin.handError(res, _this.getOrderDetail)}
      })
    })
  },


//上传签收图片
  uploadpic:function(e){
    var _this = this
    console.log(e)
    var id = e.currentTarget.dataset.p_id
  //选
    wx.showActionSheet({
      itemList: ['从相册中选择', '拍照'],
      itemColor: "#f7982a",
      success: function (res) {
        if (!res.cancel) {
          if (res.tapIndex == 0) {
            _this.chooseWxImage('album', id)
          } else if (res.tapIndex == 1) {
            _this.chooseWxImage('camera', id)
          }
        }
      }
    })
  },

  chooseWxImage: function (type, img_id) {
   
    console.log(img_id)
    let _this = this;
    wx.chooseImage({
      sizeType: ['original', 'compressed'],
      count: 1,
      sourceType: [type],
      success: function (res) {
        wx.showLoading({
          title: '上传中',
        })
        console.log(res);
        var img = res.tempFilePaths;
        _this.picupload(img[0], 'img_'+img_id,img_id)

      }
    })
  },

  picupload: function (tempfile, filename,img_id) {
    var _this =this
    console.log(wx.getStorageSync('s_id'))
    console.log(wx.getStorageSync('user_id'))
    console.log(tempfile)
    wx.uploadFile({
      url: app.globalData.host + "/wx/driver_upload_pic",
      formData: {
        'field_name': filename,
        'user_id': wx.getStorageSync('user_id'),
        's_id': wx.getStorageSync('s_id'),
        'order_id':_this.data.orderinfo._id
      },
      header: { "Content-Type": "multipart/form-data" },
      filePath: tempfile,
      method: 'POST',
      name: filename,
      // 设置请求的 header
      success: function (res) {
        wx.hideLoading()
        console.log(res.data)
        
        if (res.data) {
          var pics = _this.data.pics
          if (!pics || pics.length == 0) {
            pics = new Array()
          }
         // pics.push(res.data + "?" + Math.random() * 9999 + 1)
          pics.push(res.data)
          _this.setData({
             pics: pics
           
           })

          console.log(pics)
          _this.setData({ delpic: img_id })
          if (img_id <= 3) {
            var showUpload = {};
            var random = 'random' + img_id
            img_id = parseInt(img_id) + 1
            var showname = 'showUpload' + img_id
            showUpload[random] = "?" + Math.random() * 9999 + 1
            showUpload[showname] = true
            console.log(showUpload)
            _this.setData(showUpload)
          }
          wx.showToast({
            title: '上传成功',
          })
          

          
        }
        else {
          wx.showToast({
            title: '上传失败，请重试',
          })
        }
      },
      fail: function (res) {
        console.log(res)
      },
      complete: function () {
        // complete
      }
    })
  },

//删图片
  delpic:function(e){
    var _this = this
    console.log(e)
    var id = e.currentTarget.dataset.p_id
    var pics = _this.data.pics
    pics.splice(id,1)
    console.log(pics)
     _this.setData({ delpic: parseInt(id) - 1 })
     
      var showUpload = {};
    var showname = 'showUpload' + (parseInt(id) + 1)
      showUpload[showname] = false
      console.log(showUpload)
      _this.setData(showUpload)
    

    _this.setData({pics:pics})
  },


  //联系货主
  phone_fahuo:function(){
    var _this =this
    wx.makePhoneCall({
      phoneNumber: _this.data.orderinfo.from.phone
    })
  },
  

  //联系收货
  phone_shouhuo: function () {
    var _this = this
    wx.makePhoneCall({
      phoneNumber: _this.data.orderinfo.to.phone
    })
  },

  //导航到发货
  nav_fahuo:function(){
    var _this = this
    wx.getLocation({
      type: 'gcj02', // 返回可以用于wx.openLocation的经纬度
      success(res) {
        const latitude = _this.data.orderinfo.from.location.coordinates[1]
        const longitude = _this.data.orderinfo.from.location.coordinates[0]
        wx.openLocation({
          latitude,
          longitude
       
        })
      }
    })
  },
  
  //导航到收货
  nav_shouhuo: function () {
    var _this = this
    wx.getLocation({
      type: 'gcj02', // 返回可以用于wx.openLocation的经纬度
      success(res) {
        const latitude = _this.data.orderinfo.to.location.coordinates[1]
        const longitude = _this.data.orderinfo.to.location.coordinates[0]
        wx.openLocation({
          latitude,
          longitude

        })
      }
    })
  },

//规划策略
  setpolicy:function(e){
    console.log(e)
    var _this = this
    var p_id = e.currentTarget.dataset.p_id
    _this.setData({policy:e.currentTarget.dataset.p_id})
    _this.setData({ current_pathid: e.currentTarget.dataset.p_id})
    //_this.direction()

    var polylines = _this.data.polyline
    polylines.forEach((v,k)=>{
      if(k == p_id)
      {
        polylines[k].color = '#FF0000DD'
      }
      else
      {
        polylines[k].color = '#8DB6CDDD'
      }

    })
    console.log(polylines)
    _this.setData({ current_pathid:p_id})
    _this.setData({ polyline: polylines })
  },

  direction:function(){
    var _this = this
    var p = _this.data.pathnum
    var strategy = 8
    if(p>=-1 && p<2)
    {
      p = p + 1
    }
    else
    {
      return false
    }

    if(p==0)
    {
      strategy = 8
    
    }
    else if(p == 1)
    {
      strategy = 1
    }
    else
    {
      strategy = 10
    }
    //var myAmapFun = new amapFile.AMapWX({ key: '0bac3cb43f733478b446998dc86ccc11' });
      //myAmapFun.getDrivingRoute({
        wx.request({
          url: 'https://restapi.amap.com/v4/direction/truck?parameters',
          data:{
            key: '827c1fb597e927669eff7f1c63991f3d',
            origin: _this.data.orderinfo.from.location.coordinates[0] + "," + _this.data.orderinfo.from.location.coordinates[1],
            destination: _this.data.orderinfo.to.location.coordinates[0] + "," + _this.data.orderinfo.to.location.coordinates[1],
            strategy: strategy,
            size:4
          },
          type:'json',
          success: function (res) {
            //循环3次，请求3条不同的路线

            _this.setData({pathnum:p})
            // _this.direction()
            console.log(res.data.data.route)
            var route = res.data.data.route
     
              var points = [];
            if (route.paths && route.paths[0] && route.paths[0].steps) {
                var steps = route.paths[0].steps;
                // console.log(steps.length)
                var stepkey = 1
                if (steps.length > 100) {
                  stepkey = 2
                }
                for (var i = 0; i < steps.length; i = i + stepkey) {
                  var poLen = steps[i].polyline.split(';');
                  var lant, longt, pokey
                  //for (var j = 0; j < poLen.length; j=j+3) {
                  if (poLen.length % 2 == 0) {
                    pokey = poLen.length / 2
                  }
                  else {
                    pokey = (poLen.length + 1) / 2
                  }
                  points.push({
                    longitude: parseFloat(poLen[pokey].split(',')[0]),
                    latitude: parseFloat(poLen[pokey].split(',')[1])
                  })

                  // }
                }
              }
              var color
              if (p == 0) {
                color = '#FF0000DD'
              }
              else {
                color = '#8DB6CDDD'
              }
              var polyline = {}
              var polylines = _this.data.polyline
              polyline = {
                points: points,
                color: color,
                width: 3
              }
              polylines.push(polyline)
              var dataobj = {}
              dataobj['polyline' + p] = polyline
              dataobj['strategy' + p] = route.paths[0].strategy
              dataobj['duration' + p] = Math.round(route.paths[0].duration / 3600 * 100) / 100 + '小时'
              dataobj['distance' + p] = Math.round(route.paths[0].distance / 1000 * 100) / 100 + '公里'
              _this.setData({ showdis: true })

              _this.setData({ polyline: polylines })
              _this.setData(dataobj)
              _this.direction()
              if (p == 2) {
                var polylines = []
                var distances = []
                var durations = []
                var strategys = []

                distances.push(_this.data.distance0)
                distances.push(_this.data.distance1)
                distances.push(_this.data.distance2)


                durations.push(_this.data.duration0)
                durations.push(_this.data.duration1)
                durations.push(_this.data.duration2)

                strategys.push('推荐路线')
                strategys.push(_this.data.strategy1)
                strategys.push('备选路线')

                polylines.push(_this.data.polyline0)
                polylines.push(_this.data.polyline1)
                polylines.push(_this.data.polyline2)

                //console.log(polylines)


                _this.setData({ strategys: strategys })
                _this.setData({ durations: durations })
                _this.setData({ distances: distances })

                _this.setData({ polyline: polylines })
              }
           

          }
        })
       

  },


  //签收图
  showqspics: function (e) {
    console.log(e)
    var _this = this
    var img = e.currentTarget.dataset.img
    wx.previewImage({
      current: img,
      urls: _this.data.orderinfo.driver_confirm_deliver_at.pics
    })
  },

  //投诉图
  showtspics: function (e) {
    console.log(e)
    var _this = this
    var img = e.currentTarget.dataset.img
    wx.previewImage({
      current: img,
      urls: _this.data.orderinfo.tousu_to_driver.pics
    })
  },
  
  phoneplat: function () {
    wx.makePhoneCall({
      phoneNumber: '400988888'
    })
  },

  //平台处理投诉
  showhandletspics: function (e) {
    console.log(e)
    var _this = this
    var img = e.currentTarget.dataset.img
    wx.previewImage({
      current: img,
      urls: _this.data.orderinfo.plat_handle_tousu.pics
    })
  },

  //路径规划
  // direction:function(){
  //   var _this = this
  //   var myAmapFun = new amapFile.AMapWX({ key: '0bac3cb43f733478b446998dc86ccc11' });
  //   var p = _this.data.pathnum
  //   if(p<2 && p>=-1){
  //     p++
  //   }
  //   else
  //   {
  //     return false;
  //   }
  //     myAmapFun.getDrivingRoute({
  //       origin: _this.data.orderinfo.from.location.coordinates[0] + "," + _this.data.orderinfo.from.location.coordinates[1],
  //       destination: _this.data.orderinfo.to.location.coordinates[0] + "," + _this.data.orderinfo.to.location.coordinates[1],
  //       //origin: '113.102340698242,28.2381553649902',
  //      // destination: '113.946640014648,22.5564231872559',
  //       strategy: p,
  //       success: function (data) {
  //         _this.setData({ pathnum: p })
  //         _this.direction()
  //         console.log(data)
  //         console.log('p---'+p)
  //         var points = [];
  //         if (data.paths && data.paths[0] && data.paths[0].steps) {
  //           var steps = data.paths[0].steps;
  //          // console.log(steps.length)
  //           var stepkey = 1
  //           if(steps.length>100)
  //           {
  //             stepkey = 2
  //           }
  //           for (var i = 0; i < steps.length; i = i + stepkey) {
  //             var poLen = steps[i].polyline.split(';');
  //             var lant, longt,pokey
  //             //for (var j = 0; j < poLen.length; j=j+3) {
  //               if(poLen.length % 2 == 0)
  //               {
  //                 pokey = poLen.length / 2
  //               }
  //               else
  //               {
  //                 pokey = (poLen.length+1) / 2
  //               }
  //               points.push({
  //                 longitude: parseFloat(poLen[pokey].split(',')[0]),
  //                 latitude: parseFloat(poLen[pokey].split(',')[1])
  //               })

  //            // }
  //           }
  //         }
  //         var color
  //         if(p==0)
  //         {
  //           color ='#FF0000DD'
  //         }
  //         else
  //         {
  //           color = '#8DB6CDDD'
  //         }
  //         var polyline={}
  //         var polylines = _this.data.polyline
  //         polyline = {
  //           points: points,
  //           color: color,
  //           width: 3
  //         }
  //         polylines.push(polyline)
  //         var dataobj={}
  //         dataobj['polyline' + p] = polyline
  //         dataobj['strategy' + p] = data.paths[0].strategy
  //         dataobj['duration' + p] = Math.round(data.paths[0].duration / 3600 * 100) / 100 + '小时'
  //         dataobj['distance' + p] = Math.round(data.paths[0].distance/1000 *100)/100 +'公里'
  //         _this.setData({ showdis: true })

  //         _this.setData({ polyline: polylines })

  //         //console.log(dataobj)
  //         _this.setData(dataobj)

          
  //         if(p==2){
  //           var polylines =[]
  //           var distances = []
  //           var durations =[]
  //           var strategys=[]
            
  //           distances.push(_this.data.distance0)
  //           distances.push(_this.data.distance1)
  //           distances.push(_this.data.distance2)


  //           durations.push(_this.data.duration0)
  //           durations.push(_this.data.duration1)
  //           durations.push(_this.data.duration2)

  //           strategys.push('推荐路线')
  //           strategys.push(_this.data.strategy1)
  //           strategys.push(_this.data.strategy2)

  //           polylines.push(_this.data.polyline0)
  //           polylines.push(_this.data.polyline1)
  //           polylines.push(_this.data.polyline2)
            
  //           //console.log(polylines)

            
  //           _this.setData({ strategys: strategys })
  //           _this.setData({ durations: durations })
  //           _this.setData({ distances: distances })
            
  //           _this.setData({ polyline: polylines })
  //         }
  //       }
  //     })
    
  // },




  /*
  direction:function(){
	var _this = this
	wx.request({
		url:'https://apis.map.qq.com/ws/direction/v1/driving/',
		data:{
      'from': _this.data.orderinfo.from.location.coordinates[1]+","+ _this.data.orderinfo.from.location.coordinates[0],
      'to': _this.data.orderinfo.to.location.coordinates[1] + "," + _this.data.orderinfo.to.location.coordinates[0],
      'policy':'PICKUP'+","+_this.data.policy,
      'key':'TSFBZ-YAN3U-S2BVJ-4AP4W-XWEQF-GYFRI'
			
		},
		method:'GET',
		success:function(res){
			console.log(res)
      var coors = res.data.result.routes[0].polyline
      for (var i = 2; i < coors.length; i++) 
      { 
        coors[i] = coors[i - 2] + coors[i] / 1000000 
      }
      var pl = [];
      for (var i = 0; i < coors.length; i += 2) {
        pl.push({ latitude: coors[i], longitude: coors[i + 1] })
      }
     console.log(coors)
      // _this.setData({
      //   polyline: coors,
      // });
      _this.setData({
        polyline: [{
          points: pl,
          color: '#FF0000DD',
          width: 2
        }]
      })
		},
		fail:function(res){
      console.log(res)
		}
		
	})
  },
  */
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
      console.log('333')
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})