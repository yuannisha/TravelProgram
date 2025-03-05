<template>
	<view class="container">
		<!-- 用户信息卡片 -->
		<view class="user-card">
			<view class="user-info" @click="goToLogin" v-if="!isLogin">
				<image class="avatar" src="/static/avatar/default-avatar.png" mode="aspectFill"></image>
				<text class="login-text">登录/注册</text>
			</view>
			<view class="user-info" v-else>
				<image class="avatar" :src="userInfo.avatar" mode="aspectFill" @click="goToAvatar"></image>
				<view class="info-right">
					<text class="username">{{userInfo.username}}</text>
				</view>
			</view>
		</view>
		
		<!-- 功能列表 -->
		<view class="menu-list">
			<view class="menu-group">
				<view class="menu-item" @click="goToProfile">
					<view class="left">
						<text class="iconfont icon-user"></text>
						<text class="title">个人信息</text>
					</view>
					<text class="iconfont icon-arrow-right"></text>
				</view>
				<view class="menu-item" @click="goToFavorites">
					<view class="left">
						<text class="iconfont icon-heart"></text>
						<text class="title">我的收藏</text>
					</view>
					<text class="iconfont icon-arrow-right"></text>
				</view>
				<view class="menu-item" @click="goToPlans">
					<view class="left">
						<text class="iconfont icon-calendar"></text>
						<text class="title">我的旅行计划</text>
					</view>
					<text class="iconfont icon-arrow-right"></text>
				</view>
			</view>
			
			<view class="menu-group">
				<view class="menu-item" @click="goToSettings">
					<view class="left">
						<text class="iconfont icon-settings"></text>
						<text class="title">设置</text>
					</view>
					<text class="iconfont icon-arrow-right"></text>
				</view>
				<view class="menu-item" @click="goToAbout">
					<view class="left">
						<text class="iconfont icon-info"></text>
						<text class="title">关于我们</text>
					</view>
					<text class="iconfont icon-arrow-right"></text>
				</view>
			</view>
		</view>
		
		<!-- 退出登录按钮 -->
		<button class="logout-btn" v-if="isLogin" @click="logout">退出登录</button>
	</view>
</template>

<script>
/**
 * 用户中心页面
 * @description 展示用户信息，提供各种功能入口
 */
export default {
	data() {
		return {
			isLogin: false,
			userInfo: null
		}
	},
	onShow() {
		const app = getApp();
		app.globalData.checkLoginStatus(true); 
		// 检查登录状态
		this.checkLoginStatus()
	},
	onLoad() {
		// 页面加载时检查登录状态
		const app = getApp();
		app.globalData.checkLoginStatus(true); 
	},
	methods: {
		// 检查登录状态
		checkLoginStatus() {
			// TODO: 实际项目中需要检查登录状态
			const token = uni.getStorageSync('token')
			this.isLogin = !!token
			if (this.isLogin) {
				//this.getUserInfo()
				this.userInfo = uni.getStorageSync('userInfo')
				console.log(this.userInfo)
			}else{
				this.userInfo = {
					avatar: '/static/avatar/default-avatar.png',

					username: '游客',
					userId: '10001'
				}
			}
		},	

		// 获取用户信息
		async getUserInfo() {
			// TODO: 调用后端接口获取用户信息
			uni.getStorageSync('userInfo', res.result.userInfo)
		},
		
		// 跳转到登录页
		goToLogin() {
			uni.navigateTo({
				url: '/pages/user/login'
			})
		},
		
		// 跳转到收藏页
		goToFavorites() {
			if (!this.isLogin) {
				this.goToLogin()
				return
			}
			uni.navigateTo({
				url: '/pages/user/favorites'
			})
		},
		
		// 跳转到旅行计划页
		goToPlans() {
			if (!this.isLogin) {
				this.goToLogin()
				return
			}
			uni.navigateTo({
				url: '/pages/plans/plans'
			})
		},
		
		// 跳转到设置页
		goToSettings() {
			uni.navigateTo({
				url: '/pages/user/settings'
			})
		},
		
		// 跳转到关于页
		goToAbout() {
			uni.navigateTo({
				url: '/pages/user/about'
			})
		},
		
		// 跳转到头像页面
		goToAvatar() {
			if (!this.isLogin) return
			uni.navigateTo({
				url: '/pages/user/avatar'
			})
		},
		
		// 跳转到个人信息页
		goToProfile() {
			if (!this.isLogin) {
				this.goToLogin()
				return
			}
			uni.navigateTo({
				url: '/pages/user/profile'
			})
		},
		
		// 退出登录
		logout() {
			uni.showModal({
				title: '提示',
				content: '确定要退出登录吗？',
				success: res => {
					if (res.confirm) {
						uni.removeStorageSync('token')
						this.isLogin = false
						this.userInfo = {
							avatar: '/static/avatar/default-avatar.png',
							username: '游客',
							userId: '10001'
						}
						uni.showToast({
							title: '已退出登录',
							icon: 'none'
						})
					}
				}
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

.user-card {
	background-color: #2B9939;
	padding: 40rpx 30rpx;
	
	.user-info {
		display: flex;
		align-items: center;
		
		.avatar {
			width: 120rpx;
			height: 120rpx;
			border-radius: 60rpx;
			border: 4rpx solid rgba(255, 255, 255, 0.2);
		}
		
		.login-text {
			margin-left: 30rpx;
			font-size: 36rpx;
			color: #fff;
			font-weight: bold;
		}
		
		.info-right {
			margin-left: 30rpx;
			
			.username {
				font-size: 36rpx;
				color: #fff;
				font-weight: bold;
				margin-bottom: 10rpx;
			}
			
			.user-id {
				font-size: 24rpx;
				color: rgba(255, 255, 255, 0.8);
			}
		}
	}
}

.menu-list {
	padding: 20rpx;
	
	.menu-group {
		background-color: #fff;
		border-radius: 12rpx;
		margin-bottom: 20rpx;
		
		.menu-item {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 30rpx;
			border-bottom: 1rpx solid #eee;
			
			&:last-child {
				border-bottom: none;
			}
			
			.left {
				display: flex;
				align-items: center;
				
				.iconfont {
					font-size: 40rpx;
					margin-right: 20rpx;
					
					&.icon-heart {
						color: #FF5B05;
					}
					
					&.icon-history {
						color: #2B9939;
					}
					
					&.icon-settings {
						color: #666;
					}
					
					&.icon-info {
						color: #2B9939;
					}
				}
				
				.title {
					font-size: 28rpx;
					color: #333;
				}
			}
			
			.icon-arrow-right {
				font-size: 24rpx;
				color: #999;
			}
		}
	}
}

.logout-btn {
	margin: 40rpx 30rpx;
	height: 80rpx;
	line-height: 80rpx;
	text-align: center;
	background-color: #fff;
	border-radius: 40rpx;
	color: #FF5B05;
	font-size: 28rpx;
	
	&::after {
		border: none;
	}
}
</style> 