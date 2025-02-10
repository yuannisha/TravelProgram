"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      spotId: "",
      // 景点ID
      userId: "",
      // 用户ID
      commentList: [],
      // 评论列表
      page: 1,
      // 当前页码
      pageSize: 10,
      // 每页数量
      loading: false,
      // 加载状态
      noMore: false,
      // 是否还有更多
      refreshing: false,
      // 刷新状态
      sortBy: "time"
      // 排序方式：time-时间，rating-评分
    };
  },
  onLoad(options) {
    if (options.id) {
      this.spotId = options.id;
      this.userId = options.userId;
      this.getComments();
    } else {
      common_vendor.index.showToast({
        title: "参数错误",
        icon: "none"
      });
      setTimeout(() => {
        common_vendor.index.navigateBack();
      }, 1500);
    }
  },
  methods: {
    // 获取评论列表
    async getComments() {
      if (this.loading || this.noMore && !this.refreshing)
        return;
      this.loading = true;
      try {
        common_vendor.index.__f__("log", "at pages/spots/comments.vue:106", "userId", this.userId);
        common_vendor.index.__f__("log", "at pages/spots/comments.vue:107", "spotId", this.spotId);
        const res = await common_vendor.er.callFunction({
          name: "get-comments",
          data: {
            userId: this.userId,
            spotId: this.spotId,
            page: this.page,
            pageSize: this.pageSize,
            sortBy: this.sortBy,
            sortOrder: this.sortBy === "time" ? "desc" : "desc"
          }
        });
        if (res.result.code === 0) {
          const { list, total } = res.result.data;
          if (this.refreshing) {
            this.commentList = list;
          } else {
            this.commentList = [...this.commentList, ...list];
          }
          this.noMore = this.commentList.length >= total;
        } else {
          common_vendor.index.showToast({
            title: res.result.message || "获取评论失败",
            icon: "none"
          });
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/spots/comments.vue:137", "获取评论失败:", e);
        common_vendor.index.showToast({
          title: "获取评论失败",
          icon: "none"
        });
      } finally {
        this.loading = false;
        if (this.refreshing) {
          this.refreshing = false;
        }
      }
    },
    // 加载更多
    loadMore() {
      if (!this.noMore) {
        this.page++;
        this.getComments();
      }
    },
    // 下拉刷新
    async onRefresh() {
      this.refreshing = true;
      this.page = 1;
      this.noMore = false;
      await this.getComments();
    },
    // 切换排序方式
    changeSortBy(type) {
      if (this.sortBy === type)
        return;
      this.sortBy = type;
      this.page = 1;
      this.commentList = [];
      this.noMore = false;
      this.getComments();
    },
    // 预览图片
    previewImage(images, current) {
      common_vendor.index.previewImage({
        urls: images,
        current: images[current]
      });
    },
    // 格式化日期
    formatDate(date) {
      const d = new Date(date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.sortBy === "time" ? 1 : "",
    b: common_vendor.o(($event) => $options.changeSortBy("time")),
    c: $data.sortBy === "rating" ? 1 : "",
    d: common_vendor.o(($event) => $options.changeSortBy("rating")),
    e: common_vendor.f($data.commentList, (item, index, i0) => {
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
    }),
    f: $data.loading
  }, $data.loading ? {} : {}, {
    g: $data.noMore
  }, $data.noMore ? {} : {}, {
    h: $data.commentList.length === 0 && !$data.loading
  }, $data.commentList.length === 0 && !$data.loading ? {} : {}, {
    i: common_vendor.o((...args) => $options.loadMore && $options.loadMore(...args)),
    j: $data.refreshing,
    k: common_vendor.o((...args) => $options.onRefresh && $options.onRefresh(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/spots/comments.js.map
