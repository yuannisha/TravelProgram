<template>
	<view class="container">
		<!-- 分类切换 -->
		<view class="tab-bar">
			<view 
				class="tab-item" 
				:class="{ active: activeTab === 'spot' }"
				@click="switchTab('spot')"
			>
				景点收藏
			</view>
			<view 
				class="tab-item" 
				:class="{ active: activeTab === 'plan' }"
				@click="switchTab('plan')"
			>
				计划收藏
			</view>
		</view>

		<!-- 空状态 -->
		<view class="empty" v-if="favoriteList.length === 0">
			<image src="/static/empty/no-favorites.png" mode="aspectFit"></image>
			<text>暂无{{activeTab === 'spot' ? '收藏的景点' : '收藏的旅行计划'}}</text>
			<button class="go-btn" @click="goToList">{{activeTab === 'spot' ? '去发现景点' : '去发现旅行计划'}}</button>
		</view>
		
		<!-- 收藏列表 -->
		<scroll-view 
			v-else
			class="favorite-list" 
			scroll-y 
			@scrolltolower="loadMore"
			refresher-enabled
			:refresher-triggered="isRefreshing"
			@refresherrefresh="refresh"
		>
			<!-- 景点列表 -->
			<template v-if="activeTab === 'spot'">
				<view class="spot-favorite-item" v-for="(item, index) in favoriteList" :key="index">
					<!-- 已删除的景点显示 -->
					<view class="deleted-item" v-if="item.is_deleted">
						<uni-icons type="info" size="20" color="#999"></uni-icons>
						<text class="deleted-text">该景点已不存在</text>
						<button class="remove-btn" @click="cancelFavorite(item, index)">移除</button>
					</view>
					<!-- 正常景点显示 -->
					<view class="content" v-else @click="goToDetail(item)">
						<image class="spot-image" :src="item.detail.imageUrl" mode="aspectFill"></image>
						<view class="info">
							<view class="name-box">
								<text class="name">{{item.detail.name}}</text>
								<view class="rating">
									<uni-icons type="star-filled" size="14" color="#ff9500"></uni-icons>
									<text class="score">{{item.detail.rating}}分</text>
								</view>
							</view>
							
							<view class="location" v-if="item.detail.address">
								<uni-icons type="location" size="14" color="#666"></uni-icons>
								<text class="address">{{item.detail.address}}</text>
							</view>
							
							<view class="tag-list" v-if="item.detail.tags && item.detail.tags.length > 0">
								<text class="tag" v-for="(tag, tagIndex) in item.detail.tags" :key="tagIndex">{{tag}}</text>
							</view>
							
							<view class="bottom-info">
								<view class="price">
									<text class="price-label">门票</text>
									<text class="price-value">¥{{item.detail.price / 100}}起</text>
								</view>
								<text class="time">收藏于 {{formatDate(item.create_date)}}</text>
							</view>
						</view>
					</view>
					<view class="action-box">
						<button class="action-btn" @click="cancelFavorite(item, index)">
							<uni-icons type="trash" size="16" color="#666"></uni-icons>
							<text>取消收藏</text>
						</button>
						<button class="action-btn" @click="share(item)">
							<uni-icons type="redo" size="16" color="#666"></uni-icons>
							<text>分享</text>
						</button>
					</view>
				</view>
			</template>

			<!-- 旅行计划列表 -->
			<template v-else>
				<view class="plan-favorite-item" v-for="(item, index) in favoriteList" :key="index">
					<!-- 已删除的计划显示 -->
					<view class="deleted-item" v-if="item.is_deleted">
						<uni-icons type="info" size="20" color="#999"></uni-icons>
						<text class="deleted-text">该旅行计划已不存在</text>
						<button class="remove-btn" @click="cancelFavorite(item, index)">移除</button>
					</view>
					<!-- 正常计划显示 -->
					<view class="content" v-else @click="goToDetail(item)">
						<!-- 用户信息 -->
						<view class="user-info">
							<image 
								:src="item.detail.user_info?.avatar || '/static/default-avatar.png'" 
								mode="aspectFill" 
								class="avatar"
							></image>
							<text class="username">{{ item.detail.user_info?.username || '用户' }}</text>
							<text class="time">{{ formatDate(item.create_date) }}</text>
						</view>
						
						<!-- 计划标题和状态 -->
						<view class="plan-header">
							<text class="plan-title">{{ item.detail.title }}</text>
							<text :class="['status-tag', getStatusClass(item.detail.status)]">
								{{ getStatusText(item.detail.status) }}
							</text>
						</view>
						
						<!-- 计划日期 -->
						<view class="plan-dates">
							<uni-icons type="calendar" size="16" color="#666"></uni-icons>
							<text>{{ formatDate(item.detail.start_date) }} - {{ formatDate(item.detail.end_date) }}</text>
						</view>
						
						<!-- 计划描述 -->
						<view class="plan-description" v-if="item.detail.description">
							{{ item.detail.description }}
						</view>
						
						<!-- 景点统计 -->
						<view class="plan-stats" v-if="item.detail.spots && item.detail.spots.length > 0">
							<uni-icons type="location" size="16" color="#666"></uni-icons>
							<text>{{ item.detail.spots.length }}个景点</text>
							<text class="duration">{{ getDuration(item.detail.start_date, item.detail.end_date) }}天行程</text>
						</view>
					</view>
					
					<view class="action-box">
						<button class="action-btn" @click="cancelFavorite(item, index)">
							<uni-icons type="trash" size="16" color="#666"></uni-icons>
							<text>取消收藏</text>
						</button>
						<button class="action-btn" @click="share(item)">
							<uni-icons type="redo" size="16" color="#666"></uni-icons>
							<text>分享</text>
						</button>
					</view>
				</view>
			</template>
			
			<!-- 加载更多 -->
			<view class="loading" v-if="loading">
				<text>正在加载...</text>
			</view>
			<view class="no-more" v-if="noMore">
				<text>没有更多了</text>
			</view>
		</scroll-view>
	</view>
