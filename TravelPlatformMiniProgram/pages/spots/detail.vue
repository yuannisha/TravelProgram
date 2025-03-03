<template>
	<view class="container">
		<!-- 轮播图 -->
		<swiper class="banner" circular autoplay interval="3000" duration="1000" indicator-dots indicator-active-color="#2B9939">
			<swiper-item v-for="(item, index) in spotDetail.images || []" :key="index">
				<image :src="item" mode="aspectFill"></image>
			</swiper-item>
		</swiper>
		
		<!-- 景点信息 -->
		<view class="info-section">
			<view class="title-box">
				<text class="name">{{spotDetail.name || ''}}</text>
				<view class="favorite" @click="toggleFavorite">
					<text class="iconfont" :class="spotDetail.isFavorite ? 'icon-heart-fill' : 'icon-heart'"></text>
				</view>
			</view>
			<view class="rating-box">
				<text class="score">{{spotDetail.rating || 0}}分</text>
				<text class="comment-count">({{spotDetail.commentCount || 0}}点评)</text>
				<text class="price">¥{{(spotDetail.price || 0) / 100}}起</text>
			</view>
			<view class="tag-list">
				<text class="tag" v-for="(tag, index) in spotDetail.tags || []" :key="index">{{tag}}</text>
			</view>
			
			<view class="address-box" @click="showNavigationOptions">
				<text class="iconfont icon-location"></text>
				<text class="address">{{spotDetail.address || ''}}</text>
				<text class="distance" v-if="spotDetail.distance">{{spotDetail.distance}}km</text>
				<text class="iconfont icon-arrow-right"></text>
			</view>
		</view>
		
		<!-- 景点介绍 -->
		<view class="desc-section">
			<view class="section-title">景点介绍</view>
			<text class="desc-text">{{spotDetail.description || ''}}</text>
			<view class="open-info">
				<view class="info-item">
					<text class="label">开放时间：</text>
					<text class="value">{{spotDetail.openTime || ''}}</text>
				</view>
				<view class="info-item">
					<text class="label">建议游玩：</text>
					<text class="value">{{spotDetail.suggestedTime || ''}}</text>
				</view>
			</view>
		</view>
		
		<!-- 最新点评 -->
		<view class="comment-section" v-if="spotDetail.comments && spotDetail.comments.length > 0">
			<view class="section-header">
				<text class="title">用户评论</text>
				<text class="more" @click="goToComments">查看全部</text>
			</view>
			<view class="comment-list">
				<view class="comment-item" v-for="(item, index) in spotDetail.comments" :key="index">
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
			</view>
		</view>
		
		<!-- 底部操作栏 -->
		<view class="bottom-bar">
			<view class="left">
				<view class="action-btn" @click="toggleFavorite">
					<text class="iconfont" :class="spotDetail.isFavorite ? 'icon-heart-fill' : 'icon-heart'"></text>
					<text>{{spotDetail.isFavorite ? '已收藏' : '收藏'}}</text>
				</view>
				<view class="action-btn" @click="openMap">
					<text class="iconfont icon-navigation"></text>
					<text>导航</text>
				</view>
			</view>
			<button class="comment-btn" @click="showCommentPopup">我要评论</button>
		</view>
		
		<!-- 导航选项弹窗 -->
		<view class="popup-mask" v-if="showNavigation" @click="hideNavigationOptions">
			<view class="popup-content navigation-popup" @click.stop>
				<view class="navigation-options">
					<view class="title">选择导航方式</view>
					<view class="option-list">
						<view class="option" v-for="(item, index) in navigationOptions" :key="index" @click="navigate(item)">
							<text class="iconfont" :class="item.icon"></text>
							<text class="name">{{item.name}}</text>
						</view>
					</view>
					<view class="cancel" @click="hideNavigationOptions">取消</view>
				</view>
			</view>
		</view>
		
		<!-- 评论弹出层 -->
		<view class="popup-mask" v-if="showComment" @click="hideCommentPopup">
			<view class="popup-content comment-popupouter" @click.stop>
				<scroll-view scroll-y class="comment-popup">
					<view class="popup-header">
						<text class="title">发表评论</text>
						<text class="close" @click="hideCommentPopup">×</text>
					</view>
					
					<view class="rating-box">
						<text class="label">评分</text>
						<view class="slider-container">
							<slider 
								class="rating-slider" 
								:value="rating * 10" 
								min="0" 
								max="50" 
								:step="1"
								show-value
								@change="onSliderChange"
							/>
							<text class="rating-value">{{rating}}分</text>
						</view>
					</view>
					
					<view class="content-box">
						<text class="content-label">评论内容</text>
						<textarea 
							v-model="commentContent" 
							placeholder="请输入您的评论内容，让更多人了解这个景点"
							maxlength="500"
							class="content-input"
						></textarea>
						<text class="count">{{commentContent.length}}/500</text>
					</view>
					
					<view class="image-box">
						<text class="image-label">上传图片</text>
						<view class="image-list">
							<view 
								class="image-item" 
								v-for="(item, index) in commentImages" 
								:key="index"
							>
								<image 
									:src="item" 
									mode="aspectFill"
									@click="previewImage(index)"
								></image>
								<text class="delete" @click="deleteImage(index)">×</text>
							</view>
							<view 
								class="upload-btn" 
								v-if="commentImages.length < 9"
								@click="chooseImage"
							>
								<text class="iconfont icon-camera"></text>
								<text class="tip">{{commentImages.length}}/9</text>
							</view>
						</view>
					</view>
					
					<button 
						class="submit-btn" 
						:class="{ active: canSubmitComment }"
						:disabled="!canSubmitComment"
						@click="submitComment"
					>
						发表评论
					</button>
				</scroll-view>
			</view>
		</view>
	</view>
