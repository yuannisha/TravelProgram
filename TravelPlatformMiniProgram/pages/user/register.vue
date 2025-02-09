<template>
	<view class="container">
		<view class="header">
			<image class="logo" src="/static/logo.png" mode="aspectFit"></image>
			<text class="title">注册账号</text>
			<text class="subtitle">欢迎加入旅游平台</text>
		</view>
		
		<view class="form-box">
			<!-- 手机号输入 -->
			<view class="input-group">
				<text class="label">手机号</text>
				<view class="input-box">
					<text class="prefix">+86</text>
					<input 
						type="number" 
						v-model="phone"
						maxlength="11"
						placeholder="请输入手机号"
						@input="checkPhone"
					/>
				</view>
				<text class="error" v-if="phoneError">{{phoneError}}</text>
			</view>
			
			<!-- 验证码输入 -->
			<view class="input-group">
				<text class="label">验证码</text>
				<view class="input-box">
					<input 
						type="number" 
						v-model="code"
						maxlength="6"
						placeholder="请输入验证码"
					/>
					<button 
						class="code-btn" 
						:disabled="!canSendCode || counting" 
						@click="sendCode"
					>
						{{counting ? `${countdown}s后重发` : '获取验证码'}}
					</button>
				</view>
				<text class="error" v-if="codeError">{{codeError}}</text>
			</view>
			
			<!-- 密码输入 -->
			<view class="input-group">
				<text class="label">设置密码</text>
				<view class="input-box">
					<input 
						:type="showPassword ? 'text' : 'password'"
						v-model="password"
						placeholder="请设置6-20位密码"
						@input="checkPassword"
					/>
					<text 
						class="iconfont" 
						:class="showPassword ? 'icon-eye' : 'icon-eye-close'"
						@click="showPassword = !showPassword"
					></text>
				</view>
				<text class="error" v-if="passwordError">{{passwordError}}</text>
			</view>
			
			<!-- 昵称输入 -->
			<view class="input-group">
				<text class="label">昵称</text>
				<view class="input-box">
					<input 
						type="text" 
						v-model="nickname"
						placeholder="请输入昵称"
					/>
				</view>
			</view>
		</view>
		
		<!-- 注册按钮 -->
		<button 
			class="submit-btn" 
			:class="{ active: canSubmit }"
			:disabled="!canSubmit"
			@click="register"
		>
			注册
		</button>
		
		<!-- 用户协议 -->
		<view class="agreement">
			<checkbox :checked="agreed" @click="agreed = !agreed"></checkbox>
			<text class="agreement-text">
				注册即代表同意
				<text class="link" @click="goToUserAgreement">《用户协议》</text>
				和
				<text class="link" @click="goToPrivacyPolicy">《隐私政策》</text>
			</text>
		</view>
		
		<!-- 登录入口 -->
		<view class="login-link">
			<text>已有账号？</text>
			<text class="link" @click="goToLogin">立即登录</text>
		</view>
	</view>
</template>

<script>
/**
 * 注册页面
 * @description 用户注册
 */
