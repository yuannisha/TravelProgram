"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      bannerList: [],
      categories: [
        {
          id: 1,
          name: "自然风光",
          icon: "/static/icons/nature.png"
        },
        {
          id: 2,
          name: "人文古迹",
          icon: "/static/icons/culture.png"
        },
        {
          id: 3,
          name: "特色美食",
          icon: "/static/icons/food.png"
        },
        {
          id: 4,
          name: "主题乐园",
          icon: "/static/icons/park.png"
        }
      ],
      recommendSpots: [],
      publicPlans: [],
      loading: false
    };
  },
  onShow() {
    this.getBannerList();
    this.getRecommendSpots();
    this.getPublicPlans();
    const app = getApp();
    app.globalData.checkLoginStatus(true);
  },
  onLoad() {
    const app = getApp();
    app.globalData.checkLoginStatus(true);
  },
  methods: {
    // 获取轮播图数据
    async getBannerList() {
      try {
        const res = await common_vendor.er.callFunction({
          name: "get-spots",
          data: {
            page: 1,
            pageSize: 3,
            sortBy: "rating",
            sortOrder: "desc"
          }
        });
        common_vendor.index.__f__("log", "at pages/index/index.vue:162", "轮播图结果：", res);
        if (res.result.code === 0) {
          this.bannerList = res.result.data.list.map((item) => ({
            id: item._id,
            imageUrl: item.imageUrl
          }));
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:170", "获取轮播图失败:", e);
      }
    },
    // 获取推荐景点
    async getRecommendSpots() {
      try {
        const res = await common_vendor.er.callFunction({
          name: "get-spots",
          data: {
            page: 1,
            pageSize: 6,
            sortBy: "commentCount",
            sortOrder: "desc"
          }
        });
        common_vendor.index.__f__("log", "at pages/index/index.vue:186", "推荐景点结果：", res);
        if (res.result.code === 0) {
          this.recommendSpots = res.result.data.list.map((item) => ({
            id: item._id,
            name: item.name,
            imageUrl: item.imageUrl,
            rating: item.rating,
            price: item.price / 100
            // 转换为元
          }));
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:197", "获取推荐景点失败:", e);
      }
    },
    // 跳转到搜索页
    goToSearch() {
      common_vendor.index.navigateTo({
        url: "/pages/spots/search"
      });
    },
    goToSpotDetail(id) {
      common_vendor.index.navigateTo({
        url: `/pages/spots/detail?id=${id}`
      });
    },
    goToCategory(id) {
      common_vendor.index.switchTab({
        url: "/pages/spots/spots"
      });
    },
    goToSpots() {
      common_vendor.index.switchTab({
        url: "/pages/spots/spots"
      });
    },
    /**
     * 获取公开旅行计划
     */
    async getPublicPlans() {
      this.loading = true;
      common_vendor.index.__f__("log", "at pages/index/index.vue:230", "获取公开旅行计划", getApp().globalData.getUserId());
      try {
        const res = await common_vendor.er.callFunction({
          name: "manage-plans",
          data: {
            action: "public",
            page: 1,
            pageSize: 5,
            user_id: getApp().globalData.getUserId() || ""
          }
        });
        if (res.result.code === 0) {
          this.publicPlans = res.result.data.list;
          common_vendor.index.__f__("log", "at pages/index/index.vue:244", "公开旅行计划结果：", this.publicPlans);
        } else {
          common_vendor.index.__f__("error", "at pages/index/index.vue:246", "获取公开旅行计划失败:", res.result.message);
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:249", "获取公开旅行计划失败:", e);
      } finally {
        this.loading = false;
      }
    },
    /**
     * 跳转到公开旅行计划页面
     */
    goToPublicPlans() {
      common_vendor.index.switchTab({
        url: "/pages/plans/public-plans"
      });
    },
    /**
     * 跳转到计划详情页面
     * @param {String} id 计划ID
     */
    goToPlanDetail(id, user_info) {
      common_vendor.index.__f__("log", "at pages/index/index.vue:269", "user_info", user_info);
      common_vendor.index.__f__("log", "at pages/index/index.vue:270", "getApp().globalData.getUserId()", getApp().globalData.getUserId());
      common_vendor.index.__f__("log", "at pages/index/index.vue:271", "user_info._id === getApp().globalData.getUserId()", user_info._id === getApp().globalData.getUserId());
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
     * 跳转到创建计划页面
     */
    goToCreatePlan() {
      const token = common_vendor.index.getStorageSync("token");
      if (!token) {
        common_vendor.index.navigateTo({
          url: "/pages/user/login"
        });
        return;
      }
      common_vendor.index.navigateTo({
        url: "/pages/plans/plan-edit"
      });
    },
    /**
     * 获取状态文本
     * @param {Number} status 状态值
     * @return {String} 状态文本
     */
    getStatusText(status) {
      const statusMap = {
        0: "计划中",
        1: "进行中",
        2: "已完成"
      };
      return statusMap[status] || "未知";
    },
    /**
     * 格式化日期
     * @param {Number|String} timestamp 时间戳
     * @return {String} 格式化后的日期
     */
    formatDate(timestamp) {
      if (!timestamp)
        return "";
      const date = new Date(timestamp);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    }
  }
};
if (!Array) {
  const _component_uni_load_more = common_vendor.resolveComponent("uni-load-more");
  _component_uni_load_more();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.goToSearch && $options.goToSearch(...args)),
    b: common_vendor.f($data.bannerList, (item, index, i0) => {
      return {
        a: item.imageUrl,
        b: index,
        c: common_vendor.o(($event) => $options.goToSpotDetail(item.id), index)
      };
    }),
    c: common_vendor.f($data.categories, (item, index, i0) => {
      return {
        a: item.icon,
        b: common_vendor.t(item.name),
        c: index,
        d: common_vendor.o(($event) => $options.goToCategory(item.id), index)
      };
    }),
    d: common_vendor.o((...args) => $options.goToSpots && $options.goToSpots(...args)),
    e: common_vendor.f($data.recommendSpots, (item, index, i0) => {
      return {
        a: item.imageUrl,
        b: common_vendor.t(item.name),
        c: common_vendor.t(item.rating),
        d: common_vendor.t(item.price),
        e: index,
        f: common_vendor.o(($event) => $options.goToSpotDetail(item.id), index)
      };
    }),
    f: common_vendor.o((...args) => $options.goToPublicPlans && $options.goToPublicPlans(...args)),
    g: $data.loading
  }, $data.loading ? {
    h: common_vendor.p({
      status: "loading"
    })
  } : $data.publicPlans.length > 0 ? {
    j: common_vendor.f($data.publicPlans, (item, index, i0) => {
      return {
        a: item.user_info.avatar ? item.user_info.avatar : "/static/avatar/default.png",
        b: common_vendor.t(item.user_info.username || "用户"),
        c: common_vendor.t($options.getStatusText(item.status)),
        d: common_vendor.n("status-" + item.status),
        e: common_vendor.t(item.title),
        f: common_vendor.t($options.formatDate(item.start_date)),
        g: common_vendor.t($options.formatDate(item.end_date)),
        h: common_vendor.t(item.spots ? item.spots.length : 0),
        i: index,
        j: common_vendor.o(($event) => $options.goToPlanDetail(item._id, item.user_info), index)
      };
    })
  } : {
    k: common_vendor.o((...args) => $options.goToCreatePlan && $options.goToCreatePlan(...args))
  }, {
    i: $data.publicPlans.length > 0
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