</template>

<script>
/**
 * 景点详情页面
 * @description 展示景点详细信息，包括图片、介绍、点评等
 */
import { ref } from 'vue'

export default {
	data() {
		return {
			showNavigation: false,
			showComment: false,
			spotId: '',
			spotDetail: {},
			navigationOptions: [
				{ name: '百度地图', icon: 'icon-baidu' },
				{ name: '高德地图', icon: 'icon-gaode' },
				{ name: '腾讯地图', icon: 'icon-tengxun' }
			],
			rating: 0,
			commentContent: '',
			commentImages: []
		}
	},
	computed: {
		canSubmitComment() {
			return this.rating > 0 && this.commentContent.trim().length > 0
		}
	},
	onLoad(options) {
		if (options.id) {
			this.spotId = options.id
			this.getSpotDetail()
		}
	},
	methods: {
		// 获取景点详情
		async getSpotDetail() {
			try {
				const res = await uniCloud.callFunction({
					name: 'get-spot-detail',
					data: {
						id: this.spotId
					}
				})
				
				const uid = uni.getStorageSync('userInfo').id
				// 获取收藏状态
				const favoriteRes = await uniCloud.callFunction({
					name: 'get-favorite-status',
					data: {
						uid: uid,
						type: 'spot',
						spotId: this.spotId
					}

				})	
				console.log("favoriteRes",favoriteRes)
				if (res.result.code === 0) {
					this.spotDetail = res.result.data
					console.log("favoriteRes.result.data",favoriteRes)
					this.spotDetail.isFavorite = favoriteRes.result.data.isFavorite
					
					console.log("this.spotDetail",this.spotDetail)

				} else {
					uni.showToast({
						title: res.result.message,
						icon: 'none'
					})
				}

			} catch (e) {
				console.error('获取景点详情失败:', e)
				uni.showToast({
					title: '获取详情失败',
					icon: 'none'
				})
			}
		},
		
		// 切换收藏状态
		async toggleFavorite() {
			// 检查登录状态
			const token = uni.getStorageSync('token')
			if (!token) {
				uni.navigateTo({
					url: '/pages/user/login'
				})
				return
			}
			const uid = uni.getStorageSync('userInfo').id
			console.log("uid",uid)
			try {
				const res = await uniCloud.callFunction({
					name: 'toggle-favorite',
					data: {
						uid: uid,
						type: 'spot',
						spotId: this.spotId
					}

				})
				
				if (res.result.code === 0) {
					this.spotDetail.isFavorite = res.result.data.isFavorite
					uni.showToast({
						title: this.spotDetail.isFavorite ? '收藏成功' : '已取消收藏',
						icon: 'success'
					})
				} else {
					uni.showToast({
						title: res.result.message,
						icon: 'none'
					})
				}
			} catch (e) {
				console.error('操作收藏失败:', e)
				uni.showToast({
					title: '操作失败',
					icon: 'none'
				})
			}
		},
		
		// 显示导航选项
		showNavigationOptions() {
			this.showNavigation = true
		},
		
		// 隐藏导航选项
		hideNavigationOptions() {
			this.showNavigation = false
		},
		
		// 导航
		navigate(option) {
			uni.showToast({
				title: `即将打开${option.name}`,
				icon: 'none'
			})
			this.hideNavigationOptions()
		},
		
		// 跳转到评论列表页
		goToComments() {
			const userId = uni.getStorageSync('userInfo').id
			console.log("userId",userId)
			// 判断是否登录
			if (!userId) {
				uni.navigateTo({
					url: '/pages/user/login'
				})
				return
			}	
			uni.navigateTo({
				url: `/pages/spots/comments?id=${this.spotId}&userId=${userId}`
			})
		},
		
		// 预览图片
		previewImage(images, current) {
			uni.previewImage({
				urls: images,
				current: current
			})
		},
		
		// 格式化日期
		formatDate(timestamp) {
			if (!timestamp) return ''
			const date = new Date(timestamp)
			return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
		},
		
		// 显示评论弹窗
		showCommentPopup() {
			if (!this.checkLogin()) return
			this.showComment = true
		},
		
		// 隐藏评论弹窗
		hideCommentPopup() {
			this.showComment = false
			// 重置评论数据
			this.rating = 0
			this.commentContent = ''
			this.commentImages = []
		},
		
		// 选择图片
		async chooseImage() {
			try {
				const res = await uni.chooseImage({
					count: 9 - this.commentImages.length,
					sizeType: ['compressed'],
					sourceType: ['album', 'camera']
				})
				
				// 上传图片到云存储
				uni.showLoading({
					title: '上传中...'
				})
				
				const uploadTasks = res.tempFilePaths.map(path => {
					return uniCloud.uploadFile({
						filePath: path,
						cloudPath: `comment-images/${Date.now()}-${Math.random().toString(36).slice(-6)}.jpg`
					})
				})
				
				const uploadResults = await Promise.all(uploadTasks)
				this.commentImages.push(...uploadResults.map(item => item.fileID))
				
				uni.hideLoading()
			} catch (e) {
				console.error('选择图片失败:', e)
				uni.showToast({
					title: '上传图片失败',
					icon: 'none'
				})
			}
		},
		
		// 删除图片
		deleteImage(index) {
			this.commentImages.splice(index, 1)
		},
		
		// 提交评论
		async submitComment() {
			if (!this.canSubmitComment) return
			
			try {	
				const uid = uni.getStorageSync('userInfo').id
				const res = await uniCloud.callFunction({
					name: 'add-comment',
					data: {
						uid: uid,
						spotId: this.spotId,
						content: this.commentContent.trim(),
						rating: this.rating,
						images: this.commentImages
					}
				})
				
				if (res.result.code === 0) {
					uni.showToast({
						title: '评论成功',
						icon: 'success'
					})
					
					// 重置表单
					this.rating = 0
					this.commentContent = ''
					this.commentImages = []
					this.hideCommentPopup()
					
					// 刷新评论列表
					this.getSpotDetail()
				} else {
					throw new Error(res.result.message)
				}
			} catch (e) {
				console.error('提交评论失败:', e)
				uni.showToast({
					title: e.message || '评论失败',
					icon: 'none'
				})
			}
		},
		
		// 检查登录状态
		checkLogin() {
			const token = uni.getStorageSync('token')
			if (!token) {
				uni.navigateTo({
					url: '/pages/user/login'
				})
				return false
			}
			return true
		},
		
		// 打开地图
		openMap() {
			this.showNavigationOptions()
		},
		
		// 处理滑动条变化
		onSliderChange(e) {
			this.rating = parseFloat((e.detail.value / 10).toFixed(1))
		}
	}
}
</script>

