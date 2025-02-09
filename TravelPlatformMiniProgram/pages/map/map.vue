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
			class="map"
			:latitude="latitude"
			:longitude="longitude"
			:markers="markers"
			:scale="scale"
			:show-location="true"
			@markertap="onMarkerTap"
			@callouttap="onMarkerTap"
		></map>
		
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
			latitude: 39.908692, // 默认纬度（北京）
			longitude: 116.397477, // 默认经度（北京）
			scale: 12, // 缩放级别
			markers: [], // 地图标记点
			spotList: [], // 景点列表
			page: 1,
			pageSize: 10,
			loading: false,
			noMore: false,
			listHeight: 400 // 列表高度，单位px
		}
	},
	onLoad() {
		// 获取系统信息设置列表高度
		const systemInfo = uni.getSystemInfoSync()
		// 列表高度 = 屏幕高度 - 搜索栏高度(100rpx) - 地图高度(50vh) - tabBar高度
		this.listHeight = systemInfo.windowHeight - (100 * systemInfo.windowWidth / 750) - (systemInfo.windowHeight * 0.5) - 50
		
		// 获取当前位置
		this.getCurrentLocation()
	},
	methods: {
		// 获取当前位置
		getCurrentLocation() {
			uni.getLocation({
				type: 'gcj02',
				success: res => {
					this.latitude = res.latitude
					this.longitude = res.longitude
					// 获取附近景点
					this.getNearbySpots()
				},
				fail: () => {
					// 获取位置失败，使用默认位置获取景点
					this.getNearbySpots()
				}
			})
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
		
		// 更新地图标记
		updateMarkers() {
			this.markers = this.spotList.map((spot, index) => ({
				id: index + 1,
				latitude: spot.location.coordinates[1],
				longitude: spot.location.coordinates[0],
				title: spot.name,
				iconPath: '/static/markers/spot.png',
				width: 32,
				height: 32,
				callout: {
					content: spot.name,
					color: '#333333',
					fontSize: 14,
					borderRadius: 4,
					bgColor: '#ffffff',
					padding: 8,
					display: 'BYCLICK'
				}
			}))
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
		
		// 打开导航
		openMap(spot) {
			uni.openLocation({
				latitude: spot.location.coordinates[1],
				longitude: spot.location.coordinates[0],
				name: spot.name,
				address: spot.address,
				success: () => {
					console.log('打开导航成功')
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
		}
	}
}
</script>

<style lang="scss">
.container {
	height: 100vh;
	display: flex;
	flex-direction: column;
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
</style> 