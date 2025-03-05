"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      isEdit: false,
      planId: "",
      planData: {
        title: "",
        description: "",
        start_date: "",
        end_date: "",
        spots: [],
        status: 0,
        is_public: false
      },
      statusOptions: ["计划中", "进行中", "已完成"],
      currentSpotIndex: -1,
      currentDateIndex: -1,
      currentSpotNotes: "",
      quickNotes: ["必去景点", "特色美食", "交通便利", "性价比高", "适合拍照", "人少清净", "带孩子必去", "情侣约会", "早上去最佳", "傍晚去最佳"]
    };
  },
  onLoad(options) {
    const app = getApp();
    app.globalData.checkLoginStatus(true);
    if (options.id) {
      this.isEdit = true;
      this.planId = options.id;
      this.getPlanDetail();
    } else {
      const now = /* @__PURE__ */ new Date();
      this.planData.start_date = now.getTime();
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + 7);
      this.planData.end_date = endDate.getTime();
    }
  },
  methods: {
    /**
     * 获取计划详情
     */
    async getPlanDetail() {
      common_vendor.index.showLoading({
        title: "加载中..."
      });
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
        common_vendor.index.__f__("error", "at pages/plans/plan-edit.vue:252", "获取计划详情失败", e);
        common_vendor.index.showToast({
          title: "获取计划详情失败，请稍后重试",
          icon: "none"
        });
        setTimeout(() => {
          common_vendor.index.navigateBack();
        }, 1500);
      } finally {
        common_vendor.index.hideLoading();
      }
    },
    /**
     * 保存计划
     */
    async savePlan() {
      if (!this.planData.title) {
        return common_vendor.index.showToast({
          title: "请输入计划标题",
          icon: "none"
        });
      }
      if (!this.planData.start_date) {
        return common_vendor.index.showToast({
          title: "请选择开始日期",
          icon: "none"
        });
      }
      if (!this.planData.end_date) {
        return common_vendor.index.showToast({
          title: "请选择结束日期",
          icon: "none"
        });
      }
      if (this.planData.start_date > this.planData.end_date) {
        return common_vendor.index.showToast({
          title: "开始日期不能晚于结束日期",
          icon: "none"
        });
      }
      common_vendor.index.showLoading({
        title: this.isEdit ? "更新中..." : "创建中..."
      });
      try {
        const app = getApp();
        const userId = app.globalData.getUserId();
        common_vendor.index.__f__("log", "at pages/plans/plan-edit.vue:305", "userId", userId);
        const action = this.isEdit ? "update" : "create";
        const spots = this.planData.spots ? this.planData.spots.map((spot) => ({
          spot_id: spot.spot_id,
          visit_date: spot.visit_date,
          notes: spot.notes || ""
        })) : [];
        const requestData = {
          action,
          plan: {
            title: this.planData.title || "",
            description: this.planData.description || "",
            start_date: this.planData.start_date,
            end_date: this.planData.end_date,
            spots,
            is_public: this.planData.is_public || false,
            status: this.planData.status || 0
          },
          user_id: userId
        };
        if (this.isEdit) {
          requestData.plan_id = this.planId;
        }
        common_vendor.index.__f__("log", "at pages/plans/plan-edit.vue:334", "发送到云函数的数据：", JSON.parse(JSON.stringify(requestData)));
        const res = await common_vendor.er.callFunction({
          name: "manage-plans",
          data: JSON.parse(JSON.stringify(requestData))
        });
        if (res.result.code === 0) {
          common_vendor.index.showToast({
            title: this.isEdit ? "更新成功" : "创建成功"
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
            title: res.result.message || (this.isEdit ? "更新失败" : "创建失败"),
            icon: "none"
          });
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/plans/plan-edit.vue:365", this.isEdit ? "更新计划失败" : "创建计划失败", e);
        common_vendor.index.showToast({
          title: (this.isEdit ? "更新" : "创建") + "失败，请稍后重试",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    },
    /**
     * 开始日期变更
     */
    onStartDateChange(e) {
      const dateStr = e.detail.value;
      const selectedDate = new Date(dateStr);
      const today = /* @__PURE__ */ new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        common_vendor.index.showToast({
          title: "开始日期不能早于今天",
          icon: "none"
        });
        return;
      }
      this.planData.start_date = selectedDate.getTime();
      if (this.planData.end_date && this.planData.end_date < this.planData.start_date) {
        this.planData.end_date = this.planData.start_date;
      }
    },
    /**
     * 结束日期变更
     */
    onEndDateChange(e) {
      const dateStr = e.detail.value;
      const selectedDate = new Date(dateStr);
      const today = /* @__PURE__ */ new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        common_vendor.index.showToast({
          title: "结束日期不能早于今天",
          icon: "none"
        });
        return;
      }
      if (this.planData.start_date && selectedDate < new Date(this.planData.start_date)) {
        common_vendor.index.showToast({
          title: "结束日期不能早于开始日期",
          icon: "none"
        });
        return;
      }
      this.planData.end_date = selectedDate.getTime();
    },
    /**
     * 状态变更
     */
    onStatusChange(e) {
      this.planData.status = parseInt(e.detail.value);
    },
    /**
     * 是否公开变更
     */
    onPublicChange(e) {
      this.planData.is_public = e.detail.value;
    },
    /**
     * 跳转到景点选择页面
     */
    navigateToSpotSelect() {
      if (!this.planData.start_date || !this.planData.end_date) {
        common_vendor.index.showToast({
          title: "请先选择计划的开始和结束日期",
          icon: "none"
        });
        return;
      }
      common_vendor.index.navigateTo({
        url: `/pages/plans/spot-select?startDate=${this.planData.start_date}&endDate=${this.planData.end_date}`
      });
    },
    /**
     * 添加景点到计划中
     * @param {Object} spotData 景点数据
     */
    addSpot(spotData) {
      if (!this.planData.spots) {
        this.planData.spots = [];
      }
      const existingSpot = this.planData.spots.find(
        (spot) => spot.spot_id === spotData.spot_id && this.formatDate(spot.visit_date) === this.formatDate(spotData.visit_date)
      );
      if (existingSpot) {
        common_vendor.index.showToast({
          title: "该景点已在同一天添加过",
          icon: "none"
        });
        return;
      }
      const visitDate = new Date(spotData.visit_date);
      const startDate = new Date(this.planData.start_date);
      const endDate = new Date(this.planData.end_date);
      if (visitDate < startDate || visitDate > endDate) {
        common_vendor.index.showToast({
          title: "游览日期必须在计划日期范围内",
          icon: "none"
        });
        return;
      }
      this.planData.spots.push(spotData);
      this.planData.spots.sort((a, b) => {
        if (a.visit_date === b.visit_date) {
          return this.planData.spots.indexOf(a) - this.planData.spots.indexOf(b);
        }
        return a.visit_date - b.visit_date;
      });
      common_vendor.index.showToast({
        title: "添加成功",
        icon: "success"
      });
    },
    /**
     * 打开备注弹窗
     * @param {Number} dateIndex 日期组索引
     * @param {Number} spotIndex 景点索引
     */
    openNotesPopup(dateIndex, spotIndex) {
      this.currentDateIndex = dateIndex;
      this.currentSpotIndex = spotIndex;
      const spot = this.groupedSpots[dateIndex].spots[spotIndex];
      this.currentSpotNotes = spot.notes || "";
      this.$refs.notesPopup.open();
    },
    /**
     * 添加快速备注标签
     * @param {String} tag 标签文本
     */
    addQuickNote(tag) {
      if (!this.currentSpotNotes) {
        this.currentSpotNotes = tag;
      } else if (!this.currentSpotNotes.includes(tag)) {
        this.currentSpotNotes += "，" + tag;
      }
    },
    /**
     * 确认修改备注
     */
    confirmNotes() {
      if (this.currentDateIndex >= 0 && this.currentSpotIndex >= 0) {
        const spot = this.groupedSpots[this.currentDateIndex].spots[this.currentSpotIndex];
        const index = this.planData.spots.findIndex(
          (s) => s.spot_id === spot.spot_id && s.visit_date === spot.visit_date
        );
        if (index >= 0) {
          this.planData.spots[index].notes = this.currentSpotNotes;
        }
      }
      common_vendor.index.__f__("log", "at pages/plans/plan-edit.vue:555", "景点备注：", this.currentSpotNotes);
      common_vendor.index.__f__("log", "at pages/plans/plan-edit.vue:556", "this.planData", this.planData);
      this.closeNotesPopup();
    },
    /**
     * 关闭备注弹窗
     */
    closeNotesPopup() {
      this.currentDateIndex = -1;
      this.currentSpotIndex = -1;
      this.currentSpotNotes = "";
      this.$refs.notesPopup.close();
    },
    /**
     * 移除景点
     */
    removeSpot(dateIndex, spotIndex) {
      common_vendor.index.showModal({
        title: "确认移除",
        content: "确定要从计划中移除此景点吗？",
        confirmColor: "#FF3B30",
        success: (res) => {
          if (res.confirm) {
            const spot = this.groupedSpots[dateIndex].spots[spotIndex];
            const index = this.planData.spots.findIndex(
              (s) => s.spot_id === spot.spot_id && s.visit_date === spot.visit_date
            );
            if (index >= 0) {
              this.planData.spots.splice(index, 1);
            }
          }
        }
      });
    },
    /**
     * 返回上一页
     */
    navigateBack() {
      common_vendor.index.navigateBack();
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
    }
  },
  computed: {
    /**
     * 按日期分组的景点列表
     */
    groupedSpots() {
      if (!this.planData.spots || !this.planData.spots.length) {
        return [];
      }
      const groups = {};
      this.planData.spots.forEach((spot) => {
        const dateKey = this.formatDate(spot.visit_date);
        if (!groups[dateKey]) {
          groups[dateKey] = {
            date: spot.visit_date,
            spots: []
          };
        }
        groups[dateKey].spots.push(spot);
      });
      return Object.values(groups).sort((a, b) => a.date - b.date);
    }
  }
};
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_uni_icons2 + _easycom_uni_popup2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_popup = () => "../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_popup)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.planData.title,
    b: common_vendor.o(($event) => $data.planData.title = $event.detail.value),
    c: $data.planData.description,
    d: common_vendor.o(($event) => $data.planData.description = $event.detail.value),
    e: common_vendor.t($options.formatDate($data.planData.start_date) || "请选择开始日期"),
    f: common_vendor.p({
      type: "arrowright",
      size: "16",
      color: "#999999"
    }),
    g: $options.formatDate($data.planData.start_date),
    h: common_vendor.o((...args) => $options.onStartDateChange && $options.onStartDateChange(...args)),
    i: common_vendor.t($options.formatDate($data.planData.end_date) || "请选择结束日期"),
    j: common_vendor.p({
      type: "arrowright",
      size: "16",
      color: "#999999"
    }),
    k: $options.formatDate($data.planData.end_date),
    l: common_vendor.o((...args) => $options.onEndDateChange && $options.onEndDateChange(...args)),
    m: $data.planData.is_public,
    n: common_vendor.o((...args) => $options.onPublicChange && $options.onPublicChange(...args)),
    o: common_vendor.p({
      type: "plusempty",
      size: "16",
      color: "#007AFF"
    }),
    p: common_vendor.o((...args) => $options.navigateToSpotSelect && $options.navigateToSpotSelect(...args)),
    q: $data.planData.spots && $data.planData.spots.length > 0
  }, $data.planData.spots && $data.planData.spots.length > 0 ? {
    r: common_vendor.f($options.groupedSpots, (dateGroup, dateIndex, i0) => {
      return {
        a: common_vendor.t($options.formatDate(dateGroup.date)),
        b: common_vendor.t(dateGroup.spots.length),
        c: common_vendor.f(dateGroup.spots, (spot, spotIndex, i1) => {
          return common_vendor.e({
            a: common_vendor.t(spot.spot_detail.name),
            b: "4e4c1b18-3-" + i0 + "-" + i1,
            c: common_vendor.t($options.formatDate(spot.visit_date)),
            d: spot.notes
          }, spot.notes ? {
            e: "4e4c1b18-4-" + i0 + "-" + i1,
            f: common_vendor.p({
              type: "paperplane",
              size: "14",
              color: "#2B9939"
            }),
            g: common_vendor.t(spot.notes)
          } : {}, {
            h: "4e4c1b18-5-" + i0 + "-" + i1,
            i: common_vendor.o(($event) => $options.openNotesPopup(dateIndex, spotIndex), spotIndex),
            j: "4e4c1b18-6-" + i0 + "-" + i1,
            k: common_vendor.o(($event) => $options.removeSpot(dateIndex, spotIndex), spotIndex),
            l: spotIndex
          });
        }),
        d: dateGroup.date
      };
    }),
    s: common_vendor.p({
      type: "calendar",
      size: "14",
      color: "#999999"
    }),
    t: common_vendor.p({
      type: "compose",
      size: "18",
      color: "#007AFF"
    }),
    v: common_vendor.p({
      type: "trash",
      size: "18",
      color: "#FF3B30"
    })
  } : {}, {
    w: common_vendor.o((...args) => $options.navigateBack && $options.navigateBack(...args)),
    x: common_vendor.o((...args) => $options.savePlan && $options.savePlan(...args)),
    y: $data.currentSpotNotes,
    z: common_vendor.o(($event) => $data.currentSpotNotes = $event.detail.value),
    A: common_vendor.t($data.currentSpotNotes.length),
    B: common_vendor.f($data.quickNotes, (tag, index, i0) => {
      return {
        a: common_vendor.t(tag),
        b: index,
        c: common_vendor.o(($event) => $options.addQuickNote(tag), index)
      };
    }),
    C: common_vendor.o((...args) => $options.closeNotesPopup && $options.closeNotesPopup(...args)),
    D: common_vendor.o((...args) => $options.confirmNotes && $options.confirmNotes(...args)),
    E: common_vendor.sr("notesPopup", "4e4c1b18-7"),
    F: common_vendor.p({
      type: "bottom"
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/plans/plan-edit.js.map