<style lang="scss">
.container {
	min-height: 100vh;
	background-color: #f5f5f5;
	padding-bottom: 40rpx;
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
	background-color: #fff;
	padding: 30rpx;
	margin-bottom: 20rpx;
	
	.title-box {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
		
		.name {
			font-size: 36rpx;
			color: #333;
			font-weight: bold;
		}
		
		.favorite {
			.iconfont {
				font-size: 48rpx;
				color: #999;
				
				&.icon-heart-fill {
					color: #ff5b05;
				}
			}
		}
	}
	
	.rating-box {
		margin-bottom: 20rpx;
		
		.score {
			font-size: 32rpx;
			color: #ff9500;
			font-weight: bold;
			margin-right: 10rpx;
		}
		
		.comment-count {
			font-size: 24rpx;
			color: #999;
			margin-right: 20rpx;
		}
		
		.price {
			font-size: 32rpx;
			color: #ff5b05;
			font-weight: bold;
		}
	}
	
	.tag-list {
		display: flex;
		flex-wrap: wrap;
		margin-bottom: 20rpx;
		
		.tag {
			padding: 4rpx 16rpx;
			background-color: #f5f5f5;
			color: #666;
			font-size: 24rpx;
			border-radius: 4rpx;
			margin-right: 16rpx;
			margin-bottom: 16rpx;
		}
	}
	
	.address-box {
		display: flex;
		align-items: center;
		
		.icon-location {
			font-size: 36rpx;
			color: #2b9939;
			margin-right: 10rpx;
		}
		
		.address {
			flex: 1;
			font-size: 28rpx;
			color: #333;
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
	background-color: #fff;
	padding: 30rpx;
	margin-bottom: 20rpx;
	
	.section-title {
		font-size: 32rpx;
		color: #333;
		font-weight: bold;
		margin-bottom: 20rpx;
	}
	
	.desc-text {
		font-size: 28rpx;
		color: #666;
		line-height: 1.6;
		margin-bottom: 30rpx;
	}
	
	.open-info {
		.info-item {
			display: flex;
			margin-bottom: 16rpx;
			
			&:last-child {
				margin-bottom: 0;
			}
			
			.label {
				font-size: 28rpx;
				color: #333;
				width: 160rpx;
			}
			
			.value {
				flex: 1;
				font-size: 28rpx;
				color: #666;
			}
		}
	}
}

.comment-section {
	background-color: #fff;
	padding: 30rpx;
	margin-bottom: 20rpx;
	
	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 30rpx;
		
		.title {
			font-size: 32rpx;
			color: #333;
			font-weight: bold;
		}
		
		.more {
			font-size: 28rpx;
			color: #2b9939;
		}
	}
	
	.comment-list {
		.comment-item {
			display: flex;
			padding: 20rpx 0;
			border-bottom: 1rpx solid #eee;
			
			&:last-child {
				border-bottom: none;
			}
			
			.avatar {
				width: 80rpx;
				height: 80rpx;
				border-radius: 40rpx;
				margin-right: 20rpx;
			}
			
			.content {
				flex: 1;
				
				.user-info {
					display: flex;
					justify-content: space-between;
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
					line-height: 1.6;
					margin-bottom: 16rpx;
				}
				
				.image-list {
					display: flex;
					flex-wrap: wrap;
					margin-bottom: 16rpx;
					
					image {
						width: 160rpx;
						height: 160rpx;
						margin-right: 10rpx;
						margin-bottom: 10rpx;
						border-radius: 8rpx;
						
						&:nth-child(3n) {
							margin-right: 0;
						}
					}
				}
				
				.date {
					font-size: 24rpx;
					color: #999;
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
	
	.left {
		display: flex;
		
		.action-btn {
			display: flex;
			flex-direction: column;
			align-items: center;
			margin-right: 40rpx;
			
			.iconfont {
				font-size: 40rpx;
				color: #666;
				margin-bottom: 4rpx;
				
				&.icon-heart-fill {
					color: #ff5b05;
				}
			}
			
			text {
				font-size: 24rpx;
				color: #666;
			}
		}
	}
	
	.comment-btn {
		flex: 1;
		height: 72rpx;
		line-height: 72rpx;
		text-align: center;
		background-color: #2B9939;
		color: #fff;
		font-size: 28rpx;
		border-radius: 36rpx;
		margin-left: 30rpx;
		
		&::after {
			border: none;
		}
	}
}

/* 弹窗基础样式 */
.popup-mask {
	position: fixed;
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
	background: rgba(0, 0, 0, 0.6);
	z-index: 999;
	display: flex;
	align-items: flex-end;
}

.popup-content {
	width: 100%;
	background-color: #fff;
	border-radius: 24rpx 24rpx 0 0;
	position: relative;
	transition: transform 0.3s;
	max-height: 90vh;
}

.comment-popupouter {	
	transform: translateY(0);
}

.navigation-popup {
	transform: translateY(0);
	padding: 30rpx;
	
	.navigation-options {
		.title {
			font-size: 32rpx;
			color: #333;
			text-align: center;
			margin-bottom: 30rpx;
		}
		
		.option-list {
			display: flex;
			justify-content: space-around;
			margin-bottom: 30rpx;
			
			.option {
				display: flex;
				flex-direction: column;
				align-items: center;
				
				.iconfont {
					font-size: 80rpx;
					color: #2B9939;
					margin-bottom: 10rpx;
				}
				
				.name {
					font-size: 28rpx;
					color: #333;
				}
			}
		}
		
		.cancel {
			height: 90rpx;
			line-height: 90rpx;
			text-align: center;
			font-size: 32rpx;
			color: #666;
			border-top: 1rpx solid #eee;
		}
	}
}

.comment-popup {
	height: 90vh;
	padding: 30rpx;
	box-sizing: border-box;
	
	.popup-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 30rpx;
		
		.title {
			font-size: 32rpx;
			color: #333;
			font-weight: bold;
		}
		
		.close {
			font-size: 48rpx;
			color: #999;
			padding: 0 20rpx;
		}
	}
	
	.rating-box {
		margin-bottom: 30rpx;
		
		.label {
			font-size: 28rpx;
			color: #333;
			margin-bottom: 20rpx;
			display: block;
		}
		
		.slider-container {
			display: flex;
			align-items: center;
			padding: 0 20rpx;
			
			.rating-slider {
				flex: 1;
				margin-right: 20rpx;
			}
			
			.rating-value {
				font-size: 32rpx;
				color: #FF9500;
				font-weight: bold;
				min-width: 80rpx;
			}
		}
	}
	
	.content-box {
		margin-bottom: 30rpx;
		
		.content-label {
			font-size: 28rpx;
			color: #333;
			margin-bottom: 20rpx;
			display: block;
		}
		
		.content-input {
			width: 100%;
			height: 200rpx;
			padding: 20rpx;
			background-color: #f5f5f5;
			border-radius: 12rpx;
			font-size: 28rpx;
			color: #333;
			box-sizing: border-box;
		}
		
		.count {
			font-size: 24rpx;
			color: #999;
			text-align: right;
			margin-top: 10rpx;
			display: block;
		}
	}
	
	.image-box {
		margin-bottom: 30rpx;
		
		.image-label {
			font-size: 28rpx;
			color: #333;
			margin-bottom: 20rpx;
			display: block;
		}
		
		.image-list {
			display: flex;
			flex-wrap: wrap;
			
			.image-item {
				width: 160rpx;
				height: 160rpx;
				margin-right: 20rpx;
				margin-bottom: 20rpx;
				position: relative;
				
				&:nth-child(4n) {
					margin-right: 0;
				}
				
				image {
					width: 100%;
					height: 100%;
					border-radius: 8rpx;
				}
				
				.delete {
					position: absolute;
					top: -16rpx;
					right: -16rpx;
					width: 40rpx;
					height: 40rpx;
					line-height: 36rpx;
					text-align: center;
					background-color: rgba(0,0,0,0.5);
					border-radius: 20rpx;
					color: #fff;
					font-size: 32rpx;
				}
			}
			
			.upload-btn {
				width: 160rpx;
				height: 160rpx;
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
				background-color: #f5f5f5;
				border-radius: 8rpx;
				
				.iconfont {
					font-size: 48rpx;
					color: #999;
					margin-bottom: 10rpx;
				}
				
				.tip {
					font-size: 24rpx;
					color: #999;
				}
			}
		}
	}
	
	.submit-btn {
		width: 100%;
		height: 88rpx;
		line-height: 88rpx;
		text-align: center;
		background-color: #ccc;
		color: #fff;
		font-size: 32rpx;
		border-radius: 44rpx;
		margin-top: 40rpx;
		
		&.active {
			background-color: #2B9939;
		}
		
		&::after {
			border: none;
		}
	}
}
</style> 