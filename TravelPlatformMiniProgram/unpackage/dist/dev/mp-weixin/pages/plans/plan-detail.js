"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      planId: "",
      planData: {},
      loading: true,
      viewMode: false,
      isFavorite: false
    };
  },
  onLoad(options) {
    const app = getApp();
    app.globalData.checkLoginStatus(true);
    common_vendor.index.__f__("log", "at pages/plans/plan-detail.vue:149", "options", options);
    if (options.id) {
      this.planId = options.id;
      if (options.mode === "view") {
        this.viewMode = true;
      }
      this.getPlanDetail();
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
    /**
     * 获取计划详情
     */
    async getPlanDetail() {
      this.loading = true;
      try {
        const app = getApp();
        const userId = app.globalData.getUserId();
        const res = await common_vendor.er.callFunction({
          name: "manage-plans",
          data: {
            action: "get",
            plan_id: this.planId,
            user_id: userId
          }
        });
        if (res.result.code === 0) {
          this.planData = res.result.data;
          if (this.viewMode) {
            this.checkFavorite();
          }
        } else {
          common_vendor.index.showToast({
            title: res.result.message || "获取计划详情失败",
            icon: "none"
          });
          setTimeout(() => {
            common_vendor.index.navigateBack();
          }, 1500);
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/plans/plan-detail.vue:204", "获取计划详情失败", e);
        common_vendor.index.showToast({
          title: "获取计划详情失败，请稍后重试",
          icon: "none"
        });
        setTimeout(() => {
          common_vendor.index.navigateBack();
        }, 1500);
      } finally {
        this.loading = false;
      }
    },
    /**
     * 检查是否已收藏
     */
    async checkFavorite() {
      const userInfo = common_vendor.index.getStorageSync("userInfo");
      if (!userInfo)
        return;
      try {
        const res = await common_vendor.er.callFunction({
          name: "get-favorite-status",
          data: {
            uid: userInfo.id,
            type: "plan",
            planId: this.planId
          }
        });
        if (res.result.code === 0) {
          this.isFavorite = res.result.data.isFavorite;
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/plans/plan-detail.vue:239", "检查收藏状态失败", e);
      }
    },
    /**
     * 切换收藏状态
     */
    async toggleFavorite() {
      const userInfo = common_vendor.index.getStorageSync("userInfo");
      if (!userInfo) {
        common_vendor.index.navigateTo({
          url: "/pages/user/login"
        });
        return;
      }
      try {
        common_vendor.index.showLoading({
          title: "处理中..."
        });
        const res = await common_vendor.er.callFunction({
          name: "toggle-favorite",
          data: {
            uid: userInfo.id,
            type: "plan",
            planId: this.planId
          }
        });
        if (res.result.code === 0) {
          this.isFavorite = res.result.data.isFavorite;
          common_vendor.index.showToast({
            title: this.isFavorite ? "收藏成功" : "已取消收藏",
            icon: "none"
          });
        } else {
          common_vendor.index.showToast({
            title: res.result.message || "操作失败",
            icon: "none"
          });
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/plans/plan-detail.vue:284", "收藏操作失败", e);
        common_vendor.index.showToast({
          title: "操作失败，请稍后重试",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    },
    /**
     * 跳转到编辑页面
     */
    navigateToEdit() {
      common_vendor.index.navigateTo({
        url: `/pages/plans/plan-edit?id=${this.planId}`
      });
    },
    /**
     * 分享计划
     */
    sharePlan() {
      if (!this.planData.is_public) {
        common_vendor.index.showModal({
          title: "分享提示",
          content: "当前计划为私有状态，需要设为公开才能分享给他人查看，是否设为公开？",
          confirmText: "设为公开",
          success: async (res) => {
            if (res.confirm) {
              await this.setPublic(true);
              if (this.planData.is_public) {
                this.showShareOptions();
              }
            }
          }
        });
        return;
      }
      this.showShareOptions();
    },
    /**
     * 显示分享选项
     */
    showShareOptions() {
      common_vendor.index.showActionSheet({
        itemList: ["分享到微信", "复制链接"],
        success: (res) => {
          var _a, _b, _c;
          if (res.tapIndex === 0) {
            common_vendor.index.share({
              provider: "weixin",
              scene: "WXSceneSession",
              type: 0,
              title: this.planData.title,
              summary: this.planData.description || "快来看看我的旅行计划吧",
              imageUrl: ((_c = (_b = (_a = this.planData.spots) == null ? void 0 : _a[0]) == null ? void 0 : _b.spot_detail) == null ? void 0 : _c.imageUrl) || "/static/logo.png",
              href: `https://example.com/pages/plans/plan-detail?id=${this.planId}&mode=view`,
              success: function(res2) {
                common_vendor.index.__f__("log", "at pages/plans/plan-detail.vue:346", "分享成功", res2);
              },
              fail: function(err) {
                common_vendor.index.__f__("log", "at pages/plans/plan-detail.vue:349", "分享失败", err);
                common_vendor.index.showToast({
                  title: "分享失败",
                  icon: "none"
                });
              }
            });
          } else {
            const path = `/pages/plans/plan-detail?id=${this.planId}&mode=view`;
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
    /**
     * 设置计划公开状态
     * @param {Boolean} isPublic 是否公开
     */
    async setPublic(isPublic) {
      common_vendor.index.showLoading({
        title: "设置中..."
      });
      try {
        const app = getApp();
        const userId = app.globalData.getUserId();
        const res = await common_vendor.er.callFunction({
          name: "manage-plans",
          data: {
            action: "update",
            plan_id: this.planId,
            plan: {
              is_public: isPublic
            },
            user_id: userId
          }
        });
        if (res.result.code === 0) {
          this.planData.is_public = isPublic;
          common_vendor.index.showToast({
            title: isPublic ? "已设为公开" : "已设为私有"
          });
        } else {
          common_vendor.index.showToast({
            title: res.result.message || "设置失败",
            icon: "none"
          });
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/plans/plan-detail.vue:410", "设置公开状态失败", e);
        common_vendor.index.showToast({
          title: "设置失败，请稍后重试",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    },
    /**
     * 确认删除计划
     */
    confirmDelete() {
      common_vendor.index.showModal({
        title: "确认删除",
        content: "确定要删除这个旅行计划吗？",
        confirmColor: "#FF3B30",
        success: async (res) => {
          if (res.confirm) {
            this.deletePlan();
          }
        }
      });
    },
    /**
     * 删除计划
     */
    async deletePlan() {
      common_vendor.index.showLoading({
        title: "删除中..."
      });
      try {
        const app = getApp();
        const userId = app.globalData.getUserId();
        const res = await common_vendor.er.callFunction({
          name: "manage-plans",
          data: {
            action: "delete",
            plan_id: this.planId,
            user_id: userId
          }
        });
        if (res.result.code === 0) {
          common_vendor.index.showToast({
            title: "删除成功"
          });
          setTimeout(() => {
            const pages = getCurrentPages();
            const prevPage = pages[pages.length - 2];
            if (prevPage && prevPage.route === "pages/plans/plans") {
              prevPage.$vm.getPlans(true);
            }
            common_vendor.index.navigateBack();
          }, 1500);
        } else {
          common_vendor.index.showToast({
            title: res.result.message || "删除失败",
            icon: "none"
          });
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/plans/plan-detail.vue:481", "删除计划失败", e);
        common_vendor.index.showToast({
          title: "删除失败，请稍后重试",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    },
    /**
     * 跳转到景点详情页面
     * @param {String} spotId 景点ID
     */
    navigateToSpotDetail(spotId) {
      if (!spotId || spotId.startsWith("mock_spot_id_")) {
        common_vendor.index.showToast({
          title: "模拟景点，无法查看详情",
          icon: "none"
        });
        return;
      }
      common_vendor.index.navigateTo({
        url: `/pages/spots/detail?id=${spotId}`
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
    },
    /**
     * 格式化价格
     * @param {Number} price 价格（单位：分）
     * @return {String} 格式化后的价格
     */
    formatPrice(price) {
      if (price === void 0 || price === null)
        return "";
      return "¥" + (price / 100).toFixed(2);
    },
    /**
     * 获取景点的游览天数
     * @param {Object} spot 景点对象
     * @return {Number} 游览天数（从计划开始日期算起的第几天）
     */
    getVisitDay(spot) {
      if (!spot || !spot.visit_date || !this.planData.start_date)
        return 1;
      const visitDateStr = this.formatDate(spot.visit_date);
      const startDateStr = this.formatDate(this.planData.start_date);
      if (visitDateStr === startDateStr)
        return 1;
      const visitDate = new Date(visitDateStr);
      const startDate = new Date(startDateStr);
      const diffTime = visitDate.getTime() - startDate.getTime();
      const diffDays = Math.ceil(diffTime / (1e3 * 60 * 60 * 24));
      return diffDays + 1;
    }
  },
  computed: {
    /**
     * 按日期分组后的景点列表
     */
    groupedSpots() {
      if (!this.planData.spots || !this.planData.spots.length) {
        return [];
      }
      const groupsByDate = {};
      this.planData.spots.forEach((spot) => {
        const dateKey = this.formatDate(spot.visit_date);
        if (!groupsByDate[dateKey]) {
          const dayNumber = this.getVisitDay(spot);
          groupsByDate[dateKey] = {
            date: spot.visit_date,
            dayNumber,
            spots: []
          };
        }
        groupsByDate[dateKey].spots.push(spot);
      });
      return Object.values(groupsByDate).sort((a, b) => a.date - b.date);
    }
  },
  // 监听页面返回
  onShow() {
    if (!this.loading && this.planId) {
      this.getPlanDetail();
    }
  }
};
if (!Array) {
  const _component_uni_load_more = common_vendor.resolveComponent("uni-load-more");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  (_component_uni_load_more + _easycom_uni_icons2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.loading
  }, $data.loading ? {
    b: common_vendor.p({
      status: "loading"
    })
  } : common_vendor.e({
    c: common_vendor.t($data.planData.title),
    d: common_vendor.t($options.getStatusText($data.planData.status)),
    e: common_vendor.n("status-" + $data.planData.status),
    f: $data.viewMode && $data.planData.user_info
  }, $data.viewMode && $data.planData.user_info ? {
    g: $data.planData.user_info.avatar || "/static/default-avatar.png",
    h: common_vendor.t($data.planData.user_info.nickname || $data.planData.user_info.username || "用户")
  } : {}, {
    i: common_vendor.p({
      type: "calendar",
      size: "18",
      color: "#666"
    }),
    j: common_vendor.t($options.formatDate($data.planData.start_date)),
    k: common_vendor.t($options.formatDate($data.planData.end_date)),
    l: $data.planData.description
  }, $data.planData.description ? {
    m: common_vendor.t($data.planData.description)
  } : {}, {
    n: !$data.viewMode
  }, !$data.viewMode ? {
    o: common_vendor.p({
      type: "compose",
      size: "16",
      color: "#007AFF"
    }),
    p: common_vendor.o((...args) => $options.navigateToEdit && $options.navigateToEdit(...args)),
    q: common_vendor.p({
      type: "redo",
      size: "16",
      color: "#4CD964"
    }),
    r: common_vendor.o((...args) => $options.sharePlan && $options.sharePlan(...args)),
    s: common_vendor.p({
      type: "trash",
      size: "16",
      color: "#FF3B30"
    }),
    t: common_vendor.o((...args) => $options.confirmDelete && $options.confirmDelete(...args))
  } : {}, {
    v: $data.viewMode
  }, $data.viewMode ? {
    w: common_vendor.p({
      type: $data.isFavorite ? "heart-filled" : "heart",
      size: "16",
      color: $data.isFavorite ? "#FF5A5F" : "#999"
    }),
    x: common_vendor.t($data.isFavorite ? "已收藏" : "收藏"),
    y: common_vendor.o((...args) => $options.toggleFavorite && $options.toggleFavorite(...args)),
    z: common_vendor.p({
      type: "redo",
      size: "16",
      color: "#4CD964"
    }),
    A: common_vendor.o((...args) => $options.sharePlan && $options.sharePlan(...args))
  } : {}, {
    B: $data.planData.spots && $data.planData.spots.length > 0
  }, $data.planData.spots && $data.planData.spots.length > 0 ? {
    C: common_vendor.f($options.groupedSpots, (dateGroup, dateIndex, i0) => {
      return {
        a: common_vendor.t(dateGroup.dayNumber),
        b: common_vendor.t($options.formatDate(dateGroup.date)),
        c: common_vendor.f(dateGroup.spots, (spot, spotIndex, i1) => {
          return common_vendor.e({
            a: spot.spot_detail && spot.spot_detail.imageUrl
          }, spot.spot_detail && spot.spot_detail.imageUrl ? {
            b: spot.spot_detail.imageUrl
          } : {
            c: common_assets._imports_0$5
          }, {
            d: common_vendor.t(spot.spot_detail ? spot.spot_detail.name : "未知景点"),
            e: spot.spot_detail && spot.spot_detail.address
          }, spot.spot_detail && spot.spot_detail.address ? {
            f: "7944445f-7-" + i0 + "-" + i1,
            g: common_vendor.p({
              type: "location",
              size: "14",
              color: "#666"
            }),
            h: common_vendor.t(spot.spot_detail.address)
          } : {}, {
            i: spot.spot_detail && spot.spot_detail.price !== void 0
          }, spot.spot_detail && spot.spot_detail.price !== void 0 ? {
            j: "7944445f-8-" + i0 + "-" + i1,
            k: common_vendor.p({
              type: "rmb",
              size: "14",
              color: "#666"
            }),
            l: common_vendor.t($options.formatPrice(spot.spot_detail.price))
          } : {}, {
            m: spot.notes
          }, spot.notes ? {
            n: common_vendor.t(spot.notes)
          } : {}, {
            o: spotIndex,
            p: common_vendor.o(($event) => $options.navigateToSpotDetail(spot.spot_id), spotIndex)
          });
        }),
        d: dateIndex
      };
    })
  } : common_vendor.e({
    D: common_assets._imports_0$4,
    E: common_vendor.t($data.viewMode ? "该用户计划中并无景点" : "暂无景点，请在编辑页面添加景点"),
    F: !$data.viewMode
  }, !$data.viewMode ? {
    G: common_vendor.o((...args) => $options.navigateToEdit && $options.navigateToEdit(...args))
  } : {})));
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/plans/plan-detail.js.map
