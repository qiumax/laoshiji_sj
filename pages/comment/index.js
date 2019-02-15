// pages/comment/index.js
var handlogin = require('../../utils/handlelogin.js');
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    starIndex: 0,
    order_id:'',
    content:'',
    showUpload: true,
    showUpload0: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
   
    var order_id = options.order_id
    this.setData({
      order_id: order_id
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },



  //上传签收图片
  uploadpic: function (e) {
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
    wx.showLoading({
      title: '上传中',
    })
    console.log(img_id)
    let _this = this;
    wx.chooseImage({
      sizeType: ['original', 'compressed'],
      count: 1,
      sourceType: [type],
      success: function (res) {
        console.log(res);
        var img = res.tempFilePaths;
        _this.picupload(img[0], 'img_' + img_id, img_id)

      }
    })
  },

  picupload: function (tempfile, filename, img_id) {
    var _this = this
    console.log(wx.getStorageSync('s_id'))
    console.log(wx.getStorageSync('user_id'))
    console.log(tempfile)
    wx.uploadFile({
      url: app.globalData.host + "/wx/driver_comment_pic",
      formData: {
        'field_name': filename,
        'user_id': wx.getStorageSync('user_id'),
        's_id': wx.getStorageSync('s_id'),
        'order_id': _this.data.order_id
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
  delpic: function (e) {
    var _this = this
    console.log(e)
    var id = e.currentTarget.dataset.p_id
    var pics = _this.data.pics
    pics.splice(id, 1)
    console.log(pics)
    _this.setData({ delpic: parseInt(id) - 1 })

    var showUpload = {};
    var showname = 'showUpload' + (parseInt(id) + 1)
    showUpload[showname] = false
    console.log(showUpload)
    _this.setData(showUpload)


    _this.setData({ pics: pics })
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
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  onChange:function(e) {
    const index = e.detail.index;
    console.log(index)
    this.setData({
      'starIndex': index
    })
  },

  //评价内容
  comcontent:function(e){
    console.log(e)
    this.setData({
      content:e.detail.value
    })
  },
//提交评价
  comment:function(){
    var _this =this
    var star = _this.data.starIndex
    
    if(star==0)
    {
      wx.showToast({
        title: '请选择评分',
        icon:'none'
      })
      return false
    }
    var content = _this.data.content
    if(!content || content==''){
      wx.showToast({
        title: '请输入评论内容',
        icon: 'none'
      })
      return false
    }
    // if (!_this.data.pics || _this.data.pics.length == 0) {
    //   _this.setData({ showUpload: true })
    //   _this.setData({ showUpload0: true })
    //   wx.showToast({
    //     title: '请先上传图片',
    //     icon: 'none',
    //     duration: 5000
    //   })
    //   return false
    // }
    var comment_to_company = new Array()
    comment_to_company = {
      points: star,
      content: content,
      time: Date.parse(new Date()) / 1000,
      pics:_this.data.pics
    }
    wx.showLoading({
      title: '提交中',
    })
    handlogin.isLogin(() => {
      wx.request({
        url: app.globalData.host + '/api/driver/comment',
        data: {
          'user_id': wx.getStorageSync('user_id'),
          's_id': wx.getStorageSync('s_id'),
          'order_id': _this.data.order_id,
          'comment_to_company': JSON.stringify(comment_to_company)
        },
        method: 'POST',
        header: {
          'content-type': 'application/json'
        }, // 设置请求的 header
        success: function (res) {
          console.log(res)
          if (!res.data.err && res.data.ok=='1') {
            wx.hideLoading()
            wx.showToast({
              title: '提交成功！',
              duration: 2000,
              success(res) {
                setTimeout(function () {
                  wx.navigateBack({})
                }, 2000);

              }
            })
          }
          else {
            handlogin.handError(res, _this.comment)
          }
        },
        fail: function (res) {
          wx.showToast({
            title: '操作失败，请重试！',
            icon:'none'
          })
        }

      })
    })
    
    
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})