'use strict';

const db = uniCloud.database()
const favoriteCollection = db.collection('travel-favorites')

exports.main = async (event, context) => {
	const {
		spotId, // 景点ID
		planId, // 旅行计划ID
		type // 收藏类型：spot或plan
	} = event
	
	if (!type || (type !== 'spot' && type !== 'plan')) {
		return {
			code: -1,
			message: '收藏类型不正确'
		}
	}

	if ((type === 'spot' && !spotId) || (type === 'plan' && !planId)) {
		return {
			code: -1,
			message: '参数不能为空'
		}
	}

	console.log(context)
	console.log(event)
	const uid = event.uid
	if (!uid) {
		return {
			code: -2,
			message: '请先登录'
		}
	}
	
	try {
		// 查询是否已收藏
		const favoriteResult = await favoriteCollection.where({
			user_id: uid,
			type: type,
			...(type === 'spot' ? { spot_id: spotId } : { plan_id: planId })
		}).get()
		
		// 如果已收藏，则取消收藏
		if (favoriteResult.data.length > 0) {
			await favoriteCollection.doc(favoriteResult.data[0]._id).remove()
			return {
				code: 0,
				message: '取消收藏成功',
				data: {
					isFavorite: false
				}
			}
		}
		
		// 如果未收藏，则添加收藏
		await favoriteCollection.add({
			user_id: uid,
			type: type,
			...(type === 'spot' ? { spot_id: spotId } : { plan_id: planId }),
			create_date: Date.now()
		})

		return {
			code: 0,
			message: '收藏成功',
			data: {
				isFavorite: true
			}
		}
	} catch (e) {
		return {
			code: -1,
			message: e.message || '操作失败'
		}
	}
} 