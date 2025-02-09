<template>
	<view class="container">
		<!-- 轮播图 -->
		<swiper class="banner" circular autoplay interval="3000" duration="1000" indicator-dots indicator-active-color="#fff">
			<swiper-item v-for="(item, index) in spotDetail.images" :key="index">
				<image :src="item" mode="aspectFill"></image>
			</swiper-item>
		</swiper>
		
		<!-- 景点信息 -->
		<view class="info-section">
			<view class="title-box">
				<text class="name">{{spotDetail.name}}</text>
				<view class="favorite" @click="toggleFavorite">
					<text class="iconfont" :class="spotDetail.isFavorite ? 'icon-heart-fill' : 'icon-heart'"></text>
				</view>
			</view>
			<view class="rating-box">
				<text class="score">{{spotDetail.rating}}分</text>
				<text class="comment-count">({{spotDetail.commentCount}}点评)</text>
				<text class="price">¥{{spotDetail.price}}起</text>
			</view>
			<view class="tag-list">
				<text class="tag" v-for="(tag, index) in spotDetail.tags" :key="index">{{tag}}</text>
			</view>
			<view class="address-box" @click="openMap">
				<text class="iconfont icon-location"></text>
				<text class="address">{{spotDetail.address}}</text>
				<text class="distance" v-if="spotDetail.distance">{{spotDetail.distance}}km</text>
				<text class="iconfont icon-arrow-right"></text>
			</view>
		</view>
		
		<!-- 景点介绍 -->
		<view class="desc-section">
			<view class="section-title">景点介绍</view>
			<text class="desc-text">{{spotDetail.description}}</text>
			<view class="open-info">
				<view class="info-item">
					<text class="label">开放时间：</text>
					<text class="value">{{spotDetail.openTime}}</text>
				</view>
				<view class="info-item">
					<text class="label">建议游玩：</text>
					<text class="value">{{spotDetail.suggestedTime}}</text>
				</view>
			</view>
		</view>
		
		<!-- 评论区 -->
		<view class="comment-section">
			<view class="section-title">
				<text>游客点评</text>
				<text class="comment-count">({{spotDetail.commentCount}}条)</text>
			</view>
			<view class="comment-list">
				<view class="comment-item" v-for="(item, index) in comments" :key="index">
					<view class="user-info">
						<image class="avatar" :src="item.avatar" mode="aspectFill"></image>
						<view class="right">
							<text class="nickname">{{item.nickname}}</text>
							<view class="rating">
								<text class="score">{{item.rating}}分</text>
								<text class="time">{{item.time}}</text>
							</view>
						</view>
					</view>
					<text class="content">{{item.content}}</text>
					<view class="image-list" v-if="item.images && item.images.length">
						<image 
							v-for="(img, imgIndex) in item.images" 
							:key="imgIndex" 
							:src="img" 
							mode="aspectFill"
							@click="previewImage(item.images, imgIndex)"
						></image>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 底部操作栏 -->
		<view class="bottom-bar">
			<button class="share-btn" open-type="share">
				<text class="iconfont icon-share"></text>
				<text>分享</text>
			</button>
			<button class="primary-btn" @click="goToMap">导航</button>
		</view>
	</view>
</template>

<script>
/**
 * 景点详情页
 * @description 展示景点详细信息，包括图片、介绍、评论等
 */
export default {
	data() {
		return {
			spotId: null,
			spotDetail: {
				name: '西湖风景区',
				images: [
					'/static/spots/spot1.jpg',
					'/static/spots/spot2.jpg',
					'/static/spots/spot3.jpg'
				],
				rating: 4.9,
				commentCount: 12580,
				price: 80,
				tags: ['5A景区', '湖泊', '游船'],
				address: '浙江省杭州市西湖区龙井路1号',
				distance: 2.5,
				description: '西湖，位于浙江省杭州市西湖区龙井路1号，是中国大陆首个世界文化遗产湖泊。湖区面积49平方千米，汇水面积为21.22平方千米，湖面面积为6.38平方千米。',
				openTime: '全天开放',
				suggestedTime: '建议3-4小时',
				isFavorite: false
			},
			comments: [
				{
					nickname: '游客A',
					avatar: '/static/avatar/user1.png',
					rating: 5,
					time: '2024-02-08',
					content: '风景非常优美，特别是三潭印月的夜景，太美了！建议傍晚来，可以看到日落。',
					images: [
						'/static/comments/comment1.jpg',
						'/static/comments/comment2.jpg'
					]
				},
				{
					nickname: '游客B',
					avatar: '/static/avatar/user2.png',
					rating: 4.5,
					time: '2024-02-07',
					content: '景色宜人，适合散步。建议早上来，人少清净。',
					images: []
				}
			]
		}
	},
	onLoad(options) {
		if (options.id) {
			this.spotId = options.id
			// TODO: 根据ID获取景点详情
			this.getSpotDetail()
		}
	},
	methods: {
		// 获取景点详情
		async getSpotDetail() {
			// TODO: 调用后端接口获取数据
		},
		
		// 切换收藏状态
		toggleFavorite() {
			this.spotDetail.isFavorite = !this.spotDetail.isFavorite
			uni.showToast({
				title: this.spotDetail.isFavorite ? '收藏成功' : '已取消收藏',
				icon: 'none'
			})
		},
		
		// 打开地图
		openMap() {
			// TODO: 打开地图并显示位置
		},
		
		// 预览图片
		previewImage(images, current) {
			uni.previewImage({
				urls: images,
				current: images[current]
			})
		},
		
		// 导航
		goToMap() {
			// TODO: 调用地图导航
		}
	},
	// 分享
	onShareAppMessage() {
		return {
			title: this.spotDetail.name,
			path: `/pages/spots/detail?id=${this.spotId}`
		}
	}
}
</script>