</template>

<script>
/**
 * 收藏页面
 * @description 展示用户收藏的景点和旅行计划列表
 */
export default {
	data() {
		return {
			activeTab: 'spot', // 当前激活的标签：spot或plan
			favoriteList: [],
			page: 1,
			pageSize: 10,
			loading: false,
			noMore: false,
			isRefreshing: false
		}
	},
	onShow() {
		// 每次显示页面时刷新数据
		this.refresh()
	},
	methods: {
		// 切换标签
		switchTab(tab) {
			if (this.activeTab !== tab) {
				this.activeTab = tab
				this.refresh()
			}
		},
		
		// 获取收藏列表
		async getFavoriteList() {
			if (this.loading || this.noMore) return
			this.loading = true
			
			try {
				const uid = uni.getStorageSync('userInfo')
				const res = await uniCloud.callFunction({
					name: 'get-favorites',
					data: {
						uid: uid.id,
						page: this.page,
						pageSize: this.pageSize,
						type: this.activeTab
					}
				})
				
				if (res.result.code === 0) {
					const { list, total, deleted_count } = res.result.data
					
					// 如果有被删除的项目,显示提示
					if (deleted_count > 0) {
						uni.showToast({
							title: `${deleted_count}个${this.activeTab === 'spot' ? '景点' : '旅行计划'}已被删除`,
							icon: 'none',
							duration: 2000
						})
					}
					
					if (this.page === 1) {
						this.favoriteList = list
						console.log("this.favoriteList",this.favoriteList)
					} else {
						this.favoriteList = [...this.favoriteList, ...list]
					}
					
					this.noMore = this.favoriteList.length >= total
				}
			} catch (e) {
				console.error('获取收藏列表失败:', e)
				uni.showToast({
					title: '获取收藏列表失败',
					icon: 'none'
				})
			}
			
			this.loading = false
		},
		
		// 取消收藏
		async cancelFavorite(item, index) {
			const message = item.is_deleted 
				? `确定要移除该${this.activeTab === 'spot' ? '景点' : '旅行计划'}吗？`
				: `确定要取消收藏该${this.activeTab === 'spot' ? '景点' : '旅行计划'}吗？`
				
			uni.showModal({
				title: '提示',
				content: message,
				success: async res => {
					if (res.confirm) {
						try {
							const uid = uni.getStorageSync('userInfo')
							const res = await uniCloud.callFunction({
								name: 'toggle-favorite',
								data: {
									type: this.activeTab,
									...(this.activeTab === 'spot' 
										? { spotId: item.spot_id }
										: { planId: item.plan_id }
									),
									uid: uid.id
								}
							})

							if (res.result.code === 0) {
								this.favoriteList.splice(index, 1)
								uni.showToast({
									title: item.is_deleted ? '已移除' : '已取消收藏',
									icon: 'none'
								})
							}
						} catch (e) {
							console.error('操作失败:', e)
							uni.showToast({
								title: '操作失败',
								icon: 'none'
							})
						}
					}
				}
			})
		},
		
		// 下拉刷新
		async refresh() {
			this.isRefreshing = true
			this.page = 1
			this.noMore = false
			await this.getFavoriteList()
			this.isRefreshing = false
		},
		
		// 加载更多
		loadMore() {
			if (!this.noMore) {
				this.page++
				this.getFavoriteList()
			}
		},
		
		// 分享
		share(item) {
			uni.showActionSheet({
				itemList: ['分享到微信', '复制链接'],
				success: res => {
					if (res.tapIndex === 0) {
						// TODO: 调用微信分享
					} else {
						const path = this.activeTab === 'spot' 
							? `/pages/spots/detail?id=${item.spot_id}`
							: `/pages/plans/plan-detail?id=${item.plan_id}`
						uni.setClipboardData({
							data: `https://example.com${path}`,
							success: () => {
								uni.showToast({
									title: '链接已复制',
									icon: 'none'
								})
							}
						})
					}
				}
			})
		},
		
		// 跳转到详情页
		goToDetail(item) {
			if (item.is_deleted) return
			
			const url = this.activeTab === 'spot' 
				? `/pages/spots/detail?id=${item.spot_id}`
				: `/pages/plans/plan-detail?id=${item.plan_id}`
			
			uni.navigateTo({ url })
		},
		
		// 跳转到列表页
		goToList() {
			if (this.activeTab === 'spot') {
				uni.switchTab({
					url: '/pages/spots/spots'
				})
			} else {
				uni.switchTab({
					url: '/pages/plans/public-plans'
				})
			}
		},
		
		// 格式化日期
		formatDate(timestamp) {
			const date = new Date(timestamp)
			return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
		},
		
		// 获取状态文本
		getStatusText(status) {
			const statusMap = {
				0: '计划中',
				1: '进行中',
				2: '已完成'
			}
			return statusMap[status] || '未知'
		},
		
		// 获取状态样式类
		getStatusClass(status) {
			const statusMap = {
				0: 'status-planned',
				1: 'status-ongoing',
				2: 'status-completed'
			}
			return statusMap[status] || ''
		},
		
		// 获取持续时间
		getDuration(startDate, endDate) {
			const start = new Date(startDate)
			const end = new Date(endDate)
			const diffTime = Math.abs(end - start)
			const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
			return diffDays
		}
	}
}
</script>

