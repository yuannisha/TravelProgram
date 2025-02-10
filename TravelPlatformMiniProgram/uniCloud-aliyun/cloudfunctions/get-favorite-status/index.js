'use strict';
const db = uniCloud.database()
exports.main = async (event, context) => {
	//event为客户端上传的参数
	console.log('event : ', event)

	const {
		spotId // 景点ID
	} = event
	
	if (!spotId) {
		return {
			code: -1,
			message: '景点ID不能为空'
		}
	}
	
	const uid = event.uid
	if (!uid) {
		return {
			code: -2,
			message: '请先登录'
		}
	}	
	
	const collection = db.collection('travel-favorites')
	const favoriteResult = await collection.where({
		user_id: uid,
		spot_id: spotId
	}).get()
	
	//返回数据给客户端
	return {
		code: 0,
		message: '获取成功',
		data: {
			isFavorite: favoriteResult.data.length > 0
		}
	}
};
