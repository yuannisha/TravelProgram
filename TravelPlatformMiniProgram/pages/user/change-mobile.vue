<template>
	<view class="container">
		<view class="form-box">
			<!-- 新手机号输入 -->
			<view class="input-group">
				<text class="label">新手机号</text>
				<view class="input-box">
					<text class="prefix">+86</text>
					<input 
						type="number" 
						v-model="phone"
						maxlength="11"
						placeholder="请输入新手机号"
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
		
		<!-- 提交按钮 -->
		<button 
			class="submit-btn" 
			:class="{ active: canSubmit }"
			:disabled="!canSubmit"
			@click="changeMobile"
		>
			确认修改
		</button>
	</view>
</template>

<script>
/**
 * 更换手机号页面
 * @description 用户可以更换绑定的手机号
 */
export default {
	data() {
		return {
			phone: '',
			code: '',
			phoneError: '',
			codeError: '',
			counting: false,
			countdown: 60
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
				!this.codeError
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
			
			try {
				const res = await uniCloud.callFunction({
					name: 'send-sms-code',
					data: {
						phone: this.phone,
						type: 'change-mobile'
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
				console.error('发送验证码失败:', e)
				uni.showToast({
					title: '发送失败，请重试',
					icon: 'none'
				})
			}
		},
		
		// 更换手机号
		async changeMobile() {
			if (!this.canSubmit) return
			
			try {
				const userInfo = uni.getStorageSync('userInfo')
				if (!userInfo || !userInfo.id) {
					throw new Error('用户未登录')
				}
				
				const res = await uniCloud.callFunction({
					name: 'change-mobile',
					data: {
						userId: userInfo.id,
						newMobile: this.phone,
						code: this.code
					}
				})
				
				if (res.result.code === 0) {
					// 更新本地存储的用户信息
					userInfo.mobile = this.phone
					uni.setStorageSync('userInfo', userInfo)
					
					uni.showToast({
						title: '修改成功',
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
				console.error('更换手机号失败:', e)
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
			
			.prefix {
				font-size: 28rpx;
				color: #666;
				margin-right: 20rpx;
			}
			
			input {
				flex: 1;
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
				text-align: center;
				margin-left: 20rpx;
				
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