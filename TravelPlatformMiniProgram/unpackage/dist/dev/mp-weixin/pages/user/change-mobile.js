"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      phone: "",
      code: "",
      phoneError: "",
      codeError: "",
      counting: false,
      countdown: 60
    };
  },
  computed: {
    // 是否可以发送验证码
    canSendCode() {
      return this.phone.length === 11 && !this.phoneError;
    },
    // 是否可以提交
    canSubmit() {
      return this.phone.length === 11 && this.code.length === 6 && !this.phoneError && !this.codeError;
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
      try {
        const res = await common_vendor.er.callFunction({
          name: "send-sms-code",
          data: {
            phone: this.phone,
            type: "change-mobile"
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
        common_vendor.index.__f__("error", "at pages/user/change-mobile.vue:133", "发送验证码失败:", e);
        common_vendor.index.showToast({
          title: "发送失败，请重试",
          icon: "none"
        });
      }
    },
    // 更换手机号
    async changeMobile() {
      if (!this.canSubmit)
        return;
      try {
        const userInfo = common_vendor.index.getStorageSync("userInfo");
        if (!userInfo || !userInfo.id) {
          throw new Error("用户未登录");
        }
        const res = await common_vendor.er.callFunction({
          name: "change-mobile",
          data: {
            userId: userInfo.id,
            newMobile: this.phone,
            code: this.code
          }
        });
        if (res.result.code === 0) {
          userInfo.mobile = this.phone;
          common_vendor.index.setStorageSync("userInfo", userInfo);
          common_vendor.index.showToast({
            title: "修改成功",
            icon: "success"
          });
          setTimeout(() => {
            common_vendor.index.navigateBack();
          }, 1500);
        } else {
          throw new Error(res.result.message);
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/user/change-mobile.vue:178", "更换手机号失败:", e);
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
    a: common_vendor.o([($event) => $data.phone = $event.detail.value, (...args) => $options.checkPhone && $options.checkPhone(...args)]),
    b: $data.phone,
    c: $data.phoneError
  }, $data.phoneError ? {
    d: common_vendor.t($data.phoneError)
  } : {}, {
    e: $data.code,
    f: common_vendor.o(($event) => $data.code = $event.detail.value),
    g: common_vendor.t($data.counting ? `${$data.countdown}s后重发` : "获取验证码"),
    h: !$options.canSendCode || $data.counting,
    i: common_vendor.o((...args) => $options.sendCode && $options.sendCode(...args)),
    j: $data.codeError
  }, $data.codeError ? {
    k: common_vendor.t($data.codeError)
  } : {}, {
    l: $options.canSubmit ? 1 : "",
    m: !$options.canSubmit,
    n: common_vendor.o((...args) => $options.changeMobile && $options.changeMobile(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/user/change-mobile.js.map
