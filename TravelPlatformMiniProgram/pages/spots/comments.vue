<template>
	<view class="container">
		<!-- 排序选项 -->
		<view class="sort-bar">
			<view 
				class="sort-item" 
				:class="{ active: sortBy === 'time' }"
				@click="changeSortBy('time')"
			>
				<text>最新</text>
			</view>
			<view 
				class="sort-item" 
				:class="{ active: sortBy === 'rating' }"
				@click="changeSortBy('rating')"
			>
				<text>评分最高</text>
			</view>
		</view>
		
		<!-- 评论列表 -->
		<scroll-view 
			class="comment-list" 
			scroll-y 
			@scrolltolower="loadMore"
			refresher-enabled
			:refresher-triggered="refreshing"
			@refresherrefresh="onRefresh"
		>
			<view class="comment-item" v-for="(item, index) in commentList" :key="index">
				<image class="avatar" :src="item.user.avatar" mode="aspectFill"></image>
				<view class="content">
					<view class="user-info">
						<text class="username">{{item.user.username}}</text>
						<text class="rating">{{item.rating}}分</text>
					</view>
					<text class="comment-text">{{item.content}}</text>
					<view class="image-list" v-if="item.images && item.images.length > 0">
						<image 
							v-for="(img, imgIndex) in item.images" 
							:key="imgIndex" 
							:src="img" 
							mode="aspectFill"
							@click="previewImage(item.images, imgIndex)"
						></image>
					</view>
					<text class="date">{{formatDate(item.create_date)}}</text>
				</view>
			</view>
			
			<!-- 加载状态 -->
			<view class="loading" v-if="loading">
				<text>正在加载...</text>
			</view>
			<view class="no-more" v-if="noMore">
				<text>没有更多评论了</text>
			</view>
			<view class="empty" v-if="commentList.length === 0 && !loading">
				<text>暂无评论</text>
			</view>
		</scroll-view>
	</view>
</template>

<script>
/**
 * 景点评论列表页
 * @description 显示景点的所有评论，支持按时间和评分排序
 */
export default {
	data() {
		return {
			spotId: '', // 景点ID
            userId: '', // 用户ID
			commentList: [], // 评论列表
			page: 1, // 当前页码
			pageSize: 10, // 每页数量
			loading: false, // 加载状态
			noMore: false, // 是否还有更多
			refreshing: false, // 刷新状态
			sortBy: 'time', // 排序方式：time-时间，rating-评分
		}
	},
	onLoad(options) {
		if (options.id) {
			this.spotId = options.id    
            this.userId = options.userId
			this.getComments()
		} else {
			uni.showToast({
				title: '参数错误',
				icon: 'none'
			})
			setTimeout(() => {
				uni.navigateBack()
			}, 1500)
		}
	},
	methods: {
		// 获取评论列表
		async getComments() {
			if (this.loading || (this.noMore && !this.refreshing)) return
			this.loading = true
			
			try {
                console.log("userId",this.userId)
                console.log("spotId",this.spotId)
				const res = await uniCloud.callFunction({
					name: 'get-comments',
					data: {
                        userId: this.userId,
						spotId: this.spotId,
						page: this.page,
						pageSize: this.pageSize,
						sortBy: this.sortBy,
						sortOrder: this.sortBy === 'time' ? 'desc' : 'desc'
					}
				})
				
				if (res.result.code === 0) {
					const { list, total } = res.result.data
					
					if (this.refreshing) {
						this.commentList = list
					} else {
						this.commentList = [...this.commentList, ...list]
					}
					
					this.noMore = this.commentList.length >= total
				} else {
					uni.showToast({
						title: res.result.message || '获取评论失败',
						icon: 'none'
					})
				}
			} catch (e) {
				console.error('获取评论失败:', e)
				uni.showToast({
					title: '获取评论失败',
					icon: 'none'
				})
			} finally {
				this.loading = false
				if (this.refreshing) {
					this.refreshing = false
				}
			}
		},
		
		// 加载更多
		loadMore() {
			if (!this.noMore) {
				this.page++
				this.getComments()
			}
		},
		
		// 下拉刷新
		async onRefresh() {
			this.refreshing = true
			this.page = 1
			this.noMore = false
			await this.getComments()
		},
		
		// 切换排序方式
		changeSortBy(type) {
			if (this.sortBy === type) return
			this.sortBy = type
			this.page = 1
			this.commentList = []
			this.noMore = false
			this.getComments()
		},
		
		// 预览图片
		previewImage(images, current) {
			uni.previewImage({
				urls: images,
				current: images[current]
			})
		},
		
		// 格式化日期
		formatDate(date) {
			const d = new Date(date)
			return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
		}
	}
}
</script>

<style lang="scss">
.container {
	min-height: 100vh;
	background-color: #f5f5f5;
}

.sort-bar {
	display: flex;
	background-color: #fff;
	padding: 20rpx 30rpx;
	border-bottom: 1rpx solid #eee;
	
	.sort-item {
		margin-right: 40rpx;
		padding: 10rpx 0;
		
		text {
			font-size: 28rpx;
			color: #666;
		}
		
		&.active {
			position: relative;
			
			text {
				color: #333;
				font-weight: bold;
			}
			
			&::after {
				content: '';
				position: absolute;
				bottom: 0;
				left: 50%;
				transform: translateX(-50%);
				width: 40rpx;
				height: 4rpx;
				background-color: #007AFF;
				border-radius: 2rpx;
			}
		}
	}
}

.comment-list {
	height: calc(100vh - 100rpx);
	
	.comment-item {
		display: flex;
		padding: 30rpx;
		background-color: #fff;
		margin-bottom: 2rpx;
		
		.avatar {
			width: 80rpx;
			height: 80rpx;
			border-radius: 50%;
			margin-right: 20rpx;
		}
		
		.content {
			flex: 1;
			
			.user-info {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 10rpx;
				
				.username {
					font-size: 28rpx;
					color: #333;
					font-weight: bold;
				}
				
				.rating {
					font-size: 28rpx;
					color: #ff9500;
				}
			}
			
			.comment-text {
				font-size: 28rpx;
				color: #666;
				line-height: 1.5;
				margin-bottom: 20rpx;
			}
			
			.image-list {
				display: flex;
				flex-wrap: wrap;
				margin: 0 -10rpx;
				
				image {
					width: 200rpx;
					height: 200rpx;
					margin: 10rpx;
					border-radius: 8rpx;
				}
			}
			
			.date {
				font-size: 24rpx;
				color: #999;
				margin-top: 10rpx;
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
}
</style> 