<style lang="scss">
.container {
	min-height: 100vh;
	background-color: #f5f5f5;
}

.tab-bar {
	display: flex;
	background-color: #fff;
	padding: 20rpx 0;
	position: sticky;
	top: 0;
	z-index: 1;
	
	.tab-item {
		flex: 1;
		text-align: center;
		font-size: 28rpx;
		color: #666;
		position: relative;
		padding: 20rpx 0;
		
		&.active {
			color: #2979ff;
			font-weight: bold;
			
			&::after {
				content: '';
				position: absolute;
				bottom: 0;
				left: 50%;
				transform: translateX(-50%);
				width: 40rpx;
				height: 4rpx;
				background-color: #2979ff;
				border-radius: 2rpx;
			}
		}
	}
}

.empty {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding-top: 200rpx;
	
	image {
		width: 400rpx;
		height: 400rpx;
		margin-bottom: 40rpx;
	}
	
	text {
		font-size: 28rpx;
		color: #999;
		margin-bottom: 40rpx;
	}
	
	.go-btn {
		width: 300rpx;
		height: 80rpx;
		line-height: 80rpx;
		text-align: center;
		background-color: #2979ff;
		color: #fff;
		border-radius: 40rpx;
		font-size: 28rpx;
	}
}

.favorite-list {
	height: calc(100vh - 88rpx);
}

.spot-favorite-item {
	background-color: #fff;
	margin: 20rpx;
	border-radius: 12rpx;
	overflow: hidden;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
	
	.content {
		padding: 0;
	}
	
	.spot-image {
		width: 100%;
		height: 360rpx;
		border-radius: 12rpx 12rpx 0 0;
	}
	
	.info {
		padding: 24rpx;
	}
	
	.name-box {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16rpx;
		
		.name {
			font-size: 32rpx;
			font-weight: bold;
			color: #333;
			flex: 1;
			margin-right: 20rpx;
		}
		
		.rating {
			display: flex;
			align-items: center;
			
			.score {
				font-size: 26rpx;
				color: #ff9500;
				margin-left: 6rpx;
				font-weight: bold;
			}
		}
	}
	
	.location {
		display: flex;
		align-items: center;
		margin-bottom: 16rpx;
		
		.address {
			font-size: 26rpx;
			color: #666;
			margin-left: 8rpx;
			@include text-ellipsis;
		}
	}
	
	.tag-list {
		display: flex;
		flex-wrap: wrap;
		margin-bottom: 16rpx;
		
		.tag {
			font-size: 24rpx;
			color: #2979ff;
			background-color: rgba(41, 121, 255, 0.1);
			padding: 4rpx 16rpx;
			border-radius: 20rpx;
			margin-right: 16rpx;
			margin-bottom: 12rpx;
		}
	}
	
	.bottom-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
		
		.price {
			display: flex;
			align-items: baseline;
			
			.price-label {
				font-size: 24rpx;
				color: #666;
				margin-right: 8rpx;
			}
			
			.price-value {
				font-size: 32rpx;
				color: #ff5a5f;
				font-weight: bold;
			}
		}
		
		.time {
			font-size: 24rpx;
			color: #999;
		}
	}
	
	.action-box {
		display: flex;
		border-top: 2rpx solid #f5f5f5;
		
		.action-btn {
			flex: 1;
			height: 80rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 28rpx;
			color: #666;
			background-color: #fff;
			
			&:first-child {
				border-right: 2rpx solid #f5f5f5;
			}
			
			.uni-icons {
				margin-right: 8rpx;
			}
			
			&:active {
				background-color: #f8f8f8;
			}
		}
	}
}

