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
  },
  onShow: function() {
    common_vendor.index.__f__("log", "at App.vue:16", "App Show");
  },
  onHide: function() {
    common_vendor.index.__f__("log", "at App.vue:19", "App Hide");
  },
  onError: function(err) {
    common_vendor.index.__f__("error", "at App.vue:22", "App Error:", err);
  }
};
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  return {
    app
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
//# sourceMappingURL=../.sourcemap/mp-weixin/app.js.map
