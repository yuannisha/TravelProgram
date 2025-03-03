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
			
			// 启动时检查登录状态
			this.globalData.checkLoginStatus(false);
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
		},
		// 全局方法
		globalData: {
			/**
			 * 检查登录状态
			 * @param {Boolean} redirect 是否重定向到登录页
			 * @returns {Boolean} 是否已登录
			 */
			checkLoginStatus: function(redirect = true) {
				const token = uni.getStorageSync('token');
				const isLogin = !!token;
				
				if (!isLogin && redirect) {
					// 获取当前页面路径
					const pages = getCurrentPages();
					const currentPage = pages[pages.length - 1];
					const currentRoute = currentPage ? currentPage.route : '';
					
					console.log('当前页面路径:', currentRoute);
					
					// 保存当前页面路径，登录后可以返回
					if (currentRoute && !currentRoute.includes('/pages/user/login')) {
						uni.setStorageSync('loginRedirect', '/' + currentRoute);
					}
					
					// 跳转到登录页面
					uni.navigateTo({
						url: '/pages/user/login'
					});
				}
				
				return isLogin;
			},
			
			/**
			 * 获取当前用户ID
			 * @returns {String} 用户ID
			 */
			getUserId: function() {
				const userInfo = uni.getStorageSync('userInfo');
				console.log("获取当前用户ID",userInfo)
				return userInfo ? userInfo.id : '';
			}
		}
	}
</script>

<style lang="scss">
	/* 全局样式 */
	page {
		background-color: $bg-color;
		font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica,
			Segoe UI, Arial, Roboto, 'PingFang SC', 'miui', 'Hiragino Sans GB', 'Microsoft Yahei',
			sans-serif;
	}
</style>