.plan-favorite-item {
	background-color: #fff;
	margin: 20rpx;
	border-radius: 12rpx;
	overflow: hidden;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
	
	.content {
		padding: 0;
	}
	
	.user-info {
		display: flex;
		align-items: center;
		padding: 24rpx;
		
		.avatar {
			width: 40rpx;
			height: 40rpx;
			border-radius: 50%;
			margin-right: 16rpx;
		}
		
		.username {
			font-size: 28rpx;
			font-weight: bold;
			color: #333;
		}
		
		.time {
			font-size: 24rpx;
			color: #999;
		}
	}
	
	.plan-header {
		padding: 24rpx;
		border-bottom: 2rpx solid #f5f5f5;
		
		.plan-title {
			font-size: 32rpx;
			font-weight: bold;
			color: #333;
		}
		
		.status-tag {
			display: inline-block;
			font-size: 24rpx;
			padding: 4rpx 16rpx;
			border-radius: 20rpx;
			margin-left: 16rpx;
			
			&.status-planned {
				color: #2979ff;
				background-color: rgba(41, 121, 255, 0.1);
			}
			
			&.status-ongoing {
				color: #ff9500;
				background-color: rgba(255, 149, 0, 0.1);
			}
			
			&.status-completed {
				color: #52c41a;
				background-color: rgba(82, 196, 26, 0.1);
			}
		}
	}
	
	.plan-dates {
		padding: 24rpx;
		border-bottom: 2rpx solid #f5f5f5;
		
		.uni-icons {
			margin-right: 8rpx;
		}
		
		text {
			font-size: 24rpx;
			color: #666;
		}
	}
	
	.plan-description {
		padding: 24rpx;
		font-size: 28rpx;
		color: #666;
	}
	
	.plan-stats {
		padding: 24rpx;
		border-top: 2rpx solid #f5f5f5;
		
		.uni-icons {
			margin-right: 8rpx;
		}
		
		text {
			font-size: 24rpx;
			color: #666;
		}
		
		.duration {
			font-size: 24rpx;
			color: #999;
		}
	}
	
	.action-box {
		display: flex;
		border-top: 2rpx solid #f5f5f5;
		
		.action-btn {
			flex: 1;
			height: 80rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 28rpx;
			color: #666;
			background-color: #fff;
			
			&:first-child {
				border-right: 2rpx solid #f5f5f5;
			}
			
			.uni-icons {
				margin-right: 8rpx;
			}
			
			&:active {
				background-color: #f8f8f8;
			}
		}
	}
}

.loading, .no-more {
	text-align: center;
	padding: 30rpx;
	color: #999;
	font-size: 24rpx;
}

.status-tag {
	display: inline-block;
	font-size: 24rpx;
	padding: 4rpx 16rpx;
	border-radius: 20rpx;
	
	&.status-planned {
		color: #2979ff;
		background-color: rgba(41, 121, 255, 0.1);
	}
	
	&.status-ongoing {
		color: #ff9500;
		background-color: rgba(255, 149, 0, 0.1);
	}
	
	&.status-completed {
		color: #52c41a;
		background-color: rgba(82, 196, 26, 0.1);
	}
}

.deleted-item {
	padding: 20rpx;
	background-color: #f8f8f8;
	border-radius: 12rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 20rpx;
	
	.deleted-text {
		color: #999;
		font-size: 28rpx;
		margin-left: 10rpx;
		flex: 1;
	}
	
	.remove-btn {
		background-color: #ff5a5f;
		color: #fff;
		font-size: 24rpx;
		padding: 8rpx 20rpx;
		border-radius: 24rpx;
		margin: 0;
		line-height: 1.5;
	}
}

// 添加文本省略的mixin
@mixin text-ellipsis {
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}
</style> 