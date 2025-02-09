"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      favoriteList: [
        {
          id: 1,
          name: "西湖风景区",
          imageUrl: "/static/spots/spot1.jpg",
          rating: 4.9,
          price: 80,
          tags: ["5A景区", "湖泊", "游船"],
          favoriteTime: "2024-02-08"
        },
        {
          id: 2,
          name: "故宫博物院",
          imageUrl: "/static/spots/spot2.jpg",
          rating: 4.8,
          price: 60,
          tags: ["5A景区", "古建筑", "文物"],
          favoriteTime: "2024-02-07"
        }
      ],
      page: 1,
      loading: false,
      noMore: false,
      isRefreshing: false
    };
  },
  onLoad() {
    this.getFavoriteList();
  },
  methods: {
    // 获取收藏列表
    async getFavoriteList() {
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
      this.noMore = false;
      await this.getFavoriteList();
      this.isRefreshing = false;
    },
    // 加载更多
    loadMore() {
      if (!this.noMore) {
        this.page++;
        this.getFavoriteList();
      }
    },
    // 取消收藏
    cancelFavorite(item, index) {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要取消收藏该景点吗？",
        success: (res) => {
          if (res.confirm) {
            this.favoriteList.splice(index, 1);
            common_vendor.index.showToast({
              title: "已取消收藏",
              icon: "none"
            });
          }
        }
      });
    },
    // 分享
    share(item) {
      common_vendor.index.showActionSheet({
        itemList: ["分享到微信", "复制链接"],
        success: (res) => {
          if (res.tapIndex === 0)
            ;
          else {
            common_vendor.index.setClipboardData({
              data: `https://example.com/spots/${item.id}`,
              success: () => {
                common_vendor.index.showToast({
                  title: "链接已复制",
                  icon: "none"
                });
              }
            });
          }
        }
      });
    },
    // 跳转到景点详情
    goToSpotDetail(id) {
      common_vendor.index.navigateTo({
        url: `/pages/spots/detail?id=${id}`
      });
    },
    // 跳转到景点列表
    goToSpots() {
      common_vendor.index.switchTab({
        url: "/pages/spots/spots"
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.favoriteList.length === 0
  }, $data.favoriteList.length === 0 ? {
    b: common_assets._imports_0$2,
    c: common_vendor.o((...args) => $options.goToSpots && $options.goToSpots(...args))
  } : common_vendor.e({
    d: common_vendor.f($data.favoriteList, (item, index, i0) => {
      return {
        a: item.imageUrl,
        b: common_vendor.t(item.name),
        c: common_vendor.t(item.favoriteTime),
        d: common_vendor.t(item.rating),
        e: common_vendor.t(item.price),
        f: common_vendor.f(item.tags, (tag, tagIndex, i1) => {
          return {
            a: common_vendor.t(tag),
            b: tagIndex
          };
        }),
        g: common_vendor.o(($event) => $options.goToSpotDetail(item.id), index),
        h: common_vendor.o(($event) => $options.cancelFavorite(item, index), index),
        i: common_vendor.o(($event) => $options.share(item), index),
        j: index
      };
    }),
    e: $data.loading
  }, $data.loading ? {} : {}, {
    f: $data.noMore
  }, $data.noMore ? {} : {}, {
    g: common_vendor.o((...args) => $options.loadMore && $options.loadMore(...args)),
    h: $data.isRefreshing,
    i: common_vendor.o((...args) => $options.refresh && $options.refresh(...args))
  }));
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/user/favorites.js.map
