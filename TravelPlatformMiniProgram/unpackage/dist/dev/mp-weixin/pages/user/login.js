"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      phone: "",
      code: "",
      phoneError: "",
      codeError: "",
      counting: false,
      countdown: 60,
      agreed: false
    };
  },
  computed: {
    // 是否可以发送验证码
    canSendCode() {
      return this.phone.length === 11 && !this.phoneError;
    },
    // 是否可以提交
    canSubmit() {
      return this.phone.length === 11 && this.code.length === 6 && !this.phoneError && !this.codeError && this.agreed;
    }
  },
  methods: {
    // 检查手机号格式
    checkPhone() {
      if (this.phone.length === 11) {
        if (!/^1[3-9]\d{9}$/.test(this.phone)) {
          this.phoneError = "请输入正确的手机号";
        } else {
          this.phoneError = "";
        }
      } else {
        this.phoneError = "";
      }
    },
    // 发送验证码
    async sendCode() {
      if (!this.canSendCode || this.counting)
        return;
      this.counting = true;
      this.countdown = 60;
      const timer = setInterval(() => {
        this.countdown--;
        if (this.countdown === 0) {
          clearInterval(timer);
          this.counting = false;
        }
      }, 1e3);
      common_vendor.index.showToast({
        title: "验证码已发送",
        icon: "none"
      });
    },
    // 登录
    async login() {
      if (!this.canSubmit)
        return;
      await new Promise((resolve) => setTimeout(resolve, 1e3));
      common_vendor.index.setStorageSync("token", "mock_token");
      common_vendor.index.showToast({
        title: "登录成功",
        icon: "success"
      });
      setTimeout(() => {
        common_vendor.index.navigateBack();
      }, 1500);
    },
    // 查看用户协议
    goToUserAgreement() {
      common_vendor.index.navigateTo({
        url: "/pages/user/agreement"
      });
    },
    // 查看隐私政策
    goToPrivacyPolicy() {
      common_vendor.index.navigateTo({
        url: "/pages/user/privacy"
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_assets._imports_0$1,
    b: common_vendor.o([($event) => $data.phone = $event.detail.value, (...args) => $options.checkPhone && $options.checkPhone(...args)]),
    c: $data.phone,
    d: $data.phoneError
  }, $data.phoneError ? {
    e: common_vendor.t($data.phoneError)
  } : {}, {
    f: $data.code,
    g: common_vendor.o(($event) => $data.code = $event.detail.value),
    h: common_vendor.t($data.counting ? `${$data.countdown}s后重发` : "获取验证码"),
    i: !$options.canSendCode || $data.counting,
    j: common_vendor.o((...args) => $options.sendCode && $options.sendCode(...args)),
    k: $data.codeError
  }, $data.codeError ? {
    l: common_vendor.t($data.codeError)
  } : {}, {
    m: $options.canSubmit ? 1 : "",
    n: !$options.canSubmit,
    o: common_vendor.o((...args) => $options.login && $options.login(...args)),
    p: $data.agreed,
    q: common_vendor.o(($event) => $data.agreed = !$data.agreed),
    r: common_vendor.o((...args) => $options.goToUserAgreement && $options.goToUserAgreement(...args)),
    s: common_vendor.o((...args) => $options.goToPrivacyPolicy && $options.goToPrivacyPolicy(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/user/login.js.map
