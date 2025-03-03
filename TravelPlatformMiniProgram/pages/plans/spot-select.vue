<template>
	<view class="container">
		<!-- 搜索栏 -->
		<view class="search-box">
			<uni-search-bar
				v-model="keyword"
				placeholder="搜索景点"
				@confirm="onSearch"
				@clear="onSearch"
			/>
		</view>
		
		<view class="date-picker">
			<text class="label">选择游览日期</text>
			<picker 
				mode="date" 
				:value="formatDate(selectedDate)" 
				:start="formatDate(startDate)"
				:end="formatDate(endDate)"
				@change="onDateChange"
			>
				<view class="picker-value">
					<text>{{ formatDate(selectedDate) || '请选择日期' }}</text>
					<uni-icons type="arrowright" size="14" color="#999999"></uni-icons>
				</view>
			</picker>
		</view>
		
		<!-- 景点列表 -->
		<view class="spot-list">
			<view v-if="loading" class="loading">
				<uni-load-more status="loading"></uni-load-more>
			</view>
			<view v-else-if="spots.length > 0" class="spot-items">
				<view 
					v-for="(item, index) in spots" 
					:key="item._id" 
					class="spot-item"
					@click="selectSpot(item)"
				>
					<image :src="item.imageUrl" mode="aspectFill" class="spot-image"></image>
					<view class="spot-info">
						<text class="spot-name">{{item.name}}</text>
						<view class="spot-detail">
							<text class="spot-rating">{{item.rating}}分</text>
							<text class="spot-price">¥{{item.price/100}}起</text>
						</view>
						<text class="spot-address">{{item.address}}</text>
					</view>
				</view>
			</view>
			<view v-else class="empty">
				<text>暂无相关景点</text>
			</view>
		</view>
	</view>
</template>

<script>
	/**
	 * 景点选择页面
	 * @description 用于在创建/编辑旅行计划时选择景点
	 */
	export default {
		data() {
			return {
				keyword: '',
				spots: [],
				loading: false,
				searchTimer: null,
				selectedDate: '',
				startDate: '',
				endDate: ''
			}
		},
		onLoad(options) {
			// 获取计划的开始日期和结束日期
			this.startDate = parseInt(options.startDate);
			this.endDate = parseInt(options.endDate);
			
			// 默认选择开始日期
			this.selectedDate = this.startDate;
			
			this.loadSpots();
		},
		methods: {
			/**
			 * 加载景点列表
			 */
			async loadSpots() {
				this.loading = true;
				try {
					const res = await uniCloud.callFunction({
						name: 'get-spots',
						data: {
							keyword: this.keyword,
							page: 1,
							pageSize: 20,
							sortBy: 'rating',
							sortOrder: 'desc'
						}
					});
					
					if (res.result.code === 0) {
						this.spots = res.result.data.list;
					} else {
						uni.showToast({
							title: res.result.message || '获取景点失败',
							icon: 'none'
						});
					}
				} catch (e) {
					console.error('获取景点失败:', e);
					uni.showToast({
						title: '获取景点失败，请稍后重试',
						icon: 'none'
					});
				} finally {
					this.loading = false;
				}
			},
			
			/**
			 * 搜索输入处理
			 */
			onSearch() {
				if (this.searchTimer) {
					clearTimeout(this.searchTimer);
				}
				
				this.searchTimer = setTimeout(() => {
					this.loadSpots();
				}, 300);
			},
			
			/**
			 * 日期变更
			 */
			onDateChange(e) {
				const dateStr = e.detail.value;
				this.selectedDate = new Date(dateStr).getTime();
			},
			
			/**
			 * 选择景点
			 */
			selectSpot(spot) {
				// 构建景点数据
				const spotData = {
					spot_id: spot._id,
					visit_date: this.selectedDate,
					notes: '',
					spot_detail: {
						name: spot.name,
						imageUrl: spot.imageUrl,
						address: spot.address,
						price: spot.price,
						rating: spot.rating
					}
				};
				
				// 返回上一页并传递选中的景点数据
				const pages = getCurrentPages();
				const prevPage = pages[pages.length - 2];
				
				if (prevPage && prevPage.route === 'pages/plans/plan-edit') {
					// 调用上一页的方法添加景点
					prevPage.$vm.addSpot(spotData);
				}
				
				uni.navigateBack();
			},
			
			/**
			 * 格式化日期
			 */
			formatDate(timestamp) {
				if (!timestamp) {
					return '';
				}
				
				const date = new Date(timestamp);
				return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
			}
		}
	}
</script>

<style lang="scss">
.container {
	padding: 20rpx;
	background-color: #f5f5f5;
	min-height: 100vh;
}

.search-box {
	background-color: #fff;
	padding: 20rpx;
	border-radius: 12rpx;
	margin-bottom: 20rpx;
}

.date-picker {
	display: flex;
	align-items: center;
	padding: 20rpx;
	background-color: #FFFFFF;
	border-radius: 8rpx;
	margin-bottom: 20rpx;
	
	.label {
		font-size: 28rpx;
		color: #333333;
		margin-right: 20rpx;
	}
	
	.picker-value {
		flex: 1;
		display: flex;
		align-items: center;
		font-size: 28rpx;
		color: #333333;
		
		text {
			margin-right: 6rpx;
		}
	}
}

.spot-list {
	.loading {
		padding: 40rpx 0;
	}
	
	.spot-items {
		.spot-item {
			background-color: #fff;
			border-radius: 12rpx;
			margin-bottom: 20rpx;
			overflow: hidden;
			
			.spot-image {
				width: 100%;
				height: 300rpx;
			}
			
			.spot-info {
				padding: 20rpx;
				
				.spot-name {
					font-size: 32rpx;
					font-weight: bold;
					color: #333;
					margin-bottom: 10rpx;
				}
				
				.spot-detail {
					display: flex;
					justify-content: space-between;
					margin-bottom: 10rpx;
					
					.spot-rating {
						font-size: 26rpx;
						color: #FF9500;
					}
					
					.spot-price {
						font-size: 26rpx;
						color: #FF5B05;
					}
				}
				
				.spot-address {
					font-size: 24rpx;
					color: #999;
				}
			}
		}
	}
	
	.empty {
		padding: 100rpx 0;
		text-align: center;
		color: #999;
		font-size: 28rpx;
	}
}
</style> 