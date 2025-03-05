'use strict';

const db = uniCloud.database()
const dbCmd = db.command

/**
 * 获取用户收藏列表
 * @param {Object} event 请求参数
 * @param {string} event.uid 用户ID
 * @param {number} [event.page=1] 页码
 * @param {number} [event.pageSize=10] 每页数量
 * @param {string} [event.type] 收藏类型：spot-景点，plan-行程，不传则获取所有
 * @returns {Object} 返回结果
 * @returns {number} result.code 状态码：0-成功，-1-未登录，-2-获取失败
 * @returns {string} result.message 提示信息
 * @returns {Object} result.data 返回数据
 * @returns {Array} result.data.list 收藏列表
 * @returns {number} result.data.total 总数
 * @returns {number} result.data.page 当前页码
 * @returns {number} result.data.pageSize 每页数量
 */
exports.main = async (event, context) => {
	const {
		page = 1,
		pageSize = 10,
		type // 收藏类型：spot或plan，不传则获取所有
	} = event

	const uid = event.uid
	if (!uid) {
		return {
			code: -1,
			message: '请先登录'
		}
	}

	const collection = db.collection('travel-favorites')
	try {
		// 构建查询条件
		const where = {
			user_id: uid
		}
		if (type) {
			where.type = type
		}

		// 获取收藏列表
		const listRes = await collection
			.where(where)
			.orderBy('create_date', 'desc')
			.skip((page - 1) * pageSize)
			.limit(pageSize)
			.get()

		// 获取总数
		const countRes = await collection.where(where).count()

		// 获取关联数据
		const favorites = listRes.data
		const spotIds = favorites.filter(f => f.type === 'spot').map(f => f.spot_id)
		const planIds = favorites.filter(f => f.type === 'plan').map(f => f.plan_id)

		// 需要删除的收藏ID列表
		let needDeleteFavoriteIds = []

		// 获取景点详情
		let spotsMap = {}
		if (spotIds.length > 0) {
			const spotsRes = await db.collection('travel-spots')
				.where({
					_id: dbCmd.in(spotIds)
				})
				.get()
			spotsMap = spotsRes.data.reduce((acc, spot) => {
				acc[spot._id] = spot
				return acc
			}, {})
			
			// 检查是否有景点已被删除
			spotIds.forEach(spotId => {
				if (!spotsMap[spotId]) {
					const favorite = favorites.find(f => f.spot_id === spotId)
					if (favorite) {
						needDeleteFavoriteIds.push(favorite._id)
					}
				}
			})
		}

		// 获取旅行计划详情和创建者信息
		let plansMap = {}
		if (planIds.length > 0) {
			// 获取旅行计划详情
			const plansRes = await db.collection('travel-plans')
				.where({
					_id: dbCmd.in(planIds)
				})
				.get()
			
			// 检查是否有计划已被删除
			planIds.forEach(planId => {
				const plan = plansRes.data.find(p => p._id === planId)
				if (!plan) {
					const favorite = favorites.find(f => f.plan_id === planId)
					if (favorite) {
						needDeleteFavoriteIds.push(favorite._id)
					}
				}
			})
			
			// 获取所有计划创建者的ID
			const userIds = [...new Set(plansRes.data.map(plan => plan.user_id))]
			
			// 获取创建者信息
			const usersRes = await db.collection('uni-id-users')
				.where({
					_id: dbCmd.in(userIds)
				})
				.field({
					_id: true,
					username: true,
					nickname: true,
					avatar: true
				})
				.get()
			
			// 创建用户信息映射
			const usersMap = usersRes.data.reduce((acc, user) => {
				acc[user._id] = {
					username: user.username,
					nickname: user.nickname,
					avatar: user.avatar
				}
				return acc
			}, {})
			
			// 将用户信息添加到计划中
			plansMap = plansRes.data.reduce((acc, plan) => {
				acc[plan._id] = {
					...plan,
					user_info: usersMap[plan.user_id] || null
				}
				return acc
			}, {})
		}

		// 如果有需要删除的收藏,执行批量删除
		if (needDeleteFavoriteIds.length > 0) {
			await collection.where({
				_id: dbCmd.in(needDeleteFavoriteIds)
			}).remove()
		}

		// 组装返回数据,过滤掉已删除的项目
		const list = favorites
			.filter(favorite => !needDeleteFavoriteIds.includes(favorite._id))
			.map(favorite => {
				const detail = favorite.type === 'spot' ? spotsMap[favorite.spot_id] : plansMap[favorite.plan_id]
				return {
					...favorite,
					detail,
					is_deleted: !detail // 标记是否已删除
				}
			})

		return {
			code: 0,
			message: needDeleteFavoriteIds.length > 0 ? '部分收藏项已被删除' : '获取成功',
			data: {
				list,
				total: countRes.total - needDeleteFavoriteIds.length, // 更新总数
				page,
				pageSize,
				deleted_count: needDeleteFavoriteIds.length // 返回被删除的数量
			}
		}
	} catch (e) {
		console.error(e)
		return {
			code: -2,
			message: e.message || '获取失败'
		}
	}
} 