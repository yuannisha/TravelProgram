'use strict';

const db = uniCloud.database()
const $ = db.command.aggregate

exports.main = async (event, context) => {
	const {
		page = 1,
		pageSize = 10
	} = event
	
	const uid = context.USERID
	if (!uid) {
		return {
			code: -1,
			message: '请先登录'
		}
	}
	
	const collection = db.collection('travel-favorites')
	
	try {
		// 构建聚合管道
		const pipeline = [
			{
				$match: {
					user_id: uid
				}
			},
			{
				$lookup: {
					from: 'travel-spots',
					localField: 'spot_id',
					foreignField: '_id',
					as: 'spot'
				}
			},
			{
				$unwind: {
					path: '$spot',
					preserveNullAndEmptyArrays: false
				}
			},
			{
				$sort: {
					create_date: -1
				}
			},
			{
				$skip: (page - 1) * pageSize
			},
			{
				$limit: pageSize
			},
			{
				$project: {
					_id: 1,
					create_date: 1,
					spot: {
						_id: 1,
						name: 1,
						imageUrl: 1,
						price: 1,
						rating: 1,
						tags: 1
					}
				}
			}
		]
		
		// 获取收藏列表
		const listRes = await collection.aggregate(pipeline).end()
		
		// 获取总数
		const totalRes = await collection.where({
			user_id: uid
		}).count()
		
		return {
			code: 0,
			message: '获取成功',
			data: {
				list: listRes.data,
				total: totalRes.total
			}
		}
	} catch (e) {
		return {
			code: -2,
			message: e.message || '获取失败'
		}
	}
} 