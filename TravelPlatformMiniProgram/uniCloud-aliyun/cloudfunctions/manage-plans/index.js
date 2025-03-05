'use strict';

/**
 * 旅行计划管理云函数
 * @param {Object} event 请求参数
 * @param {string} event.action 操作类型：create, update, delete, get, list
 * @param {Object} event.plan 计划数据（创建/更新时使用）
 * @param {string} event.plan_id 计划ID（获取/更新/删除单个计划时使用）
 * @param {number} event.page 页码（获取列表时使用）
 * @param {number} event.pageSize 每页数量（获取列表时使用）
 * @param {string} event.status 计划状态筛选（获取列表时使用）
 * @param {string} event.user_id 用户ID（从前端传入）
 * @returns {Object} 返回结果
 * @returns {number} result.code 状态码：0-成功，401-未登录，400-参数错误，403-无权限，404-不存在
 * @returns {string} result.message 提示信息
 * @returns {Object} [result.data] 返回数据
 */
exports.main = async (event, context) => {
	const db = uniCloud.database();
	const dbCmd = db.command;
	const plansCollection = db.collection('travel-plans');
	console.log(event)
	
	// 获取当前用户ID 
	const USERID = event.user_id;
	if (!USERID) {
		return {
			code: 401,
			message: '未登录'
		};
	}
	
	/**
	 * 更新计划状态
	 * @param {Object} plan 计划对象
	 * @returns {Object} 更新后的计划对象
	 */
	async function updatePlanStatus(plan) {
		const now = Date.now();
		let newStatus = plan.status;
		
		// 根据当前时间和计划日期判断状态
		if (now < plan.start_date) {
			newStatus = 0; // 计划中
		} else if (now >= plan.start_date && now <= plan.end_date) {
			newStatus = 1; // 进行中
		} else if (now > plan.end_date) {
			newStatus = 2; // 已完成
		}
		
		// 如果状态发生变化，且存在_id，才更新数据库
		if (newStatus !== plan.status && plan._id) {
			try {
				await plansCollection.doc(plan._id).update({
					status: newStatus,
					update_date: now
				});
				console.log('状态已更新', plan._id, newStatus);
			} catch (e) {
				console.error('更新状态失败', e);
				// 即使更新失败，继续处理
			}
		}
		
		plan.status = newStatus;
		plan.update_date = now;
		
		return plan;
	}
	
	// 根据操作类型执行不同的逻辑
	switch (event.action) {
		case 'create': {
			// 创建旅行计划
			const plan = event.plan;
			plan.user_id = USERID;
			plan.create_date = Date.now();
			plan.update_date = plan.create_date;
			
			// 直接计算状态，不尝试更新数据库
			const now = Date.now();
			if (now < plan.start_date) {
				plan.status = 0; // 计划中
			} else if (now >= plan.start_date && now <= plan.end_date) {
				plan.status = 1; // 进行中
			} else if (now > plan.end_date) {
				plan.status = 2; // 已完成
			}
			
			const createResult = await plansCollection.add(plan);
			
			return {
				code: 0,
				message: '创建成功',
				data: {
					plan_id: createResult.id
				}
			};
		}
		
		case 'update': {
			// 更新旅行计划
			const planId = event.plan_id;
			const plan = event.plan;
			plan.update_date = Date.now();
			
			// 自动更新状态
			const currentPlan = await plansCollection.doc(planId).get();
			if (currentPlan.data && currentPlan.data.length > 0) {
				const updatedPlan = await updatePlanStatus({
					...currentPlan.data[0],
					...plan
				});
				plan.status = updatedPlan.status;
			}
			// 删除plan中的_id字段
			delete plan._id;
			
			await plansCollection.doc(planId).update(plan);
			
			return {
				code: 0,
				message: '更新成功'
			};
		}
		
		case 'delete': {
			// 删除计划
			if (!event.plan_id) {
				return {
					code: 400,
					message: '缺少计划ID'
				};
			}
			
			// 检查计划是否存在且属于当前用户
			const plan = await plansCollection.doc(event.plan_id).get();
			if (!plan.data || plan.data.length === 0) {
				return {
					code: 404,
					message: '计划不存在'
				};
			}
			
			if (plan.data[0].user_id !== USERID) {
				return {
					code: 403,
					message: '无权操作此计划'
				};
			}
			
			// 删除计划
			const result = await plansCollection.doc(event.plan_id).remove();
			
			return {
				code: 0,
				message: '删除成功',
				data: result
			};
		}
		
		case 'get': {
			// 获取单个计划详情
			if (!event.plan_id) {
				return {
					code: 400,
					message: '缺少计划ID'
				};
			}
			
			// 获取计划详情
			const plan = await plansCollection.doc(event.plan_id).get();
			if (!plan.data || plan.data.length === 0) {
				return {
					code: 404,
					message: '计划不存在'
				};
			}
			
			// 检查权限：只有计划创建者或公开的计划可以查看
			if (plan.data[0].user_id !== USERID && !plan.data[0].is_public) {
				return {
					code: 403,
					message: '无权查看此计划'
				};
			}
			
			// 如果计划包含景点，获取景点详情
			const planData = plan.data[0];
			if (planData.spots && planData.spots.length > 0) {
				// 提取所有景点ID
				const spotIds = planData.spots.map(spot => spot.spot_id);
				
				// 获取景点详情
				const spotsResult = await db.collection('travel-spots')
					.where({
						_id: dbCmd.in(spotIds)
					})
					.field({
						_id: 1,
						name: 1,
						imageUrl: 1,
						address: 1,
						price: 1,
						rating: 1
					})
					.get();
				
				// 将景点详情添加到计划中
				const spotsMap = {};
				spotsResult.data.forEach(spot => {
					spotsMap[spot._id] = spot;
				});
				
				planData.spots = planData.spots.map(spot => {
					return {
						...spot,
						spot_detail: spotsMap[spot.spot_id] || null
					};
				});
			}
			
			return {
				code: 0,
				message: '获取成功',
				data: planData
			};
		}
		
		case 'list': {
			// 获取计划列表
			const page = event.page || 1;
			const pageSize = event.pageSize || 10;
			const skip = (page - 1) * pageSize;
			
			// 构建查询条件
			let where = {
				user_id: USERID
			};
			
			// 根据状态筛选
			if (event.status !== undefined && event.status !== null && event.status !== '') {
				where.status = parseInt(event.status);
			}
			
			// 查询总数
			const countResult = await plansCollection.where(where).count();
			
			// 查询列表
			const listResult = await plansCollection
				.where(where)
				.skip(skip)
				.limit(pageSize)
				.orderBy('create_date', 'desc')
				.get();
				
			// 更新每个计划的状态
			const updatedList = await Promise.all(listResult.data.map(plan => updatePlanStatus(plan)));
			
			return {
				code: 0,
				message: '获取成功',
				data: {
					list: updatedList,
					total: countResult.total,
					page,
					pageSize
				}
			};
		}
		
		case 'public': {
			// 获取公开的计划列表
			const page = event.page || 1;
			const pageSize = event.pageSize || 10;
			const skip = (page - 1) * pageSize;
			const keyword = event.keyword || '';
			
			// 构建查询条件
			let matchCondition = {
				is_public: true
			};
			
			// 如果有关键词，添加搜索条件
			if (keyword && keyword.trim()) {
				const searchKeyword = keyword.trim();
				console.log("搜索关键词", searchKeyword);
				matchCondition.$or = [
					{ title: { $regex: searchKeyword, $options: 'i' } },
					{ description: { $regex: searchKeyword, $options: 'i' } }
				];
			}
			
			// 查询总数
			const countResult = await plansCollection
				.where(matchCondition)
				.count();
			
			// 查询列表
			const listResult = await plansCollection
				.where(matchCondition)
				.skip(skip)
				.limit(pageSize)
				.orderBy('create_date', 'desc')
				.get();
				
			// 获取用户信息
			const userIds = [...new Set(listResult.data.map(item => item.user_id))];
			let userInfoMap = {};
			
			if (userIds.length > 0) {
				const userResult = await db.collection('uni-id-users')
					.where({
						_id: dbCmd.in(userIds)
					})
					.field({
						_id: true,
						username: true,
						nickname: true,
						avatar: true
					})
					.get();
					
				userResult.data.forEach(user => {
					userInfoMap[user._id] = user;
				});
			}
			
			// 更新每个计划的状态并关联用户信息
			const resultWithUserInfo = await Promise.all(listResult.data.map(async plan => {
				const updatedPlan = await updatePlanStatus(plan);
				return {
					...updatedPlan,
					user_info: userInfoMap[plan.user_id] || null
				};
			}));
			
			return {
				code: 0,
				message: '获取成功',
				data: {
					list: resultWithUserInfo,
					total: countResult.total,
					page,
					pageSize
				}
			};
		}
		
		default:
			return {
				code: 400,
				message: '未知操作类型'
			};
	}
}; 