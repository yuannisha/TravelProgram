"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      bannerList: [
        {
          id: 1,
          imageUrl: "/static/banner/banner1.jpg"
        },
        {
          id: 2,
          imageUrl: "/static/banner/banner2.jpg"
        },
        {
          id: 3,
          imageUrl: "/static/banner/banner3.jpg"
        }
      ],
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
      recommendSpots: [
        {
          id: 1,
          name: "西湖风景区",
          imageUrl: "/static/spots/spot1.jpg",
          rating: 4.9,
          price: 80
        },
        {
          id: 2,
          name: "故宫博物院",
          imageUrl: "/static/spots/spot2.jpg",
          rating: 4.8,
          price: 60
        },
        {
          id: 3,
          name: "黄山风景区",
          imageUrl: "/static/spots/spot3.jpg",
          rating: 4.7,
          price: 190
        }
      ]
    };
  },
  methods: {
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
      common_vendor.index.navigateTo({
        url: `/pages/spots/list?categoryId=${id}`
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
