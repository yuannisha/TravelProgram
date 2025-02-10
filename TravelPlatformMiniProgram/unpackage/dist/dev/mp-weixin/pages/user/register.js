"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      phone: "",
      code: "",
      password: "",
      username: "",
      gender: 0,
      phoneError: "",
      codeError: "",
      passwordError: "",
      counting: false,
      countdown: 60,
      showPassword: false,
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
      return this.phone.length === 11 && this.code.length === 6 && this.password.length >= 6 && this.username && this.gender !== 0 && !this.phoneError && !this.codeError && !this.passwordError && this.agreed;
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
    // 检查密码格式
    checkPassword() {
      if (this.password.length > 0) {
        if (this.password.length < 6 || this.password.length > 20) {
          this.passwordError = "密码长度应为6-20位";
        } else if (!/^[a-zA-Z0-9_]+$/.test(this.password)) {
          this.passwordError = "密码只能包含字母、数字和下划线";
        } else {
          this.passwordError = "";
        }
      } else {
        this.passwordError = "";
      }
    },
    // 发送验证码
    async sendCode() {
      if (!this.canSendCode || this.counting)
        return;
      try {
        const res = await common_vendor.er.callFunction({
          name: "send-sms-code",
          data: {
            phone: this.phone,
            type: "register"
          }
        });
        if (res.result.code === 0) {
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
        } else {
          common_vendor.index.showToast({
            title: res.result.message,
            icon: "none"
          });
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/user/register.vue:237", "发送验证码失败:", e);
        common_vendor.index.showToast({
          title: "发送失败，请重试",
          icon: "none"
        });
      }
    },
    // 选择性别
    selectGender(value) {
      this.gender = value;
    },
    // 注册
    async register() {
      if (!this.canSubmit)
        return;
      common_vendor.index.__f__("log", "at pages/user/register.vue:253", "注册的手机号：", this.phone);
      common_vendor.index.__f__("log", "at pages/user/register.vue:254", "注册的验证码：", this.code);
      common_vendor.index.__f__("log", "at pages/user/register.vue:255", "注册的密码：", this.password);
      common_vendor.index.__f__("log", "at pages/user/register.vue:256", "注册的用户名：", this.username);
      common_vendor.index.__f__("log", "at pages/user/register.vue:257", "注册的性别：", this.gender);
      try {
        const res = await common_vendor.er.callFunction({
          name: "user-register",
          data: {
            phone: this.phone,
            code: this.code,
            password: this.password,
            username: this.username,
            gender: this.gender,
            status: 1,
            mobile_confirmed: 1
          }
        });
        if (res.result.code === 0) {
          common_vendor.index.showToast({
            title: "注册成功",
            icon: "success"
          });
          setTimeout(() => {
            common_vendor.index.navigateBack();
          }, 1500);
        } else {
          common_vendor.index.showToast({
            title: res.result.message,
            icon: "none"
          });
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/user/register.vue:290", "注册失败:", e);
        common_vendor.index.showToast({
          title: "注册失败，请重试",
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
    // 跳转到登录页
    goToLogin() {
      common_vendor.index.navigateBack();
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
    m: $data.showPassword ? "text" : "password",
    n: common_vendor.o([($event) => $data.password = $event.detail.value, (...args) => $options.checkPassword && $options.checkPassword(...args)]),
    o: $data.password,
    p: common_vendor.n($data.showPassword ? "icon-eye" : "icon-eye-close"),
    q: common_vendor.o(($event) => $data.showPassword = !$data.showPassword),
    r: $data.passwordError
  }, $data.passwordError ? {
    s: common_vendor.t($data.passwordError)
  } : {}, {
    t: $data.username,
    v: common_vendor.o(($event) => $data.username = $event.detail.value),
    w: $data.gender === 1 ? 1 : "",
    x: common_vendor.o(($event) => $options.selectGender(1)),
    y: $data.gender === 2 ? 1 : "",
    z: common_vendor.o(($event) => $options.selectGender(2)),
    A: $options.canSubmit ? 1 : "",
    B: !$options.canSubmit,
    C: common_vendor.o((...args) => $options.register && $options.register(...args)),
    D: $data.agreed,
    E: common_vendor.o(($event) => $data.agreed = !$data.agreed),
    F: common_vendor.o((...args) => $options.goToUserAgreement && $options.goToUserAgreement(...args)),
    G: common_vendor.o((...args) => $options.goToPrivacyPolicy && $options.goToPrivacyPolicy(...args)),
    H: common_vendor.o((...args) => $options.goToLogin && $options.goToLogin(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/user/register.js.map
