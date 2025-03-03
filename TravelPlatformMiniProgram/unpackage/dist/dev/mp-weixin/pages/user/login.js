"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      phone: "",
      password: "",
      code: "",
      phoneError: "",
      passwordError: "",
      codeError: "",
      agreed: false,
      counting: false,
      countdown: 60,
      showPassword: false
    };
  },
  computed: {
    // 是否可以发送验证码
    canSendCode() {
      return this.phone.length === 11 && !this.phoneError;
    },
    // 是否可以提交
    canSubmit() {
      return this.phone.length === 11 && this.password.length >= 6 && this.code.length === 6 && !this.phoneError && !this.passwordError && !this.codeError && this.agreed;
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
      common_vendor.index.showToast({
        title: "验证码已发送",
        icon: "none"
      });
      this.counting = true;
      this.countdown = 60;
      const timer = setInterval(() => {
        this.countdown--;
        if (this.countdown === 0) {
          clearInterval(timer);
          this.counting = false;
        }
      }, 1e3);
    },
    // 登录
    async login() {
      if (!this.canSubmit)
        return;
      try {
        const res = await common_vendor.er.callFunction({
          name: "user-login",
          data: {
            phone: this.phone,
            password: this.password,
            code: this.code
          }
        });
        common_vendor.index.__f__("log", "at pages/user/login.vue:172", "登录的手机号：", this.phone);
        common_vendor.index.__f__("log", "at pages/user/login.vue:173", "登录的密码：", this.password);
        common_vendor.index.__f__("log", "at pages/user/login.vue:174", "登录的验证码：", this.code);
        common_vendor.index.__f__("log", "at pages/user/login.vue:175", "登录结果：", res);
        if (res.result.code === 0) {
          common_vendor.index.setStorageSync("token", res.result.token);
          common_vendor.index.setStorageSync("userInfo", res.result.userInfo);
          common_vendor.index.showToast({
            title: "登录成功",
            icon: "success"
          });
          setTimeout(() => {
            const pages = getCurrentPages();
            if (pages.length > 1) {
              common_vendor.index.navigateBack();
            } else {
              common_vendor.index.switchTab({
                url: "/pages/index/index"
              });
            }
          }, 1500);
        } else {
          common_vendor.index.showToast({
            title: res.result.message,
            icon: "none"
          });
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/user/login.vue:206", "登录失败:", e);
        common_vendor.index.showToast({
          title: "登录失败，请重试",
          icon: "none"
        });
      }
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
    },
    // 跳转到注册页面
    goToRegister() {
      common_vendor.index.navigateTo({
        url: "/pages/user/register"
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o([($event) => $data.phone = $event.detail.value, (...args) => $options.checkPhone && $options.checkPhone(...args)]),
    b: $data.phone,
    c: $data.phoneError
  }, $data.phoneError ? {
    d: common_vendor.t($data.phoneError)
  } : {}, {
    e: $data.showPassword ? "text" : "password",
    f: $data.password,
    g: common_vendor.o(($event) => $data.password = $event.detail.value),
    h: common_vendor.n($data.showPassword ? "icon-eye" : "icon-eye-close"),
    i: common_vendor.o(($event) => $data.showPassword = !$data.showPassword),
    j: $data.passwordError
  }, $data.passwordError ? {
    k: common_vendor.t($data.passwordError)
  } : {}, {
    l: $data.code,
    m: common_vendor.o(($event) => $data.code = $event.detail.value),
    n: common_vendor.t($data.counting ? `${$data.countdown}s后重试` : "获取验证码"),
    o: $options.canSendCode && !$data.counting ? 1 : "",
    p: !$options.canSendCode || $data.counting,
    q: common_vendor.o((...args) => $options.sendCode && $options.sendCode(...args)),
    r: $data.codeError
  }, $data.codeError ? {
    s: common_vendor.t($data.codeError)
  } : {}, {
    t: $options.canSubmit ? 1 : "",
    v: !$options.canSubmit,
    w: common_vendor.o((...args) => $options.login && $options.login(...args)),
    x: $data.agreed,
    y: common_vendor.o(($event) => $data.agreed = !$data.agreed),
    z: common_vendor.o((...args) => $options.goToUserAgreement && $options.goToUserAgreement(...args)),
    A: common_vendor.o((...args) => $options.goToPrivacyPolicy && $options.goToPrivacyPolicy(...args)),
    B: common_vendor.o((...args) => $options.goToRegister && $options.goToRegister(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/user/login.js.map
