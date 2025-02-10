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
      recommendSpots: []
    };
  },
  onShow() {
    this.getBannerList();
    this.getRecommendSpots();
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
        common_vendor.index.__f__("log", "at pages/index/index.vue:99", "轮播图结果：", res);
        if (res.result.code === 0) {
          this.bannerList = res.result.data.list.map((item) => ({
            id: item._id,
            imageUrl: item.imageUrl
          }));
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:107", "获取轮播图失败:", e);
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
        common_vendor.index.__f__("log", "at pages/index/index.vue:123", "推荐景点结果：", res);
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
        common_vendor.index.__f__("error", "at pages/index/index.vue:134", "获取推荐景点失败:", e);
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
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
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
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
