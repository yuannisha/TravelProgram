<template>
	<view class="container">
		<!-- 搜索栏 -->
		<view class="search-box">
			<view class="search-input" @click="goToSearch">
				<text class="iconfont icon-search"></text>
				<text class="placeholder">搜索景点/地点</text>
			</view>
		</view>

		<!-- 轮播图 -->
		<swiper class="banner" circular autoplay interval="3000" duration="1000" indicator-dots indicator-active-color="#2B9939">
			<swiper-item v-for="(item, index) in bannerList" :key="index" @click="goToSpotDetail(item.id)">
				<image :src="item.imageUrl" mode="aspectFill"></image>
			</swiper-item>
		</swiper>

		<!-- 分类导航 -->
		<view class="nav-grid">
			<view class="nav-item" v-for="(item, index) in categories" :key="index" @click="goToCategory(item.id)">
				<image :src="item.icon" mode="aspectFit"></image>
				<text>{{item.name}}</text>
			</view>
		</view>

		<!-- 推荐景点 -->
		<view class="recommend-section">
			<view class="section-header">
				<text class="title">热门推荐</text>
				<text class="more" @click="goToSpots">查看更多</text>
			</view>
			<view class="spot-list">
				<view class="spot-item" v-for="(item, index) in recommendSpots" :key="index" @click="goToSpotDetail(item.id)">
					<image :src="item.imageUrl" mode="aspectFill"></image>
					<view class="spot-info">
						<text class="name">{{item.name}}</text>
						<view class="rating">
							<text class="score">{{item.rating}}分</text>
							<text class="price">¥{{item.price}}起</text>
						</view>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 旅行计划 -->
		<view class="plan-section">
			<view class="section-header">
				<text class="title">精选旅行计划</text>
				<text class="more" @click="goToPublicPlans">查看更多</text>
			</view>
			<view class="plan-list">
				<view v-if="loading" class="loading-plans">
					<uni-load-more status="loading"></uni-load-more>
				</view>
				<view v-else-if="publicPlans.length > 0" class="plan-scroll">
					<scroll-view scroll-x class="scroll-view">
						<view 
							class="plan-item" 
							v-for="(item, index) in publicPlans" 
							:key="index"
							@click="goToPlanDetail(item._id,item.user_info)"
						>
							<view class="plan-top">
								<view class="user-info">
									<image 
										:src="item.user_info.avatar ? item.user_info.avatar : '/static/avatar/default.png'" 
										mode="aspectFill" 
										class="avatar"
									></image>
									<text class="username">{{ item.user_info.username || '用户' }}</text>
								</view>
								<view class="status" :class="'status-' + item.status">
									{{ getStatusText(item.status) }}
								</view>
							</view>
							<view class="plan-content">
								<text class="plan-title">{{ item.title }}</text>
								<view class="plan-date">
									<text>{{ formatDate(item.start_date) }} - {{ formatDate(item.end_date) }}</text>
								</view>
								<view class="plan-spots">
									<text>{{ item.spots ? item.spots.length : 0 }}个景点</text>
								</view>
							</view>
						</view>
					</scroll-view>
				</view>
				<view v-else class="empty-plans">
					<text>暂无公开的旅行计划</text>
					<button class="create-btn" @click="goToCreatePlan">创建我的计划</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
/**
 * 首页
 * @description 展示轮播图、分类导航和推荐景点
 */
