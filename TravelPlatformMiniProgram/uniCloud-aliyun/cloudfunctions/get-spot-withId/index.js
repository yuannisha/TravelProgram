'use strict';
const db = uniCloud.database()

/**
 * 根据ID获取景点详情
 * @param {String} id - 景点ID
 * @returns {Object} 返回景点信息
 */
exports.main = async (event, context) => {
	//event为客户端上传的参数
	console.log('event : ', event)
	const { id } = event
	
	if (!id) {
		return {
			code: 1,
			message: '景点ID不能为空'
		}
	}
	
	try {
		const spot = await db.collection('travel-spots').doc(id).get()
		return {
			code: 0,
			message: '获取成功',
			data: spot.data
		}
	} catch (e) {
		return {
			
			code: -1,
			message: '获取失败'
		}
	}
}
