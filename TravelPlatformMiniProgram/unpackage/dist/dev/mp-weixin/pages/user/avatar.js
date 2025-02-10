"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      currentAvatar: "",
      tempFilePath: "",
      hasNewImage: false
    };
  },
  onLoad() {
    const userInfo = common_vendor.index.getStorageSync("userInfo");
    if (userInfo) {
      this.currentAvatar = userInfo.avatar;
    }
  },
  methods: {
    // 选择图片
    chooseImage() {
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          this.tempFilePath = res.tempFilePaths[0];
          this.currentAvatar = this.tempFilePath;
          this.hasNewImage = true;
        }
      });
    },
    // 上传头像
    async uploadAvatar() {
      if (!this.hasNewImage)
        return;
      try {
        common_vendor.index.showLoading({
          title: "上传中..."
        });
        const uploadRes = await common_vendor.er.uploadFile({
          filePath: this.tempFilePath,
          cloudPath: `avatar/${Date.now()}.jpg`
        });
        const userInfo = common_vendor.index.getStorageSync("userInfo");
        if (!userInfo || !userInfo.id) {
          throw new Error("用户未登录");
        }
        const res = await common_vendor.er.callFunction({
          name: "update-avatar",
          data: {
            userId: userInfo.id,
            avatar: uploadRes.fileID
          }
        });
        if (res.result.code === 0) {
          userInfo.avatar = res.result.avatar;
          common_vendor.index.setStorageSync("userInfo", userInfo);
          common_vendor.index.showToast({
            title: "更新成功",
            icon: "success"
          });
          setTimeout(() => {
            common_vendor.index.navigateBack();
          }, 1500);
        } else {
          throw new Error(res.result.message);
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/user/avatar.vue:96", "上传头像失败:", e);
        common_vendor.index.showToast({
          title: "上传失败，请重试",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $data.currentAvatar,
    b: common_vendor.o((...args) => $options.chooseImage && $options.chooseImage(...args)),
    c: common_vendor.o((...args) => $options.uploadAvatar && $options.uploadAvatar(...args)),
    d: !$data.hasNewImage
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/user/avatar.js.map
