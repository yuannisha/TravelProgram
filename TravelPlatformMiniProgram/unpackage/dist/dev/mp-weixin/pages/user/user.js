"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      isLogin: false,
      userInfo: {
        avatar: "/static/avatar/default-avatar.png",
        nickname: "游客",
        userId: "10001"
      }
    };
  },
  onShow() {
    this.checkLoginStatus();
  },
  methods: {
    // 检查登录状态
    checkLoginStatus() {
      const token = common_vendor.index.getStorageSync("token");
      this.isLogin = !!token;
      if (this.isLogin) {
        this.getUserInfo();
      }
    },
    // 获取用户信息
    async getUserInfo() {
    },
    // 跳转到登录页
    goToLogin() {
      common_vendor.index.navigateTo({
        url: "/pages/user/login"
      });
    },
    // 跳转到收藏页
    goToFavorites() {
      if (!this.isLogin) {
        this.goToLogin();
        return;
      }
      common_vendor.index.navigateTo({
        url: "/pages/user/favorites"
      });
    },
    // 跳转到历史记录页
    goToHistory() {
      if (!this.isLogin) {
        this.goToLogin();
        return;
      }
      common_vendor.index.navigateTo({
        url: "/pages/user/history"
      });
    },
    // 跳转到设置页
    goToSettings() {
      common_vendor.index.navigateTo({
        url: "/pages/user/settings"
      });
    },
    // 跳转到关于页
    goToAbout() {
      common_vendor.index.navigateTo({
        url: "/pages/user/about"
      });
    },
    // 退出登录
    logout() {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要退出登录吗？",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.removeStorageSync("token");
            this.isLogin = false;
            this.userInfo = {
              avatar: "/static/avatar/default-avatar.png",
              nickname: "游客",
              userId: "10001"
            };
            common_vendor.index.showToast({
              title: "已退出登录",
              icon: "none"
            });
          }
        }
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: !$data.isLogin
  }, !$data.isLogin ? {
    b: common_assets._imports_0,
    c: common_vendor.o((...args) => $options.goToLogin && $options.goToLogin(...args))
  } : {
    d: $data.userInfo.avatar,
    e: common_vendor.t($data.userInfo.nickname),
    f: common_vendor.t($data.userInfo.userId)
  }, {
    g: common_vendor.o((...args) => $options.goToFavorites && $options.goToFavorites(...args)),
    h: common_vendor.o((...args) => $options.goToHistory && $options.goToHistory(...args)),
    i: common_vendor.o((...args) => $options.goToSettings && $options.goToSettings(...args)),
    j: common_vendor.o((...args) => $options.goToAbout && $options.goToAbout(...args)),
    k: $data.isLogin
  }, $data.isLogin ? {
    l: common_vendor.o((...args) => $options.logout && $options.logout(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/user/user.js.map
