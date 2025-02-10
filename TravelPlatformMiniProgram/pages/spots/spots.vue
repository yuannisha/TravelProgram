<template>
	<view class="container">
		<!-- 搜索栏 -->
		<view class="search-box">
			<view class="search-input" @click="goToSearch">
				<text class="iconfont icon-search"></text>
				<text class="placeholder">搜索景点/地点</text>
			</view>
		</view>
		
		<!-- 分类标签 -->
		<scroll-view class="category-scroll" scroll-x>
			<view class="category-list">
				<view 
					class="category-item" 
					:class="{ active: currentCategory === item.id }"
					v-for="(item, index) in categories" 
					:key="index"
					@click="changeCategory(item.id)"
				>
					{{item.name}}
				</view>
			</view>
		</scroll-view>
		
		<!-- 景点列表 -->
		<scroll-view 
			class="spot-scroll" 
			scroll-y 
			@scrolltolower="loadMore"
			refresher-enabled
			:refresher-triggered="isRefreshing"
			@refresherrefresh="refresh"
		>
			<view class="spot-list">
				<view class="spot-item" v-for="(item, index) in spotList" :key="index" @click="goToDetail(item.id)">
					<image :src="item.imageUrl" mode="aspectFill"></image>
					<view class="info">
						<view class="name-box flex justify-between">
							<text class="name">{{item.name}}</text>
							<text class="distance" v-if="item.distance">{{item.distance}}km</text>
						</view>
						<view class="tag-list">
							<text class="tag" v-for="(tag, tagIndex) in item.tags" :key="tagIndex">{{tag}}</text>
						</view>
						<view class="bottom">
							<view class="rating">
								<text class="score">{{item.rating}}分</text>
								<text class="comment">({{item.commentCount}}点评)</text>
							</view>
							<text class="price">¥{{item.price}}起</text>
						</view>
					</view>
				</view>
			</view>
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
 * 景点列表页
 * @description 展示所有景点，支持分类筛选和下拉刷新
 */
export default {
	data() {
		return {
			categories: [
				{ id: 0, name: '全部' },
				{ id: 1, name: '自然风光' },
				{ id: 2, name: '人文古迹' },
				{ id: 3, name: '特色美食' },
				{ id: 4, name: '主题乐园' }
			],
			currentCategory: 0,
			spotList: [],
			page: 1,
			pageSize: 10,
			loading: false,
			noMore: false,
			isRefreshing: false,
			longitude: null,
			latitude: null
		}
	},
	onLoad() {
		// 获取当前位置
		this.getCurrentLocation()
	},
	methods: {
		// 获取当前位置
		getCurrentLocation() {
			uni.getLocation({
				type: 'gcj02',
				success: res => {
					this.longitude = res.longitude
					this.latitude = res.latitude
					this.getSpotList()
				},
				fail: () => {
					// 获取位置失败，仍然获取景点列表，但不会有距离信息
					this.getSpotList()
				}
			})
		},
		
		// 切换分类
		changeCategory(id) {
			if (this.currentCategory === id) return
			this.currentCategory = id
			this.page = 1
			this.spotList = []
			this.noMore = false
			this.getSpotList()
		},
		
		// 获取景点列表
		async getSpotList() {
			if (this.loading || this.noMore) return
			this.loading = true
			
			try {
				const res = await uniCloud.callFunction({
					name: 'get-spots',
					data: {
						categoryId: this.currentCategory,
						page: this.page,
						pageSize: this.pageSize,
						longitude: this.longitude,
						latitude: this.latitude
					}
				})
				
				if (res.result.code === 0) {
					const { list, total } = res.result.data
					
					// 处理数据
					const spots = list.map(item => ({
						id: item._id,
						name: item.name,
						imageUrl: item.imageUrl,
						distance: item.distance ? Number(item.distance.toFixed(1)) : null,
						tags: item.tags || [],
						rating: item.rating,
						commentCount: item.commentCount,
						price: item.price / 100 // 转换为元
					}))
					
					if (this.page === 1) {
						this.spotList = spots
					} else {
						this.spotList = [...this.spotList, ...spots]
					}
					
					this.noMore = this.spotList.length >= total
				}
			} catch (e) {
				console.error('获取景点列表失败:', e)
				uni.showToast({
					title: '获取景点列表失败',
					icon: 'none'
				})
			}
			
			this.loading = false
		},
		
		// 下拉刷新
		async refresh() {
			this.isRefreshing = true
			this.page = 1
			this.spotList = []
			this.noMore = false
			await this.getSpotList()
			this.isRefreshing = false
		},
		
		// 加载更多
		loadMore() {
			if (!this.noMore) {
				this.page++
				this.getSpotList()
			}
		},
		
		// 跳转到搜索页
		goToSearch() {
			uni.navigateTo({
				url: '/pages/spots/search'
			})
		},
		
		// 跳转到详情页
		goToDetail(id) {
			uni.navigateTo({
				url: `/pages/spots/detail?id=${id}`
			})
		}
	}
}
</script>

