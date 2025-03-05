<template>
	<view class="container">
		<view v-if="loading" class="loading">
			<uni-load-more status="loading"></uni-load-more>
		</view>
		
		<block v-else>
			<view class="plan-header">
				<view class="title-section">
					<view class="title">{{ planData.title }}</view>
					<view class="status" :class="'status-' + planData.status">
						{{ getStatusText(planData.status) }}
					</view>
				</view>
				
				<!-- 用户信息（仅在查看模式下显示） -->
				<view class="user-info" v-if="viewMode && planData.user_info">
					<image 
						:src="planData.user_info.avatar || '/static/default-avatar.png'" 
						mode="aspectFill" 
						class="avatar"
					></image>
					<text class="username">{{ planData.user_info.nickname || planData.user_info.username || '用户' }}</text>
				</view>
				
				<view class="date-section">
					<uni-icons type="calendar" size="18" color="#666"></uni-icons>
					<text>{{ formatDate(planData.start_date) }} - {{ formatDate(planData.end_date) }}</text>
				</view>
				
				<view class="desc-section" v-if="planData.description">
					<text>{{ planData.description }}</text>
				</view>
				
				<view class="action-section" v-if="!viewMode">
					<view class="action-btn edit" @click="navigateToEdit">
						<uni-icons type="compose" size="16" color="#007AFF"></uni-icons>
						<text>编辑</text>
					</view>
					<view class="action-btn share" @click="sharePlan">
						<uni-icons type="redo" size="16" color="#4CD964"></uni-icons>
						<text>分享</text>
					</view>
					<view class="action-btn delete" @click="confirmDelete">
						<uni-icons type="trash" size="16" color="#FF3B30"></uni-icons>
						<text>删除</text>
					</view>
				</view>
				
				<!-- 收藏按钮（仅在查看模式下显示） -->
				<view class="action-section" v-if="viewMode">
					<view class="action-btn like" @click="toggleFavorite">
						<uni-icons :type="isFavorite ? 'heart-filled' : 'heart'" size="16" :color="isFavorite ? '#FF5A5F' : '#999'"></uni-icons>
						<text>{{ isFavorite ? '已收藏' : '收藏' }}</text>
					</view>
					<view class="action-btn share" @click="sharePlan">
						<uni-icons type="redo" size="16" color="#4CD964"></uni-icons>
						<text>分享</text>
					</view>
				</view>
			</view>
			
			<view class="spots-section">
				<view class="section-title">景点列表</view>
				
				<view v-if="planData.spots && planData.spots.length > 0" class="spots-list">
					<view 
						v-for="(dateGroup, dateIndex) in groupedSpots" 
						:key="dateIndex" 
						class="date-group"
					>
						<view class="date-header">
							<text class="day-number">第{{ dateGroup.dayNumber }}天</text>
							<text class="date-text">{{ formatDate(dateGroup.date) }}</text>
						</view>
						
						<view 
							v-for="(spot, spotIndex) in dateGroup.spots" 
							:key="spotIndex" 
							class="spot-item"
							@click="navigateToSpotDetail(spot.spot_id)"
						>
							<view class="spot-content">
								<image 
									v-if="spot.spot_detail && spot.spot_detail.imageUrl" 
									:src="spot.spot_detail.imageUrl" 
									mode="aspectFill" 
									class="spot-image"
								></image>
								<image 
									v-else 
									src="/static/spots/default.jpg" 
									mode="aspectFill" 
									class="spot-image"
								></image>
								
								<view class="spot-info">
									<view class="spot-name">{{ spot.spot_detail ? spot.spot_detail.name : '未知景点' }}</view>
									
									<view class="spot-address" v-if="spot.spot_detail && spot.spot_detail.address">
										<uni-icons type="location" size="14" color="#666"></uni-icons>
										<text>{{ spot.spot_detail.address }}</text>
									</view>
									
									<view class="spot-price" v-if="spot.spot_detail && spot.spot_detail.price !== undefined">
										<uni-icons type="rmb" size="14" color="#666"></uni-icons>
										<text>{{ formatPrice(spot.spot_detail.price) }}</text>
									</view>
								</view>
							</view>
							
							<view class="spot-notes" v-if="spot.notes">
								<text class="notes-label">备注：</text>
								<text class="notes-content">{{ spot.notes }}</text>
							</view>
						</view>
					</view>
				</view>
				
				<view v-else class="empty-spots">
					<image src="/static/empty.png" mode="aspectFit" class="empty-image"></image>
					<text>{{ viewMode ? '该用户计划中并无景点' : '暂无景点，请在编辑页面添加景点' }}</text>
					<button v-if="!viewMode" class="add-btn" @click="navigateToEdit">添加景点</button>
				</view>
			</view>
		</block>
	</view>
