"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      latitude: 39.908692,
      // 默认纬度（北京）
      longitude: 116.397477,
      // 默认经度（北京）
      scale: 12,
      // 缩放级别
      markers: [],
      // 地图标记点
      spotList: [],
      // 景点列表
      page: 1,
      pageSize: 10,
      loading: false,
      noMore: false,
      listHeight: 400
      // 列表高度，单位px
    };
  },
  onLoad() {
    const systemInfo = common_vendor.index.getSystemInfoSync();
    this.listHeight = systemInfo.windowHeight - 100 * systemInfo.windowWidth / 750 - systemInfo.windowHeight * 0.5 - 50;
    this.getCurrentLocation();
  },
  methods: {
    // 获取当前位置
    getCurrentLocation() {
      common_vendor.index.getLocation({
        type: "gcj02",
        success: (res) => {
          this.latitude = res.latitude;
          this.longitude = res.longitude;
          this.getNearbySpots();
        },
        fail: () => {
          this.getNearbySpots();
        }
      });
    },
    // 获取附近景点
    async getNearbySpots() {
      if (this.loading || this.noMore)
        return;
      this.loading = true;
      try {
        const res = await common_vendor.er.callFunction({
          name: "get-spots",
          data: {
            longitude: this.longitude,
            latitude: this.latitude,
            page: this.page,
            pageSize: this.pageSize,
            sortBy: "distance",
            sortOrder: "asc"
          }
        });
        if (res.result.code === 0) {
          const { list, total } = res.result.data;
          if (this.page === 1) {
            this.spotList = list;
          } else {
            this.spotList = [...this.spotList, ...list];
          }
          this.updateMarkers();
          this.noMore = this.spotList.length >= total;
        }
      } catch (e) {
        common_vendor.index.showToast({
          title: "获取景点失败",
          icon: "none"
        });
      }
      this.loading = false;
    },
    // 更新地图标记
    updateMarkers() {
      this.markers = this.spotList.map((spot, index) => ({
        id: index + 1,
        latitude: spot.location.coordinates[1],
        longitude: spot.location.coordinates[0],
        title: spot.name,
        iconPath: "/static/markers/spot.png",
        width: 32,
        height: 32,
        callout: {
          content: spot.name,
          color: "#333333",
          fontSize: 14,
          borderRadius: 4,
          bgColor: "#ffffff",
          padding: 8,
          display: "BYCLICK"
        }
      }));
    },
    // 加载更多
    loadMore() {
      if (!this.noMore) {
        this.page++;
        this.getNearbySpots();
      }
    },
    // 标记点点击事件
    onMarkerTap(e) {
      const spot = this.spotList[e.markerId - 1];
      if (spot) {
        this.goToDetail(spot._id);
      }
    },
    // 打开导航
    openMap(spot) {
      common_vendor.index.openLocation({
        latitude: spot.location.coordinates[1],
        longitude: spot.location.coordinates[0],
        name: spot.name,
        address: spot.address,
        success: () => {
          common_vendor.index.__f__("log", "at pages/map/map.vue:197", "打开导航成功");
        }
      });
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
    b: $data.latitude,
    c: $data.longitude,
    d: $data.markers,
    e: $data.scale,
    f: common_vendor.o((...args) => $options.onMarkerTap && $options.onMarkerTap(...args)),
    g: common_vendor.o((...args) => $options.onMarkerTap && $options.onMarkerTap(...args)),
    h: common_vendor.f($data.spotList, (item, index, i0) => {
      return common_vendor.e({
        a: item.imageUrl,
        b: common_vendor.t(item.name),
        c: item.distance
      }, item.distance ? {
        d: common_vendor.t(item.distance.toFixed(1))
      } : {}, {
        e: common_vendor.t(item.rating),
        f: common_vendor.t(item.price),
        g: common_vendor.t(item.address),
        h: common_vendor.o(($event) => $options.openMap(item), index),
        i: index,
        j: common_vendor.o(($event) => $options.goToDetail(item._id), index)
      });
    }),
    i: $data.loading
  }, $data.loading ? {} : {}, {
    j: $data.noMore
  }, $data.noMore ? {} : {}, {
    k: $data.listHeight + "px",
    l: common_vendor.o((...args) => $options.loadMore && $options.loadMore(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/map/map.js.map
