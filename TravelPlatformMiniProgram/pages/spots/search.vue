<template>
	<view class="container">
		<!-- 搜索框 -->
		<view class="search-box">
			<view class="input-box">
				<input 
					type="text"
					v-model="keyword"
					placeholder="搜索景点/地点"
					@confirm="search"
					focus
				/>
				<view class="icon-search-box" @click="search">
					<image src="/static/icons/search.png" mode="aspectFit" class="icon-img"></image>
				</view>
				<view class="icon-close-box" v-if="keyword" @click="clearKeyword">
					<image src="/static/icons/clear.png" mode="aspectFit" class="icon-img"></image>
				</view>
			</view>
			<text class="cancel-btn" @click="goBack">取消</text>
		</view>
		
		<!-- 搜索历史 -->
		<view class="history-section" v-if="!keyword && searchHistory.length > 0">
			<view class="section-header">
				<text class="title">搜索历史</text>
				<text class="clear-btn" @click="clearHistory">清空</text>
			</view>
			<view class="history-list">
				<view 
					class="history-item" 
					v-for="(item, index) in searchHistory" 
					:key="index"
					@click="useHistory(item)"
				>
					<view class="icon-time-box">
						<image src="/static/icons/time.png" mode="aspectFit" class="icon-img" style="width: 40rpx;height: 40rpx;"></image>
					</view>
					<text class="keyword">{{item}}</text>
					<view class="icon-close-box" @click.stop="removeHistory(index)">
						<image src="/static/icons/clear.png" mode="aspectFit" class="icon-img" style="width: 40rpx;height: 40rpx;"></image>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 热门搜索 -->
		<view class="hot-section" v-if="!keyword">
			<view class="section-header">
				<text class="title">热门搜索</text>
			</view>
			<view class="hot-list">
				<view 
					class="hot-item" 
					v-for="(item, index) in hotKeywords" 
					:key="index"
					@click="useHot(item)"
				>
					<text class="rank" :class="{ top: index < 3 }">{{index + 1}}</text>
					<text class="keyword">{{item}}</text>
				</view>
			</view>
		</view>
		
		<!-- 搜索结果 -->
		<scroll-view 
			v-if="keyword"
			class="result-list" 
			scroll-y 
			@scrolltolower="loadMore"
		>
			<!-- 无搜索结果时显示推荐 -->
			<view v-if="spotList.length === 0 && !loading" class="no-result">
				<text class="tip">暂未搜索到相关内容，以下是推荐景点</text>
				<view class="recommend-list">
					<view class="spot-item" v-for="(item, index) in recommendList" :key="index" @click="goToDetail(item._id)">
						<image class="spot-image" :src="item.imageUrl" mode="aspectFill"></image>
						<view class="info">
							<view class="name-box">
								<text class="name">{{item.name}}</text>
								<text class="distance" v-if="item.distance">{{item.distance.toFixed(1)}}km</text>
							</view>
							<view class="rating">
								<text class="score">{{item.rating}}分</text>
								<text class="price">¥{{item.price/100}}起</text>
							</view>
							<view class="address">{{item.address}}</view>
						</view>
					</view>
				</view>
			</view>
			
			<!-- 搜索结果列表 -->
			<view v-else>
				<view class="spot-item" v-for="(item, index) in spotList" :key="index" @click="goToDetail(item._id)">
					<image class="spot-image" :src="item.imageUrl" mode="aspectFill"></image>
					<view class="info">
						<view class="name-box">
							<text class="name">{{item.name}}</text>
							<text class="distance" v-if="item.distance">{{item.distance.toFixed(1)}}km</text>
						</view>
						<view class="rating">
							<text class="score">{{item.rating}}分</text>
							<text class="price">¥{{item.price/100}}起</text>
						</view>
						<view class="address">{{item.address}}</view>
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
 * 搜索页面
 * @description 景点搜索
 */
