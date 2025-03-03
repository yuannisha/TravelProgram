<template>
	<view class="container">
		<!-- 搜索栏 -->
		<view class="search-box">
			<view class="search-input" @click="goToSearch">
				<text class="iconfont icon-search"></text>
				<text class="placeholder">搜索景点/地点</text>
			</view>
		</view>
		
		<!-- 地图容器 -->
		<map
			id="map"
			class="map"
			:latitude="latitude"
			:longitude="longitude"
			:markers="markers"
			:polyline="polyline"
			scale="14"
			show-location
		></map>
		
		<view class="navigation-info" v-if="spot">
			<view class="spot-info">
				<text class="name">{{spot.name}}</text>
				<text class="address">{{spot.address}}</text>
			</view>
			<view class="navigation-btn" @click="openMapApp">
				<text class="iconfont icon-navigation"></text>
				<text>导航</text>
			</view>
		</view>
		
		<!-- 景点列表 -->
		<scroll-view 
			class="spot-list" 
			scroll-y
			:style="{ height: listHeight + 'px' }"
			@scrolltolower="loadMore"
		>
			<view class="spot-item" v-for="(item, index) in spotList" :key="index" @click="goToDetail(item._id)">
				<image class="spot-image" :src="item.imageUrl" mode="aspectFill"></image>
				<view class="info">
					<view class="name-box">
						<text class="name">{{item.name}}</text>
						<text class="distance" v-if="item.distance">{{item.distance.toFixed(1)}}km</text>
					</view>
					<view class="rating">
						<text class="score">{{item.rating}}分</text>
						<text class="price">¥{{item.price}}起</text>
					</view>
					<view class="address">{{item.address}}</view>
				</view>
				<view class="nav-btn" @click.stop="openMap(item)">
					<text class="iconfont icon-navigation"></text>
					<text>导航</text>
				</view>
			</view>
			<!-- 导航选项弹窗 -->
		<view class="popup-mask" v-if="showNavigation" @click="hideNavigationOptions">
			<view class="popup-content navigation-popup" @click.stop>
				<view class="navigation-options">
					<view class="title">选择导航方式</view>
					<view class="option-list">
						<view class="option" v-for="(item, index) in navigationOptions" :key="index" @click="navigate(item)">
							<text class="iconfont" :class="item.icon"></text>
							<text class="name">{{item.name}}</text>
						</view>
					</view>
					<view class="cancel" @click="hideNavigationOptions">取消</view>
				</view>
			</view>
		</view>
			<!-- 加载更多 -->
			<view class="loading" v-if="loading">
				<text>正在加载...</text>
			</view>
			<view class="no-more" v-if="noMore">
				<text>没有更多了</text>
			</view>
		</scroll-view>
	</view>
</template>

<script>

/**
 * 地图页面
 * @description 展示景点在地图上的位置，支持导航
 */
