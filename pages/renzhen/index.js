// pages/renzhen/index.js
const app = getApp()
var util = require('../../utils/util.js');
var handlogin = require('../../utils/handlelogin.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
      validstatus:1,//1 待初审 2 待面签 3 审核通过
      img_sfz_z:'/images/sfz1.png',
      img_sfz_f:'/images/sfz2.png',
      img_xsz_z:'/images/xsz1.png',
      img_xsz_f:'/images/xsz2.png',
      img_jsz_z:'/images/jsz1.png',
      img_jsz_f:'/images/jsz2.png',
      img_bxd: '/images/bxd.png',
      img_gcpz: '/images/gcpz.png',
      name: '',
      phone: '',
      id: ''
     
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getdata()
    this.getTrucklist()
    this.getTrucktype()
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

bindtypeChange:function(e){
  console.log(e)
  var typeindex = e.detail.value
  var trucktypes  = this.data.trucktypes
  console.log(trucktypes[typeindex])
  this.setData({ truck_type: trucktypes[typeindex]}) 
},

bindlengthChange: function (e) {
  console.log(e)
  var lenindex = e.detail.value
  var trucks = this.data.trucks
  console.log(trucks[lenindex])
  this.setData({truck_length:trucks[lenindex]})
},


//车型信息
getTrucktype:function(){
  var trucktypes = ['高栏','重板','轻板','箱式']
  this.setData({trucktypes:trucktypes})
},
//车长信息
getTrucklist:function(){
  var _this = this
  wx.request({
    url: app.globalData.host + '/wx/getTruckList',
    data:{
      'user_id': wx.getStorageSync('user_id'),
      's_id': wx.getStorageSync('s_id'),
    },
    method:'POST',
    header: {
      'content-type': 'application/json'
    }, 
    success:function(res){
      console.log(res.data.trucks)
      var trucks = new Array()
      res.data.trucks.forEach((v,k)=>{
        console.log(v)
        trucks.push(v.name)
      })
      _this.setData({ trucks: trucks})

    }

  })

},


  getdata:function(){
    var _this = this;
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
            _this.setData({userinfo:res.data})
            if (res.data.apply_driver_state){
              _this.setData({
                validstatus: res.data.apply_driver_state
              })  
            }
            _this.setData({
         
              img_sfz_z: res.data.id_img_1 ? res.data.id_img_1 +"? v ="+Math.random()*9999+1 :'/images/sfz1.png',
              img_sfz_f: res.data.id_img_2 ? res.data.id_img_2 + "? v =" + Math.random() * 9999 + 1 : '/images/sfz2.png',
              img_xsz_z: res.data.truck_img_1 ? res.data.truck_img_1 + "? v =" + Math.random() * 9999 + 1:'/images/xsz1.png',
              img_xsz_f: res.data.truck_img_2 ? res.data.truck_img_2 + "? v =" + Math.random() * 9999 + 1 :'/images/xsz2.png',
              img_jsz_z: res.data.driver_licence_1 ? res.data.driver_licence_1 + "? v =" + Math.random() * 9999 + 1:'/images/jsz1.png',
              img_jsz_f: res.data.driver_licence_2 ? res.data.driver_licence_2 + "? v =" + Math.random() * 9999 + 1 :'/images/jsz2.png',
              img_bxd: res.data.insurance_img ? res.data.insurance_img + "? v =" + Math.random() * 9999 + 1:'/images/bxd.png',
              img_gcpz: res.data.sany_truck_img ? res.data.sany_truck_img + "? v =" + Math.random() * 9999 + 1:'/images/gcpz.png',
              name: res.data.name,
              phone: res.data.phone,
              truck_type:res.data.truck_type,
              truck_length:res.data.truck_length,
              id: res.data.id
            })
          }
          else {
            handlogin.handError(res, _this.getdata)
          }


        },
        fail: function (res) {
          handlogin.handError(res, _this.getdata)
        }

      })

    })

  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  chooseImageTap: function (e) {
    console.log(e)
    var img_id = e.target.dataset.img_id
    let _this = this;
    wx.showActionSheet({
      itemList: ['从相册中选择', '拍照'],
      itemColor: "#f7982a",
      success: function (res) {
        if (!res.cancel) {
          if (res.tapIndex == 0) {
            _this.chooseWxImage('album', img_id)
          } else if (res.tapIndex == 1) {
            _this.chooseWxImage('camera', img_id)
          }
        }
      }
    })
  },
  chooseWxImage: function (type,img_id) {
    console.log(img_id)
    let _this = this;
    wx.chooseImage({
      sizeType: ['original', 'compressed'],
      count:1,
      sourceType: [type],
      success: function (res) {
        console.log(res);
        var img = res.tempFilePaths;
        console.log(img)
       var files = _this.data.files;
        if ('img_sfz_z' == img_id)
        {
          _this.setData({img_sfz_z: img[0]})
          _this.uploadpic(img[0],'id_img_1')
        }
        else if ('img_sfz_f' == img_id){
          _this.setData({img_sfz_f: img[0]})
          _this.uploadpic(img[0], 'id_img_2')
        }
        else if ('img_xsz_z' == img_id) {
          _this.setData({ img_xsz_z: img[0] })
          _this.uploadpic(img[0], 'truck_img_1')
        }
        else if ('img_xsz_f' == img_id) {
          _this.setData({ img_xsz_f: img[0] })
          _this.uploadpic(img[0], 'truck_img_2')
        }
        else if ('img_jsz_z' == img_id) {
          _this.setData({ img_jsz_z: img[0] })
          _this.uploadpic(img[0], 'driver_licence_1')
        }
        else if ('img_jsz_f' == img_id) {
          _this.setData({ img_jsz_f: img[0] })
          _this.uploadpic(img[0], 'driver_licence_2')
        }
        else if ('img_bxd' == img_id) {
          _this.setData({ img_bxd: img[0] })
          _this.uploadpic(img[0], 'insurance_img')
        }
        else if ('img_gcpz' == img_id) {
          _this.setData({ img_gcpz: img[0] })
          _this.uploadpic(img[0], 'sany_truck_img')
        }
        
      }
    })
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  phone_input: function (e) {
    console.log('phone')
    this.setData({
      phone: e.detail.detail.value
    })

  },

  id_input: function (e) {
    console.log(e)
    console.log('id')
    this.setData({
      id: e.detail.detail.value
    })
  },

  name_input: function (e) {
    console.log(e)
    this.setData({
      name: e.detail.detail.value
    })
  },

  //提交更新用户信息
  submit:function(){

    var name = this.data.name
    var phone = this.data.phone
    var id = this.data.id
    var truck_type = this.data.truck_type
    var truck_length = this.data.truck_length

    if (!name || name == '') {
      wx.showToast({
        title: '姓名不能为空！',
        icon: 'none',
        duration: 1000
      })
      return false;
    }

    if (!id || id == '') {
      wx.showToast({
        title: '身份证号码不能为空！',
        icon: 'none',
        duration: 1000
      })
      return false;
    }

    if (!truck_length || truck_length == '') {
      wx.showToast({
        title: '车长信息不能为空',
        icon: 'none',
        duration: 1000
      })
      return false;
    }


    if (!truck_type || truck_type == '') {
      wx.showToast({
        title: '车型信息不能为空',
        icon: 'none',
        duration: 1000
      })
      return false;
    }

    if (!phone || phone == '') {
      wx.showToast({
        title: '手机号码不能为空！',
        icon: 'none',
        duration: 1000
      })
      return false;
    }

    var reg = /^\d{11}$/;
    console.log(phone)
    if (!reg.test(phone)) {
      wx.showToast({
        icon: 'none',
        title: '手机号码格式不正确',
      })
      return false;
    }

    //判断图片上传状态
              
    if(this.data.img_sfz_z == '/images/sfz1.png')
    {
      wx.showToast({
        icon: 'none',
        title: '请上传身份证正面图片',
      })
      return false;
    }
    else if (this.data.img_sfz_f == '/images/sfz2.png'){
      wx.showToast({
        icon: 'none',
        title: '请上传身份证反面图片',
      })
      return false;
    }
    else if (this.data.img_xsz_z== '/images/xsz1.png') {
      wx.showToast({
        icon: 'none',
        title: '请上传行驶证正面图片',
      })
      return false;
    }
    else if (this.data.img_xsz_f=='/images/xsz2.png') {
      wx.showToast({
        icon: 'none',
        title: '请上传行驶证反面图片',
      })
      return false;
    }
    else if (this.data.img_jsz_z=='/images/jsz1.png') {
      wx.showToast({
        icon: 'none',
        title: '请上传驾驶证正面图片',
      })
      return false;
    }
    else if (this.data.img_jsz_f=='/images/jsz2.png') {
      wx.showToast({
        icon: 'none',
        title: '请上传驾驶证反面图片',
      })
      return false;
    }
    else if (this.data.img_bxd== '/images/bxd.png') {
      wx.showToast({
        icon: 'none',
        title: '请上传保险单图片',
      })
      return false;
    }
    wx.showLoading({
      title: '提交中',
    })
    var _this=this;
    wx.request({
      url: app.globalData.host + '/api/user/updateInfo',
      data: {
        'user_id': wx.getStorageSync('user_id'),
        's_id': wx.getStorageSync('s_id'),
        'name': name,
        'phone': phone,
        'truck_type':truck_type,
        'truck_length':truck_length,
        'id':id
      },
      method: 'POST',
      header: {
        'content-type': 'application/json'
      }, // 设置请求的 header
      success: function (res) {
        wx.hideLoading()
        console.log(res)
        if (res.data.ok == 1) {

          if (name) {
            wx.setStorageSync('name', name);
          }
          wx.showToast({
            title: '提交成功',
            duration: 2000,
            success(res) {
              setTimeout(function () {
                wx.navigateBack({})
              }, 2000);

            }
          })
        }
      },
      complete: function (res) {
        wx.hideNavigationBarLoading()
        wx.hideLoading()
      }

    })
    
  },
 
  uploadpic:function(tempfile,filename){
    console.log(wx.getStorageSync('s_id'))
    console.log(wx.getStorageSync('user_id'))
    console.log(tempfile)
    wx.uploadFile({
      url: app.globalData.host + "/wx/upload_file",
      formData: {
        'field_name': filename,
        'user_id': wx.getStorageSync('user_id'),
        's_id': wx.getStorageSync('s_id'),
      },
      header: { "Content-Type": "multipart/form-data" },
      filePath: tempfile,
      method:'POST',
      name:filename,
     // 设置请求的 header
      success: function (res) {

        if (res.data == '{"ok":1}'){
          wx.showToast({
            title: '上传成功',
          })
        }
        else
        {
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
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})