<style lang="scss">
.container {
	display: flex;
	flex-direction: column;
	height: 100vh;
}

.search-box {
	padding: 20rpx 30rpx;
	background-color: #2B9939;
	
	.search-input {
		display: flex;
		align-items: center;
		height: 72rpx;
		padding: 0 30rpx;
		background: rgba(255, 255, 255, 0.9);
		border-radius: 36rpx;
		
		.icon-search {
			font-size: 32rpx;
			color: #666;
			margin-right: 10rpx;
		}
		
		.placeholder {
			font-size: 28rpx;
			color: #999;
		}
	}
}

.category-scroll {
	background-color: #fff;
	border-bottom: 1rpx solid #eee;
	
	.category-list {
		display: flex;
		padding: 0 20rpx;
		white-space: nowrap;
		
		.category-item {
			padding: 20rpx 30rpx;
			font-size: 28rpx;
			color: #666;
			position: relative;
			
			&.active {
				color: #2B9939;
				font-weight: bold;
				
				&::after {
					content: '';
					position: absolute;
					left: 30rpx;
					right: 30rpx;
					bottom: 10rpx;
					height: 4rpx;
					background-color: #2B9939;
					border-radius: 2rpx;
				}
			}
		}
	}
}

.spot-scroll {
	flex: 1;
	background-color: #f5f5f5;
}

.spot-list {
	padding: 20rpx;
	
	.spot-item {
		margin-bottom: 20rpx;
		background-color: #fff;
		border-radius: 12rpx;
		overflow: hidden;
		
		image {
			width: 100%;
			height: 300rpx;
		}
		
		.info {
			padding: 20rpx;
			
			.name-box {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 16rpx;
				
				.name {
					font-size: 32rpx;
					color: #333;
					font-weight: bold;
				}
				
				.distance {
					font-size: 24rpx;
					color: #999;
				}
			}
			
			.tag-list {
				margin-bottom: 16rpx;
				
				.tag {
					display: inline-block;
					padding: 4rpx 12rpx;
					margin-right: 12rpx;
					font-size: 22rpx;
					color: #2B9939;
					background-color: rgba(43, 153, 57, 0.1);
					border-radius: 4rpx;
				}
			}
			
			.bottom {
				display: flex;
				justify-content: space-between;
				align-items: center;
				
				.rating {
					.score {
						font-size: 28rpx;
						color: #FF9500;
						font-weight: bold;
						margin-right: 8rpx;
					}
					
					.comment {
						font-size: 24rpx;
						color: #999;
					}
				}
				
				.price {
					font-size: 28rpx;
					color: #FF5B05;
					font-weight: bold;
				}
			}
		}
	}
}

.loading, .no-more {
	padding: 30rpx;
	text-align: center;
	
	text {
		font-size: 24rpx;
		color: #999;
	}
}
</style> 