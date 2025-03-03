'use strict';

/**
 * 获取收藏状态云函数
 * @param {Object} event
 * @param {string} event.uid - 用户ID
 * @param {string} event.type - 收藏类型：spot或plan
 * @param {string} [event.spotId] - 景点ID（type为spot时必填）
 * @param {string} [event.planId] - 计划ID（type为plan时必填）
 */
exports.main = async (event, context) => {
	const db = uniCloud.database();
	const collection = db.collection('travel-favorites');
	
	const { uid, type, spotId, planId } = event;
	
	// 参数校验
	if (!uid) {
		return {
			code: -1,
			message: '请先登录'
		};
	}
	
	if (!type || (type !== 'spot' && type !== 'plan')) {
		return {
			code: -1,
			message: '收藏类型不正确'
		};
	}
	
	if ((type === 'spot' && !spotId) || (type === 'plan' && !planId)) {
		return {
			code: -1,
			message: '参数不能为空'
		};
	}
	
	try {
		// 查询是否已收藏
		const result = await collection.where({
			user_id: uid,
			type: type,
			...(type === 'spot' ? { spot_id: spotId } : { plan_id: planId })
		}).get();
		
		return {
			code: 0,
			message: '获取成功',
			data: {
				isFavorite: result.data.length > 0
			}
		};
	} catch (e) {
		return {
			code: -2,
			message: e.message || '获取失败'
		};
	}
};
