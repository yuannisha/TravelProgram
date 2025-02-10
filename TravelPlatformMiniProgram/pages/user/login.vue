<template>
	<view class="container">
		<view class="header">
			<text class="subtitle">欢迎使用旅游小程序</text>
		</view>
		
		<view class="form">
			<!-- 手机号输入 -->
			<view class="form-item">
				<text class="iconfont icon-phone"></text>
				<input 
					type="number" 
					v-model="phone"
					maxlength="11"
					placeholder="请输入手机号"
					@input="checkPhone"
				/>
			</view>
			<text class="error-text" v-if="phoneError">{{phoneError}}</text>
			
			<!-- 密码输入 -->
			<view class="form-item">
				<text class="iconfont icon-lock"></text>
				<input 
					:type="showPassword ? 'text' : 'password'"
					v-model="password"
					placeholder="请输入密码"
				/>
				<text 
					class="iconfont" 
					:class="showPassword ? 'icon-eye' : 'icon-eye-close'"
					@click="showPassword = !showPassword"
				></text>
			</view>
			<text class="error-text" v-if="passwordError">{{passwordError}}</text>
			
			<!-- 验证码输入 -->
			<view class="form-item">
				<text class="iconfont icon-safe"></text>
				<input 
					type="number" 
					v-model="code"
					maxlength="6"
					placeholder="请输入验证码"
				/>
				<button 
					class="code-btn"
					:class="{ active: canSendCode && !counting }"
					:disabled="!canSendCode || counting"
					@click="sendCode"
				>
					{{counting ? `${countdown}s后重试` : '获取验证码'}}
				</button>
			</view>
			<text class="error-text" v-if="codeError">{{codeError}}</text>
		</view>
		
		<!-- 登录按钮 -->
		<button 
			class="submit-btn" 
			:class="{ active: canSubmit }"
			:disabled="!canSubmit"
			@click="login"
		>
			登录
		</button>
		
		<!-- 用户协议 -->
		<view class="agreement">
			<checkbox :checked="agreed" @click="agreed = !agreed"></checkbox>
			<text class="agreement-text">
				登录即代表同意
				<text class="link" @click="goToUserAgreement">《用户协议》</text>
				和
				<text class="link" @click="goToPrivacyPolicy">《隐私政策》</text>
			</text>
		</view>

		<!-- 注册入口 -->
		<view class="register-link">
			<text>还没有账号？</text>
			<text class="link" @click="goToRegister">立即注册</text>
		</view>
	</view>
</template>

<script>
/**
 * 登录页面
 * @description 用户登录界面，支持手机号+密码+验证码登录
 */
export default {
	data() {
		return {
			phone: '',
			password: '',
			code: '',
			phoneError: '',
			passwordError: '',
			codeError: '',
			agreed: false,
			counting: false,
			countdown: 60,
			showPassword: false
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
				this.password.length >= 6 &&
				this.code.length === 6 && 
				!this.phoneError && 
				!this.passwordError && 
				!this.codeError &&
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
		
		// 发送验证码
		async sendCode() {
			if (!this.canSendCode || this.counting) return

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
		},
		
		// 登录
		async login() {
			if (!this.canSubmit) return
			
			try {
				const res = await uniCloud.callFunction({
					name: 'user-login',
					data: {
						phone: this.phone,
						password: this.password,
						code: this.code
					}
				})

				console.log("登录的手机号：", this.phone)
				console.log("登录的密码：", this.password)
				console.log("登录的验证码：", this.code)
				console.log("登录结果：", res)

				if (res.result.code === 0) {
					// 保存token和用户信息
					uni.setStorageSync('token', res.result.token)
					uni.setStorageSync('userInfo', res.result.userInfo)
					
					uni.showToast({
						title: '登录成功',
						icon: 'success'
					})
					
					// 返回上一页
					setTimeout(() => {
						uni.switchTab({
							url: '/pages/user/user'	
						})
					}, 1500)

				} else {
					uni.showToast({
						title: res.result.message,
						icon: 'none'
					})
				}
			} catch (e) {
				console.error('登录失败:', e)
				uni.showToast({
					title: '登录失败，请重试',
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
		
		// 跳转到注册页面
		goToRegister() {
			uni.navigateTo({
				url: '/pages/user/register'
			})
		}
	}
}
</script>

<style lang="scss">
.container {
	padding: 60rpx 40rpx;
}

.header {
	margin-bottom: 60rpx;
	
	.title {
		font-size: 48rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 20rpx;
	}
	
	.subtitle {
		font-size: 28rpx;
		color: #999;
	}
}

.form {
	margin-bottom: 60rpx;
	
	.form-item {
		display: flex;
		align-items: center;
		height: 100rpx;
		padding: 0 30rpx;
		background-color: #f5f5f5;
		border-radius: 12rpx;
		margin-bottom: 20rpx;
		
		.iconfont {
			font-size: 40rpx;
			color: #999;
			margin-right: 20rpx;
		}
		
		input {
			flex: 1;
			height: 100%;
			font-size: 28rpx;
		}
		
		.code-btn {
			width: 200rpx;
			height: 60rpx;
			line-height: 60rpx;
			text-align: center;
			font-size: 24rpx;
			color: #999;
			background-color: #eee;
			border-radius: 30rpx;
			margin-left: 20rpx;
			
			&.active {
				color: #fff;
				background-color: #2B9939;
			}
			
			&::after {
				border: none;
			}
		}
	}
	
	.error-text {
		font-size: 24rpx;
		color: #ff5b05;
		margin: -10rpx 0 20rpx 30rpx;
	}
}

.submit-btn {
	width: 100%;
	height: 90rpx;
	line-height: 90rpx;
	text-align: center;
	font-size: 32rpx;
	color: #fff;
	background-color: #ddd;
	border-radius: 45rpx;
	margin-bottom: 40rpx;
	
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

.register-link {
	text-align: center;
	font-size: 28rpx;
	color: #999;
	margin-top: 40rpx;
	
	.link {
		color: #2B9939;
		margin-left: 10rpx;
	}
}
</style> 