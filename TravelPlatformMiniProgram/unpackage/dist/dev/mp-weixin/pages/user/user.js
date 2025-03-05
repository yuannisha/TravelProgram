"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      isLogin: false,
      userInfo: null
    };
  },
  onShow() {
    const app = getApp();
    app.globalData.checkLoginStatus(true);
    this.checkLoginStatus();
  },
  onLoad() {
    const app = getApp();
    app.globalData.checkLoginStatus(true);
  },
  methods: {
    // 检查登录状态
    checkLoginStatus() {
      const token = common_vendor.index.getStorageSync("token");
      this.isLogin = !!token;
      if (this.isLogin) {
        this.userInfo = common_vendor.index.getStorageSync("userInfo");
        common_vendor.index.__f__("log", "at pages/user/user.vue:98", this.userInfo);
      } else {
        this.userInfo = {
          avatar: "/static/avatar/default-avatar.png",
          username: "游客",
          userId: "10001"
        };
      }
    },
    // 获取用户信息
    async getUserInfo() {
      common_vendor.index.getStorageSync("userInfo", res.result.userInfo);
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
    // 跳转到旅行计划页
    goToPlans() {
      if (!this.isLogin) {
        this.goToLogin();
        return;
      }
      common_vendor.index.navigateTo({
        url: "/pages/plans/plans"
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
    // 跳转到头像页面
    goToAvatar() {
      if (!this.isLogin)
        return;
      common_vendor.index.navigateTo({
        url: "/pages/user/avatar"
      });
    },
    // 跳转到个人信息页
    goToProfile() {
      if (!this.isLogin) {
        this.goToLogin();
        return;
      }
      common_vendor.index.navigateTo({
        url: "/pages/user/profile"
      });
    },
    // 退出登录
    logout() {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要退出登录吗？",
        success: (res2) => {
          if (res2.confirm) {
            common_vendor.index.removeStorageSync("token");
            this.isLogin = false;
            this.userInfo = {
              avatar: "/static/avatar/default-avatar.png",
              username: "游客",
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
    e: common_vendor.o((...args) => $options.goToAvatar && $options.goToAvatar(...args)),
    f: common_vendor.t($data.userInfo.username)
  }, {
    g: common_vendor.o((...args) => $options.goToProfile && $options.goToProfile(...args)),
    h: common_vendor.o((...args) => $options.goToFavorites && $options.goToFavorites(...args)),
    i: common_vendor.o((...args) => $options.goToPlans && $options.goToPlans(...args)),
    j: common_vendor.o((...args) => $options.goToSettings && $options.goToSettings(...args)),
    k: common_vendor.o((...args) => $options.goToAbout && $options.goToAbout(...args)),
    l: $data.isLogin
  }, $data.isLogin ? {
    m: common_vendor.o((...args) => $options.logout && $options.logout(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/user/user.js.map
