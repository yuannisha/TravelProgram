'use strict';

const db = uniCloud.database()
const $ = db.command.aggregate

exports.main = async (event, context) => {
	const {
		page = event.page || 1,
		pageSize = event.pageSize || 10
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
		// 获取和uid相关的收藏列表
		const listRes = await collection.where({
			user_id: uid
		}).orderBy('create_date', 'desc').skip((page - 1) * pageSize).limit(pageSize).get()	
		console.log("listRes",listRes)

		// 获取总数
		const totalRes = listRes.data.length
		console.log("totalRes",totalRes)
		
		return {
			code: 0,
			message: '获取成功',
			data: {
				list: listRes.data,
				total: totalRes
			}
		}
	} catch (e) {
		return {
			code: -2,
			message: e.message || '获取失败'
		}
	}
} 