export default {
	data() {
		return {
			latitude: 39.909, // 默认纬度（北京）
			longitude: 116.397, // 默认经度（北京）
			scale: 12, // 缩放级别
			markers: [], // 地图标记点
			spotList: [], // 景点列表
			page: 1,
			pageSize: 10,
			loading: false,
			noMore: false,
			listHeight: 400, // 列表高度，单位px
			isLocationReady: false, // 位置是否就绪
			spot: null,
			polyline: [],
			navigationOptions: [
				{ name: '百度地图', icon: 'icon-baidu' },
				{ name: '高德地图', icon: 'icon-gaode' },
				{ name: '腾讯地图', icon: 'icon-tengxun' }
			],
			showNavigation: false,
		}
	},
	onShow() {
		// 页面加载时检查登录状态
		const app = getApp();
		app.globalData.checkLoginStatus(true);
	},	
	onLoad(options) {
		// 页面加载时检查登录状态
		const app = getApp();
		app.globalData.checkLoginStatus(true);
		
		// 获取列表容器高度
		const systemInfo = uni.getSystemInfoSync()
		this.listHeight = systemInfo.windowHeight - 350
		
		// 获取位置信息
		this.getCurrentLocation()
		
		// 获取景点列表
		this.getSpotList()
		
		// 获取景点信息
		if (options.id) {
			this.getSpotInfo(options.id)
		}
	},
	methods: {
		// 获取景点列表
		async getSpotList() {
			try {
				const app = getApp();
				const userId = app.globalData.getUserId();
				
				const res = await uniCloud.callFunction({
					name: 'get-spots',
					data: {
						longitude: this.longitude,
						latitude: this.latitude,
						page: 1,
						pageSize: 10,
						user_id: userId
					}
				})
				
				if (res.result.code === 0) {
					this.spotList = res.result.data.list
					//将spotList的数据以distance正向排序
					this.spotList.sort((a, b) => a.distance - b.distance)	
					console.log("景点列表",this.spotList)
					this.updateMarkers()

				}
			} catch (e) {
				console.error('获取景点列表失败:', e)
				uni.showToast({
					title: '获取景点列表失败',
					icon: 'none'
				})
			}
		},

		// 获取景点信息
		async getSpotInfo(id) {
			try {
				const app = getApp();
				const userId = app.globalData.getUserId();

				const res = await uniCloud.callFunction({
					name: 'get-spot-detail',
					data: { 
						id,
						user_id: userId
					}
				})
				
				if (res.result.code === 0) {
					this.spot = res.result.data
					// 添加标记点
					if (this.spot.location && this.spot.location.coordinates) {
						const [longitude, latitude] = this.spot.location.coordinates
						this.markers = [{
							id: 1,
							latitude,
							longitude,
							title: this.spot.name,
							iconPath: '/static/icons/park.png',
							width: 32,
							height: 32
						}]
					}
				}
			} catch (e) {
				console.error('获取景点信息失败:', e)
				uni.showToast({
					title: '获取景点信息失败',
					icon: 'none'
				})
			}
		},
		// 获取当前位置
		getCurrentLocation() {
			// #ifdef MP-WEIXIN
			this.wxGetLocation()
			// #endif
			
			// #ifdef H5
			this.h5GetLocation()
			// #endif
			
			// #ifdef APP-PLUS
			this.appGetLocation()
			// #endif
		},
		
		// 微信小程序获取位置
		wxGetLocation() {
			uni.authorize({
				scope: 'scope.userLocation',
				success: () => {
					this.getLocationInfo()
				},
				fail: () => {
					uni.showModal({
						title: '提示',
						content: '需要获取您的地理位置，请确认授权',
						success: (res) => {
							if (res.confirm) {
								uni.openSetting()
							} else {
								this.useDefaultLocation()
							}
						}
					})
				}
			})
		},
		
		// H5获取位置
		h5GetLocation() {
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(
					(position) => {
						this.latitude = position.coords.latitude
						this.longitude = position.coords.longitude
						this.isLocationReady = true
						this.updateMarkers()
					},
					(error) => {
						console.error('获取位置失败:', error)
						this.useDefaultLocation()
					}
				)
			} else {
				this.useDefaultLocation()
			}
		},
		
		// APP获取位置
		appGetLocation() {
			this.getLocationInfo()
		},
		
		// 统一获取位置信息
		getLocationInfo() {
			uni.getLocation({
				type: 'gcj02',
				success: (res) => {
					this.latitude = res.latitude
					this.longitude = res.longitude
					this.isLocationReady = true
					this.updateMarkers()
				},
				fail: (err) => {
					console.error('获取位置失败:', err)
					this.useDefaultLocation()
				}
			})
		},
		
		// 使用默认位置（北京）
		useDefaultLocation() {
			uni.showToast({
				title: '未能获取位置，使用默认位置',
				icon: 'none'
			})
			this.isLocationReady = true
			this.updateMarkers()
		},
		
		// 更新地图标记
		updateMarkers() {
			if (this.spotList.length > 0) {
				this.markers = this.spotList.map((spot, index) => {
					return {
						id: index,
						latitude: spot.location.coordinates[1],
						longitude: spot.location.coordinates[0],
						title: spot.name,
						iconPath: '/static/icons/park.png',
						width: 32,
						height: 32
					}
				})
			}
		},
		
		// 获取附近景点
		async getNearbySpots() {
			if (this.loading || this.noMore) return
			this.loading = true
			
			try {
				const res = await uniCloud.callFunction({
					name: 'get-spots',
					data: {
						longitude: this.longitude,
						latitude: this.latitude,
						page: this.page,
						pageSize: this.pageSize,
						sortBy: 'distance',
						sortOrder: 'asc'
					}
				})
				
				if (res.result.code === 0) {
					const { list, total } = res.result.data
					
					// 更新景点列表
					if (this.page === 1) {
						this.spotList = list
					} else {
						this.spotList = [...this.spotList, ...list]
					}
					
					// 更新地图标记
					this.updateMarkers()
					
					// 检查是否还有更多数据
					this.noMore = this.spotList.length >= total
				}
			} catch (e) {
				uni.showToast({
					title: '获取景点失败',
					icon: 'none'
				})
			}
			
			this.loading = false
		},
		
		// 加载更多
		loadMore() {
			if (!this.noMore) {
				this.page++
				this.getNearbySpots()
			}
		},
		
		// 标记点点击事件
		onMarkerTap(e) {
			const spot = this.spotList[e.markerId - 1]
			if (spot) {
				this.goToDetail(spot._id)
			}
		},
		
		// 打开地图应用进行导航
		openMapApp() {
			if (!this.spot || !this.spot.location) return
			
			const [longitude, latitude] = this.spot.location.coordinates
			uni.openLocation({
				latitude,
				longitude,
				name: this.spot.name,
				address: this.spot.address,
				success: () => {
					console.log('打开导航成功')
				},
				fail: () => {
					uni.showToast({
						title: '打开导航失败',
						icon: 'none'
					})
				}
			})
		},
		
		// 跳转到搜索页
		goToSearch() {
			uni.navigateTo({
				url: '/pages/spots/search'
			})
		},
		
		// 跳转到详情页
		goToDetail(id) {
			uni.navigateTo({
				url: `/pages/spots/detail?id=${id}`
			})
		},

		// 显示导航选项
		showNavigationOptions() {
			this.showNavigation = true
		},
		
		// 隐藏导航选项
		hideNavigationOptions() {
			this.showNavigation = false
		},
		
		// 导航
		navigate(option) {
			uni.showToast({
				title: `即将打开${option.name}`,
				icon: 'none'
			})
			this.hideNavigationOptions()
		},

		// 打开地图
		openMap() {
			this.showNavigationOptions()
		},
	}
}
</script>

