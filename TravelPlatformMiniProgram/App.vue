<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
			// 监听网络状态
			uni.onNetworkStatusChange(function(res) {
				if (!res.isConnected) {
					uni.showToast({
						title: '网络连接已断开',
						icon: 'none'
					})
				}
			})
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		},
		onError: function(err) {
			console.error('App Error:', err)
			// 可以添加错误上报逻辑
		}
	}
</script>

<style lang="scss">
	/* 引入图标字体 */
	@font-face {
		font-family: "iconfont";
		src: url('/static/fonts/iconfont.ttf') format('truetype');
	}

	/* 全局样式 */
	page {
		background-color: $bg-color;
		font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica,
			Segoe UI, Arial, Roboto, 'PingFang SC', 'miui', 'Hiragino Sans GB', 'Microsoft Yahei',
			sans-serif;
	}
</style>