export default {
	data() {
		return {
			keyword: '', // 搜索关键词
			searchHistory: [], // 搜索历史
			hotKeywords: [
				'西湖',
				'故宫',
				'黄山',
				'长城',
				'兵马俑',
				'九寨沟',
				'张家界',
				'泰山',
				'三亚',
				'丽江'
			], // 热门搜索
			spotList: [], // 搜索结果
			recommendList: [], // 推荐景点列表
			page: 1,
			pageSize: 10,
			loading: false,
			noMore: false,
			longitude: null,
			latitude: null
		}
	},
	onLoad() {
		// 获取搜索历史
		this.getSearchHistory()
		// 获取当前位置
		this.getCurrentLocation()
		// 获取推荐景点
		this.getRecommendSpots()
	},
	methods: {
		// 获取搜索历史
		getSearchHistory() {
			const history = uni.getStorageSync('searchHistory')
			this.searchHistory = history ? JSON.parse(history) : []
		},
		
		// 保存搜索历史
		saveSearchHistory() {
			if (!this.keyword) return
			
			// 移除重复的关键词
			const index = this.searchHistory.indexOf(this.keyword)
			if (index > -1) {
				this.searchHistory.splice(index, 1)
			}
			
			// 添加到历史记录开头
			this.searchHistory.unshift(this.keyword)
			
			// 最多保存10条记录
			if (this.searchHistory.length > 10) {
				this.searchHistory.pop()
			}
			
			// 保存到本地存储
			uni.setStorageSync('searchHistory', JSON.stringify(this.searchHistory))
		},
		
		// 清空搜索历史
		clearHistory() {
			uni.showModal({
				title: '提示',
				content: '确定要清空搜索历史吗？',
				success: res => {
					if (res.confirm) {
						this.searchHistory = []
						uni.removeStorageSync('searchHistory')
					}
				}
			})
		},
		
		// 移除单条历史记录
		removeHistory(index) {
			this.searchHistory.splice(index, 1)
			uni.setStorageSync('searchHistory', JSON.stringify(this.searchHistory))
		},
		
		// 使用历史记录搜索
		useHistory(keyword) {
			this.keyword = keyword
			this.search()
		},
		
		// 使用热门关键词搜索
		useHot(keyword) {
			this.keyword = keyword
			this.search()
		},
		
		// 清空关键词
		clearKeyword() {
			this.keyword = ''
			this.spotList = []
		},
		
		// 获取当前位置
		getCurrentLocation() {
			uni.getLocation({
				type: 'gcj02',
				success: res => {
					this.latitude = res.latitude
					this.longitude = res.longitude
				}
			})
		},
		
		// 搜索
		async search() {
			console.log("搜索关键词", this.keyword)
			if (!this.keyword) return
			
			this.page = 1
			this.spotList = []
			this.noMore = false
			this.loading = true  // 在这里设置loading状态

			try {
				console.log("搜索开始")
				await this.getSearchResult()
				this.saveSearchHistory()
			} catch (e) {
				console.error('搜索失败:', e)
				uni.showToast({
					title: '搜索失败，请重试',
					icon: 'none'
				})
			} finally {
				this.loading = false
			}
		},
		
		// 获取搜索结果
		async getSearchResult() {
			console.log("获取搜索结果")
			console.log("loading", this.loading)
			
			try {
				const res = await uniCloud.callFunction({
					name: 'get-spots',
					data: {
						keyword: this.keyword,
						page: this.page,
						pageSize: this.pageSize,
						longitude: this.longitude,
						latitude: this.latitude
					}
				})
				
				console.log("搜索结果：", res)
				
				if (res.result.code === 0) {
					const { list, total } = res.result.data
					
					if (this.page === 1) {
						this.spotList = list
					} else {
						this.spotList = [...this.spotList, ...list]
					}
					
					this.noMore = this.spotList.length >= total
					
					// 如果搜索结果为空，显示提示
					if (this.page === 1 && list.length === 0) {
						uni.showToast({
							title: '未找到相关景点',
							icon: 'none'
						})
					}
				} else {
					throw new Error(res.result.message)
				}
			} catch (e) {
				console.error('获取搜索结果失败:', e)
				throw e
			}
		},
		
		// 加载更多
		loadMore() {
			if (!this.noMore) {
				this.page++
				this.getSearchResult()
			}
		},
		
		// 跳转到详情页
		goToDetail(id) {
			uni.navigateTo({
				url: `/pages/spots/detail?id=${id}`
			})
		},
		
		// 返回上一页
		goBack() {
			uni.navigateBack()
		},
		
		// 获取推荐景点
		async getRecommendSpots() {
			try {
				const res = await uniCloud.callFunction({
					name: 'get-spots',
					data: {
						page: 1,
						pageSize: 5,
						sortBy: 'rating',
						sortOrder: 'desc'
					}
				})
				
				if (res.result.code === 0) {
					this.recommendList = res.result.data.list
				}
			} catch (e) {
				console.error('获取推荐景点失败:', e)
			}
		}
	}
}
</script>

