<template>
	<view class="container">
		<view class="profile-list">
			<view class="profile-item" @click="goToAvatar">
				<text class="label">头像</text>
				<view class="right">
					<image class="avatar" :src="userInfo.avatar" mode="aspectFill"></image>
					<text class="iconfont icon-arrow-right"></text>
				</view>
			</view>
			
			<view class="profile-item">
				<text class="label">用户名</text>
				<view class="right">
					<input 
						type="text"
						v-model="userInfo.username"
						placeholder="请输入用户名"
						@blur="updateField('username')"

					/>
				</view>
			</view>
			
			<view class="profile-item">
				<text class="label">性别</text>
				<view class="right">
					<text>{{userInfo.gender === 1 ? '男' : '女'}}</text>
				</view>
			</view>
			
			<view class="profile-item" @click="goToChangeMobile">
				<text class="label">手机号</text>
				<view class="right">
					<text>{{formatPhone(userInfo.mobile)}}</text>
					<text class="iconfont icon-arrow-right"></text>
				</view>
			</view>
			
			<view class="profile-item" @click="goToChangePassword">
				<text class="label">修改密码</text>
				<view class="right">
					<text class="iconfont icon-arrow-right"></text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
/**
 * 个人信息页面
 * @description 用户可以查看和修改个人信息
 */
export default {
	data() {
		return {
			userInfo: null
		}
	},
	onShow() {
		this.getUserInfo()
	},
	methods: {
		// 获取用户信息
		getUserInfo() {
			const userInfo = uni.getStorageSync('userInfo')
			if (userInfo) {
				this.userInfo = { ...userInfo }
			} else {
				uni.navigateBack()
			}
		},
		
		// 格式化手机号
		formatPhone(phone) {
			return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
		},
		
		// 更新字段
		async updateField(field) {
			try {
				const res = await uniCloud.callFunction({
					name: 'update-user-info',
					data: {
						userId: this.userInfo.id,
						field,
						value: this.userInfo[field]
					}
				})
				
				if (res.result.code === 0) {
					// 更新本地存储
					uni.setStorageSync('userInfo', this.userInfo)
					uni.showToast({
						title: '更新成功',
						icon: 'success'
					})
				} else {
					throw new Error(res.result.message)
				}
			} catch (e) {
				console.error('更新失败:', e)
				uni.showToast({
					title: '更新失败',
					icon: 'none'
				})
			}
		},
		
		// 跳转到头像页
		goToAvatar() {
			uni.navigateTo({
				url: '/pages/user/avatar'
			})
		},
		
		// 跳转到修改密码页
		goToChangePassword() {
			uni.navigateTo({
				url: '/pages/user/change-password'
			})
		},
		
		// 跳转到更换手机号页
		goToChangeMobile() {
			uni.navigateTo({
				url: '/pages/user/change-mobile'
			})
		}
	}
}
</script>

<style lang="scss">
.container {
	min-height: 100vh;
	background-color: #f5f5f5;
	padding: 20rpx;
}

.profile-list {
	background-color: #fff;
	border-radius: 12rpx;
	
	.profile-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 30rpx;
		border-bottom: 1rpx solid #eee;
		
		&:last-child {
			border-bottom: none;
		}
		
		.label {
			font-size: 28rpx;
			color: #333;
		}
		
		.right {
			display: flex;
			align-items: center;
			
			.avatar {
				width: 80rpx;
				height: 80rpx;
				border-radius: 40rpx;
				margin-right: 20rpx;
			}
			
			input {
				text-align: right;
				font-size: 28rpx;
				color: #666;
			}
			
			text {
				font-size: 28rpx;
				color: #666;
			}
			
			.icon-arrow-right {
				font-size: 24rpx;
				color: #999;
				margin-left: 10rpx;
			}
		}
	}
}
</style> 