<style lang="scss">
.container {
	height: 100vh;
	display: flex;
	flex-direction: column;
	position: relative;
}

.search-box {
	padding: 20rpx 30rpx;
	background-color: #2B9939;
	height: 100rpx;
	box-sizing: border-box;
	
	.search-input {
		display: flex;
		align-items: center;
		height: 60rpx;
		padding: 0 30rpx;
		background: rgba(255, 255, 255, 0.9);
		border-radius: 30rpx;
		
		.icon-search {
			font-size: 32rpx;
			color: #666;
			margin-right: 10rpx;
		}
		
		.placeholder {
			font-size: 28rpx;
			color: #999;
		}
	}
}

.map {
	width: 100%;
	height: 50vh;
}

.navigation-info {
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	background-color: #fff;
	padding: 30rpx;
	border-radius: 24rpx 24rpx 0 0;
	box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);
	display: flex;
	justify-content: space-between;
	align-items: center;
	
	.spot-info {
		flex: 1;
		margin-right: 20rpx;
		
		.name {
			font-size: 32rpx;
			color: #333;
			font-weight: bold;
			margin-bottom: 10rpx;
			@include text-ellipsis;
		}
		
		.address {
			font-size: 24rpx;
			color: #666;
			@include text-ellipsis;
		}
	}
	
	.navigation-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 20rpx;
		
		.iconfont {
			font-size: 48rpx;
			color: #007AFF;
			margin-bottom: 10rpx;
		}
		
		text {
			font-size: 24rpx;
			color: #007AFF;
		}
	}
}

.spot-list {
	flex: 1;
	background-color: #f5f5f5;
	padding: 20rpx;
	
	.spot-item {
		display: flex;
		padding: 20rpx;
		background-color: #fff;
		border-radius: 12rpx;
		margin-bottom: 20rpx;
		
		.spot-image {
			width: 160rpx;
			height: 160rpx;
			border-radius: 8rpx;
			margin-right: 20rpx;
		}
		
		.info {
			flex: 1;
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			
			.name-box {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 10rpx;
				
				.name {
					font-size: 32rpx;
					color: #333;
					font-weight: bold;
				}
				
				.distance {
					font-size: 24rpx;
					color: #999;
				}
			}
			
			.rating {
				margin-bottom: 10rpx;
				
				.score {
					font-size: 28rpx;
					color: #FF9500;
					font-weight: bold;
					margin-right: 20rpx;
				}
				
				.price {
					font-size: 28rpx;
					color: #FF5B05;
					font-weight: bold;
				}
			}
			
			.address {
				font-size: 24rpx;
				color: #666;
				@include text-ellipsis;
			}
		}
		
		.nav-btn {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			margin-left: 20rpx;
			padding: 0 20rpx;
			
			.iconfont {
				font-size: 40rpx;
				color: #2B9939;
				margin-bottom: 4rpx;
			}
			
			text {
				font-size: 24rpx;
				color: #2B9939;
			}
		}
	}
}

.loading, .no-more {
	padding: 30rpx;
	text-align: center;
	
	text {
		font-size: 24rpx;
		color: #999;
	}
}

/* 弹窗基础样式 */
.popup-mask {
	position: fixed;
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
	background: rgba(0, 0, 0, 0.6);
	z-index: 999;
	display: flex;
	align-items: flex-end;
}

.popup-content {
	width: 100%;
	background-color: #fff;
	border-radius: 24rpx 24rpx 0 0;
	position: relative;
	transition: transform 0.3s;
	max-height: 90vh;
}
.navigation-popup {
	transform: translateY(0);
	padding: 30rpx;
	
	.navigation-options {
		.title {
			font-size: 32rpx;
			color: #333;
			text-align: center;
			margin-bottom: 30rpx;
		}
		
		.option-list {
			display: flex;
			justify-content: space-around;
			margin-bottom: 30rpx;
			
			.option {
				display: flex;
				flex-direction: column;
				align-items: center;
				
				.iconfont {
					font-size: 80rpx;
					color: #2B9939;
					margin-bottom: 10rpx;
				}
				
				.name {
					font-size: 28rpx;
					color: #333;
				}
			}
		}
		
		.cancel {
			height: 90rpx;
			line-height: 90rpx;
			text-align: center;
			font-size: 32rpx;
			color: #666;
			border-top: 1rpx solid #eee;
		}
	}
}

</style> 