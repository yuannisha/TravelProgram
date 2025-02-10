"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      favoriteList: [],
      page: 1,
      pageSize: 10,
      loading: false,
      noMore: false,
      isRefreshing: false
    };
  },
  onShow() {
    this.refresh();
  },
  methods: {
    // 获取收藏列表
    async getFavoriteList() {
      if (this.loading || this.noMore)
        return;
      this.loading = true;
      try {
        const uid = common_vendor.index.getStorageSync("userInfo");
        common_vendor.index.__f__("log", "at pages/user/favorites.vue:88", "uid", uid);
        const res = await common_vendor.er.callFunction({
          name: "get-favorites",
          data: {
            uid: uid.id,
            page: this.page,
            pageSize: this.pageSize
          }
        });
        common_vendor.index.__f__("log", "at pages/user/favorites.vue:97", "res", res);
        if (res.result.code === 0) {
          common_vendor.index.__f__("log", "at pages/user/favorites.vue:99", "获取收藏列表成功", res);
          const { list, total } = res.result.data;
          const promises = list.map(
            (item) => common_vendor.er.callFunction({
              name: "get-spot-withId",
              data: {
                id: item.spot_id
              }
            })
          );
          const spotResults = await Promise.all(promises);
          const favorites = spotResults.map((result) => {
            const spotData = result.result.data[0];
            return {
              id: spotData._id,
              name: spotData.name,
              imageUrl: spotData.imageUrl,
              rating: spotData.rating,
              price: spotData.price / 100,
              tags: spotData.tags || []
            };
          });
          common_vendor.index.__f__("log", "at pages/user/favorites.vue:124", "favorites", favorites);
          if (this.page === 1) {
            this.favoriteList = favorites;
            common_vendor.index.__f__("log", "at pages/user/favorites.vue:128", "this.favoriteList", this.favoriteList);
          } else {
            this.favoriteList = [...this.favoriteList, ...favorites];
            common_vendor.index.__f__("log", "at pages/user/favorites.vue:131", "this.favoriteList", this.favoriteList);
          }
          this.noMore = this.favoriteList.length >= total;
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/user/favorites.vue:137", "获取收藏列表失败:", e);
        common_vendor.index.showToast({
          title: "获取收藏列表失败",
          icon: "none"
        });
      }
      this.loading = false;
    },
    // 取消收藏
    async cancelFavorite(item, index) {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要取消收藏该景点吗？",
        success: async (res) => {
          if (res.confirm) {
            try {
              const uid = common_vendor.index.getStorageSync("userInfo");
              const res2 = await common_vendor.er.callFunction({
                name: "toggle-favorite",
                data: {
                  spotId: item.id,
                  uid: uid.id
                }
              });
              if (res2.result.code === 0) {
                this.favoriteList.splice(index, 1);
                common_vendor.index.showToast({
                  title: "已取消收藏",
                  icon: "none"
                });
              }
            } catch (e) {
              common_vendor.index.__f__("error", "at pages/user/favorites.vue:172", "取消收藏失败:", e);
              common_vendor.index.showToast({
                title: "操作失败",
                icon: "none"
              });
            }
          }
        }
      });
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
