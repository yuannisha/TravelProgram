'use strict';

const db = uniCloud.database()
const favoriteCollection = db.collection('travel-favorites')

exports.main = async (event, context) => {
	const {
		spotId // 景点ID
	} = event
	
	if (!spotId) {
		return {
			code: -1,
			message: '景点ID不能为空'
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
			spot_id: spotId
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
			spot_id: spotId,
			create_date: new Date()
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