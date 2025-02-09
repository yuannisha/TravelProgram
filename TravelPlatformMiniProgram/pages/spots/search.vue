<template>
	<view class="container">
		<!-- 搜索框 -->
		<view class="search-box">
			<view class="input-box">
				<text class="iconfont icon-search"></text>
				<input 
					type="text"
					v-model="keyword"
					placeholder="搜索景点/地点"
					confirm-type="search"
					@confirm="search"
					focus
				/>
				<text class="iconfont icon-close" v-if="keyword" @click="clearKeyword"></text>
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
					<text class="iconfont icon-time"></text>
					<text class="keyword">{{item}}</text>
					<text class="iconfont icon-close" @click.stop="removeHistory(index)"></text>
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
			v-else
			class="result-list" 
			scroll-y 
			@scrolltolower="loadMore"
		>
			<view class="spot-item" v-for="(item, index) in spotList" :key="index" @click="goToDetail(item._id)">
				<image class="spot-image" :src="item.imageUrl" mode="aspectFill"></image>
				<view class="info">
					<view class="name-box">
						<text class="name">{{item.name}}</text>
						<text class="distance" v-if="item.distance">{{item.distance.toFixed(1)}}km</text>
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
			
			<!-- 加载更多 -->
			<view class="loading" v-if="loading">
				<text>正在加载...</text>
			</view>
			<view class="no-more" v-if="noMore">
				<text>没有更多了</text>
			</view>
			
			<!-- 空状态 -->
			<view class="empty" v-if="!loading && spotList.length === 0">
				<image src="/static/empty/no-search.png" mode="aspectFit"></image>
				<text>未找到相关景点</text>
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
			page: 1,
			pageSize: 10,
			loading: false,
			noMore: false
		}
	},
	onLoad() {
		// 获取搜索历史
		this.getSearchHistory()
		// 获取当前位置
		this.getCurrentLocation()
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
			if (!this.keyword) return
			
			this.page = 1
			this.spotList = []
			this.noMore = false
			this.saveSearchHistory()
			await this.getSearchResult()
		},
		
		// 获取搜索结果
		async getSearchResult() {
			if (this.loading || this.noMore) return
			this.loading = true
			
			try {
				const res = await uniCloud.callFunction({
					name: 'get-spots',
					data: {
						keyword: this.keyword,
						longitude: this.longitude,
						latitude: this.latitude,
						page: this.page,
						pageSize: this.pageSize
					}
				})
				
				if (res.result.code === 0) {
					const { list, total } = res.result.data
					
					if (this.page === 1) {
						this.spotList = list
					} else {
						this.spotList = [...this.spotList, ...list]
					}
					
					this.noMore = this.spotList.length >= total
				}
			} catch (e) {
				uni.showToast({
					title: '搜索失败',
					icon: 'none'
				})
			}
			
			this.loading = false
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
		}
	}
}
</script>

<style lang="scss">
.container {
	min-height: 100vh;
	background-color: #fff;
}

.search-box {
	display: flex;
	align-items: center;
	padding: 20rpx 30rpx;
	background-color: #fff;
	border-bottom: 1rpx solid #eee;
	
	.input-box {
		flex: 1;
		display: flex;
		align-items: center;
		height: 72rpx;
		padding: 0 20rpx;
		background-color: #f5f5f5;
		border-radius: 36rpx;
		margin-right: 20rpx;
		
		.icon-search {
			font-size: 32rpx;
			color: #666;
			margin-right: 10rpx;
		}
		
		input {
			flex: 1;
			height: 100%;
			font-size: 28rpx;
			color: #333;
		}
		
		.icon-close {
			font-size: 32rpx;
			color: #999;
			padding: 10rpx;
		}
	}
	
	.cancel-btn {
		font-size: 28rpx;
		color: #666;
	}
}

.history-section, .hot-section {
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
		
		.clear-btn {
			font-size: 28rpx;
			color: #999;
		}
	}
}

.history-list {
	.history-item {
		display: flex;
		align-items: center;
		height: 80rpx;
		
		.icon-time {
			font-size: 32rpx;
			color: #999;
			margin-right: 10rpx;
		}
		
		.keyword {
			flex: 1;
			font-size: 28rpx;
			color: #333;
		}
		
		.icon-close {
			font-size: 32rpx;
			color: #999;
			padding: 10rpx;
		}
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

.result-list {
	padding: 20rpx;
	
	.spot-item {
		display: flex;
		padding: 20rpx;
		background-color: #fff;
		border-radius: 12rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
		
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
				
				.distance {
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
}

.loading, .no-more {
	padding: 30rpx;
	text-align: center;
	
	text {
		font-size: 24rpx;
		color: #999;
	}
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
	}
}
</style> 