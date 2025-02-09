"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      keyword: "",
      // 搜索关键词
      searchHistory: [],
      // 搜索历史
      hotKeywords: [
        "西湖",
        "故宫",
        "黄山",
        "长城",
        "兵马俑",
        "九寨沟",
        "张家界",
        "泰山",
        "三亚",
        "丽江"
      ],
      // 热门搜索
      spotList: [],
      // 搜索结果
      page: 1,
      pageSize: 10,
      loading: false,
      noMore: false
    };
  },
  onLoad() {
    this.getSearchHistory();
    this.getCurrentLocation();
  },
  methods: {
    // 获取搜索历史
    getSearchHistory() {
      const history = common_vendor.index.getStorageSync("searchHistory");
      this.searchHistory = history ? JSON.parse(history) : [];
    },
    // 保存搜索历史
    saveSearchHistory() {
      if (!this.keyword)
        return;
      const index = this.searchHistory.indexOf(this.keyword);
      if (index > -1) {
        this.searchHistory.splice(index, 1);
      }
      this.searchHistory.unshift(this.keyword);
      if (this.searchHistory.length > 10) {
        this.searchHistory.pop();
      }
      common_vendor.index.setStorageSync("searchHistory", JSON.stringify(this.searchHistory));
    },
    // 清空搜索历史
    clearHistory() {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要清空搜索历史吗？",
        success: (res) => {
          if (res.confirm) {
            this.searchHistory = [];
            common_vendor.index.removeStorageSync("searchHistory");
          }
        }
      });
    },
    // 移除单条历史记录
    removeHistory(index) {
      this.searchHistory.splice(index, 1);
      common_vendor.index.setStorageSync("searchHistory", JSON.stringify(this.searchHistory));
    },
    // 使用历史记录搜索
    useHistory(keyword) {
      this.keyword = keyword;
      this.search();
    },
    // 使用热门关键词搜索
    useHot(keyword) {
      this.keyword = keyword;
      this.search();
    },
    // 清空关键词
    clearKeyword() {
      this.keyword = "";
      this.spotList = [];
    },
    // 获取当前位置
    getCurrentLocation() {
      common_vendor.index.getLocation({
        type: "gcj02",
        success: (res) => {
          this.latitude = res.latitude;
          this.longitude = res.longitude;
        }
      });
    },
    // 搜索
    async search() {
      if (!this.keyword)
        return;
      this.page = 1;
      this.spotList = [];
      this.noMore = false;
      this.saveSearchHistory();
      await this.getSearchResult();
    },
    // 获取搜索结果
    async getSearchResult() {
      if (this.loading || this.noMore)
        return;
      this.loading = true;
      try {
        const res = await common_vendor.er.callFunction({
          name: "get-spots",
          data: {
            keyword: this.keyword,
            longitude: this.longitude,
            latitude: this.latitude,
            page: this.page,
            pageSize: this.pageSize
          }
        });
        if (res.result.code === 0) {
          const { list, total } = res.result.data;
          if (this.page === 1) {
            this.spotList = list;
          } else {
            this.spotList = [...this.spotList, ...list];
          }
          this.noMore = this.spotList.length >= total;
        }
      } catch (e) {
        common_vendor.index.showToast({
          title: "搜索失败",
          icon: "none"
        });
      }
      this.loading = false;
    },
    // 加载更多
    loadMore() {
      if (!this.noMore) {
        this.page++;
        this.getSearchResult();
      }
    },
    // 跳转到详情页
    goToDetail(id) {
      common_vendor.index.navigateTo({
        url: `/pages/spots/detail?id=${id}`
      });
    },
    // 返回上一页
    goBack() {
      common_vendor.index.navigateBack();
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.search && $options.search(...args)),
    b: $data.keyword,
    c: common_vendor.o(($event) => $data.keyword = $event.detail.value),
    d: $data.keyword
  }, $data.keyword ? {
    e: common_vendor.o((...args) => $options.clearKeyword && $options.clearKeyword(...args))
  } : {}, {
    f: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    g: !$data.keyword && $data.searchHistory.length > 0
  }, !$data.keyword && $data.searchHistory.length > 0 ? {
    h: common_vendor.o((...args) => $options.clearHistory && $options.clearHistory(...args)),
    i: common_vendor.f($data.searchHistory, (item, index, i0) => {
      return {
        a: common_vendor.t(item),
        b: common_vendor.o(($event) => $options.removeHistory(index), index),
        c: index,
        d: common_vendor.o(($event) => $options.useHistory(item), index)
      };
    })
  } : {}, {
    j: !$data.keyword
  }, !$data.keyword ? {
    k: common_vendor.f($data.hotKeywords, (item, index, i0) => {
      return {
        a: common_vendor.t(index + 1),
        b: index < 3 ? 1 : "",
        c: common_vendor.t(item),
        d: index,
        e: common_vendor.o(($event) => $options.useHot(item), index)
      };
    })
  } : common_vendor.e({
    l: common_vendor.f($data.spotList, (item, index, i0) => {
      return common_vendor.e({
        a: item.imageUrl,
        b: common_vendor.t(item.name),
        c: item.distance
      }, item.distance ? {
        d: common_vendor.t(item.distance.toFixed(1))
      } : {}, {
        e: common_vendor.t(item.rating),
        f: common_vendor.t(item.price),
        g: common_vendor.f(item.tags, (tag, tagIndex, i1) => {
          return {
            a: common_vendor.t(tag),
            b: tagIndex
          };
        }),
        h: index,
        i: common_vendor.o(($event) => $options.goToDetail(item._id), index)
      });
    }),
    m: $data.loading
  }, $data.loading ? {} : {}, {
    n: $data.noMore
  }, $data.noMore ? {} : {}, {
    o: !$data.loading && $data.spotList.length === 0
  }, !$data.loading && $data.spotList.length === 0 ? {
    p: common_assets._imports_0$3
  } : {}, {
    q: common_vendor.o((...args) => $options.loadMore && $options.loadMore(...args))
  }));
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/spots/search.js.map