export default {
	data() {
		return {
			phone: '',
			code: '',
			password: '',
			nickname: '',
			phoneError: '',
			codeError: '',
			passwordError: '',
			counting: false,
			countdown: 60,
			showPassword: false,
			agreed: false
		}
	},
	computed: {
		// 是否可以发送验证码
		canSendCode() {
			return this.phone.length === 11 && !this.phoneError
		},
		// 是否可以提交
		canSubmit() {
			return this.phone.length === 11 && 
				this.code.length === 6 && 
				this.password.length >= 6 &&
				this.nickname &&
				!this.phoneError && 
				!this.codeError &&
				!this.passwordError &&
				this.agreed
		}
	},
	methods: {
		// 检查手机号格式
		checkPhone() {
			if (this.phone.length === 11) {
				if (!/^1[3-9]\d{9}$/.test(this.phone)) {
					this.phoneError = '请输入正确的手机号'
				} else {
					this.phoneError = ''
				}
			} else {
				this.phoneError = ''
			}
		},
		
		// 检查密码格式
		checkPassword() {
			if (this.password.length > 0) {
				if (this.password.length < 6 || this.password.length > 20) {
					this.passwordError = '密码长度应为6-20位'
				} else if (!/^[a-zA-Z0-9_]+$/.test(this.password)) {
					this.passwordError = '密码只能包含字母、数字和下划线'
				} else {
					this.passwordError = ''
				}
			} else {
				this.passwordError = ''
			}
		},
		
		// 发送验证码
		async sendCode() {
			if (!this.canSendCode || this.counting) return
			
			try {
				const res = await uniCloud.callFunction({
					name: 'send-sms-code',
					data: {
						phone: this.phone,
						type: 'register'
					}
				})
				
				if (res.result.code === 0) {
					uni.showToast({
						title: '验证码已发送',
						icon: 'none'
					})
					
					// 开始倒计时
					this.counting = true
					this.countdown = 60
					const timer = setInterval(() => {
						this.countdown--
						if (this.countdown === 0) {
							clearInterval(timer)
							this.counting = false
						}
					}, 1000)
				} else {
					uni.showToast({
						title: res.result.message,
						icon: 'none'
					})
				}
			} catch (e) {
				uni.showToast({
					title: '发送失败，请重试',
					icon: 'none'
				})
			}
		},
		
		// 注册
		async register() {
			if (!this.canSubmit) return
			
			try {
				const res = await uniCloud.callFunction({
					name: 'user-register',
					data: {
						phone: this.phone,
						code: this.code,
						password: this.password,
						nickname: this.nickname
					}
				})
				
				if (res.result.code === 0) {
					uni.showToast({
						title: '注册成功',
						icon: 'success'
					})
					
					// 保存token
					uni.setStorageSync('token', res.result.token)
					
					// 返回上一页
					setTimeout(() => {
						uni.navigateBack()
					}, 1500)
				} else {
					uni.showToast({
						title: res.result.message,
						icon: 'none'
					})
				}
			} catch (e) {
				uni.showToast({
					title: '注册失败，请重试',
					icon: 'none'
				})
			}
		},
		
		// 查看用户协议
		goToUserAgreement() {
			uni.navigateTo({
				url: '/pages/user/agreement'
			})
		},
		
		// 查看隐私政策
		goToPrivacyPolicy() {
			uni.navigateTo({
				url: '/pages/user/privacy'
			})
		},
		
		// 跳转到登录页
		goToLogin() {
			uni.navigateBack()
		}
	}
}
</script>

<style lang="scss">
.container {
	padding: 60rpx 40rpx;
}

.header {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-bottom: 80rpx;
	
	.logo {
		width: 160rpx;
		height: 160rpx;
		margin-bottom: 20rpx;
	}
	
	.title {
		font-size: 40rpx;
		color: #333;
		font-weight: bold;
		margin-bottom: 10rpx;
	}
	
	.subtitle {
		font-size: 28rpx;
		color: #999;
	}
}

.form-box {
	.input-group {
		margin-bottom: 40rpx;
		
		.label {
			font-size: 28rpx;
			color: #333;
			margin-bottom: 20rpx;
			display: block;
		}
		
		.input-box {
			display: flex;
			align-items: center;
			height: 88rpx;
			padding: 0 30rpx;
			background-color: #f5f5f5;
			border-radius: 12rpx;
			
			.prefix {
				font-size: 28rpx;
				color: #333;
				margin-right: 20rpx;
			}
			
			input {
				flex: 1;
				height: 100%;
				font-size: 28rpx;
				color: #333;
			}
			
			.code-btn {
				width: 200rpx;
				height: 60rpx;
				line-height: 60rpx;
				font-size: 24rpx;
				color: #fff;
				background-color: #2B9939;
				border-radius: 30rpx;
				padding: 0;
				margin: 0;
				
				&[disabled] {
					background-color: #ccc;
				}
				
				&::after {
					border: none;
				}
			}
			
			.iconfont {
				font-size: 40rpx;
				color: #999;
				padding: 20rpx;
				margin-right: -20rpx;
			}
		}
		
		.error {
			font-size: 24rpx;
			color: #FF5B05;
			margin-top: 10rpx;
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
	margin: 60rpx 0;
	
	&.active {
		background-color: #2B9939;
	}
	
	&::after {
		border: none;
	}
}

.agreement {
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 40rpx;
	
	checkbox {
		transform: scale(0.7);
		margin-right: 10rpx;
	}
	
	.agreement-text {
		font-size: 24rpx;
		color: #999;
		
		.link {
			color: #2B9939;
		}
	}
}

.login-link {
	text-align: center;
	font-size: 28rpx;
	color: #999;
	
	.link {
		color: #2B9939;
		margin-left: 10rpx;
	}
}
</style> 