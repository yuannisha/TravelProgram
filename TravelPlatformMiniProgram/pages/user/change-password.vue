<template>
	<view class="container">
		<view class="form-box">
			<!-- 旧密码输入 -->
			<view class="input-group">
				<text class="label">当前密码</text>
				<view class="input-box">
					<input 
						:type="showOldPassword ? 'text' : 'password'"
						v-model="oldPassword"
						placeholder="请输入当前密码"
					/>
					<text 
						class="iconfont" 
						:class="showOldPassword ? 'icon-eye' : 'icon-eye-close'"
						@click="showOldPassword = !showOldPassword"
					></text>
				</view>
			</view>
			
			<!-- 新密码输入 -->
			<view class="input-group">
				<text class="label">新密码</text>
				<view class="input-box">
					<input 
						:type="showNewPassword ? 'text' : 'password'"
						v-model="newPassword"
						placeholder="请输入新密码"
						@input="checkPassword"
					/>
					<text 
						class="iconfont" 
						:class="showNewPassword ? 'icon-eye' : 'icon-eye-close'"
						@click="showNewPassword = !showNewPassword"
					></text>
				</view>
				<text class="error" v-if="passwordError">{{passwordError}}</text>
			</view>
			
			<!-- 确认新密码 -->
			<view class="input-group">
				<text class="label">确认新密码</text>
				<view class="input-box">
					<input 
						:type="showConfirmPassword ? 'text' : 'password'"
						v-model="confirmPassword"
						placeholder="请再次输入新密码"
						@input="checkConfirmPassword"
					/>
					<text 
						class="iconfont" 
						:class="showConfirmPassword ? 'icon-eye' : 'icon-eye-close'"
						@click="showConfirmPassword = !showConfirmPassword"
					></text>
				</view>
				<text class="error" v-if="confirmError">{{confirmError}}</text>
			</view>
		</view>
		
		<!-- 提交按钮 -->
		<button 
			class="submit-btn" 
			:class="{ active: canSubmit }"
			:disabled="!canSubmit"
			@click="changePassword"
		>
			确认修改
		</button>
	</view>
</template>

<script>
/**
 * 修改密码页面
 * @description 用户可以修改自己的登录密码
 */
export default {
	data() {
		return {
			oldPassword: '',
			newPassword: '',
			confirmPassword: '',
			showOldPassword: false,
			showNewPassword: false,
			showConfirmPassword: false,
			passwordError: '',
			confirmError: ''
		}
	},
	computed: {
		// 是否可以提交
		canSubmit() {
			return this.oldPassword && 
				this.newPassword && 
				this.confirmPassword && 
				!this.passwordError && 
				!this.confirmError
		}
	},
	methods: {
		// 检查密码格式
		checkPassword() {
			if (this.newPassword.length > 0) {
				if (this.newPassword.length < 6 || this.newPassword.length > 20) {
					this.passwordError = '密码长度应为6-20位'
				} else if (!/^[a-zA-Z0-9_]+$/.test(this.newPassword)) {
					this.passwordError = '密码只能包含字母、数字和下划线'
				} else {
					this.passwordError = ''
					this.checkConfirmPassword()
				}
			} else {
				this.passwordError = ''
			}
		},
		
		// 检查确认密码
		checkConfirmPassword() {
			if (this.confirmPassword.length > 0) {
				if (this.confirmPassword !== this.newPassword) {
					this.confirmError = '两次输入的密码不一致'
				} else {
					this.confirmError = ''
				}
			} else {
				this.confirmError = ''
			}
		},
		
		// 修改密码
		async changePassword() {
			if (!this.canSubmit) return
			
			try {
				const userInfo = uni.getStorageSync('userInfo')
				if (!userInfo || !userInfo.id) {
					throw new Error('用户未登录')
				}
				
				const res = await uniCloud.callFunction({
					name: 'change-password',
					data: {
						userId: userInfo.id,
						oldPassword: this.oldPassword,
						newPassword: this.newPassword
					}
				})
				
				if (res.result.code === 0) {
					uni.showToast({
						title: '修改成功，请重新登录',
						icon: 'none'
					})
					
					// 清除登录信息
					uni.removeStorageSync('token')
					uni.removeStorageSync('userInfo')
					
					// 返回到登录页
					setTimeout(() => {
						uni.reLaunch({
							url: '/pages/user/login'
						})
					}, 1500)
				} else {
					throw new Error(res.result.message)
				}
			} catch (e) {
				console.error('修改密码失败:', e)
				uni.showToast({
					title: e.message || '修改失败，请重试',
					icon: 'none'
				})
			}
		}
	}
}
</script>

<style lang="scss">
.container {
	min-height: 100vh;
	background-color: #f5f5f5;
	padding: 40rpx;
}

.form-box {
	background-color: #fff;
	border-radius: 12rpx;
	padding: 20rpx;
	
	.input-group {
		margin-bottom: 30rpx;
		
		.label {
			font-size: 28rpx;
			color: #333;
			margin-bottom: 20rpx;
			display: block;
		}
		
		.input-box {
			display: flex;
			align-items: center;
			border-bottom: 1rpx solid #eee;
			padding: 20rpx 0;
			
			input {
				flex: 1;
				font-size: 28rpx;
				color: #333;
			}
			
			.iconfont {
				font-size: 40rpx;
				color: #999;
				padding: 0 20rpx;
			}
		}
		
		.error {
			font-size: 24rpx;
			color: #ff5b05;
			margin-top: 10rpx;
		}
	}
}

.submit-btn {
	margin-top: 60rpx;
	height: 88rpx;
	line-height: 88rpx;
	text-align: center;
	background-color: #ccc;
	color: #fff;
	border-radius: 44rpx;
	font-size: 32rpx;
	
	&.active {
		background-color: #2B9939;
	}
	
	&::after {
		border: none;
	}
}
</style> 