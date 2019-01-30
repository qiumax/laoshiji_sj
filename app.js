//app.js
var util = require('./utils/util.js');
App({
  
  onLaunch: function (options) {

    console.log('onLauch');

    console.log('options');
    console.log(options);

    if (options.scene == 1044) {
      console.log(options.shareTicket)
    }
    console.log('onlanch end');
  },

  globalData: {
    userInfo: null,
    host: 'https://driver.quxunbao.cn',
    comhost: 'https://driver-com.quxunbao.cn',
    refreshtime: 60000,//页面刷新时间
    ORDER_STATE:{
      TO_GET_CARGO: 1,
      DRIVER_CONFIRM_GET_CARGO: 2,
      COMPANY_CONFIRM_GET_CARGO: 3,
      DRIVER_CONFIRM_DELIVER: 4,
      COMPANY_TOUSU_DELIVER: 5,
      PLAT_HANDLE_TOUSU: 6,
      COMPANY_CONFIRM_DELIVER: 7,
      COMMENTED: 8
    }
  }

  
})