<style lang="scss">
.container {
	min-height: 100vh;
	background-color: #f5f5f5;
}

.search-box {
	display: flex;
	align-items: center;
	padding: 20rpx 30rpx;
	background-color: #fff;
	
	.input-box {
		flex: 1;
		display: flex;
		align-items: center;
		height: 72rpx;
		background-color: #f5f5f5;
		border-radius: 36rpx;
		padding: 0 30rpx;
		margin-right: 20rpx;
		
		.icon-search-box, .icon-close-box, .icon-time-box {
			width: 40rpx;
			height: 40rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			
			.icon-img {
				width: 32rpx;
				height: 32rpx;
			}
		}
		
		.icon-search-box {
			margin-right: 10rpx;
		}
		
		.icon-close-box {
			margin-left: 10rpx;
		}
		
		input {
			flex: 1;
			height: 100%;
			font-size: 28rpx;
			color: #333;
		}
	}
	
	.cancel-btn {
		font-size: 28rpx;
		color: #666;
	}
}

.history-section {
	background-color: #fff;
	padding: 30rpx;
	margin-top: 20rpx;
	
	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 30rpx;
		
		.title {
			font-size: 28rpx;
			color: #333;
			font-weight: bold;
		}
		
		.clear-btn {
			font-size: 24rpx;
			color: #999;
		}
	}
	
	.history-list {
		.history-item {
			display: flex;
			align-items: center;
			margin-bottom: 20rpx;
			
			.icon-time-box {
				margin-right: 10rpx;
			}
			
			.icon-close-box {
				padding: 10rpx;
			}
			
			.keyword {
				flex: 1;
				font-size: 28rpx;
				color: #333;
			}
		}
	}
}

.hot-section {
	padding: 30rpx;
	
	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
		
		.title {
			font-size: 32rpx;
			color: #333;
			font-weight: bold;
		}
	}
	
	.hot-list {
		.hot-item {
			display: flex;
			align-items: center;
			height: 80rpx;
			
			.rank {
				width: 40rpx;
				font-size: 28rpx;
				color: #999;
				text-align: center;
				
				&.top {
					color: #FF5B05;
					font-weight: bold;
				}
			}
			
			.keyword {
				font-size: 28rpx;
				color: #333;
			}
		}
	}
}

.result-list {
	background-color: #fff;
	padding: 20rpx;
	
	.spot-item {
		display: flex;
		padding: 20rpx;
		border-bottom: 1rpx solid #eee;
		
		&:last-child {
			border-bottom: none;
		}
		
		.spot-image {
			width: 160rpx;
			height: 160rpx;
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
			
			.rating {
				margin: 10rpx 0;
				
				.score {
					font-size: 28rpx;
					color: #ff9500;
					margin-right: 20rpx;
				}
				
				.price {
					font-size: 28rpx;
					color: #ff5b05;
				}
			}
			
			.address {
				font-size: 24rpx;
				color: #666;
				@include text-ellipsis;
			}
		}
	}
}

.loading, .no-more, .empty {
	padding: 30rpx;
	text-align: center;
	
	text {
		font-size: 24rpx;
		color: #999;
	}
	
	image {
		width: 200rpx;
		height: 200rpx;
		margin-bottom: 20rpx;
	}
}

.no-result {
	padding: 30rpx;
	
	.tip {
		font-size: 28rpx;
		color: #666;
		text-align: center;
		margin-bottom: 30rpx;
	}
	
	.recommend-list {
		background-color: #fff;
		border-radius: 12rpx;
		padding: 20rpx;
	}
}
</style> 