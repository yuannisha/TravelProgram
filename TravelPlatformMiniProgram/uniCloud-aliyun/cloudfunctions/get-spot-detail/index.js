'use strict';

const db = uniCloud.database()
const $ = db.command.aggregate

exports.main = async (event, context) => {
	const { id } = event
	
	if (!id) {
		return {
			code: 1,
			message: '景点ID不能为空'
		}
	}
	
	try {
		// 获取用户ID（如果已登录）
		const { USERID } = context.auth || {}
		
		// 聚合查询
		const spotCollection = db.collection('travel-spots')
		const favoriteCollection = db.collection('travel-favorites')
		const commentCollection = db.collection('travel-comments')
		const userCollection = db.collection('uni-id-users')
		
		// 获取景点基本信息
		const spotInfo = await spotCollection.doc(id).get()
		if (!spotInfo.data || spotInfo.data.length === 0) {
			return {
				code: 2,
				message: '景点不存在'
			}
		}
		
		const spot = spotInfo.data[0]
		
		// 检查是否已收藏（需要登录）
		let isFavorite = false
		if (USERID) {
			const favorite = await favoriteCollection.where({
				user_id: USERID,
				spot_id: id
			}).get()
			isFavorite = favorite.data && favorite.data.length > 0
		}
		
		// 获取最新的3条评论
		const comments = await commentCollection.aggregate()
			.match({
				spot_id: id
			})
			.sort({
				create_date: -1
			})
			.limit(3)
			.lookup({
				from: 'uni-id-users',
				localField: 'user_id',
				foreignField: '_id',
				as: 'user'
			})
			.project({
				_id: 1,
				content: 1,
				rating: 1,
				images: 1,
				create_date: 1,
				'user._id': 1,
				'user.username': 1,
				'user.avatar': 1
			})
			.end()
		
		// 处理评论数据
		const formattedComments = comments.data.map(comment => ({
			...comment,
			user: comment.user[0] || {
				username: '未知用户',
				avatar: '/static/images/default-avatar.png'
			}
		}))
		
		return {
			code: 0,
			message: 'success',
			data: {
				...spot,
				isFavorite,
				comments: formattedComments
			}
		}
		
	} catch (e) {
		console.error('获取景点详情失败:', e)
		return {
			code: -1,
			message: '获取景点详情失败'
		}
	}
} 