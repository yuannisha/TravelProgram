<template>
	<view class="container">
		<view class="header">
			<view class="title">旅行灵感</view>
			<view class="subtitle">发现更多精彩旅行计划</view>
		</view>
		
		<view class="search-bar">
			<view class="search-input">
				<uni-icons type="search" size="18" color="#999"></uni-icons>
				<input 
					type="text" 
					v-model="keyword" 
					placeholder="搜索旅行计划" 
					confirm-type="search"
					@confirm="onSearch"
				/>
				<uni-icons 
					v-if="keyword" 
					type="clear" 
					size="18" 
					color="#999" 
					@click="clearKeyword"
				></uni-icons>
			</view>
			<view class="search-btn" @click="onSearch">搜索</view>
		</view>
		
		<scroll-view 
			scroll-y 
			class="plan-list" 
			@scrolltolower="loadMore"
			refresher-enabled
			:refresher-triggered="refreshing"
			@refresherrefresh="onRefresh"
		>
			<view v-if="loading && !list.length" class="loading-box">
				<uni-load-more status="loading" :content-text="loadingText"></uni-load-more>
			</view>
			
			<view v-else-if="!loading && !list.length && !isSearching" class="empty-box">
				<image src="/static/empty.png" mode="aspectFit"></image>
				<view class="empty-text">暂无公开旅行计划</view>
				<button class="create-btn" @click="goToCreate">创建我的计划</button>
			</view>
			
			<view v-else-if="!loading && !list.length && isSearching" class="empty-box">
				<image src="/static/empty-search.png" mode="aspectFit"></image>
				<view class="empty-text">未找到相关旅行计划</view>
				<button class="reset-btn" @click="resetSearch">重置搜索</button>
			</view>
			
			<view v-else class="plan-items">
				<view 
					v-for="(item, index) in list" 
					:key="item._id" 
					class="plan-item"
					@click="viewDetail(item._id,item.user_info)"
				>
					<view class="user-info">
						<image 
							:src="item.user_info.avatar || '/static/default-avatar.png'" 
							mode="aspectFill" 
							class="avatar"
						></image>
						<text class="username">{{item.user_info.nickname || item.user_info.username || '用户'}}</text>
						<view class="status-tag" :class="'status-' + item.status">
							{{statusText[item.status]}}
						</view>
					</view>
					
					<view class="plan-content">
						<view class="plan-title">{{item.title}}</view>
						<view class="plan-date">
							{{formatDate(item.start_date)}} - {{formatDate(item.end_date)}}
						</view>
						<view class="plan-desc" v-if="item.description">{{item.description}}</view>
						<view class="plan-spots" v-if="item.spots && item.spots.length">
							包含 {{item.spots.length}} 个景点
						</view>
					</view>
					
					<view class="action-bar">
						<view class="time-ago">{{formatTimeAgo(item.create_date)}}</view>
						<view class="actions">
							<view v-if="item.is_public && item.user_info._id !== userInfo.id" class="action-btn like">
								<uni-icons type="heart" size="18" color="#999"></uni-icons>
								<text>收藏</text>
							</view>
							<view v-if="item.is_public && item.user_info._id !== userInfo.id" class="action-btn share">
								<uni-icons type="redo" size="18" color="#999"></uni-icons>
								<text>分享</text>
							</view>
						</view>
					</view>
				</view>
			</view>
			
			<uni-load-more 
				v-if="list.length > 0" 
				:status="loadMoreStatus" 
				:content-text="loadingText"
			></uni-load-more>
		</scroll-view>
	</view>
</template>

