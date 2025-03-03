"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      latitude: 39.909,
      // 默认纬度（北京）
      longitude: 116.397,
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
      listHeight: 400,
      // 列表高度，单位px
      isLocationReady: false,
      // 位置是否就绪
      spot: null,
      polyline: [],
      navigationOptions: [
        { name: "百度地图", icon: "icon-baidu" },
        { name: "高德地图", icon: "icon-gaode" },
        { name: "腾讯地图", icon: "icon-tengxun" }
      ],
      showNavigation: false
    };
  },
  onShow() {
    const app = getApp();
    app.globalData.checkLoginStatus(true);
  },
  onLoad(options) {
    const app = getApp();
    app.globalData.checkLoginStatus(true);
    const systemInfo = common_vendor.index.getSystemInfoSync();
    this.listHeight = systemInfo.windowHeight - 350;
    this.getCurrentLocation();
    this.getSpotList();
    if (options.id) {
      this.getSpotInfo(options.id);
    }
  },
  methods: {
    // 获取景点列表
    async getSpotList() {
      try {
        const app = getApp();
        const userId = app.globalData.getUserId();
        const res = await common_vendor.er.callFunction({
          name: "get-spots",
          data: {
            longitude: this.longitude,
            latitude: this.latitude,
            page: 1,
            pageSize: 10,
            user_id: userId
          }
        });
        if (res.result.code === 0) {
          this.spotList = res.result.data.list;
          this.spotList.sort((a, b) => a.distance - b.distance);
          common_vendor.index.__f__("log", "at pages/map/map.vue:162", "景点列表", this.spotList);
          this.updateMarkers();
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/map/map.vue:167", "获取景点列表失败:", e);
        common_vendor.index.showToast({
          title: "获取景点列表失败",
          icon: "none"
        });
      }
    },
    // 获取景点信息
    async getSpotInfo(id) {
      try {
        const app = getApp();
        const userId = app.globalData.getUserId();
        const res = await common_vendor.er.callFunction({
          name: "get-spot-detail",
          data: {
            id,
            user_id: userId
          }
        });
        if (res.result.code === 0) {
          this.spot = res.result.data;
          if (this.spot.location && this.spot.location.coordinates) {
            const [longitude, latitude] = this.spot.location.coordinates;
            this.markers = [{
              id: 1,
              latitude,
              longitude,
              title: this.spot.name,
              iconPath: "/static/icons/park.png",
              width: 32,
              height: 32
            }];
          }
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/map/map.vue:206", "获取景点信息失败:", e);
        common_vendor.index.showToast({
          title: "获取景点信息失败",
          icon: "none"
        });
      }
    },
    // 获取当前位置
    getCurrentLocation() {
      this.wxGetLocation();
    },
    // 微信小程序获取位置
    wxGetLocation() {
      common_vendor.index.authorize({
        scope: "scope.userLocation",
        success: () => {
          this.getLocationInfo();
        },
        fail: () => {
          common_vendor.index.showModal({
            title: "提示",
            content: "需要获取您的地理位置，请确认授权",
            success: (res) => {
              if (res.confirm) {
                common_vendor.index.openSetting();
              } else {
                this.useDefaultLocation();
              }
            }
          });
        }
      });
    },
    // H5获取位置
    h5GetLocation() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            this.latitude = position.coords.latitude;
            this.longitude = position.coords.longitude;
            this.isLocationReady = true;
            this.updateMarkers();
          },
          (error) => {
            common_vendor.index.__f__("error", "at pages/map/map.vue:262", "获取位置失败:", error);
            this.useDefaultLocation();
          }
        );
      } else {
        this.useDefaultLocation();
      }
    },
    // APP获取位置
    appGetLocation() {
      this.getLocationInfo();
    },
    // 统一获取位置信息
    getLocationInfo() {
      common_vendor.index.getLocation({
        type: "gcj02",
        success: (res) => {
          this.latitude = res.latitude;
          this.longitude = res.longitude;
          this.isLocationReady = true;
          this.updateMarkers();
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/map/map.vue:287", "获取位置失败:", err);
          this.useDefaultLocation();
        }
      });
    },
    // 使用默认位置（北京）
    useDefaultLocation() {
      common_vendor.index.showToast({
        title: "未能获取位置，使用默认位置",
        icon: "none"
      });
      this.isLocationReady = true;
      this.updateMarkers();
    },
    // 更新地图标记
    updateMarkers() {
      if (this.spotList.length > 0) {
        this.markers = this.spotList.map((spot, index) => {
          return {
            id: index,
            latitude: spot.location.coordinates[1],
            longitude: spot.location.coordinates[0],
            title: spot.name,
            iconPath: "/static/icons/park.png",
            width: 32,
            height: 32
          };
        });
      }
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
    // 打开地图应用进行导航
    openMapApp() {
      if (!this.spot || !this.spot.location)
        return;
      const [longitude, latitude] = this.spot.location.coordinates;
      common_vendor.index.openLocation({
        latitude,
        longitude,
        name: this.spot.name,
        address: this.spot.address,
        success: () => {
          common_vendor.index.__f__("log", "at pages/map/map.vue:391", "打开导航成功");
        },
        fail: () => {
          common_vendor.index.showToast({
            title: "打开导航失败",
            icon: "none"
          });
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
    },
    // 显示导航选项
    showNavigationOptions() {
      this.showNavigation = true;
    },
    // 隐藏导航选项
    hideNavigationOptions() {
      this.showNavigation = false;
    },
    // 导航
    navigate(option) {
      common_vendor.index.showToast({
        title: `即将打开${option.name}`,
        icon: "none"
      });
      this.hideNavigationOptions();
    },
    // 打开地图
    openMap() {
      this.showNavigationOptions();
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.goToSearch && $options.goToSearch(...args)),
    b: $data.latitude,
    c: $data.longitude,
    d: $data.markers,
    e: $data.polyline,
    f: $data.spot
  }, $data.spot ? {
    g: common_vendor.t($data.spot.name),
    h: common_vendor.t($data.spot.address),
    i: common_vendor.o((...args) => $options.openMapApp && $options.openMapApp(...args))
  } : {}, {
    j: common_vendor.f($data.spotList, (item, index, i0) => {
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
    k: $data.showNavigation
  }, $data.showNavigation ? {
    l: common_vendor.f($data.navigationOptions, (item, index, i0) => {
      return {
        a: common_vendor.n(item.icon),
        b: common_vendor.t(item.name),
        c: index,
        d: common_vendor.o(($event) => $options.navigate(item), index)
      };
    }),
    m: common_vendor.o((...args) => $options.hideNavigationOptions && $options.hideNavigationOptions(...args)),
    n: common_vendor.o(() => {
    }),
    o: common_vendor.o((...args) => $options.hideNavigationOptions && $options.hideNavigationOptions(...args))
  } : {}, {
    p: $data.loading
  }, $data.loading ? {} : {}, {
    q: $data.noMore
  }, $data.noMore ? {} : {}, {
    r: $data.listHeight + "px",
    s: common_vendor.o((...args) => $options.loadMore && $options.loadMore(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/map/map.js.map