</template>

<script>
	/**
	 * 旅行计划详情页面
	 * @description 显示旅行计划的详细信息，包括景点列表
	 */
	export default {
		data() {
			return {
				planId: '',
				planData: {},
				loading: true,
				viewMode: false,
				isFavorite: false
			}
		},
		onLoad(options) {
			// 页面加载时检查登录状态
			const app = getApp();
			app.globalData.checkLoginStatus(true); // 强制跳转，因为查看详情必须登录
			console.log("options",options)
			if (options.id) {
				this.planId = options.id;
				// 设置查看模式
				if (options.mode === 'view') {
					this.viewMode = true;
				}
				this.getPlanDetail();
			} else {
				uni.showToast({
					title: '参数错误',
					icon: 'none'
				});
				setTimeout(() => {
					uni.navigateBack();
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
					
					const res = await uniCloud.callFunction({
						name: 'manage-plans',
						data: {
							action: 'get',
							plan_id: this.planId,
							user_id: userId
						}
					});
					
					if (res.result.code === 0) {
						this.planData = res.result.data;
						
						// 如果是查看模式，检查是否已收藏
						if (this.viewMode) {
							this.checkFavorite();
						}
					} else {
						uni.showToast({
							title: res.result.message || '获取计划详情失败',
							icon: 'none'
						});
						setTimeout(() => {
							uni.navigateBack();
						}, 1500);
					}
				} catch (e) {
					console.error('获取计划详情失败', e);
					uni.showToast({
						title: '获取计划详情失败，请稍后重试',
						icon: 'none'
					});
					setTimeout(() => {
						uni.navigateBack();
					}, 1500);
				} finally {
					this.loading = false;
				}
			},
			
			/**
			 * 检查是否已收藏
			 */
			async checkFavorite() {
				// 检查登录状态
				const userInfo = uni.getStorageSync('userInfo');
				if (!userInfo) return;
				
				try {
					const res = await uniCloud.callFunction({
						name: 'get-favorite-status',
						data: {
							uid: userInfo.id,
							type: 'plan',
							planId: this.planId
						}
					});
					
					if (res.result.code === 0) {
						this.isFavorite = res.result.data.isFavorite;
					}
				} catch (e) {
					console.error('检查收藏状态失败', e);
				}
			},
			
			/**
			 * 切换收藏状态
			 */
			async toggleFavorite() {
				// 检查登录状态
				const userInfo = uni.getStorageSync('userInfo');
				if (!userInfo) {
					uni.navigateTo({
						url: '/pages/user/login'
					});
					return;
				}
				
				try {
					// 显示加载中
					uni.showLoading({
						title: '处理中...'
					});
					
					const res = await uniCloud.callFunction({
						name: 'toggle-favorite',
						data: {
							uid: userInfo.id,
							type: 'plan',
							planId: this.planId
						}
					});
					
					if (res.result.code === 0) {
						this.isFavorite = res.result.data.isFavorite;
						uni.showToast({
							title: this.isFavorite ? '收藏成功' : '已取消收藏',
							icon: 'none'
						});
					} else {
						uni.showToast({
							title: res.result.message || '操作失败',
							icon: 'none'
						});
					}
				} catch (e) {
					console.error('收藏操作失败', e);
					uni.showToast({
						title: '操作失败，请稍后重试',
						icon: 'none'
					});
				} finally {
					uni.hideLoading();
				}
			},
			
			/**
			 * 跳转到编辑页面
			 */
			navigateToEdit() {
				uni.navigateTo({
					url: `/pages/plans/plan-edit?id=${this.planId}`
				});
			},
			
			/**
			 * 分享计划
			 */
			sharePlan() {
				// 如果计划不是公开的，提示用户设为公开
				if (!this.planData.is_public) {
					uni.showModal({
						title: '分享提示',
						content: '当前计划为私有状态，需要设为公开才能分享给他人查看，是否设为公开？',
						confirmText: '设为公开',
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
				uni.showActionSheet({
					itemList: ['分享到微信', '复制链接'],
					success: res => {
						if (res.tapIndex === 0) {
							// 分享到微信
							uni.share({
								provider: 'weixin',
								scene: 'WXSceneSession',
								type: 0,
								title: this.planData.title,
								summary: this.planData.description || '快来看看我的旅行计划吧',
								imageUrl: this.planData.spots?.[0]?.spot_detail?.imageUrl || '/static/logo.png',
								href: `https://example.com/pages/plans/plan-detail?id=${this.planId}&mode=view`,
								success: function (res) {
									console.log('分享成功', res);
								},
								fail: function (err) {
									console.log('分享失败', err);
									uni.showToast({
										title: '分享失败',
										icon: 'none'
									});
								}
							});
						} else {
							// 复制链接
							const path = `/pages/plans/plan-detail?id=${this.planId}&mode=view`;
							uni.setClipboardData({
								data: `https://example.com${path}`,
								success: () => {
									uni.showToast({
										title: '链接已复制',
										icon: 'none'
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
				uni.showLoading({
					title: '设置中...'
				});
				
				try {
					const app = getApp();
					const userId = app.globalData.getUserId();
					
					const res = await uniCloud.callFunction({
						name: 'manage-plans',
						data: {
							action: 'update',
							plan_id: this.planId,
							plan: {
								is_public: isPublic
							},
							user_id: userId
						}
					});
					
					if (res.result.code === 0) {
						this.planData.is_public = isPublic;
						uni.showToast({
							title: isPublic ? '已设为公开' : '已设为私有'
						});
					} else {
						uni.showToast({
							title: res.result.message || '设置失败',
							icon: 'none'
						});
					}
				} catch (e) {
					console.error('设置公开状态失败', e);
					uni.showToast({
						title: '设置失败，请稍后重试',
						icon: 'none'
					});
				} finally {
					uni.hideLoading();
				}
			},
			
			/**
			 * 确认删除计划
			 */
			confirmDelete() {
				uni.showModal({
					title: '确认删除',
					content: '确定要删除这个旅行计划吗？',
					confirmColor: '#FF3B30',
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
				uni.showLoading({
					title: '删除中...'
				});
				
				try {
					const app = getApp();
					const userId = app.globalData.getUserId();
					
					const res = await uniCloud.callFunction({
						name: 'manage-plans',
						data: {
							action: 'delete',
							plan_id: this.planId,
							user_id: userId
						}
					});
					
					if (res.result.code === 0) {
						uni.showToast({
							title: '删除成功'
						});
						
						// 返回上一页并刷新列表
						setTimeout(() => {
							const pages = getCurrentPages();
							const prevPage = pages[pages.length - 2];
							
							// 如果上一页是计划列表页，刷新列表
							if (prevPage && prevPage.route === 'pages/plans/plans') {
								prevPage.$vm.getPlans(true);
							}
							
							uni.navigateBack();
						}, 1500);
					} else {
						uni.showToast({
							title: res.result.message || '删除失败',
							icon: 'none'
						});
					}
				} catch (e) {
					console.error('删除计划失败', e);
					uni.showToast({
						title: '删除失败，请稍后重试',
						icon: 'none'
					});
				} finally {
					uni.hideLoading();
				}
			},
			
			/**
			 * 跳转到景点详情页面
			 * @param {String} spotId 景点ID
			 */
			navigateToSpotDetail(spotId) {
				if (!spotId || spotId.startsWith('mock_spot_id_')) {
					uni.showToast({
						title: '模拟景点，无法查看详情',
						icon: 'none'
					});
					return;
				}
				
				uni.navigateTo({
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
					0: '计划中',
					1: '进行中',
					2: '已完成'
				};
				return statusMap[status] || '未知';
			},
			
			/**
			 * 格式化日期
			 * @param {Number|String} timestamp 时间戳
			 * @return {String} 格式化后的日期
			 */
			formatDate(timestamp) {
				if (!timestamp) return '';
				const date = new Date(timestamp);
				return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
			},
			
			/**
			 * 格式化价格
			 * @param {Number} price 价格（单位：分）
			 * @return {String} 格式化后的价格
			 */
			formatPrice(price) {
				if (price === undefined || price === null) return '';
				return '¥' + (price / 100).toFixed(2);
			},
			
			/**
			 * 获取景点的游览天数
			 * @param {Object} spot 景点对象
			 * @return {Number} 游览天数（从计划开始日期算起的第几天）
			 */
			getVisitDay(spot) {
				if (!spot || !spot.visit_date || !this.planData.start_date) return 1;
				
				// 获取日期字符串，不考虑时间部分
				const visitDateStr = this.formatDate(spot.visit_date);
				const startDateStr = this.formatDate(this.planData.start_date);
				
				// 如果日期字符串相同，说明是第一天
				if (visitDateStr === startDateStr) return 1;
				
				// 计算日期差值
				const visitDate = new Date(visitDateStr);
				const startDate = new Date(startDateStr);
				const diffTime = visitDate.getTime() - startDate.getTime();
				const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
				
				return diffDays + 1; // 加1是因为从第一天开始计数
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
				
				// 创建一个按游览日期分组的对象
				const groupsByDate = {};
				
				// 按日期对景点进行分组
				this.planData.spots.forEach(spot => {
					const dateKey = this.formatDate(spot.visit_date);
					if (!groupsByDate[dateKey]) {
						const dayNumber = this.getVisitDay(spot);
						groupsByDate[dateKey] = {
							date: spot.visit_date,
							dayNumber: dayNumber,
							spots: []
						};
					}
					groupsByDate[dateKey].spots.push(spot);
				});
				
				// 将分组对象转换为数组并按日期排序
				return Object.values(groupsByDate).sort((a, b) => a.date - b.date);
			}
		},
		// 监听页面返回
		onShow() {
			// 如果不是第一次加载（即从编辑页面返回），则刷新数据
			if (!this.loading && this.planId) {
				this.getPlanDetail();
			}
		}
	}
</script>

<style lang="scss">
	.container {
		background-color: #f5f5f5;
		min-height: 100vh;
		padding-bottom: 30rpx;
	}
	
	.loading {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 300rpx;
	}
	
	.plan-header {
		background-color: #ffffff;
		padding: 30rpx;
		margin-bottom: 20rpx;
		
		.title-section {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 20rpx;
			
			.title {
				font-size: 36rpx;
				font-weight: bold;
				color: #333333;
				flex: 1;
			}
			
			.status {
				padding: 6rpx 20rpx;
				border-radius: 20rpx;
				font-size: 24rpx;
				
				&.status-0 {
					color: #007AFF;
					background-color: rgba(0, 122, 255, 0.1);
				}
				
				&.status-1 {
					color: #FF9500;
					background-color: rgba(255, 149, 0, 0.1);
				}
				
				&.status-2 {
					color: #4CD964;
					background-color: rgba(76, 217, 100, 0.1);
				}
			}
		}
		
		.user-info {
			display: flex;
			align-items: center;
			margin-bottom: 20rpx;
			padding: 10rpx 0;
			border-bottom: 1rpx solid #f0f0f0;
			
			.avatar {
				width: 60rpx;
				height: 60rpx;
				border-radius: 50%;
				margin-right: 16rpx;
			}
			
			.username {
				font-size: 28rpx;
				color: #333333;
			}
		}
		
		.date-section {
			display: flex;
			align-items: center;
			margin-bottom: 20rpx;
			
			text {
				font-size: 28rpx;
				color: #666666;
				margin-left: 10rpx;
			}
		}
		
		.desc-section {
			margin-bottom: 20rpx;
			
			text {
				font-size: 28rpx;
				color: #666666;
				line-height: 1.5;
			}
		}
		
		.action-section {
			display: flex;
			justify-content: flex-end;
			margin-top: 30rpx;
			padding-top: 20rpx;
			border-top: 1rpx solid #f0f0f0;
			
			.action-btn {
				display: flex;
				align-items: center;
				margin-left: 30rpx;
				
				text {
					font-size: 28rpx;
					margin-left: 6rpx;
				}
				
				&.edit {
					color: #007AFF;
				}
				
				&.share {
					color: #4CD964;
				}
				
				&.delete {
					color: #FF3B30;
				}
				
				&.like {
					color: #999;
					
					&.active {
						color: #FF5A5F;
					}
				}
			}
		}
	}
	
	.spots-section {
		background-color: #ffffff;
		border-radius: 20rpx;
		padding: 30rpx;
		
		.section-title {
			font-size: 32rpx;
			font-weight: bold;
			color: #333333;
			margin-bottom: 30rpx;
		}
		
		.spots-list {
			.date-group {
				margin-bottom: 30rpx;
				
				.date-header {
					display: flex;
					align-items: center;
					padding: 10rpx 0;
					margin-bottom: 20rpx;
					border-bottom: 1rpx solid #f0f0f0;
					
					.day-number {
						padding: 6rpx 16rpx;
						background-color: rgba(0, 122, 255, 0.8);
						color: #ffffff;
						font-size: 24rpx;
						border-radius: 6rpx;
						margin-right: 16rpx;
					}
					
					.date-text {
						font-size: 26rpx;
						color: #666666;
					}
				}
			
				.spot-item {
					margin-bottom: 30rpx;
					padding-bottom: 20rpx;
					border-bottom: 1rpx dashed #f0f0f0;
					
					&:last-child {
						margin-bottom: 0;
						padding-bottom: 0;
						border-bottom: none;
					}
					
					.spot-content {
						display: flex;
						margin-bottom: 20rpx;
						
						.spot-image {
							width: 200rpx;
							height: 150rpx;
							border-radius: 10rpx;
							margin-right: 20rpx;
						}
						
						.spot-info {
							flex: 1;
							
							.spot-name {
								font-size: 30rpx;
								font-weight: bold;
								color: #333333;
								margin-bottom: 10rpx;
							}
							
							.spot-date, .spot-address, .spot-price {
								display: flex;
								align-items: center;
								font-size: 24rpx;
								color: #666666;
								margin-bottom: 10rpx;
								
								text {
									margin-left: 6rpx;
								}
							}
						}
					}
					
					.spot-notes {
						background-color: #f9f9f9;
						padding: 20rpx;
						border-radius: 10rpx;
						font-size: 26rpx;
						
						.notes-label {
							color: #999999;
						}
						
						.notes-content {
							color: #666666;
						}
					}
				}
			}
		}
		
		.empty-spots {
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			padding: 50rpx 0;
			
			.empty-image {
				width: 200rpx;
				height: 200rpx;
				margin-bottom: 30rpx;
			}
			
			text {
				font-size: 28rpx;
				color: #999999;
				margin-bottom: 30rpx;
			}
			
			.add-btn {
				width: 300rpx;
				height: 80rpx;
				line-height: 80rpx;
				border-radius: 40rpx;
				font-size: 30rpx;
				color: #ffffff;
				background-color: #007AFF;
			}
		}
	}
</style> 