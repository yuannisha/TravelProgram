"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      activeTab: "spot",
      // 当前激活的标签：spot或plan
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
    // 切换标签
    switchTab(tab) {
      if (this.activeTab !== tab) {
        this.activeTab = tab;
        this.refresh();
      }
    },
    // 获取收藏列表
    async getFavoriteList() {
      if (this.loading || this.noMore)
        return;
      this.loading = true;
      try {
        const uid = common_vendor.index.getStorageSync("userInfo");
        const res = await common_vendor.er.callFunction({
          name: "get-favorites",
          data: {
            uid: uid.id,
            page: this.page,
            pageSize: this.pageSize,
            type: this.activeTab
          }
        });
        if (res.result.code === 0) {
          const { list, total, deleted_count } = res.result.data;
          if (deleted_count > 0) {
            common_vendor.index.showToast({
              title: `${deleted_count}个${this.activeTab === "spot" ? "景点" : "旅行计划"}已被删除`,
              icon: "none",
              duration: 2e3
            });
          }
          if (this.page === 1) {
            this.favoriteList = list;
            common_vendor.index.__f__("log", "at pages/user/favorites.vue:224", "this.favoriteList", this.favoriteList);
          } else {
            this.favoriteList = [...this.favoriteList, ...list];
          }
          this.noMore = this.favoriteList.length >= total;
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/user/favorites.vue:232", "获取收藏列表失败:", e);
        common_vendor.index.showToast({
          title: "获取收藏列表失败",
          icon: "none"
        });
      }
      this.loading = false;
    },
    // 取消收藏
    async cancelFavorite(item, index) {
      const message = item.is_deleted ? `确定要移除该${this.activeTab === "spot" ? "景点" : "旅行计划"}吗？` : `确定要取消收藏该${this.activeTab === "spot" ? "景点" : "旅行计划"}吗？`;
      common_vendor.index.showModal({
        title: "提示",
        content: message,
        success: async (res) => {
          if (res.confirm) {
            try {
              const uid = common_vendor.index.getStorageSync("userInfo");
              const res2 = await common_vendor.er.callFunction({
                name: "toggle-favorite",
                data: {
                  type: this.activeTab,
                  ...this.activeTab === "spot" ? { spotId: item.spot_id } : { planId: item.plan_id },
                  uid: uid.id
                }
              });
              if (res2.result.code === 0) {
                this.favoriteList.splice(index, 1);
                common_vendor.index.showToast({
                  title: item.is_deleted ? "已移除" : "已取消收藏",
                  icon: "none"
                });
              }
            } catch (e) {
              common_vendor.index.__f__("error", "at pages/user/favorites.vue:275", "操作失败:", e);
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
            const path = this.activeTab === "spot" ? `/pages/spots/detail?id=${item.spot_id}` : `/pages/plans/plan-detail?id=${item.plan_id}`;
            common_vendor.index.setClipboardData({
              data: `https://example.com${path}`,
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
    // 跳转到详情页
    goToDetail(item) {
      if (item.is_deleted)
        return;
      const url = this.activeTab === "spot" ? `/pages/spots/detail?id=${item.spot_id}` : `/pages/plans/plan-detail?id=${item.plan_id}`;
      common_vendor.index.navigateTo({ url });
    },
    // 跳转到列表页
    goToList() {
      if (this.activeTab === "spot") {
        common_vendor.index.switchTab({
          url: "/pages/spots/spots"
        });
      } else {
        common_vendor.index.switchTab({
          url: "/pages/plans/public-plans"
        });
      }
    },
    // 格式化日期
    formatDate(timestamp) {
      const date = new Date(timestamp);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    },
    // 获取状态文本
    getStatusText(status) {
      const statusMap = {
        0: "计划中",
        1: "进行中",
        2: "已完成"
      };
      return statusMap[status] || "未知";
    },
    // 获取状态样式类
    getStatusClass(status) {
      const statusMap = {
        0: "status-planned",
        1: "status-ongoing",
        2: "status-completed"
      };
      return statusMap[status] || "";
    },
    // 获取持续时间
    getDuration(startDate, endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1e3 * 60 * 60 * 24));
      return diffDays;
    }
  }
};
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.activeTab === "spot" ? 1 : "",
    b: common_vendor.o(($event) => $options.switchTab("spot")),
    c: $data.activeTab === "plan" ? 1 : "",
    d: common_vendor.o(($event) => $options.switchTab("plan")),
    e: $data.favoriteList.length === 0
  }, $data.favoriteList.length === 0 ? {
    f: common_assets._imports_0$2,
    g: common_vendor.t($data.activeTab === "spot" ? "收藏的景点" : "收藏的旅行计划"),
    h: common_vendor.t($data.activeTab === "spot" ? "去发现景点" : "去发现旅行计划"),
    i: common_vendor.o((...args) => $options.goToList && $options.goToList(...args))
  } : common_vendor.e({
    j: $data.activeTab === "spot"
  }, $data.activeTab === "spot" ? {
    k: common_vendor.f($data.favoriteList, (item, index, i0) => {
      return common_vendor.e({
        a: item.is_deleted
      }, item.is_deleted ? {
        b: "dea029d8-0-" + i0,
        c: common_vendor.p({
          type: "info",
          size: "20",
          color: "#999"
        }),
        d: common_vendor.o(($event) => $options.cancelFavorite(item, index), index)
      } : common_vendor.e({
        e: item.detail.imageUrl,
        f: common_vendor.t(item.detail.name),
        g: "dea029d8-1-" + i0,
        h: common_vendor.p({
          type: "star-filled",
          size: "14",
          color: "#ff9500"
        }),
        i: common_vendor.t(item.detail.rating),
        j: item.detail.address
      }, item.detail.address ? {
        k: "dea029d8-2-" + i0,
        l: common_vendor.p({
          type: "location",
          size: "14",
          color: "#666"
        }),
        m: common_vendor.t(item.detail.address)
      } : {}, {
        n: item.detail.tags && item.detail.tags.length > 0
      }, item.detail.tags && item.detail.tags.length > 0 ? {
        o: common_vendor.f(item.detail.tags, (tag, tagIndex, i1) => {
          return {
            a: common_vendor.t(tag),
            b: tagIndex
          };
        })
      } : {}, {
        p: common_vendor.t(item.detail.price / 100),
        q: common_vendor.t($options.formatDate(item.create_date)),
        r: common_vendor.o(($event) => $options.goToDetail(item), index)
      }), {
        s: "dea029d8-3-" + i0,
        t: common_vendor.o(($event) => $options.cancelFavorite(item, index), index),
        v: "dea029d8-4-" + i0,
        w: common_vendor.o(($event) => $options.share(item), index),
        x: index
      });
    }),
    l: common_vendor.p({
      type: "trash",
      size: "16",
      color: "#666"
    }),
    m: common_vendor.p({
      type: "redo",
      size: "16",
      color: "#666"
    })
  } : {
    n: common_vendor.f($data.favoriteList, (item, index, i0) => {
      var _a, _b;
      return common_vendor.e({
        a: item.is_deleted
      }, item.is_deleted ? {
        b: "dea029d8-5-" + i0,
        c: common_vendor.p({
          type: "info",
          size: "20",
          color: "#999"
        }),
        d: common_vendor.o(($event) => $options.cancelFavorite(item, index), index)
      } : common_vendor.e({
        e: ((_a = item.detail.user_info) == null ? void 0 : _a.avatar) || "/static/default-avatar.png",
        f: common_vendor.t(((_b = item.detail.user_info) == null ? void 0 : _b.username) || "用户"),
        g: common_vendor.t($options.formatDate(item.create_date)),
        h: common_vendor.t(item.detail.title),
        i: common_vendor.t($options.getStatusText(item.detail.status)),
        j: common_vendor.n($options.getStatusClass(item.detail.status)),
        k: "dea029d8-6-" + i0,
        l: common_vendor.p({
          type: "calendar",
          size: "16",
          color: "#666"
        }),
        m: common_vendor.t($options.formatDate(item.detail.start_date)),
        n: common_vendor.t($options.formatDate(item.detail.end_date)),
        o: item.detail.description
      }, item.detail.description ? {
        p: common_vendor.t(item.detail.description)
      } : {}, {
        q: item.detail.spots && item.detail.spots.length > 0
      }, item.detail.spots && item.detail.spots.length > 0 ? {
        r: "dea029d8-7-" + i0,
        s: common_vendor.p({
          type: "location",
          size: "16",
          color: "#666"
        }),
        t: common_vendor.t(item.detail.spots.length),
        v: common_vendor.t($options.getDuration(item.detail.start_date, item.detail.end_date))
      } : {}, {
        w: common_vendor.o(($event) => $options.goToDetail(item), index)
      }), {
        x: "dea029d8-8-" + i0,
        y: common_vendor.o(($event) => $options.cancelFavorite(item, index), index),
        z: "dea029d8-9-" + i0,
        A: common_vendor.o(($event) => $options.share(item), index),
        B: index
      });
    }),
    o: common_vendor.p({
      type: "trash",
      size: "16",
      color: "#666"
    }),
    p: common_vendor.p({
      type: "redo",
      size: "16",
      color: "#666"
    })
  }, {
    q: $data.loading
  }, $data.loading ? {} : {}, {
    r: $data.noMore
  }, $data.noMore ? {} : {}, {
    s: common_vendor.o((...args) => $options.loadMore && $options.loadMore(...args)),
    t: $data.isRefreshing,
    v: common_vendor.o((...args) => $options.refresh && $options.refresh(...args))
  }));
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/user/favorites.js.map
