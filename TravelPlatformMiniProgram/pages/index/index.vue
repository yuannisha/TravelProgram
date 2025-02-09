<template>
	<view class="container">
		<!-- 搜索栏 -->
		<view class="search-box">
			<view class="search-input" @click="goToSearch">
				<text class="iconfont icon-search"></text>
				<text class="placeholder">搜索景点/地点</text>
			</view>
		</view>

		<!-- 轮播图 -->
		<swiper class="banner" circular autoplay interval="3000" duration="1000" indicator-dots indicator-active-color="#2B9939">
			<swiper-item v-for="(item, index) in bannerList" :key="index" @click="goToSpotDetail(item.id)">
				<image :src="item.imageUrl" mode="aspectFill"></image>
			</swiper-item>
		</swiper>

		<!-- 分类导航 -->
		<view class="nav-grid">
			<view class="nav-item" v-for="(item, index) in categories" :key="index" @click="goToCategory(item.id)">
				<image :src="item.icon" mode="aspectFit"></image>
				<text>{{item.name}}</text>
			</view>
		</view>

		<!-- 推荐景点 -->
		<view class="recommend-section">
			<view class="section-header">
				<text class="title">热门推荐</text>
				<text class="more" @click="goToSpots">查看更多</text>
			</view>
			<view class="spot-list">
				<view class="spot-item" v-for="(item, index) in recommendSpots" :key="index" @click="goToSpotDetail(item.id)">
					<image :src="item.imageUrl" mode="aspectFill"></image>
					<view class="spot-info">
						<text class="name">{{item.name}}</text>
						<view class="rating">
							<text class="score">{{item.rating}}分</text>
							<text class="price">¥{{item.price}}起</text>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
/**
 * 首页
 * @description 展示轮播图、分类导航和推荐景点
 */
export default {
	data() {
		return {
			bannerList: [
				{
					id: 1,
					imageUrl: '/static/banner/banner1.jpg'
				},
				{
					id: 2,
					imageUrl: '/static/banner/banner2.jpg'
				},
				{
					id: 3,
					imageUrl: '/static/banner/banner3.jpg'
				}
			],
			categories: [
				{
					id: 1,
					name: '自然风光',
					icon: '/static/icons/nature.png'
				},
				{
					id: 2,
					name: '人文古迹',
					icon: '/static/icons/culture.png'
				},
				{
					id: 3,
					name: '特色美食',
					icon: '/static/icons/food.png'
				},
				{
					id: 4,
					name: '主题乐园',
					icon: '/static/icons/park.png'
				}
			],
			recommendSpots: [
				{
					id: 1,
					name: '西湖风景区',
					imageUrl: '/static/spots/spot1.jpg',
					rating: 4.9,
					price: 80
				},
				{
					id: 2,
					name: '故宫博物院',
					imageUrl: '/static/spots/spot2.jpg',
					rating: 4.8,
					price: 60
				},
				{
					id: 3,
					name: '黄山风景区',
					imageUrl: '/static/spots/spot3.jpg',
					rating: 4.7,
					price: 190
				}
			]
		}
	},
	methods: {
		goToSearch() {
			// 跳转到搜索页面
			uni.navigateTo({
				url: '/pages/spots/search'
			})
		},
		goToSpotDetail(id) {
			// 跳转到景点详情页
			uni.navigateTo({
				url: `/pages/spots/detail?id=${id}`
			})
		},
		goToCategory(id) {
			// 跳转到分类页面
			uni.navigateTo({
				url: `/pages/spots/list?categoryId=${id}`
			})
		},
		goToSpots() {
			// 跳转到景点列表页
			uni.switchTab({
				url: '/pages/spots/spots'
			})
		}
	}
}
</script>

<style lang="scss">
.container {
	padding-bottom: 20rpx;
}

.search-box {
	padding: 20rpx 30rpx;
	background-color: #2B9939;
	
	.search-input {
		display: flex;
		align-items: center;
		height: 72rpx;
		padding: 0 30rpx;
		background: rgba(255, 255, 255, 0.9);
		border-radius: 36rpx;
		
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

.banner {
	width: 100%;
	height: 300rpx;
	
	image {
		width: 100%;
		height: 100%;
	}
}

.nav-grid {
	display: flex;
	flex-wrap: wrap;
	padding: 30rpx 20rpx;
	background-color: #fff;
	
	.nav-item {
		width: 25%;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 20rpx 0;
		
		image {
			width: 80rpx;
			height: 80rpx;
			margin-bottom: 10rpx;
		}
		
		text {
			font-size: 24rpx;
			color: #333;
		}
	}
}

.recommend-section {
	margin-top: 20rpx;
	background-color: #fff;
	padding: 20rpx;
	
	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
		
		.title {
			font-size: 32rpx;
			font-weight: bold;
			color: #333;
		}
		
		.more {
			font-size: 24rpx;
			color: #666;
		}
	}
	
	.spot-list {
		.spot-item {
			margin-bottom: 20rpx;
			
			image {
				width: 100%;
				height: 300rpx;
				border-radius: 12rpx;
			}
			
			.spot-info {
				padding: 16rpx 10rpx;
				
				.name {
					font-size: 28rpx;
					color: #333;
					font-weight: bold;
				}
				
				.rating {
					margin-top: 10rpx;
					display: flex;
					justify-content: space-between;
					
					.score {
						font-size: 24rpx;
						color: #FF9500;
					}
					
					.price {
						font-size: 24rpx;
						color: #FF5B05;
					}
				}
			}
		}
	}
}
</style>
