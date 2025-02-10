"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
      showOldPassword: false,
      showNewPassword: false,
      showConfirmPassword: false,
      passwordError: "",
      confirmError: ""
    };
  },
  computed: {
    // 是否可以提交
    canSubmit() {
      return this.oldPassword && this.newPassword && this.confirmPassword && !this.passwordError && !this.confirmError;
    }
  },
  methods: {
    // 检查密码格式
    checkPassword() {
      if (this.newPassword.length > 0) {
        if (this.newPassword.length < 6 || this.newPassword.length > 20) {
          this.passwordError = "密码长度应为6-20位";
        } else if (!/^[a-zA-Z0-9_]+$/.test(this.newPassword)) {
          this.passwordError = "密码只能包含字母、数字和下划线";
        } else {
          this.passwordError = "";
          this.checkConfirmPassword();
        }
      } else {
        this.passwordError = "";
      }
    },
    // 检查确认密码
    checkConfirmPassword() {
      if (this.confirmPassword.length > 0) {
        if (this.confirmPassword !== this.newPassword) {
          this.confirmError = "两次输入的密码不一致";
        } else {
          this.confirmError = "";
        }
      } else {
        this.confirmError = "";
      }
    },
    // 修改密码
    async changePassword() {
      if (!this.canSubmit)
        return;
      try {
        const userInfo = common_vendor.index.getStorageSync("userInfo");
        if (!userInfo || !userInfo.id) {
          throw new Error("用户未登录");
        }
        const res = await common_vendor.er.callFunction({
          name: "change-password",
          data: {
            userId: userInfo.id,
            oldPassword: this.oldPassword,
            newPassword: this.newPassword
          }
        });
        if (res.result.code === 0) {
          common_vendor.index.showToast({
            title: "修改成功，请重新登录",
            icon: "none"
          });
          common_vendor.index.removeStorageSync("token");
          common_vendor.index.removeStorageSync("userInfo");
          setTimeout(() => {
            common_vendor.index.reLaunch({
              url: "/pages/user/login"
            });
          }, 1500);
        } else {
          throw new Error(res.result.message);
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/user/change-password.vue:169", "修改密码失败:", e);
        common_vendor.index.showToast({
          title: e.message || "修改失败，请重试",
          icon: "none"
        });
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.showOldPassword ? "text" : "password",
    b: $data.oldPassword,
    c: common_vendor.o(($event) => $data.oldPassword = $event.detail.value),
    d: common_vendor.n($data.showOldPassword ? "icon-eye" : "icon-eye-close"),
    e: common_vendor.o(($event) => $data.showOldPassword = !$data.showOldPassword),
    f: $data.showNewPassword ? "text" : "password",
    g: common_vendor.o([($event) => $data.newPassword = $event.detail.value, (...args) => $options.checkPassword && $options.checkPassword(...args)]),
    h: $data.newPassword,
    i: common_vendor.n($data.showNewPassword ? "icon-eye" : "icon-eye-close"),
    j: common_vendor.o(($event) => $data.showNewPassword = !$data.showNewPassword),
    k: $data.passwordError
  }, $data.passwordError ? {
    l: common_vendor.t($data.passwordError)
  } : {}, {
    m: $data.showConfirmPassword ? "text" : "password",
    n: common_vendor.o([($event) => $data.confirmPassword = $event.detail.value, (...args) => $options.checkConfirmPassword && $options.checkConfirmPassword(...args)]),
    o: $data.confirmPassword,
    p: common_vendor.n($data.showConfirmPassword ? "icon-eye" : "icon-eye-close"),
    q: common_vendor.o(($event) => $data.showConfirmPassword = !$data.showConfirmPassword),
    r: $data.confirmError
  }, $data.confirmError ? {
    s: common_vendor.t($data.confirmError)
  } : {}, {
    t: $options.canSubmit ? 1 : "",
    v: !$options.canSubmit,
    w: common_vendor.o((...args) => $options.changePassword && $options.changePassword(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/user/change-password.js.map
