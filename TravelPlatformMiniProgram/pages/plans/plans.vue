<template>
	<view class="container">
		<view class="header">
			<view class="title">我的旅行计划</view>
			<view class="add-btn" @click="navigateToCreate">
				<uni-icons type="plusempty" size="20" color="#FFFFFF">添加</uni-icons>
			</view>
		</view>
		
		<view class="filter-bar">
			<view 
				class="filter-item" 
				:class="{ active: currentStatus === '' }" 
				@click="filterByStatus('')"
			>全部</view>
			<view 
				class="filter-item" 
				:class="{ active: currentStatus === '0' }" 
				@click="filterByStatus('0')"
			>计划中</view>
			<view 
				class="filter-item" 
				:class="{ active: currentStatus === '1' }" 
				@click="filterByStatus('1')"
			>进行中</view>
			<view 
				class="filter-item" 
				:class="{ active: currentStatus === '2' }" 
				@click="filterByStatus('2')"
			>已完成</view>
		</view>
		
		<scroll-view 
			scroll-y 
			class="plan-list" 
			@scrolltolower="loadMore" 
			refresher-enabled 
			:refresher-triggered="refreshing" 
			@refresherrefresh="onRefresh"
		>
			<view v-if="loading && !refreshing" class="loading">
				<uni-load-more status="loading"></uni-load-more>
			</view>
			
			<view v-else-if="planList.length === 0" class="empty">
				<image src="/static/empty.png" mode="aspectFit" class="empty-image"></image>
				<text class="empty-text">暂无旅行计划</text>
				<button class="create-btn" @click="navigateToCreate">创建计划</button>
			</view>
			
			<view v-else class="plan-items">
				<view 
					v-for="(plan, index) in planList" 
					:key="plan._id" 
					class="plan-item"
					@click="navigateToDetail(plan._id)"
				>
					<view class="plan-header">
						<view class="plan-title">{{ plan.title }}</view>
						<view class="plan-status" :class="'status-' + plan.status">
							{{ getStatusText(plan.status) }}
						</view>
					</view>
					
					<view class="plan-date">
						<uni-icons type="calendar" size="16" color="#666"></uni-icons>
						<text>{{ formatDate(plan.start_date) }} - {{ formatDate(plan.end_date) }}</text>
					</view>
					
					<view class="plan-desc" v-if="plan.description">{{ plan.description }}</view>
					
					<view class="plan-spots" v-if="plan.spots && plan.spots.length > 0">
						<text class="spots-count">包含 {{ plan.spots.length }} 个景点</text>
					</view>
					
					<view class="plan-footer">
						<text class="plan-time">{{ formatTime(plan.create_date) }}</text>
						<view class="plan-actions">
							<view class="action-btn edit" @click.stop="navigateToEdit(plan._id)">
								<uni-icons type="compose" size="16" color="#007AFF"></uni-icons>
								<text>编辑</text>
							</view>
							<view class="action-btn delete" @click.stop="confirmDelete(plan._id)">
								<uni-icons type="trash" size="16" color="#FF3B30"></uni-icons>
								<text>删除</text>
							</view>
						</view>
					</view>
				</view>
				
				<uni-load-more v-if="planList.length > 0" :status="loadMoreStatus"></uni-load-more>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	/**
	 * 旅行计划列表页面
	 * @description 显示用户创建的所有旅行计划，支持筛选、刷新和加载更多
	 */
	export default {
		data() {
			return {
				planList: [],
				loading: true,
				refreshing: false,
				currentPage: 1,
				pageSize: 10,
				total: 0,
				noMore: false,
				loadMoreStatus: 'more',
				currentStatus: ''
			}
		},
		onLoad() {
			// 页面加载时检查登录状态
			const app = getApp();
			app.globalData.checkLoginStatus(true); // 强制跳转，因为计划列表必须登录
			
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
					this.loadMoreStatus = 'more';
				}
				
				if (this.noMore && !refresh) {
					return;
				}
				
				this.loading = true;
				
				try {
					const app = getApp();
					const userId = app.globalData.getUserId();
					
					const res = await uniCloud.callFunction({
						name: 'manage-plans',
						data: {
							action: 'list',
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
						this.loadMoreStatus = this.noMore ? 'noMore' : 'more';
					} else {
						uni.showToast({
							title: res.result.message || '获取计划列表失败',
							icon: 'none'
						});
					}
				} catch (e) {
					console.error('获取计划列表失败', e);
					uni.showToast({
						title: '获取计划列表失败，请稍后重试',
						icon: 'none'
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
				uni.navigateTo({
					url: '/pages/plans/plan-edit'
				});
			},
			
			/**
			 * 跳转到编辑计划页面
			 * @param {String} id 计划ID
			 */
			navigateToEdit(id) {
				uni.navigateTo({
					url: `/pages/plans/plan-edit?id=${id}`
				});
			},
			
			/**
			 * 跳转到计划详情页面
			 * @param {String} id 计划ID
			 */
			navigateToDetail(id) {
				uni.navigateTo({
					url: `/pages/plans/plan-detail?id=${id}`
				});
			},
			
			/**
			 * 确认删除计划
			 * @param {String} id 计划ID
			 */
			confirmDelete(id) {
				uni.showModal({
					title: '确认删除',
					content: '确定要删除这个旅行计划吗？',
					confirmColor: '#FF3B30',
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
				uni.showLoading({
					title: '删除中...'
				});
				console.log("计划id",id)
				try {
					const res = await uniCloud.callFunction({
						name: 'manage-plans',
						data: {
							action: 'delete',
							plan_id: id,
							user_id: getApp().globalData.getUserId()
						}
					});
					
					if (res.result.code === 0) {
						uni.showToast({
							title: '删除成功'
						});
						
						// 从列表中移除
						this.planList = this.planList.filter(plan => plan._id !== id);
						
						// 如果删除后列表为空且有更多数据，重新加载
						if (this.planList.length === 0 && this.total > 0) {
							this.getPlans(true);
						}
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
			 * 格式化时间
			 * @param {Number|String} timestamp 时间戳
			 * @return {String} 格式化后的时间
			 */
			formatTime(timestamp) {
				if (!timestamp) return '';
				const date = new Date(timestamp);
				return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
			}
		}
	}
</script>

<style lang="scss">
	.container {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background-color: #f5f5f5;
	}
	
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20rpx 30rpx;
		background-color: #ffffff;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
		
		.title {
			font-size: 36rpx;
			font-weight: bold;
			color: #333333;
		}
		
		.add-btn {
			display: flex;
			justify-content: center;
			align-items: center;
			width: 80rpx;
			height: 80rpx;
			border-radius: 50%;
			background-color: #007AFF;
		}
	}
	
	.filter-bar {
		display: flex;
		padding: 20rpx 30rpx;
		background-color: #ffffff;
		margin-top: 20rpx;
		
		.filter-item {
			padding: 10rpx 30rpx;
			margin-right: 20rpx;
			border-radius: 30rpx;
			font-size: 28rpx;
			color: #666666;
			background-color: #f5f5f5;
			
			&.active {
				color: #ffffff;
				background-color: #007AFF;
			}
		}
	}
	
	.plan-list {
		flex: 1;
		padding: 20rpx 30rpx;
	}
	
	.loading, .empty {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		height: 300rpx;
	}
	
	.empty {
		padding: 100rpx 0;
		
		.empty-image {
			width: 200rpx;
			height: 200rpx;
			margin-bottom: 30rpx;
		}
		
		.empty-text {
			font-size: 30rpx;
			color: #999999;
			margin-bottom: 30rpx;
		}
		
		.create-btn {
			width: 300rpx;
			height: 80rpx;
			line-height: 80rpx;
			border-radius: 40rpx;
			font-size: 30rpx;
			color: #ffffff;
			background-color: #007AFF;
		}
	}
	
	.plan-items {
		.plan-item {
			margin-bottom: 30rpx;
			padding: 30rpx;
			border-radius: 20rpx;
			background-color: #ffffff;
			box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
			
			.plan-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 20rpx;
				
				.plan-title {
					font-size: 32rpx;
					font-weight: bold;
					color: #333333;
				}
				
				.plan-status {
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
			
			.plan-date {
				display: flex;
				align-items: center;
				margin-bottom: 20rpx;
				font-size: 28rpx;
				color: #666666;
				
				text {
					margin-left: 10rpx;
				}
			}
			
			.plan-desc {
				margin-bottom: 20rpx;
				font-size: 28rpx;
				color: #666666;
				line-height: 1.5;
			}
			
			.plan-spots {
				margin-bottom: 20rpx;
				
				.spots-count {
					font-size: 26rpx;
					color: #999999;
				}
			}
			
			.plan-footer {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding-top: 20rpx;
				border-top: 1rpx solid #f0f0f0;
				
				.plan-time {
					font-size: 24rpx;
					color: #999999;
				}
				
				.plan-actions {
					display: flex;
					
					.action-btn {
						display: flex;
						align-items: center;
						margin-left: 30rpx;
						
						text {
							margin-left: 6rpx;
							font-size: 26rpx;
						}
						
						&.edit {
							color: #007AFF;
						}
						
						&.delete {
							color: #FF3B30;
						}
					}
				}
			}
		}
	}
</style> 