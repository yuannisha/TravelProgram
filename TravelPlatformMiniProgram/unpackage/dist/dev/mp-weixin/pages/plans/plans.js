"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      planList: [],
      loading: true,
      refreshing: false,
      currentPage: 1,
      pageSize: 10,
      total: 0,
      noMore: false,
      loadMoreStatus: "more",
      currentStatus: ""
    };
  },
  onLoad() {
    const app = getApp();
    app.globalData.checkLoginStatus(true);
    this.getPlans();
  },
  methods: {
    /**
     * 获取旅行计划列表
     * @param {Boolean} refresh 是否刷新数据
     */
    async getPlans(refresh = false) {
      if (refresh) {
        this.currentPage = 1;
        this.noMore = false;
        this.loadMoreStatus = "more";
      }
      if (this.noMore && !refresh) {
        return;
      }
      this.loading = true;
      try {
        const app = getApp();
        const userId = app.globalData.getUserId();
        const res = await common_vendor.er.callFunction({
          name: "manage-plans",
          data: {
            action: "list",
            page: this.currentPage,
            pageSize: this.pageSize,
            status: this.currentStatus,
            user_id: userId
          }
        });
        if (res.result.code === 0) {
          const { list, total } = res.result.data;
          if (refresh) {
            this.planList = list;
          } else {
            this.planList = [...this.planList, ...list];
          }
          this.total = total;
          this.noMore = this.planList.length >= total;
          this.loadMoreStatus = this.noMore ? "noMore" : "more";
        } else {
          common_vendor.index.showToast({
            title: res.result.message || "获取计划列表失败",
            icon: "none"
          });
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/plans/plans.vue:175", "获取计划列表失败", e);
        common_vendor.index.showToast({
          title: "获取计划列表失败，请稍后重试",
          icon: "none"
        });
      } finally {
        this.loading = false;
        if (refresh) {
          this.refreshing = false;
        }
      }
    },
    /**
     * 加载更多数据
     */
    loadMore() {
      if (this.noMore || this.loading) {
        return;
      }
      this.currentPage++;
      this.getPlans();
    },
    /**
     * 下拉刷新
     */
    onRefresh() {
      this.refreshing = true;
      this.getPlans(true);
    },
    /**
     * 根据状态筛选计划
     * @param {String} status 状态值
     */
    filterByStatus(status) {
      if (this.currentStatus === status) {
        return;
      }
      this.currentStatus = status;
      this.getPlans(true);
    },
    /**
     * 跳转到创建计划页面
     */
    navigateToCreate() {
      common_vendor.index.navigateTo({
        url: "/pages/plans/plan-edit"
      });
    },
    /**
     * 跳转到编辑计划页面
     * @param {String} id 计划ID
     */
    navigateToEdit(id) {
      common_vendor.index.navigateTo({
        url: `/pages/plans/plan-edit?id=${id}`
      });
    },
    /**
     * 跳转到计划详情页面
     * @param {String} id 计划ID
     */
    navigateToDetail(id) {
      common_vendor.index.navigateTo({
        url: `/pages/plans/plan-detail?id=${id}`
      });
    },
    /**
     * 确认删除计划
     * @param {String} id 计划ID
     */
    confirmDelete(id) {
      common_vendor.index.showModal({
        title: "确认删除",
        content: "确定要删除这个旅行计划吗？",
        confirmColor: "#FF3B30",
        success: async (res) => {
          if (res.confirm) {
            this.deletePlan(id);
          }
        }
      });
    },
    /**
     * 删除计划
     * @param {String} id 计划ID
     */
    async deletePlan(id) {
      common_vendor.index.showLoading({
        title: "删除中..."
      });
      common_vendor.index.__f__("log", "at pages/plans/plans.vue:275", "计划id", id);
      try {
        const res = await common_vendor.er.callFunction({
          name: "manage-plans",
          data: {
            action: "delete",
            plan_id: id,
            user_id: getApp().globalData.getUserId()
          }
        });
        if (res.result.code === 0) {
          common_vendor.index.showToast({
            title: "删除成功"
          });
          this.planList = this.planList.filter((plan) => plan._id !== id);
          if (this.planList.length === 0 && this.total > 0) {
            this.getPlans(true);
          }
        } else {
          common_vendor.index.showToast({
            title: res.result.message || "删除失败",
            icon: "none"
          });
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/plans/plans.vue:305", "删除计划失败", e);
        common_vendor.index.showToast({
          title: "删除失败，请稍后重试",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
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
     * 格式化时间
     * @param {Number|String} timestamp 时间戳
     * @return {String} 格式化后的时间
     */
    formatTime(timestamp) {
      if (!timestamp)
        return "";
      const date = new Date(timestamp);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
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
      type: "plusempty",
      size: "20",
      color: "#FFFFFF"
    }),
    b: common_vendor.o((...args) => $options.navigateToCreate && $options.navigateToCreate(...args)),
    c: $data.currentStatus === "" ? 1 : "",
    d: common_vendor.o(($event) => $options.filterByStatus("")),
    e: $data.currentStatus === "0" ? 1 : "",
    f: common_vendor.o(($event) => $options.filterByStatus("0")),
    g: $data.currentStatus === "1" ? 1 : "",
    h: common_vendor.o(($event) => $options.filterByStatus("1")),
    i: $data.currentStatus === "2" ? 1 : "",
    j: common_vendor.o(($event) => $options.filterByStatus("2")),
    k: $data.loading && !$data.refreshing
  }, $data.loading && !$data.refreshing ? {
    l: common_vendor.p({
      status: "loading"
    })
  } : $data.planList.length === 0 ? {
    n: common_assets._imports_0$4,
    o: common_vendor.o((...args) => $options.navigateToCreate && $options.navigateToCreate(...args))
  } : common_vendor.e({
    p: common_vendor.f($data.planList, (plan, index, i0) => {
      return common_vendor.e({
        a: common_vendor.t(plan.title),
        b: common_vendor.t($options.getStatusText(plan.status)),
        c: common_vendor.n("status-" + plan.status),
        d: "71ff5a54-2-" + i0,
        e: common_vendor.t($options.formatDate(plan.start_date)),
        f: common_vendor.t($options.formatDate(plan.end_date)),
        g: plan.description
      }, plan.description ? {
        h: common_vendor.t(plan.description)
      } : {}, {
        i: plan.spots && plan.spots.length > 0
      }, plan.spots && plan.spots.length > 0 ? {
        j: common_vendor.t(plan.spots.length)
      } : {}, {
        k: common_vendor.t($options.formatTime(plan.create_date)),
        l: "71ff5a54-3-" + i0,
        m: common_vendor.o(($event) => $options.navigateToEdit(plan._id), plan._id),
        n: "71ff5a54-4-" + i0,
        o: common_vendor.o(($event) => $options.confirmDelete(plan._id), plan._id),
        p: plan._id,
        q: common_vendor.o(($event) => $options.navigateToDetail(plan._id), plan._id)
      });
    }),
    q: common_vendor.p({
      type: "calendar",
      size: "16",
      color: "#666"
    }),
    r: common_vendor.p({
      type: "compose",
      size: "16",
      color: "#007AFF"
    }),
    s: common_vendor.p({
      type: "trash",
      size: "16",
      color: "#FF3B30"
    }),
    t: $data.planList.length > 0
  }, $data.planList.length > 0 ? {
    v: common_vendor.p({
      status: $data.loadMoreStatus
    })
  } : {}), {
    m: $data.planList.length === 0,
    w: common_vendor.o((...args) => $options.loadMore && $options.loadMore(...args)),
    x: $data.refreshing,
    y: common_vendor.o((...args) => $options.onRefresh && $options.onRefresh(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/plans/plans.js.map
