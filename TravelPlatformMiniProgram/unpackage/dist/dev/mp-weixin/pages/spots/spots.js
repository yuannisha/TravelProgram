"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      categories: [
        { id: 0, name: "全部" },
        { id: 1, name: "自然风光" },
        { id: 2, name: "人文古迹" },
        { id: 3, name: "特色美食" },
        { id: 4, name: "主题乐园" }
      ],
      currentCategory: 0,
      spotList: [
        {
          id: 1,
          name: "西湖风景区",
          imageUrl: "/static/spots/spot1.jpg",
          distance: 2.5,
          tags: ["5A景区", "湖泊", "游船"],
          rating: 4.9,
          commentCount: 12580,
          price: 80
        },
        {
          id: 2,
          name: "故宫博物院",
          imageUrl: "/static/spots/spot2.jpg",
          distance: 5.1,
          tags: ["5A景区", "古建筑", "文物"],
          rating: 4.8,
          commentCount: 25890,
          price: 60
        },
        {
          id: 3,
          name: "黄山风景区",
          imageUrl: "/static/spots/spot3.jpg",
          distance: 8.2,
          tags: ["5A景区", "山岳", "云海"],
          rating: 4.7,
          commentCount: 8956,
          price: 190
        }
      ],
      page: 1,
      loading: false,
      noMore: false,
      isRefreshing: false
    };
  },
  onLoad() {
    this.getSpotList();
  },
  methods: {
    // 切换分类
    changeCategory(id) {
      if (this.currentCategory === id)
        return;
      this.currentCategory = id;
      this.page = 1;
      this.spotList = [];
      this.noMore = false;
      this.getSpotList();
    },
    // 获取景点列表
    async getSpotList() {
      if (this.loading || this.noMore)
        return;
      this.loading = true;
      await new Promise((resolve) => setTimeout(resolve, 1e3));
      this.loading = false;
      if (this.page > 2) {
        this.noMore = true;
      }
    },
    // 下拉刷新
    async refresh() {
      this.isRefreshing = true;
      this.page = 1;
      this.spotList = [];
      this.noMore = false;
      await this.getSpotList();
      this.isRefreshing = false;
    },
    // 加载更多
    loadMore() {
      if (!this.noMore) {
        this.page++;
        this.getSpotList();
      }
    },
    // 跳转到搜索页
    goToSearch() {
      common_vendor.index.navigateTo({
        url: "/pages/spots/search"
      });
    },
    // 跳转到详情页
    goToDetail(id) {
      common_vendor.index.navigateTo({
        url: `/pages/spots/detail?id=${id}`
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.goToSearch && $options.goToSearch(...args)),
    b: common_vendor.f($data.categories, (item, index, i0) => {
      return {
        a: common_vendor.t(item.name),
        b: $data.currentCategory === item.id ? 1 : "",
        c: index,
        d: common_vendor.o(($event) => $options.changeCategory(item.id), index)
      };
    }),
    c: common_vendor.f($data.spotList, (item, index, i0) => {
      return common_vendor.e({
        a: item.imageUrl,
        b: common_vendor.t(item.name),
        c: item.distance
      }, item.distance ? {
        d: common_vendor.t(item.distance)
      } : {}, {
        e: common_vendor.f(item.tags, (tag, tagIndex, i1) => {
          return {
            a: common_vendor.t(tag),
            b: tagIndex
          };
        }),
        f: common_vendor.t(item.rating),
        g: common_vendor.t(item.commentCount),
        h: common_vendor.t(item.price),
        i: index,
        j: common_vendor.o(($event) => $options.goToDetail(item.id), index)
      });
    }),
    d: $data.loading
  }, $data.loading ? {} : {}, {
    e: $data.noMore
  }, $data.noMore ? {} : {}, {
    f: common_vendor.o((...args) => $options.loadMore && $options.loadMore(...args)),
    g: $data.isRefreshing,
    h: common_vendor.o((...args) => $options.refresh && $options.refresh(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/spots/spots.js.map
