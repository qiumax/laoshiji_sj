// pages/renzhen/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
      isvalid:false,//是否认证通过
      img_sfz_z:'/images/sfz_zhen.png',
      img_sfz_f:'/images/sfz_fan.png'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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

  chooseImageTap: function (e) {
    console.log(e)
    var img_id = e.target.dataset.img_id
    let _this = this;
    wx.showActionSheet({

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
       
        if ('img_sfz_z' == img_id)
        {
          _this.setData({img_sfz_z: img[0]})
        }
        else if ('img_sfz_f' == img_id){
          _this.setData({img_sfz_f: img[0]})
        }
        
      }
    })
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