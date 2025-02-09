'use strict';

const db = uniCloud.database()
const $ = db.command.aggregate

exports.main = async (event, context) => {
	const {
		spotId, // 景点ID
		page = 1, // 页码
		pageSize = 10 // 每页数量
	} = event
	
	if (!spotId) {
		return {
			code: -1,
			message: '景点ID不能为空'
		}
	}
	
	const collection = db.collection('travel-comments')
	
	try {
		// 构建聚合管道
		const pipeline = [
			{
				$match: {
					spot_id: spotId
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
				$lookup: {
					from: 'uni-id-users',
					localField: 'user_id',
					foreignField: '_id',
					as: 'user'
				}
			},
			{
				$project: {
					_id: 1,
					content: 1,
					rating: 1,
					images: 1,
					create_date: 1,
					'user._id': 1,
					'user.nickname': 1,
					'user.avatar': 1
				}
			}
		]
		
		// 获取评论列表
		const listRes = await collection.aggregate(pipeline).end()
		
		// 获取总数
		const totalRes = await collection.where({
			spot_id: spotId
		}).count()
		
		// 处理用户信息
		const comments = listRes.data.map(comment => {
			const user = comment.user[0] || {}
			return {
				...comment,
				user: {
					id: user._id,
					nickname: user.nickname || '游客',
					avatar: user.avatar || '/static/avatar/default-avatar.png'
				}
			}
		})
		
		return {
			code: 0,
			message: '获取成功',
			data: {
				list: comments,
				total: totalRes.total,
				page,
				pageSize
			}
		}
	} catch (e) {
		return {
			code: -1,
			message: e.message || '获取评论失败'
		}
	}
} 