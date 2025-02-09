"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      spotId: null,
      spotDetail: {
        name: "西湖风景区",
        images: [
          "/static/spots/spot1.jpg",
          "/static/spots/spot2.jpg",
          "/static/spots/spot3.jpg"
        ],
        rating: 4.9,
        commentCount: 12580,
        price: 80,
        tags: ["5A景区", "湖泊", "游船"],
        address: "浙江省杭州市西湖区龙井路1号",
        distance: 2.5,
        description: "西湖，位于浙江省杭州市西湖区龙井路1号，是中国大陆首个世界文化遗产湖泊。湖区面积49平方千米，汇水面积为21.22平方千米，湖面面积为6.38平方千米。",
        openTime: "全天开放",
        suggestedTime: "建议3-4小时",
        isFavorite: false
      },
      comments: [
        {
          nickname: "游客A",
          avatar: "/static/avatar/user1.png",
          rating: 5,
          time: "2024-02-08",
          content: "风景非常优美，特别是三潭印月的夜景，太美了！建议傍晚来，可以看到日落。",
          images: [
            "/static/comments/comment1.jpg",
            "/static/comments/comment2.jpg"
          ]
        },
        {
          nickname: "游客B",
          avatar: "/static/avatar/user2.png",
          rating: 4.5,
          time: "2024-02-07",
          content: "景色宜人，适合散步。建议早上来，人少清净。",
          images: []
        }
      ]
    };
  },
  onLoad(options) {
    if (options.id) {
      this.spotId = options.id;
      this.getSpotDetail();
    }
  },
  methods: {
    // 获取景点详情
    async getSpotDetail() {
    },
    // 切换收藏状态
    toggleFavorite() {
      this.spotDetail.isFavorite = !this.spotDetail.isFavorite;
      common_vendor.index.showToast({
        title: this.spotDetail.isFavorite ? "收藏成功" : "已取消收藏",
        icon: "none"
      });
    },
    // 打开地图
    openMap() {
    },
    // 预览图片
    previewImage(images, current) {
      common_vendor.index.previewImage({
        urls: images,
        current: images[current]
      });
    },
    // 导航
    goToMap() {
    }
  },
  // 分享
  onShareAppMessage() {
    return {
      title: this.spotDetail.name,
      path: `/pages/spots/detail?id=${this.spotId}`
    };
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.f($data.spotDetail.images, (item, index, i0) => {
      return {
        a: item,
        b: index
      };
    }),
    b: common_vendor.t($data.spotDetail.name),
    c: common_vendor.n($data.spotDetail.isFavorite ? "icon-heart-fill" : "icon-heart"),
    d: common_vendor.o((...args) => $options.toggleFavorite && $options.toggleFavorite(...args)),
    e: common_vendor.t($data.spotDetail.rating),
    f: common_vendor.t($data.spotDetail.commentCount),
    g: common_vendor.t($data.spotDetail.price),
    h: common_vendor.f($data.spotDetail.tags, (tag, index, i0) => {
      return {
        a: common_vendor.t(tag),
        b: index
      };
    }),
    i: common_vendor.t($data.spotDetail.address),
    j: $data.spotDetail.distance
  }, $data.spotDetail.distance ? {
    k: common_vendor.t($data.spotDetail.distance)
  } : {}, {
    l: common_vendor.o((...args) => $options.openMap && $options.openMap(...args)),
    m: common_vendor.t($data.spotDetail.description),
    n: common_vendor.t($data.spotDetail.openTime),
    o: common_vendor.t($data.spotDetail.suggestedTime),
    p: common_vendor.t($data.spotDetail.commentCount),
    q: common_vendor.f($data.comments, (item, index, i0) => {
      return common_vendor.e({
        a: item.avatar,
        b: common_vendor.t(item.nickname),
        c: common_vendor.t(item.rating),
        d: common_vendor.t(item.time),
        e: common_vendor.t(item.content),
        f: item.images && item.images.length
      }, item.images && item.images.length ? {
        g: common_vendor.f(item.images, (img, imgIndex, i1) => {
          return {
            a: imgIndex,
            b: img,
            c: common_vendor.o(($event) => $options.previewImage(item.images, imgIndex), imgIndex)
          };
        })
      } : {}, {
        h: index
      });
    }),
    r: common_vendor.o((...args) => $options.goToMap && $options.goToMap(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
_sfc_main.__runtimeHooks = 2;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/spots/detail.js.map
