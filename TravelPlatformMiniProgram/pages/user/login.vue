<template>
	<view class="container">
		<view class="header">
			<image class="logo" src="/static/logo.png" mode="aspectFit"></image>
			<text class="title">旅游平台</text>
			<text class="subtitle">探索世界的美好</text>
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
	</view>
</template>

<script>
/**
 * 登录页面
 * @description 手机号验证码登录
 */
export default {
	data() {
		return {
			phone: '',
			code: '',
			phoneError: '',
			codeError: '',
			counting: false,
			countdown: 60,
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
				!this.phoneError && 
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
			
			// TODO: 调用发送验证码接口
			
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
			
			uni.showToast({
				title: '验证码已发送',
				icon: 'none'
			})
		},
		
		// 登录
		async login() {
			if (!this.canSubmit) return
			
			// TODO: 调用登录接口
			await new Promise(resolve => setTimeout(resolve, 1000))
			
			// 模拟登录成功
			uni.setStorageSync('token', 'mock_token')
			uni.showToast({
				title: '登录成功',
				icon: 'success'
			})
			
			// 返回上一页
			setTimeout(() => {
				uni.navigateBack()
			}, 1500)
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
</style> 