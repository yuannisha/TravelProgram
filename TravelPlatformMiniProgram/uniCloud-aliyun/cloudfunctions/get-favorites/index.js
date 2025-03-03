'use strict';

const db = uniCloud.database()
const dbCmd = db.command

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

		// 组装返回数据
		const list = favorites.map(favorite => ({
			...favorite,
			detail: favorite.type === 'spot' ? spotsMap[favorite.spot_id] : plansMap[favorite.plan_id]
		}))

		return {
			code: 0,
			message: '获取成功',
			data: {
				list,
				total: countRes.total,
				page,
				pageSize
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