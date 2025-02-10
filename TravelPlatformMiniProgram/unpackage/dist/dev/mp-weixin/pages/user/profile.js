"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      userInfo: null
    };
  },
  onShow() {
    this.getUserInfo();
  },
  methods: {
    // 获取用户信息
    getUserInfo() {
      const userInfo = common_vendor.index.getStorageSync("userInfo");
      if (userInfo) {
        this.userInfo = { ...userInfo };
      } else {
        common_vendor.index.navigateBack();
      }
    },
    // 格式化手机号
    formatPhone(phone) {
      return phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2");
    },
    // 更新字段
    async updateField(field) {
      try {
        const res = await common_vendor.er.callFunction({
          name: "update-user-info",
          data: {
            userId: this.userInfo.id,
            field,
            value: this.userInfo[field]
          }
        });
        if (res.result.code === 0) {
          common_vendor.index.setStorageSync("userInfo", this.userInfo);
          common_vendor.index.showToast({
            title: "更新成功",
            icon: "success"
          });
        } else {
          throw new Error(res.result.message);
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/user/profile.vue:103", "更新失败:", e);
        common_vendor.index.showToast({
          title: "更新失败",
          icon: "none"
        });
      }
    },
    // 跳转到头像页
    goToAvatar() {
      common_vendor.index.navigateTo({
        url: "/pages/user/avatar"
      });
    },
    // 跳转到修改密码页
    goToChangePassword() {
      common_vendor.index.navigateTo({
        url: "/pages/user/change-password"
      });
    },
    // 跳转到更换手机号页
    goToChangeMobile() {
      common_vendor.index.navigateTo({
        url: "/pages/user/change-mobile"
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $data.userInfo.avatar,
    b: common_vendor.o((...args) => $options.goToAvatar && $options.goToAvatar(...args)),
    c: common_vendor.o(($event) => $options.updateField("username")),
    d: $data.userInfo.username,
    e: common_vendor.o(($event) => $data.userInfo.username = $event.detail.value),
    f: common_vendor.t($data.userInfo.gender === 1 ? "男" : "女"),
    g: common_vendor.t($options.formatPhone($data.userInfo.mobile)),
    h: common_vendor.o((...args) => $options.goToChangeMobile && $options.goToChangeMobile(...args)),
    i: common_vendor.o((...args) => $options.goToChangePassword && $options.goToChangePassword(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/user/profile.js.map
