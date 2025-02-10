<template>
	<view class="container">
		<view class="avatar-preview">
			<image :src="currentAvatar" mode="aspectFill"></image>
		</view>
		
		<view class="action-buttons">
			<button class="btn" @click="chooseImage">选择图片</button>
			<button class="btn primary" @click="uploadAvatar" :disabled="!hasNewImage">更新头像</button>
		</view>
	</view>
</template>

<script>
/**
 * 头像预览和更新页面
 * @description 用户可以预览和更换头像
 */
export default {
	data() {
		return {
			currentAvatar: '',
			tempFilePath: '',
			hasNewImage: false
		}
	},
	onLoad() {
		const userInfo = uni.getStorageSync('userInfo')
		if (userInfo) {
			this.currentAvatar = userInfo.avatar
		}
	},
	methods: {
		// 选择图片
		chooseImage() {
			uni.chooseImage({
				count: 1,
				sizeType: ['compressed'],
				sourceType: ['album', 'camera'],
				success: (res) => {
					this.tempFilePath = res.tempFilePaths[0]
					this.currentAvatar = this.tempFilePath
					this.hasNewImage = true
				}
			})
		},
		
		// 上传头像
		async uploadAvatar() {
			if (!this.hasNewImage) return
			
			try {
				uni.showLoading({
					title: '上传中...'
				})
				
				// 上传文件到云存储
				const uploadRes = await uniCloud.uploadFile({
					filePath: this.tempFilePath,
					cloudPath: `avatar/${Date.now()}.jpg`
				})
				
				const userInfo = uni.getStorageSync('userInfo')
				if (!userInfo || !userInfo.id) {
					throw new Error('用户未登录')
				}
				
				// 调用云函数更新头像
				const res = await uniCloud.callFunction({
					name: 'update-avatar',
					data: {
						userId: userInfo.id,
						avatar: uploadRes.fileID
					}
				})
				
				if (res.result.code === 0) {
					// 更新本地存储的用户信息
					userInfo.avatar = res.result.avatar
					uni.setStorageSync('userInfo', userInfo)
					
					uni.showToast({
						title: '更新成功',
						icon: 'success'
					})
					
					// 返回上一页
					setTimeout(() => {
						uni.navigateBack()
					}, 1500)
				} else {
					throw new Error(res.result.message)
				}
				
			} catch (e) {
				console.error('上传头像失败:', e)
				uni.showToast({
					title: '上传失败，请重试',
					icon: 'none'
				})
			} finally {
				uni.hideLoading()
			}
		}
	}
}
</script>

<style lang="scss">
.container {
	padding: 40rpx;
}

.avatar-preview {
	width: 400rpx;
	height: 400rpx;
	margin: 0 auto 60rpx;
	border-radius: 50%;
	overflow: hidden;
	box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.1);
	
	image {
		width: 100%;
		height: 100%;
	}
}

.action-buttons {
	.btn {
		width: 100%;
		height: 88rpx;
		line-height: 88rpx;
		text-align: center;
		font-size: 32rpx;
		color: #333;
		background-color: #f5f5f5;
		border-radius: 44rpx;
		margin-bottom: 30rpx;
		
		&.primary {
			color: #fff;
			background-color: #2B9939;
			
			&[disabled] {
				background-color: #ccc;
			}
		}
		
		&::after {
			border: none;
		}
	}
}
</style> 