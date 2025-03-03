"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      keyword: "",
      spots: [],
      loading: false,
      searchTimer: null,
      selectedDate: "",
      startDate: "",
      endDate: ""
    };
  },
  onLoad(options) {
    this.startDate = parseInt(options.startDate);
    this.endDate = parseInt(options.endDate);
    this.selectedDate = this.startDate;
    this.loadSpots();
  },
  methods: {
    /**
     * 加载景点列表
     */
    async loadSpots() {
      this.loading = true;
      try {
        const res = await common_vendor.er.callFunction({
          name: "get-spots",
          data: {
            keyword: this.keyword,
            page: 1,
            pageSize: 20,
            sortBy: "rating",
            sortOrder: "desc"
          }
        });
        if (res.result.code === 0) {
          this.spots = res.result.data.list;
        } else {
          common_vendor.index.showToast({
            title: res.result.message || "获取景点失败",
            icon: "none"
          });
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/plans/spot-select.vue:113", "获取景点失败:", e);
        common_vendor.index.showToast({
          title: "获取景点失败，请稍后重试",
          icon: "none"
        });
      } finally {
        this.loading = false;
      }
    },
    /**
     * 搜索输入处理
     */
    onSearch() {
      if (this.searchTimer) {
        clearTimeout(this.searchTimer);
      }
      this.searchTimer = setTimeout(() => {
        this.loadSpots();
      }, 300);
    },
    /**
     * 日期变更
     */
    onDateChange(e) {
      const dateStr = e.detail.value;
      this.selectedDate = new Date(dateStr).getTime();
    },
    /**
     * 选择景点
     */
    selectSpot(spot) {
      const spotData = {
        spot_id: spot._id,
        visit_date: this.selectedDate,
        notes: "",
        spot_detail: {
          name: spot.name,
          imageUrl: spot.imageUrl,
          address: spot.address,
          price: spot.price,
          rating: spot.rating
        }
      };
      const pages = getCurrentPages();
      const prevPage = pages[pages.length - 2];
      if (prevPage && prevPage.route === "pages/plans/plan-edit") {
        prevPage.$vm.addSpot(spotData);
      }
      common_vendor.index.navigateBack();
    },
    /**
     * 格式化日期
     */
    formatDate(timestamp) {
      if (!timestamp) {
        return "";
      }
      const date = new Date(timestamp);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    }
  }
};
if (!Array) {
  const _component_uni_search_bar = common_vendor.resolveComponent("uni-search-bar");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _component_uni_load_more = common_vendor.resolveComponent("uni-load-more");
  (_component_uni_search_bar + _easycom_uni_icons2 + _component_uni_load_more)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o($options.onSearch),
    b: common_vendor.o($options.onSearch),
    c: common_vendor.o(($event) => $data.keyword = $event),
    d: common_vendor.p({
      placeholder: "搜索景点",
      modelValue: $data.keyword
    }),
    e: common_vendor.t($options.formatDate($data.selectedDate) || "请选择日期"),
    f: common_vendor.p({
      type: "arrowright",
      size: "14",
      color: "#999999"
    }),
    g: $options.formatDate($data.selectedDate),
    h: $options.formatDate($data.startDate),
    i: $options.formatDate($data.endDate),
    j: common_vendor.o((...args) => $options.onDateChange && $options.onDateChange(...args)),
    k: $data.loading
  }, $data.loading ? {
    l: common_vendor.p({
      status: "loading"
    })
  } : $data.spots.length > 0 ? {
    n: common_vendor.f($data.spots, (item, index, i0) => {
      return {
        a: item.imageUrl,
        b: common_vendor.t(item.name),
        c: common_vendor.t(item.rating),
        d: common_vendor.t(item.price / 100),
        e: common_vendor.t(item.address),
        f: item._id,
        g: common_vendor.o(($event) => $options.selectSpot(item), item._id)
      };
    })
  } : {}, {
    m: $data.spots.length > 0
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/plans/spot-select.js.map
