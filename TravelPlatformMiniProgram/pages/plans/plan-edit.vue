<template>
	<view class="container">
		<view class="form-container">
			<view class="form-item">
				<text class="label">计划标题</text>
				<input 
					class="input" 
					type="text" 
					v-model="planData.title" 
					placeholder="请输入计划标题" 
					maxlength="100"
				/>
			</view>
			
			<view class="form-item">
				<text class="label">计划描述</text>
				<textarea 
					class="textarea" 
					v-model="planData.description" 
					placeholder="请输入计划描述" 
					maxlength="500"
				></textarea>
			</view>
			
			<view class="form-item">
				<text class="label">开始日期</text>
				<picker 
					mode="date" 
					:value="formatDate(planData.start_date)" 
					@change="onStartDateChange"
				>
					<view class="picker-value">
						<text>{{ formatDate(planData.start_date) || '请选择开始日期' }}</text>
						<uni-icons type="arrowright" size="16" color="#999999"></uni-icons>
					</view>
				</picker>
			</view>
			
			<view class="form-item">
				<text class="label">结束日期</text>
				<picker 
					mode="date" 
					:value="formatDate(planData.end_date)" 
					@change="onEndDateChange"
				>
					<view class="picker-value">
						<text>{{ formatDate(planData.end_date) || '请选择结束日期' }}</text>
						<uni-icons type="arrowright" size="16" color="#999999"></uni-icons>
					</view>
				</picker>
			</view>
			

			
			<view class="form-item">
				<text class="label">是否公开</text>
				<switch 
					:checked="planData.is_public" 
					@change="onPublicChange" 
					color="#007AFF"
				/>
			</view>
			
			<view class="form-item spots-section">
				<view class="spots-header">
					<text class="label">景点列表</text>
					<view class="add-spot-btn" @click="navigateToSpotSelect">
						<uni-icons type="plusempty" size="16" color="#007AFF"></uni-icons>
						<text>添加景点</text>
					</view>
				</view>
				
				<view v-if="planData.spots && planData.spots.length > 0" class="spots-list">
					<view 
						v-for="(dateGroup, dateIndex) in groupedSpots" 
						:key="dateGroup.date"
						class="date-group"
					>
						<view class="date-header">
							<text>{{formatDate(dateGroup.date)}}</text>
							<text class="spot-count">（{{dateGroup.spots.length}}个景点）</text>
						</view>
						
						<view 
							v-for="(spot, spotIndex) in dateGroup.spots" 
							:key="spotIndex"
							class="spot-item"
						>
							<view class="spot-info">
								<text class="spot-name">{{spot.spot_detail.name}}</text>
								<view class="spot-date">
									<uni-icons type="calendar" size="14" color="#999999"></uni-icons>
									<text>{{formatDate(spot.visit_date)}}</text>
								</view>
								<view v-if="spot.notes" class="spot-notes">
									<uni-icons type="paperplane" size="14" color="#2B9939"></uni-icons>
									<text>{{spot.notes}}</text>
								</view>
							</view>
							
							<view class="spot-actions">
								<view 
									class="action-btn" 
									@click.stop="openNotesPopup(dateIndex, spotIndex)"
								>
									<uni-icons type="compose" size="18" color="#007AFF"></uni-icons>
								</view>
								<view 
									class="action-btn" 
									@click.stop="removeSpot(dateIndex, spotIndex)"
								>
									<uni-icons type="trash" size="18" color="#FF3B30"></uni-icons>
								</view>
							</view>
						</view>
					</view>
				</view>
				
				<view v-else class="empty-spots">
					<text>您尚未添加任何景点，点击上方按钮添加吧!</text>
				</view>
			</view>
		</view>
		
		<view class="btn-group">
			<button class="btn cancel" @click="navigateBack">取消</button>
			<button class="btn save" @click="savePlan">保存</button>
		</view>
		
		<!-- 添加备注弹窗 -->
		<uni-popup ref="notesPopup" type="bottom">
			<view class="notes-popup">
				<view class="notes-popup-header">
					<text class="title">景点备注</text>
					<text>记录您对景点的特别计划或想法</text>
				</view>
				<view class="notes-popup-content">
					<view class="form-item">
						<text class="label">备注内容</text>
						<textarea 
							class="notes-textarea" 
							v-model="currentSpotNotes" 
							placeholder="请输入您对该景点的备注，例如：必去景点、特色美食、交通建议等" 
							maxlength="200"
						></textarea>
						<text class="notes-count">{{currentSpotNotes.length}}/200</text>
					</view>
					
					<view class="quick-notes">
						<text class="label">快速备注</text>
						<view class="quick-notes-list">
							<view 
								v-for="(tag, index) in quickNotes" 
								:key="index"
								class="quick-note-tag"
								@click="addQuickNote(tag)"
							>
								<text>{{tag}}</text>
							</view>
						</view>
					</view>
				</view>
				<view class="notes-popup-footer">
					<button class="btn cancel" @click="closeNotesPopup">取消</button>
					<button class="btn confirm" @click="confirmNotes">确认</button>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
	/**
	 * 旅行计划编辑页面
	 * @description 用于创建新的旅行计划或编辑现有计划
	 */
	export default {
		data() {
			return {
				isEdit: false,
				planId: '',
				planData: {
					title: '',
					description: '',
					start_date: '',
					end_date: '',
					spots: [],
					status: 0,
					is_public: false
				},
				statusOptions: ['计划中', '进行中', '已完成'],
				currentSpotIndex: -1,
				currentDateIndex: -1,
				currentSpotNotes: '',
				quickNotes: ['必去景点', '特色美食', '交通便利', '性价比高', '适合拍照', '人少清净', '带孩子必去', '情侣约会', '早上去最佳', '傍晚去最佳']
			}
		},
		onLoad(options) {
			// 页面加载时检查登录状态
			const app = getApp();
			app.globalData.checkLoginStatus(true); // 强制跳转，因为编辑功能必须登录
			
			if (options.id) {
				this.isEdit = true;
				this.planId = options.id;
				this.getPlanDetail();
			} else {
				// 新建计划，设置默认值
				const now = new Date();
				this.planData.start_date = now.getTime();
				
				// 默认结束日期为开始日期后7天
				const endDate = new Date(now);
				endDate.setDate(endDate.getDate() + 7);
				this.planData.end_date = endDate.getTime();
			}
		},
		methods: {
			/**
			 * 获取计划详情
			 */
			async getPlanDetail() {
				uni.showLoading({
					title: '加载中...'
				});
				
				try {
					const app = getApp();
					const userId = app.globalData.getUserId();
					
					const res = await uniCloud.callFunction({
						name: 'manage-plans',
						data: {
							action: 'get',
							plan_id: this.planId,
							user_id: userId
						}
					});
					
					if (res.result.code === 0) {
						this.planData = res.result.data;
					} else {
						uni.showToast({
							title: res.result.message || '获取计划详情失败',
							icon: 'none'
						});
						setTimeout(() => {
							uni.navigateBack();
						}, 1500);
					}
				} catch (e) {
					console.error('获取计划详情失败', e);
					uni.showToast({
						title: '获取计划详情失败，请稍后重试',
						icon: 'none'
					});
					setTimeout(() => {
						uni.navigateBack();
					}, 1500);
				} finally {
					uni.hideLoading();
				}
			},
			
			/**
			 * 保存计划
			 */
			async savePlan() {
				// 表单验证
				if (!this.planData.title) {
					return uni.showToast({
						title: '请输入计划标题',
						icon: 'none'
					});
				}
				
				if (!this.planData.start_date) {
					return uni.showToast({
						title: '请选择开始日期',
						icon: 'none'
					});
				}
				
				if (!this.planData.end_date) {
					return uni.showToast({
						title: '请选择结束日期',
						icon: 'none'
					});
				}
				
				if (this.planData.start_date > this.planData.end_date) {
					return uni.showToast({
						title: '开始日期不能晚于结束日期',
						icon: 'none'
					});
				}
				
				uni.showLoading({
					title: this.isEdit ? '更新中...' : '创建中...'
				});
				
				try {
					const app = getApp();
					const userId = app.globalData.getUserId();
					console.log("userId",userId);
					
					const action = this.isEdit ? 'update' : 'create';
					
					// 处理spots数组，确保是普通对象
					const spots = this.planData.spots ? this.planData.spots.map(spot => ({
						spot_id: spot.spot_id,
						visit_date: spot.visit_date,
						notes: spot.notes || ''
					})) : [];
					
					const requestData = {
						action,
						plan: {
							title: this.planData.title || '',
							description: this.planData.description || '',
							start_date: this.planData.start_date,
							end_date: this.planData.end_date,
							spots: spots,
							is_public: this.planData.is_public || false,
							status: this.planData.status || 0
						},
						user_id: userId
					};
					
					if (this.isEdit) {
						requestData.plan_id = this.planId;
					}
					
					console.log("发送到云函数的数据：", JSON.parse(JSON.stringify(requestData)));
					
					const res = await uniCloud.callFunction({
						name: 'manage-plans',
						data: JSON.parse(JSON.stringify(requestData))
					});
					
					if (res.result.code === 0) {
						uni.showToast({
							title: this.isEdit ? '更新成功' : '创建成功'
						});
						
						// 返回上一页并刷新列表
						setTimeout(() => {
							const pages = getCurrentPages();
							const prevPage = pages[pages.length - 2];
							
							// 如果上一页是计划列表页，刷新列表
							if (prevPage && prevPage.route === 'pages/plans/plans') {
								prevPage.$vm.getPlans(true);
							}
							
							uni.navigateBack();
						}, 1500);
					} else {
						uni.showToast({
							title: res.result.message || (this.isEdit ? '更新失败' : '创建失败'),
							icon: 'none'
						});
					}
				} catch (e) {
					console.error(this.isEdit ? '更新计划失败' : '创建计划失败', e);
					uni.showToast({
						title: (this.isEdit ? '更新' : '创建') + '失败，请稍后重试',
						icon: 'none'
					});
				} finally {
					uni.hideLoading();
				}
			},
			
			/**
			 * 开始日期变更
			 */
			onStartDateChange(e) {
				const dateStr = e.detail.value;
				const selectedDate = new Date(dateStr);
				const today = new Date();
				today.setHours(0, 0, 0, 0);
				
				if (selectedDate < today) {
					uni.showToast({
						title: '开始日期不能早于今天',
						icon: 'none'
					});
					return;
				}
				
				this.planData.start_date = selectedDate.getTime();
				
				// 如果结束日期早于开始日期，自动调整结束日期
				if (this.planData.end_date && this.planData.end_date < this.planData.start_date) {
					this.planData.end_date = this.planData.start_date;
				}
			},
			
			/**
			 * 结束日期变更
			 */
			onEndDateChange(e) {
				const dateStr = e.detail.value;
				const selectedDate = new Date(dateStr);
				const today = new Date();
				today.setHours(0, 0, 0, 0);
				
				if (selectedDate < today) {
					uni.showToast({
						title: '结束日期不能早于今天',
						icon: 'none'
					});
					return;
				}
				
				if (this.planData.start_date && selectedDate < new Date(this.planData.start_date)) {
					uni.showToast({
						title: '结束日期不能早于开始日期',
						icon: 'none'
					});
					return;
				}
				
				this.planData.end_date = selectedDate.getTime();
			},
			
			/**
			 * 状态变更
			 */
			onStatusChange(e) {
				this.planData.status = parseInt(e.detail.value);
			},
			
			/**
			 * 是否公开变更
			 */
			onPublicChange(e) {
				this.planData.is_public = e.detail.value;
			},
			
			/**
			 * 跳转到景点选择页面
			 */
			navigateToSpotSelect() {
				if (!this.planData.start_date || !this.planData.end_date) {
					uni.showToast({
						title: '请先选择计划的开始和结束日期',
						icon: 'none'
					});
					return;
				}
				
				uni.navigateTo({
					url: `/pages/plans/spot-select?startDate=${this.planData.start_date}&endDate=${this.planData.end_date}`
				});
			},
			
			/**
			 * 添加景点到计划中
			 * @param {Object} spotData 景点数据
			 */
			addSpot(spotData) {
				if (!this.planData.spots) {
					this.planData.spots = [];
				}
				
				// 检查是否已添加该景点
				const existingSpot = this.planData.spots.find(spot => 
					spot.spot_id === spotData.spot_id && 
					this.formatDate(spot.visit_date) === this.formatDate(spotData.visit_date)
				);
				
				if (existingSpot) {
					uni.showToast({
						title: '该景点已在同一天添加过',
						icon: 'none'
					});
					return;
				}
				
				// 验证游览日期是否在计划日期范围内
				const visitDate = new Date(spotData.visit_date);
				const startDate = new Date(this.planData.start_date);
				const endDate = new Date(this.planData.end_date);
				
				if (visitDate < startDate || visitDate > endDate) {
					uni.showToast({
						title: '游览日期必须在计划日期范围内',
						icon: 'none'
					});
					return;
				}
				
				this.planData.spots.push(spotData);
				
				// 按日期和添加顺序排序
				this.planData.spots.sort((a, b) => {
					if (a.visit_date === b.visit_date) {
						return this.planData.spots.indexOf(a) - this.planData.spots.indexOf(b);
					}
					return a.visit_date - b.visit_date;
				});
				
				uni.showToast({
					title: '添加成功',
					icon: 'success'
				});
			},
			
			/**
			 * 打开备注弹窗
			 * @param {Number} dateIndex 日期组索引
			 * @param {Number} spotIndex 景点索引
			 */
			openNotesPopup(dateIndex, spotIndex) {
				this.currentDateIndex = dateIndex;
				this.currentSpotIndex = spotIndex;
				
				const spot = this.groupedSpots[dateIndex].spots[spotIndex];
				this.currentSpotNotes = spot.notes || '';
				
				this.$refs.notesPopup.open();
			},
			
			/**
			 * 添加快速备注标签
			 * @param {String} tag 标签文本
			 */
			addQuickNote(tag) {
				if (!this.currentSpotNotes) {
					this.currentSpotNotes = tag;
				} else if (!this.currentSpotNotes.includes(tag)) {
					this.currentSpotNotes += '，' + tag;
				}
			},
			
			/**
			 * 确认修改备注
			 */
			confirmNotes() {
				if (this.currentDateIndex >= 0 && this.currentSpotIndex >= 0) {
					const spot = this.groupedSpots[this.currentDateIndex].spots[this.currentSpotIndex];
					
					// 找到planData.spots中对应的景点
					const index = this.planData.spots.findIndex(s => 
						s.spot_id === spot.spot_id && 
						s.visit_date === spot.visit_date
					);
					
					if (index >= 0) {
						this.planData.spots[index].notes = this.currentSpotNotes;
					}
				}
				console.log("景点备注：", this.currentSpotNotes);
				console.log("this.planData", this.planData);
				this.closeNotesPopup();
			},
			
			/**
			 * 关闭备注弹窗
			 */
			closeNotesPopup() {
				this.currentDateIndex = -1;
				this.currentSpotIndex = -1;
				this.currentSpotNotes = '';
				this.$refs.notesPopup.close();
			},
			
			/**
			 * 移除景点
			 */
			removeSpot(dateIndex, spotIndex) {
				uni.showModal({
					title: '确认移除',
					content: '确定要从计划中移除此景点吗？',
					confirmColor: '#FF3B30',
					success: (res) => {
						if (res.confirm) {
							const spot = this.groupedSpots[dateIndex].spots[spotIndex];
							const index = this.planData.spots.findIndex(s => 
								s.spot_id === spot.spot_id && 
								s.visit_date === spot.visit_date
							);
							
							if (index >= 0) {
								this.planData.spots.splice(index, 1);
							}
						}
					}
				});
			},
			
			/**
			 * 返回上一页
			 */
			navigateBack() {
				uni.navigateBack();
			},
			
			/**
			 * 格式化日期
			 * @param {Number|String} timestamp 时间戳
			 * @return {String} 格式化后的日期
			 */
			formatDate(timestamp) {
				if (!timestamp) return '';
				const date = new Date(timestamp);
				return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
			}
		},
		computed: {
			/**
			 * 按日期分组的景点列表
			 */
			groupedSpots() {
				if (!this.planData.spots || !this.planData.spots.length) {
					return [];
				}
				
				// 按日期分组
				const groups = {};
				this.planData.spots.forEach(spot => {
					const dateKey = this.formatDate(spot.visit_date);
					if (!groups[dateKey]) {
						groups[dateKey] = {
							date: spot.visit_date,
							spots: []
						};
					}
					groups[dateKey].spots.push(spot);
				});
				
				// 转换为数组并按日期排序
				return Object.values(groups).sort((a, b) => a.date - b.date);
			}
		}
	}