<style lang="scss">
.container {
	padding-bottom: 100rpx;
}

.banner {
	width: 100%;
	height: 500rpx;
	
	image {
		width: 100%;
		height: 100%;
	}
}

.info-section {
	padding: 30rpx;
	background-color: #fff;
	
	.title-box {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
		
		.name {
			font-size: 36rpx;
			font-weight: bold;
			color: #333;
		}
		
		.favorite {
			.iconfont {
				font-size: 40rpx;
				color: #999;
				
				&.icon-heart-fill {
					color: #FF5B05;
				}
			}
		}
	}
	
	.rating-box {
		margin-bottom: 20rpx;
		
		.score {
			font-size: 32rpx;
			color: #FF9500;
			font-weight: bold;
			margin-right: 8rpx;
		}
		
		.comment-count {
			font-size: 24rpx;
			color: #999;
			margin-right: 20rpx;
		}
		
		.price {
			font-size: 32rpx;
			color: #FF5B05;
			font-weight: bold;
		}
	}
	
	.tag-list {
		margin-bottom: 20rpx;
		
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
	
	.address-box {
		display: flex;
		align-items: center;
		
		.icon-location {
			font-size: 32rpx;
			color: #666;
			margin-right: 10rpx;
		}
		
		.address {
			flex: 1;
			font-size: 28rpx;
			color: #666;
		}
		
		.distance {
			font-size: 24rpx;
			color: #999;
			margin: 0 10rpx;
		}
		
		.icon-arrow-right {
			font-size: 24rpx;
			color: #999;
		}
	}
}

.desc-section {
	margin-top: 20rpx;
	padding: 30rpx;
	background-color: #fff;
	
	.section-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 20rpx;
	}
	
	.desc-text {
		font-size: 28rpx;
		color: #666;
		line-height: 1.6;
		margin-bottom: 20rpx;
	}
	
	.open-info {
		.info-item {
			margin-bottom: 10rpx;
			
			.label {
				font-size: 28rpx;
				color: #333;
			}
			
			.value {
				font-size: 28rpx;
				color: #666;
			}
		}
	}
}

.comment-section {
	margin-top: 20rpx;
	padding: 30rpx;
	background-color: #fff;
	
	.section-title {
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;
		
		text {
			font-size: 32rpx;
			font-weight: bold;
			color: #333;
		}
		
		.comment-count {
			font-size: 24rpx;
			color: #999;
			margin-left: 10rpx;
			font-weight: normal;
		}
	}
	
	.comment-list {
		.comment-item {
			padding: 20rpx 0;
			border-bottom: 1rpx solid #eee;
			
			&:last-child {
				border-bottom: none;
			}
			
			.user-info {
				display: flex;
				align-items: center;
				margin-bottom: 16rpx;
				
				.avatar {
					width: 64rpx;
					height: 64rpx;
					border-radius: 32rpx;
					margin-right: 16rpx;
				}
				
				.right {
					flex: 1;
					
					.nickname {
						font-size: 28rpx;
						color: #333;
						margin-bottom: 4rpx;
					}
					
					.rating {
						.score {
							font-size: 24rpx;
							color: #FF9500;
							margin-right: 10rpx;
						}
						
						.time {
							font-size: 24rpx;
							color: #999;
						}
					}
				}
			}
			
			.content {
				font-size: 28rpx;
				color: #333;
				line-height: 1.6;
				margin-bottom: 16rpx;
			}
			
			.image-list {
				display: flex;
				flex-wrap: wrap;
				
				image {
					width: 200rpx;
					height: 200rpx;
					margin-right: 10rpx;
					margin-bottom: 10rpx;
					border-radius: 8rpx;
					
					&:nth-child(3n) {
						margin-right: 0;
					}
				}
			}
		}
	}
}

.bottom-bar {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	height: 100rpx;
	background-color: #fff;
	border-top: 1rpx solid #eee;
	display: flex;
	align-items: center;
	padding: 0 30rpx;
	
	.share-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		margin-right: 30rpx;
		background: none;
		padding: 0;
		line-height: 1;
		
		&::after {
			border: none;
		}
		
		.iconfont {
			font-size: 40rpx;
			color: #666;
			margin-bottom: 4rpx;
		}
		
		text {
			font-size: 24rpx;
			color: #666;
		}
	}
	
	.primary-btn {
		flex: 1;
		height: 72rpx;
		line-height: 72rpx;
		text-align: center;
		background-color: #2B9939;
		color: #fff;
		font-size: 28rpx;
		border-radius: 36rpx;
		
		&::after {
			border: none;
		}
	}
}
</style> 