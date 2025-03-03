"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      list: [],
      loading: true,
      refreshing: false,
      page: 1,
      pageSize: 10,
      total: 0,
      loadMoreStatus: "more",
      keyword: "",
      isSearching: false,
      loadingText: {
        contentdown: "上拉加载更多",
        contentrefresh: "加载中...",
        contentnomore: "没有更多了"
      },
      statusText: {
        0: "计划中",
        1: "进行中",
        2: "已完成"
      },
      userInfo: common_vendor.index.getStorageSync("userInfo")
    };
  },
  onShow() {
    const app = getApp();
    app.globalData.checkLoginStatus(true);
    this.getPublicPlans();
  },
  onLoad() {
    const app = getApp();
    app.globalData.checkLoginStatus(true);
    this.getPublicPlans();
  },
  methods: {
    /**
     * 获取公开旅行计划列表
     */
    async getPublicPlans() {
      try {
        this.loading = true;
        const app = getApp();
        const userId = app.globalData.getUserId();
        const res = await common_vendor.er.callFunction({
          name: "manage-plans",
          data: {
            action: "public",
            // 修正参数名称
            page: this.page,
            pageSize: this.pageSize,
            keyword: this.keyword,
            user_id: userId
          }
        });
        if (res.result.code === 0) {
          const { list, total } = res.result.data;
          if (this.page === 1) {
            this.list = list;
          } else {
            this.list = [...this.list, ...list];
          }
          this.total = total;
          if (this.list.length >= total) {
            this.loadMoreStatus = "noMore";
          } else {
            this.loadMoreStatus = "more";
          }
        } else {
          common_vendor.index.showToast({
            title: res.result.message || "获取失败",
            icon: "none"
          });
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/plans/public-plans.vue:197", "获取公开旅行计划失败", e);
        common_vendor.index.showToast({
          title: "获取失败，请稍后重试",
          icon: "none"
        });
      } finally {
        this.loading = false;
        this.refreshing = false;
      }
    },
    /**
     * 加载更多
     */
    loadMore() {
      if (this.loadMoreStatus !== "more" || this.loading)
        return;
      this.page++;
      this.loadMoreStatus = "loading";
      this.getPublicPlans();
    },
    /**
     * 下拉刷新
     */
    onRefresh() {
      this.refreshing = true;
      this.page = 1;
      this.getPublicPlans();
    },
    /**
     * 搜索
     */
    onSearch() {
      if (!this.keyword.trim()) {
        if (this.isSearching) {
          this.resetSearch();
        }
        return;
      }
      this.isSearching = true;
      this.page = 1;
      this.getPublicPlans();
    },
    /**
     * 清除关键词
     */
    clearKeyword() {
      this.keyword = "";
      if (this.isSearching) {
        this.resetSearch();
      }
    },
    /**
     * 重置搜索
     */
    resetSearch() {
      this.keyword = "";
      this.isSearching = false;
      this.page = 1;
      this.getPublicPlans();
    },
    /**
     * 查看计划详情
     * @param {String} id 计划ID
     */
    viewDetail(id, user_info) {
      if (user_info._id === getApp().globalData.getUserId()) {
        common_vendor.index.navigateTo({
          url: `/pages/plans/plan-detail?id=${id}`
        });
      } else {
        common_vendor.index.navigateTo({
          url: `/pages/plans/plan-detail?id=${id}&mode=view`
        });
      }
    },
    /**
     * 跳转到创建页面
     */
    goToCreate() {
      common_vendor.index.navigateTo({
        url: "/pages/plans/plan-edit"
      });
    },
    /**
     * 格式化日期
     * @param {String|Number} timestamp 时间戳
     * @returns {String} 格式化后的日期
     */
    formatDate(timestamp) {
      if (!timestamp)
        return "";
      const date = new Date(timestamp);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      return `${year}-${month}-${day}`;
    },
    /**
     * 格式化时间为多久前
     * @param {String|Number} timestamp 时间戳
     * @returns {String} 多久前
     */
    formatTimeAgo(timestamp) {
      if (!timestamp)
        return "";
      const now = /* @__PURE__ */ new Date();
      const date = new Date(timestamp);
      const diff = Math.floor((now - date) / 1e3);
      if (diff < 60) {
        return "刚刚";
      } else if (diff < 3600) {
        return Math.floor(diff / 60) + "分钟前";
      } else if (diff < 86400) {
        return Math.floor(diff / 3600) + "小时前";
      } else if (diff < 2592e3) {
        return Math.floor(diff / 86400) + "天前";
      } else if (diff < 31536e3) {
        return Math.floor(diff / 2592e3) + "个月前";
      } else {
        return Math.floor(diff / 31536e3) + "年前";
      }
    }
  }
};
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _component_uni_load_more = common_vendor.resolveComponent("uni-load-more");
  (_easycom_uni_icons2 + _component_uni_load_more)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.p({
      type: "search",
      size: "18",
      color: "#999"
    }),
    b: common_vendor.o((...args) => $options.onSearch && $options.onSearch(...args)),
    c: $data.keyword,
    d: common_vendor.o(($event) => $data.keyword = $event.detail.value),
    e: $data.keyword
  }, $data.keyword ? {
    f: common_vendor.o($options.clearKeyword),
    g: common_vendor.p({
      type: "clear",
      size: "18",
      color: "#999"
    })
  } : {}, {
    h: common_vendor.o((...args) => $options.onSearch && $options.onSearch(...args)),
    i: $data.loading && !$data.list.length
  }, $data.loading && !$data.list.length ? {
    j: common_vendor.p({
      status: "loading",
      ["content-text"]: $data.loadingText
    })
  } : !$data.loading && !$data.list.length && !$data.isSearching ? {
    l: common_assets._imports_0$4,
    m: common_vendor.o((...args) => $options.goToCreate && $options.goToCreate(...args))
  } : !$data.loading && !$data.list.length && $data.isSearching ? {
    o: common_assets._imports_1$1,
    p: common_vendor.o((...args) => $options.resetSearch && $options.resetSearch(...args))
  } : {
    q: common_vendor.f($data.list, (item, index, i0) => {
      return common_vendor.e({
        a: item.user_info.avatar || "/static/default-avatar.png",
        b: common_vendor.t(item.user_info.nickname || item.user_info.username || "用户"),
        c: common_vendor.t($data.statusText[item.status]),
        d: common_vendor.n("status-" + item.status),
        e: common_vendor.t(item.title),
        f: common_vendor.t($options.formatDate(item.start_date)),
        g: common_vendor.t($options.formatDate(item.end_date)),
        h: item.description
      }, item.description ? {
        i: common_vendor.t(item.description)
      } : {}, {
        j: item.spots && item.spots.length
      }, item.spots && item.spots.length ? {
        k: common_vendor.t(item.spots.length)
      } : {}, {
        l: common_vendor.t($options.formatTimeAgo(item.create_date)),
        m: item.is_public && item.user_info._id !== $data.userInfo.id
      }, item.is_public && item.user_info._id !== $data.userInfo.id ? {
        n: "2afebb0c-3-" + i0,
        o: common_vendor.p({
          type: "heart",
          size: "18",
          color: "#999"
        })
      } : {}, {
        p: item.is_public && item.user_info._id !== $data.userInfo.id
      }, item.is_public && item.user_info._id !== $data.userInfo.id ? {
        q: "2afebb0c-4-" + i0,
        r: common_vendor.p({
          type: "redo",
          size: "18",
          color: "#999"
        })
      } : {}, {
        s: item._id,
        t: common_vendor.o(($event) => $options.viewDetail(item._id, item.user_info), item._id)
      });
    })
  }, {
    k: !$data.loading && !$data.list.length && !$data.isSearching,
    n: !$data.loading && !$data.list.length && $data.isSearching,
    r: $data.list.length > 0
  }, $data.list.length > 0 ? {
    s: common_vendor.p({
      status: $data.loadMoreStatus,
      ["content-text"]: $data.loadingText
    })
  } : {}, {
    t: common_vendor.o((...args) => $options.loadMore && $options.loadMore(...args)),
    v: $data.refreshing,
    w: common_vendor.o((...args) => $options.onRefresh && $options.onRefresh(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/plans/public-plans.js.map