export default {
	data() {
		return {
			bannerList: [],
			categories: [
				{
					id: 1,
					name: '自然风光',
					icon: '/static/icons/nature.png'
				},
				{
					id: 2,
					name: '人文古迹',
					icon: '/static/icons/culture.png'
				},
				{
					id: 3,
					name: '特色美食',
					icon: '/static/icons/food.png'
				},
				{
					id: 4,
					name: '主题乐园',
					icon: '/static/icons/park.png'
				}
			],
			recommendSpots: [],
			publicPlans: [],
			loading: false
		}
	},
	onShow() {

		this.getBannerList()
		this.getRecommendSpots()
		this.getPublicPlans()
		// 页面加载时检查登录状态
		const app = getApp();
		app.globalData.checkLoginStatus(true); 
		
	},
	onLoad() {
		// 页面加载时检查登录状态
		const app = getApp();
		app.globalData.checkLoginStatus(true);
	},
	methods: {
		// 获取轮播图数据
		async getBannerList() {
			try {
				const res = await uniCloud.callFunction({
					name: 'get-spots',
					data: {
						page: 1,
						pageSize: 3,
						sortBy: 'rating',
						sortOrder: 'desc'
					}
				})
				console.log("轮播图结果：",res)	
				if (res.result.code === 0) {
					this.bannerList = res.result.data.list.map(item => ({
						id: item._id,
						imageUrl: item.imageUrl
					}))
				}
			} catch (e) {
				console.error('获取轮播图失败:', e)
			}
		},
		
		// 获取推荐景点
		async getRecommendSpots() {
			try {
				const res = await uniCloud.callFunction({
					name: 'get-spots',
					data: {
						page: 1,
						pageSize: 6,
						sortBy: 'commentCount',
						sortOrder: 'desc'
					}
				})
				console.log("推荐景点结果：",res)	
				if (res.result.code === 0) {
					this.recommendSpots = res.result.data.list.map(item => ({
						id: item._id,
						name: item.name,
						imageUrl: item.imageUrl,
						rating: item.rating,
						price: item.price / 100 // 转换为元
					}))
				}
			} catch (e) {
				console.error('获取推荐景点失败:', e)
			}
		},
		// 跳转到搜索页
		goToSearch() {
			uni.navigateTo({
				url: '/pages/spots/search'
			})
		},
		goToSpotDetail(id) {
			// 跳转到景点详情页
			uni.navigateTo({
				url: `/pages/spots/detail?id=${id}`
			})
		},
		goToCategory(id) {
			// 跳转到分类页面
			uni.switchTab({
				url: '/pages/spots/spots'
			})
		},
		goToSpots() {
			// 跳转到景点列表页
			uni.switchTab({
				url: '/pages/spots/spots'
			})
		},
		
		/**
		 * 获取公开旅行计划
		 */
		async getPublicPlans() {
			this.loading = true;
			console.log("获取公开旅行计划",getApp().globalData.getUserId())
			try {
				const res = await uniCloud.callFunction({
					name: 'manage-plans',
					data: {
						action: 'public',
						page: 1,
						pageSize: 5,
						user_id: getApp().globalData.getUserId() || ''
					}
				});
				
				if (res.result.code === 0) {
					this.publicPlans = res.result.data.list;
					console.log("公开旅行计划结果：",this.publicPlans)
				} else {
					console.error('获取公开旅行计划失败:', res.result.message);
				}
			} catch (e) {
				console.error('获取公开旅行计划失败:', e);
			} finally {
				this.loading = false;
			}
		},
		
		/**
		 * 跳转到公开旅行计划页面
		 */
		goToPublicPlans() {
			uni.switchTab({
				url: '/pages/plans/public-plans'
			});
		},
		
		/**
		 * 跳转到计划详情页面
		 * @param {String} id 计划ID
		 */
		goToPlanDetail(id,user_info) {
			console.log("user_info",user_info)
			console.log("getApp().globalData.getUserId()",getApp().globalData.getUserId())
			console.log("user_info._id === getApp().globalData.getUserId()",user_info._id === getApp().globalData.getUserId())
			// 判断该计划是否是自己的计划
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
		 * 跳转到创建计划页面
		 */
		goToCreatePlan() {
			// 检查登录状态
			const token = uni.getStorageSync('token');
			if (!token) {
				uni.navigateTo({
					url: '/pages/user/login'
				});
				return;
			}
			
			uni.navigateTo({
				url: '/pages/plans/plan-edit'
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
		}
	}
}
</script>

<style lang="scss">
.container {
	padding-bottom: 20rpx;
}

.search-box {
	display: flex;
	align-items: center;
	background-color: #fff;
	border-radius: 36rpx;
	padding: 0 30rpx;
	height: 72rpx;
	margin: 20rpx 30rpx;
	
	.iconfont {
		font-size: 36rpx;
		color: #999;
		margin-right: 10rpx;
	}
	
	input {
		flex: 1;
		height: 100%;
		font-size: 28rpx;
		color: #333;
		
		&::placeholder {
			color: #999;
		}
	}
}

.banner {
	width: 100%;
	height: 300rpx;
	
	image {
		width: 100%;
		height: 100%;
	}
}

.nav-grid {
	display: flex;
	flex-wrap: wrap;
	padding: 30rpx 20rpx;
	background-color: #fff;
	
	.nav-item {
		width: 25%;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 20rpx 0;
		
		image {
			width: 80rpx;
			height: 80rpx;
			margin-bottom: 10rpx;
		}
		
		text {
			font-size: 24rpx;
			color: #333;
		}
	}
}

.recommend-section {
	margin-top: 20rpx;
	background-color: #fff;
	padding: 20rpx;
	
	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
		
		.title {
			font-size: 32rpx;
			font-weight: bold;
			color: #333;
		}
		
		.more {
			font-size: 24rpx;
			color: #666;
		}
	}
	
	.spot-list {
		.spot-item {
			margin-bottom: 20rpx;
			
			image {
				width: 100%;
				height: 300rpx;
				border-radius: 12rpx;
			}
			
			.spot-info {
				padding: 16rpx 10rpx;
				
				.name {
					font-size: 28rpx;
					color: #333;
					font-weight: bold;
				}
				
				.rating {
					margin-top: 10rpx;
					display: flex;
					justify-content: space-between;
					
					.score {
						font-size: 24rpx;
						color: #FF9500;
					}
					
					.price {
						font-size: 24rpx;
						color: #FF5B05;
					}
				}
			}
		}
	}
}

.plan-section {
	margin-top: 20rpx;
	background-color: #fff;
	padding: 20rpx;
	
	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
		
		.title {
			font-size: 32rpx;
			font-weight: bold;
			color: #333;
		}
		
		.more {
			font-size: 24rpx;
			color: #999;
		}
	}
	
	.loading-plans {
		height: 200rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.plan-scroll {
		.scroll-view {
			white-space: nowrap;
			
			.plan-item {
				display: inline-block;
				width: 400rpx;
				margin-right: 20rpx;
				background-color: #f8f8f8;
				border-radius: 12rpx;
				padding: 20rpx;
				box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
				
				&:last-child {
					margin-right: 0;
				}
				
				.plan-top {
					display: flex;
					justify-content: space-between;
					align-items: center;
					margin-bottom: 15rpx;
					
					.user-info {
						display: flex;
						align-items: center;
						
						.avatar {
							width: 40rpx;
							height: 40rpx;
							border-radius: 50%;
							margin-right: 10rpx;
						}
						
						.username {
							font-size: 24rpx;
							color: #666;
							white-space: nowrap;
							overflow: hidden;
							text-overflow: ellipsis;
							max-width: 150rpx;
						}
					}
					
					.status {
						padding: 4rpx 12rpx;
						border-radius: 20rpx;
						font-size: 20rpx;
						
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
				
				.plan-content {
					.plan-title {
						font-size: 28rpx;
						font-weight: bold;
						color: #333;
						margin-bottom: 10rpx;
						white-space: nowrap;
						overflow: hidden;
						text-overflow: ellipsis;
					}
					
					.plan-date, .plan-spots {
						font-size: 22rpx;
						color: #999;
						margin-bottom: 6rpx;
					}
				}
			}
		}
	}
	
	.empty-plans {
		height: 200rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		
		text {
			font-size: 26rpx;
			color: #999;
			margin-bottom: 20rpx;
		}
		
		.create-btn {
			font-size: 24rpx;
			color: #fff;
			background-color: #2B9939;
			border-radius: 30rpx;
			padding: 10rpx 30rpx;
			line-height: 1.5;
		}
	}
}
</style>