</script>

<style lang="scss">
	.container {
		padding: 30rpx;
		background-color: #f5f5f5;
		min-height: 100vh;
	}
	
	.form-container {
		background-color: #ffffff;
		border-radius: 20rpx;
		padding: 30rpx;
		margin-bottom: 30rpx;
	}
	
	.form-item {
		margin-bottom: 30rpx;
		
		.label {
			display: block;
			font-size: 28rpx;
			color: #333333;
			margin-bottom: 10rpx;
		}
		
		.input, .textarea {
			width: 100%;
			background-color: #f5f5f5;
			border-radius: 10rpx;
			padding: 20rpx;
			font-size: 28rpx;
			color: #333333;
		}
		
		.textarea {
			height: 200rpx;
		}
		
		.picker-value {
			display: flex;
			justify-content: space-between;
			align-items: center;
			background-color: #f5f5f5;
			border-radius: 10rpx;
			padding: 20rpx;
			font-size: 28rpx;
			color: #333333;
		}
	}
	
	.spots-section {
		.spots-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 20rpx;
			
			.add-spot-btn {
				display: flex;
				align-items: center;
				color: #007AFF;
				font-size: 28rpx;
				
				text {
					margin-left: 6rpx;
				}
			}
		}
		
		.spots-list {
			.date-group {
				margin-bottom: 20rpx;
				
				.date-header {
					font-size: 28rpx;
					color: #333333;
					margin-bottom: 10rpx;
					
					.spot-count {
						font-size: 24rpx;
						color: #666666;
					}
				}
				
				.spot-item {
					display: flex;
					justify-content: space-between;
					align-items: center;
					padding: 20rpx;
					background-color: #f5f5f5;
					border-radius: 10rpx;
					margin-bottom: 20rpx;
					
					.spot-info {
						flex: 1;
						
						.spot-name {
							font-size: 28rpx;
							color: #333333;
							margin-bottom: 10rpx;
						}
						
						.spot-date {
							display: flex;
							align-items: center;
							font-size: 24rpx;
							color: #666666;
							margin-bottom: 8rpx;
							
							text {
								margin-left: 4rpx;
							}
						}
						
						.spot-notes {
							display: flex;
							align-items: flex-start;
							font-size: 24rpx;
							color: #2B9939;
							word-break: break-all;
							
							text {
								margin-left: 4rpx;
								flex: 1;
							}
						}
					}
					
					.spot-actions {
						display: flex;
						
						.action-btn {
							display: flex;
							justify-content: center;
							align-items: center;
							width: 60rpx;
							height: 60rpx;
							margin-left: 10rpx;
						}
					}
				}
			}
		}
		
		.empty-spots {
			padding: 30rpx 0;
			text-align: center;
			font-size: 28rpx;
			color: #999999;
		}
	}
	
	.btn-group {
		display: flex;
		justify-content: space-between;
		
		.btn {
			flex: 1;
			height: 80rpx;
			line-height: 80rpx;
			border-radius: 40rpx;
			font-size: 30rpx;
			
			&.cancel {
				margin-right: 20rpx;
				background-color: #f5f5f5;
				color: #666666;
			}
			
			&.save {
				background-color: #007AFF;
				color: #ffffff;
			}
		}
	}
	
	.notes-popup {
		background-color: #FFFFFF;
		border-radius: 20rpx 20rpx 0 0;
		padding: 30rpx;
		
		.notes-popup-header {
			margin-bottom: 30rpx;
			
			.title {
				font-size: 32rpx;
				font-weight: bold;
				color: #333333;
				margin-bottom: 10rpx;
				display: block;
			}
			
			text {
				font-size: 24rpx;
				color: #999999;
			}
		}
		
		.notes-popup-content {
			.form-item {
				margin-bottom: 30rpx;
				position: relative;
				
				.label {
					display: block;
					font-size: 28rpx;
					color: #333333;
					margin-bottom: 10rpx;
				}
				
				.notes-textarea {
					width: 100%;
					height: 200rpx;
					background-color: #f5f5f5;
					border-radius: 10rpx;
					padding: 20rpx;
					font-size: 28rpx;
					color: #333333;
				}
				
				.notes-count {
					position: absolute;
					right: 10rpx;
					bottom: 10rpx;
					font-size: 24rpx;
					color: #999999;
				}
			}
			
			.quick-notes {
				margin-bottom: 30rpx;
				
				.label {
					display: block;
					font-size: 28rpx;
					color: #333333;
					margin-bottom: 10rpx;
				}
				
				.quick-notes-list {
					display: flex;
					flex-wrap: wrap;
					
					.quick-note-tag {
						background-color: #f0f7f1;
						border-radius: 6rpx;
						padding: 10rpx 20rpx;
						margin-right: 20rpx;
						margin-bottom: 20rpx;
						
						text {
							font-size: 24rpx;
							color: #2B9939;
						}
					}
				}
			}
		}
		
		.notes-popup-footer {
			display: flex;
			
			.btn {
				flex: 1;
				height: 80rpx;
				line-height: 80rpx;
				border-radius: 40rpx;
				font-size: 30rpx;
				
				&.cancel {
					margin-right: 20rpx;
					background-color: #f5f5f5;
					color: #666666;
				}
				
				&.confirm {
					background-color: #2B9939;
					color: #ffffff;
				}
			}
		}
	}
</style> 