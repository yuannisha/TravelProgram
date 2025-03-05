"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
if (!Math) {
  "./pages/index/index.js";
  "./pages/spots/spots.js";
  "./pages/map/map.js";
  "./pages/user/user.js";
  "./pages/user/avatar.js";
  "./pages/user/profile.js";
  "./pages/user/change-password.js";
  "./pages/user/change-mobile.js";
  "./pages/spots/detail.js";
  "./pages/user/login.js";
  "./pages/user/register.js";
  "./pages/user/favorites.js";
  "./pages/spots/search.js";
  "./pages/user/settings.js";
  "./pages/user/about.js";
  "./pages/spots/comments.js";
  "./pages/plans/plans.js";
  "./pages/plans/plan-edit.js";
  "./pages/plans/plan-detail.js";
  "./pages/plans/public-plans.js";
  "./pages/plans/spot-select.js";
}
const _sfc_main = {
  onLaunch: function() {
    common_vendor.index.__f__("log", "at App.vue:4", "App Launch");
    common_vendor.index.onNetworkStatusChange(function(res) {
      if (!res.isConnected) {
        common_vendor.index.showToast({
          title: "网络连接已断开",
          icon: "none"
        });
      }
    });
    this.globalData.checkLoginStatus(false);
  },
  onShow: function() {
    common_vendor.index.__f__("log", "at App.vue:19", "App Show");
  },
  onHide: function() {
    common_vendor.index.__f__("log", "at App.vue:22", "App Hide");
  },
  onError: function(err) {
    common_vendor.index.__f__("error", "at App.vue:25", "App Error:", err);
  },
  // 全局方法
  globalData: {
    /**
     * 检查登录状态
     * @param {Boolean} redirect 是否重定向到登录页
     * @returns {Boolean} 是否已登录
     */
    checkLoginStatus: function(redirect = true) {
      const token = common_vendor.index.getStorageSync("token");
      const isLogin = !!token;
      if (!isLogin && redirect) {
        const pages = getCurrentPages();
        const currentPage = pages[pages.length - 1];
        const currentRoute = currentPage ? currentPage.route : "";
        common_vendor.index.__f__("log", "at App.vue:45", "当前页面路径:", currentRoute);
        if (currentRoute && !currentRoute.includes("/pages/user/login")) {
          common_vendor.index.setStorageSync("loginRedirect", "/" + currentRoute);
        }
        common_vendor.index.navigateTo({
          url: "/pages/user/login"
        });
      }
      return isLogin;
    },
    /**
     * 获取当前用户ID
     * @returns {String} 用户ID
     */
    getUserId: function() {
      const userInfo = common_vendor.index.getStorageSync("userInfo");
      common_vendor.index.__f__("log", "at App.vue:67", "获取当前用户ID", userInfo);
      return userInfo ? userInfo.id : "";
    }
  }
};
require("./vue-devtools/hook.js");
require("./vue-devtools/backend.js");
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  return {
    app
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
//# sourceMappingURL=../.sourcemap/mp-weixin/app.js.map