<script>
	/**
	 * 公共旅行计划页面
	 * @description 展示其他用户分享的旅行计划
	 */
	export default {
		data() {
			return {
				list: [],
				loading: true,
				refreshing: false,
				page: 1,
				pageSize: 10,
				total: 0,
				loadMoreStatus: 'more',
				keyword: '',
				isSearching: false,
				loadingText: {
					contentdown: '上拉加载更多',
					contentrefresh: '加载中...',
					contentnomore: '没有更多了'
				},
				statusText: {
					0: '计划中',
					1: '进行中',
					2: '已完成'
				},
				userInfo: uni.getStorageSync('userInfo')
			}
		},
        onShow() {
			// 页面加载时检查登录状态
			const app = getApp();
			app.globalData.checkLoginStatus(true); // 修改为强制跳转
			this.userInfo = uni.getStorageSync('userInfo');
			
			this.getPublicPlans();
		},
		onLoad() {
			// 页面加载时检查登录状态
			const app = getApp();
			app.globalData.checkLoginStatus(true); // 修改为强制跳转
			this.userInfo = uni.getStorageSync('userInfo');
			
			this.getPublicPlans();
		},
		methods: {
			/**
			 * 获取公开旅行计划列表
			 */
			async getPublicPlans() {
				try {
					this.loading = true;
					
					const app = getApp();
					const userId = app.globalData.getUserId();
					
					const res = await uniCloud.callFunction({
						name: 'manage-plans',
						data: {
							action: 'public', // 修正参数名称
							page: this.page,
							pageSize: this.pageSize,
							keyword: this.keyword,
							user_id: userId
						}
					});
					
					if (res.result.code === 0) {
						const { list, total } = res.result.data;
						
						if (this.page === 1) {
							this.list = list;
						} else {
							this.list = [...this.list, ...list];
						}
						console.log("this.list",this.list);
						this.total = total;
						
						if (this.list.length >= total) {
							this.loadMoreStatus = 'noMore';
						} else {
							this.loadMoreStatus = 'more';
						}
					} else {
						uni.showToast({
							title: res.result.message || '获取失败',
							icon: 'none'
						});
					}
				} catch (e) {
					console.error('获取公开旅行计划失败', e);
					uni.showToast({
						title: '获取失败，请稍后重试',
						icon: 'none'
					});
				} finally {
					this.loading = false;
					this.refreshing = false;
				}
			},
			
			/**
			 * 加载更多
			 */
			loadMore() {
				if (this.loadMoreStatus !== 'more' || this.loading) return;
				
				this.page++;
				this.loadMoreStatus = 'loading';
				this.getPublicPlans();
			},
			
			/**
			 * 下拉刷新
			 */
			onRefresh() {
				this.refreshing = true;
				this.page = 1;
				this.getPublicPlans();
			},
			
			/**
			 * 搜索
			 */
			onSearch() {
				if (!this.keyword.trim()) {
					if (this.isSearching) {
						this.resetSearch();
					}
					return;
				}
				
				this.isSearching = true;
				this.page = 1;
				this.getPublicPlans();
			},
			
			/**
			 * 清除关键词
			 */
			clearKeyword() {
				this.keyword = '';
				if (this.isSearching) {
					this.resetSearch();
				}
			},
			
			/**
			 * 重置搜索
			 */
			resetSearch() {
				this.keyword = '';
				this.isSearching = false;
				this.page = 1;
				this.getPublicPlans();
			},
			
			/**
			 * 查看计划详情
			 * @param {String} id 计划ID
			 */
			viewDetail(id,user_info) {
				if (user_info._id === getApp().globalData.getUserId()) {
				uni.navigateTo({
					url: `/pages/plans/plan-detail?id=${id}`
				});
			} else {
				uni.navigateTo({
					url: `/pages/plans/plan-detail?id=${id}&mode=view`
				});
			}
			},
			
			/**
			 * 跳转到创建页面
			 */
			goToCreate() {
				uni.navigateTo({
					url: '/pages/plans/plan-edit'
				});
			},
			
			/**
			 * 格式化日期
			 * @param {String|Number} timestamp 时间戳
			 * @returns {String} 格式化后的日期
			 */
			formatDate(timestamp) {
				if (!timestamp) return '';
				
				const date = new Date(timestamp);
				const year = date.getFullYear();
				const month = (date.getMonth() + 1).toString().padStart(2, '0');
				const day = date.getDate().toString().padStart(2, '0');
				
				return `${year}-${month}-${day}`;
			},
			
			/**
			 * 格式化时间为多久前
			 * @param {String|Number} timestamp 时间戳
			 * @returns {String} 多久前
			 */
			formatTimeAgo(timestamp) {
				if (!timestamp) return '';
				
				const now = new Date();
				const date = new Date(timestamp);
				const diff = Math.floor((now - date) / 1000);
				
				if (diff < 60) {
					return '刚刚';
				} else if (diff < 3600) {
					return Math.floor(diff / 60) + '分钟前';
				} else if (diff < 86400) {
					return Math.floor(diff / 3600) + '小时前';
				} else if (diff < 2592000) {
					return Math.floor(diff / 86400) + '天前';
				} else if (diff < 31536000) {
					return Math.floor(diff / 2592000) + '个月前';
				} else {
					return Math.floor(diff / 31536000) + '年前';
				}
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
		padding: 30rpx;
		background-color: #ffffff;
		
		.title {
			font-size: 36rpx;
			font-weight: bold;
			color: #333;
			margin-bottom: 10rpx;
		}
		
		.subtitle {
			font-size: 24rpx;
			color: #999;
		}
	}
	
	.search-bar {
		display: flex;
		align-items: center;
		padding: 20rpx 30rpx;
		background-color: #ffffff;
		border-bottom: 1rpx solid #eee;
		
		.search-input {
			flex: 1;
			display: flex;
			align-items: center;
			background-color: #f5f5f5;
			border-radius: 36rpx;
			padding: 0 20rpx;
			height: 72rpx;
			margin-right: 20rpx;
			
			input {
				flex: 1;
				height: 72rpx;
				font-size: 28rpx;
				margin: 0 20rpx;
			}
		}
		
		.search-btn {
			font-size: 28rpx;
			color: #007AFF;
		}
	}
	
	.plan-list {
		flex: 1;
		padding: 20rpx;
	}
	
	.loading-box, .empty-box {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 100rpx 0;
		
		image {
			width: 200rpx;
			height: 200rpx;
			margin-bottom: 30rpx;
		}
		
		.empty-text {
			font-size: 28rpx;
			color: #999;
			margin-bottom: 30rpx;
		}
		
		.create-btn, .reset-btn {
			width: 300rpx;
			height: 80rpx;
			line-height: 80rpx;
			text-align: center;
			font-size: 28rpx;
			color: #ffffff;
			background-color: #007AFF;
			border-radius: 40rpx;
		}
		
		.reset-btn {
			background-color: #f0f0f0;
			color: #666;
		}
	}
	
	.plan-items {
		.plan-item {
			background-color: #ffffff;
			border-radius: 12rpx;
			padding: 30rpx;
			margin-bottom: 20rpx;
			box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
		}
		
		.user-info {
			display: flex;
			align-items: center;
			margin-bottom: 20rpx;
			
			.avatar {
				width: 60rpx;
				height: 60rpx;
				border-radius: 50%;
				margin-right: 16rpx;
			}
			
			.username {
				font-size: 28rpx;
				color: #333;
				flex: 1;
			}
			
			.status-tag {
				font-size: 24rpx;
				padding: 4rpx 16rpx;
				border-radius: 20rpx;
				
				&.status-0 {
					background-color: #e6f7ff;
					color: #1890ff;
				}
				
				&.status-1 {
					background-color: #fff7e6;
					color: #fa8c16;
				}
				
				&.status-2 {
					background-color: #f6ffed;
					color: #52c41a;
				}
			}
		}
		
		.plan-content {
			margin-bottom: 20rpx;
			
			.plan-title {
				font-size: 32rpx;
				font-weight: bold;
				color: #333;
				margin-bottom: 10rpx;
			}
			
			.plan-date {
				font-size: 24rpx;
				color: #666;
				margin-bottom: 16rpx;
			}
			
			.plan-desc {
				font-size: 28rpx;
				color: #666;
				margin-bottom: 16rpx;
				line-height: 1.5;
				display: -webkit-box;
				-webkit-box-orient: vertical;
				-webkit-line-clamp: 2;
				overflow: hidden;
			}
			
			.plan-spots {
				font-size: 24rpx;
				color: #999;
			}
		}
		
		.action-bar {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding-top: 20rpx;
			border-top: 1rpx solid #f0f0f0;
			
			.time-ago {
				font-size: 24rpx;
				color: #999;
			}
			
			.actions {
				display: flex;
				
				.action-btn {
					display: flex;
					align-items: center;
					margin-left: 30rpx;
					
					text {
						font-size: 24rpx;
						color: #999;
						margin-left: 6rpx;
					}
				}
			}
		}
	}
</style> 