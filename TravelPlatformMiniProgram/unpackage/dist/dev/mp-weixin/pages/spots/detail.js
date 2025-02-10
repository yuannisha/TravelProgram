"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      showNavigation: false,
      showComment: false,
      spotId: "",
      spotDetail: {},
      navigationOptions: [
        { name: "百度地图", icon: "icon-baidu" },
        { name: "高德地图", icon: "icon-gaode" },
        { name: "腾讯地图", icon: "icon-tengxun" }
      ],
      rating: 0,
      commentContent: "",
      commentImages: []
    };
  },
  computed: {
    canSubmitComment() {
      return this.rating > 0 && this.commentContent.trim().length > 0;
    }
  },
  onLoad(options) {
    if (options.id) {
      this.spotId = options.id;
      this.getSpotDetail();
    }
  },
  methods: {
    // 获取景点详情
    async getSpotDetail() {
      try {
        const res = await common_vendor.er.callFunction({
          name: "get-spot-detail",
          data: {
            id: this.spotId
          }
        });
        const uid = common_vendor.index.getStorageSync("userInfo").id;
        const favoriteRes = await common_vendor.er.callFunction({
          name: "get-favorite-status",
          data: {
            uid,
            spotId: this.spotId
          }
        });
        common_vendor.index.__f__("log", "at pages/spots/detail.vue:244", "favoriteRes", favoriteRes);
        if (res.result.code === 0) {
          this.spotDetail = res.result.data;
          this.spotDetail.isFavorite = favoriteRes.result.data.isFavorite;
          common_vendor.index.__f__("log", "at pages/spots/detail.vue:248", "this.spotDetail", this.spotDetail);
        } else {
          common_vendor.index.showToast({
            title: res.result.message,
            icon: "none"
          });
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/spots/detail.vue:258", "获取景点详情失败:", e);
        common_vendor.index.showToast({
          title: "获取详情失败",
          icon: "none"
        });
      }
    },
    // 切换收藏状态
    async toggleFavorite() {
      const token = common_vendor.index.getStorageSync("token");
      if (!token) {
        common_vendor.index.navigateTo({
          url: "/pages/user/login"
        });
        return;
      }
      const uid = common_vendor.index.getStorageSync("userInfo").id;
      common_vendor.index.__f__("log", "at pages/spots/detail.vue:277", "uid", uid);
      try {
        const res = await common_vendor.er.callFunction({
          name: "toggle-favorite",
          data: {
            uid,
            spotId: this.spotId
          }
        });
        if (res.result.code === 0) {
          this.spotDetail.isFavorite = res.result.data.isFavorite;
          common_vendor.index.showToast({
            title: this.spotDetail.isFavorite ? "收藏成功" : "已取消收藏",
            icon: "success"
          });
        } else {
          common_vendor.index.showToast({
            title: res.result.message,
            icon: "none"
          });
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/spots/detail.vue:301", "操作收藏失败:", e);
        common_vendor.index.showToast({
          title: "操作失败",
          icon: "none"
        });
      }
    },
    // 显示导航选项
    showNavigationOptions() {
      this.showNavigation = true;
    },
    // 隐藏导航选项
    hideNavigationOptions() {
      this.showNavigation = false;
    },
    // 导航
    navigate(option) {
      common_vendor.index.showToast({
        title: `即将打开${option.name}`,
        icon: "none"
      });
      this.hideNavigationOptions();
    },
    // 跳转到评论列表页
    goToComments() {
      const userId = common_vendor.index.getStorageSync("userInfo").id;
      common_vendor.index.__f__("log", "at pages/spots/detail.vue:331", "userId", userId);
      if (!userId) {
        common_vendor.index.navigateTo({
          url: "/pages/user/login"
        });
        return;
      }
      common_vendor.index.navigateTo({
        url: `/pages/spots/comments?id=${this.spotId}&userId=${userId}`
      });
    },
    // 预览图片
    previewImage(images, current) {
      common_vendor.index.previewImage({
        urls: images,
        current
      });
    },
    // 格式化日期
    formatDate(timestamp) {
      if (!timestamp)
        return "";
      const date = new Date(timestamp);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    },
    // 显示评论弹窗
    showCommentPopup() {
      if (!this.checkLogin())
        return;
      this.showComment = true;
    },
    // 隐藏评论弹窗
    hideCommentPopup() {
      this.showComment = false;
      this.rating = 0;
      this.commentContent = "";
      this.commentImages = [];
    },
    // 选择图片
    async chooseImage() {
      try {
        const res = await common_vendor.index.chooseImage({
          count: 9 - this.commentImages.length,
          sizeType: ["compressed"],
          sourceType: ["album", "camera"]
        });
        common_vendor.index.showLoading({
          title: "上传中..."
        });
        const uploadTasks = res.tempFilePaths.map((path) => {
          return common_vendor.er.uploadFile({
            filePath: path,
            cloudPath: `comment-images/${Date.now()}-${Math.random().toString(36).slice(-6)}.jpg`
          });
        });
        const uploadResults = await Promise.all(uploadTasks);
        this.commentImages.push(...uploadResults.map((item) => item.fileID));
        common_vendor.index.hideLoading();
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/spots/detail.vue:400", "选择图片失败:", e);
        common_vendor.index.showToast({
          title: "上传图片失败",
          icon: "none"
        });
      }
    },
    // 删除图片
    deleteImage(index) {
      this.commentImages.splice(index, 1);
    },
    // 提交评论
    async submitComment() {
      if (!this.canSubmitComment)
        return;
      try {
        const uid = common_vendor.index.getStorageSync("userInfo").id;
        const res = await common_vendor.er.callFunction({
          name: "add-comment",
          data: {
            uid,
            spotId: this.spotId,
            content: this.commentContent.trim(),
            rating: this.rating,
            images: this.commentImages
          }
        });
        if (res.result.code === 0) {
          common_vendor.index.showToast({
            title: "评论成功",
            icon: "success"
          });
          this.rating = 0;
          this.commentContent = "";
          this.commentImages = [];
          this.hideCommentPopup();
          this.getSpotDetail();
        } else {
          throw new Error(res.result.message);
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/spots/detail.vue:448", "提交评论失败:", e);
        common_vendor.index.showToast({
          title: e.message || "评论失败",
          icon: "none"
        });
      }
    },
    // 检查登录状态
    checkLogin() {
      const token = common_vendor.index.getStorageSync("token");
      if (!token) {
        common_vendor.index.navigateTo({
          url: "/pages/user/login"
        });
        return false;
      }
      return true;
    },
    // 打开地图
    openMap() {
      this.showNavigationOptions();
    },
    // 处理滑动条变化
    onSliderChange(e) {
      this.rating = parseFloat((e.detail.value / 10).toFixed(1));
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.f($data.spotDetail.images || [], (item, index, i0) => {
      return {
        a: item,
        b: index
      };
    }),
    b: common_vendor.t($data.spotDetail.name || ""),
    c: common_vendor.n($data.spotDetail.isFavorite ? "icon-heart-fill" : "icon-heart"),
    d: common_vendor.o((...args) => $options.toggleFavorite && $options.toggleFavorite(...args)),
    e: common_vendor.t($data.spotDetail.rating || 0),
    f: common_vendor.t($data.spotDetail.commentCount || 0),
    g: common_vendor.t(($data.spotDetail.price || 0) / 100),
    h: common_vendor.f($data.spotDetail.tags || [], (tag, index, i0) => {
      return {
        a: common_vendor.t(tag),
        b: index
      };
    }),
    i: common_vendor.t($data.spotDetail.address || ""),
    j: $data.spotDetail.distance
  }, $data.spotDetail.distance ? {
    k: common_vendor.t($data.spotDetail.distance)
  } : {}, {
    l: common_vendor.o((...args) => $options.showNavigationOptions && $options.showNavigationOptions(...args)),
    m: common_vendor.t($data.spotDetail.description || ""),
    n: common_vendor.t($data.spotDetail.openTime || ""),
    o: common_vendor.t($data.spotDetail.suggestedTime || ""),
    p: $data.spotDetail.comments && $data.spotDetail.comments.length > 0
  }, $data.spotDetail.comments && $data.spotDetail.comments.length > 0 ? {
    q: common_vendor.o((...args) => $options.goToComments && $options.goToComments(...args)),
    r: common_vendor.f($data.spotDetail.comments, (item, index, i0) => {
      return common_vendor.e({
        a: item.user.avatar,
        b: common_vendor.t(item.user.username),
        c: common_vendor.t(item.rating),
        d: common_vendor.t(item.content),
        e: item.images && item.images.length > 0
      }, item.images && item.images.length > 0 ? {
        f: common_vendor.f(item.images, (img, imgIndex, i1) => {
          return {
            a: imgIndex,
            b: img,
            c: common_vendor.o(($event) => $options.previewImage(item.images, imgIndex), imgIndex)
          };
        })
      } : {}, {
        g: common_vendor.t($options.formatDate(item.create_date)),
        h: index
      });
    })
  } : {}, {
    s: common_vendor.n($data.spotDetail.isFavorite ? "icon-heart-fill" : "icon-heart"),
    t: common_vendor.t($data.spotDetail.isFavorite ? "已收藏" : "收藏"),
    v: common_vendor.o((...args) => $options.toggleFavorite && $options.toggleFavorite(...args)),
    w: common_vendor.o((...args) => $options.openMap && $options.openMap(...args)),
    x: common_vendor.o((...args) => $options.showCommentPopup && $options.showCommentPopup(...args)),
    y: $data.showNavigation
  }, $data.showNavigation ? {
    z: common_vendor.f($data.navigationOptions, (item, index, i0) => {
      return {
        a: common_vendor.n(item.icon),
        b: common_vendor.t(item.name),
        c: index,
        d: common_vendor.o(($event) => $options.navigate(item), index)
      };
    }),
    A: common_vendor.o((...args) => $options.hideNavigationOptions && $options.hideNavigationOptions(...args)),
    B: common_vendor.o(() => {
    }),
    C: common_vendor.o((...args) => $options.hideNavigationOptions && $options.hideNavigationOptions(...args))
  } : {}, {
    D: $data.showComment
  }, $data.showComment ? common_vendor.e({
    E: common_vendor.o((...args) => $options.hideCommentPopup && $options.hideCommentPopup(...args)),
    F: $data.rating * 10,
    G: common_vendor.o((...args) => $options.onSliderChange && $options.onSliderChange(...args)),
    H: common_vendor.t($data.rating),
    I: $data.commentContent,
    J: common_vendor.o(($event) => $data.commentContent = $event.detail.value),
    K: common_vendor.t($data.commentContent.length),
    L: common_vendor.f($data.commentImages, (item, index, i0) => {
      return {
        a: item,
        b: common_vendor.o(($event) => $options.previewImage(index), index),
        c: common_vendor.o(($event) => $options.deleteImage(index), index),
        d: index
      };
    }),
    M: $data.commentImages.length < 9
  }, $data.commentImages.length < 9 ? {
    N: common_vendor.t($data.commentImages.length),
    O: common_vendor.o((...args) => $options.chooseImage && $options.chooseImage(...args))
  } : {}, {
    P: $options.canSubmitComment ? 1 : "",
    Q: !$options.canSubmitComment,
    R: common_vendor.o((...args) => $options.submitComment && $options.submitComment(...args)),
    S: common_vendor.o(() => {
    }),
    T: common_vendor.o((...args) => $options.hideCommentPopup && $options.hideCommentPopup(...args))
  }) : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/spots/detail.js.map
