<template>
	<view class="container">
		<!-- 空状态 -->
		<view class="empty" v-if="favoriteList.length === 0">
			<image src="/static/empty/no-favorites.png" mode="aspectFit"></image>
			<text>暂无收藏的景点</text>
			<button class="go-btn" @click="goToSpots">去发现景点</button>
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
			<view class="favorite-item" v-for="(item, index) in favoriteList" :key="index">
				<view class="content" @click="goToSpotDetail(item.id)">
					<image class="spot-image" :src="item.imageUrl" mode="aspectFill"></image>
					<view class="info">
						<view class="name-box">
							<text class="name">{{item.name}}</text>
							<text class="time">{{item.favoriteTime}}</text>
						</view>
						<view class="rating">
							<text class="score">{{item.rating}}分</text>
							<text class="price">¥{{item.price}}起</text>
						</view>
						<view class="tag-list">
							<text class="tag" v-for="(tag, tagIndex) in item.tags" :key="tagIndex">{{tag}}</text>
						</view>
					</view>
				</view>
				<view class="action-box">
					<button class="action-btn" @click="cancelFavorite(item, index)">
						<text class="iconfont icon-delete"></text>
						<text>取消收藏</text>
					</button>
					<button class="action-btn" @click="share(item)">
						<text class="iconfont icon-share"></text>
						<text>分享</text>
					</button>
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
 * 收藏页面
 * @description 展示用户收藏的景点列表
 */
export default {
	data() {
		return {
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
		// 获取收藏列表
		async getFavoriteList() {
			if (this.loading || this.noMore) return
			this.loading = true
			
			try {
				const uid = uni.getStorageSync('userInfo')
				console.log("uid",uid)
				const res = await uniCloud.callFunction({
					name: 'get-favorites',
					data: {
						uid: uid.id,
						page: this.page,
						pageSize: this.pageSize
					}
				})
				console.log("res",res)
				if (res.result.code === 0) {
					console.log("获取收藏列表成功",res)
					const { list, total } = res.result.data
					// 使用 Promise.all 处理异步操作
					const promises = list.map(item => 
						uniCloud.callFunction({
							name: 'get-spot-withId',
							data: {
								id: item.spot_id
							}
						})
					)
					
					const spotResults = await Promise.all(promises)
					const favorites = spotResults.map(result => {
						const spotData = result.result.data[0]
						return {
							id: spotData._id,
							name: spotData.name,
							imageUrl: spotData.imageUrl,
							rating: spotData.rating,
							price: spotData.price / 100,
							tags: spotData.tags || []
						}
					})
					
					console.log("favorites", favorites)
					
					if (this.page === 1) {
						this.favoriteList = favorites
						console.log("this.favoriteList", this.favoriteList)
					} else {
						this.favoriteList = [...this.favoriteList, ...favorites]
						console.log("this.favoriteList", this.favoriteList)
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
			uni.showModal({
				title: '提示',
				content: '确定要取消收藏该景点吗？',
				success: async res => {
					if (res.confirm) {
						try {
							const uid = uni.getStorageSync('userInfo')
							const res = await uniCloud.callFunction({
								name: 'toggle-favorite',
								data: {
									spotId: item.id,
									uid: uid.id
								}
							})

							if (res.result.code === 0) {
								this.favoriteList.splice(index, 1)
								uni.showToast({
									title: '已取消收藏',
									icon: 'none'
								})
							}
						} catch (e) {
							console.error('取消收藏失败:', e)
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
						uni.setClipboardData({
							data: `https://example.com/spots/${item.id}`,
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
		
		// 跳转到景点详情
		goToSpotDetail(id) {
			uni.navigateTo({
				url: `/pages/spots/detail?id=${id}`
			})
		},
		
		// 跳转到景点列表
		goToSpots() {
			uni.switchTab({
				url: '/pages/spots/spots'
			})
		}
	}
}
</script>

<style lang="scss">
.container {
	min-height: 100vh;
	background-color: #f5f5f5;
}

.empty {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding-top: 200rpx;
	
	image {
		width: 300rpx;
		height: 300rpx;
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
		background-color: #2B9939;
		color: #fff;
		font-size: 28rpx;
		border-radius: 40rpx;
		
		&::after {
			border: none;
		}
	}
}

.favorite-list {
	padding: 20rpx;
	
	.favorite-item {
		margin-bottom: 20rpx;
		background-color: #fff;
		border-radius: 12rpx;
		overflow: hidden;
		
		.content {
			display: flex;
			padding: 20rpx;
			
			.spot-image {
				width: 200rpx;
				height: 200rpx;
				border-radius: 8rpx;
				margin-right: 20rpx;
			}
			
			.info {
				flex: 1;
				display: flex;
				flex-direction: column;
				justify-content: space-between;
				
				.name-box {
					display: flex;
					justify-content: space-between;
					align-items: center;
					margin-bottom: 10rpx;
					
					.name {
						font-size: 32rpx;
						color: #333;
						font-weight: bold;
					}
					
					.time {
						font-size: 24rpx;
						color: #999;
					}
				}
				
				.rating {
					margin-bottom: 10rpx;
					
					.score {
						font-size: 28rpx;
						color: #FF9500;
						font-weight: bold;
						margin-right: 20rpx;
					}
					
					.price {
						font-size: 28rpx;
						color: #FF5B05;
						font-weight: bold;
					}
				}
				
				.tag-list {
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
			}
		}
		
		.action-box {
			display: flex;
			align-items: center;
			justify-content: flex-end;
			padding: 20rpx;
			border-top: 1rpx solid #eee;
			
			.action-btn {
				display: flex;
				align-items: center;
				margin-left: 30rpx;
				background: none;
				padding: 0;
				line-height: 1;
				
				&::after {
					border: none;
				}
				
				.iconfont {
					font-size: 32rpx;
					color: #666;
					margin-right: 4rpx;
				}
				
				text {
					font-size: 28rpx;
					color: #666;
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