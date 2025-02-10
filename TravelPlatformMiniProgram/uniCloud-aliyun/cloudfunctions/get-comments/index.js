'use strict';

/**
 * 获取景点评论列表
 * @param {String} spotId - 景点ID
 * @param {Number} page - 页码
 * @param {Number} pageSize - 每页数量
 * @param {String} sortBy - 排序字段：time-时间，rating-评分
 * @param {String} sortOrder - 排序方式：asc-升序，desc-降序
 */
exports.main = async (event, context) => {
	const db = uniCloud.database()
	
	const {
		userId,
		spotId,
		page = 1,
		pageSize = 10,
		sortBy = sortBy || 'time',
		sortOrder = 'desc'
	} = event
	console.log("userId",userId)	
	console.log("spotId",spotId)
	// 判断是否登录
	if (!userId) {
		return {
			code: 2,
			message: '请先登录'
		}
	}	

	// 参数校验
	if (!spotId) {
		return {
			code: 3,
			message: '景点ID不能为空'
		}
	}
	
	// 构建排序条件
	const sortField = sortBy === 'time' ? 'create_date' : 'rating'
	const sortDirection = sortOrder === 'asc' ? 1 : -1
	const sortCondition = {
		[sortField]: sortDirection
	}
	
	try {
		// 查询评论总数
		const countResult = await db.collection('travel-comments')
			.where({
				spot_id: spotId
			})
			.count()
		console.log("countResult",countResult)
		const total = countResult.total
		
		// 查询评论列表
		const commentResult = await db.collection('travel-comments')
			.where({
				spot_id: spotId
			})
			.orderBy(sortField, sortOrder === 'desc' ? 'desc' : 'asc')
			.skip((page - 1) * pageSize)
			.limit(pageSize)
			.get()
		console.log("commentResult",commentResult)
		// 获取评论用户信息
		const userIds = commentResult.data.map(comment => comment.user_id)
		const userResult = await db.collection('uni-id-users')
			.where({
				_id: db.command.in(userIds)
			})
			.field({
				_id: true,
				username: true,
				avatar: true
			})
			.get()
		console.log("userResult",userResult)
		// 将用户信息添加到评论中
		const userMap = {}
		userResult.data.forEach(user => {
			userMap[user._id] = user
		})
		
		const comments = commentResult.data.map(comment => ({
			_id: comment._id,
			content: comment.content,
			rating: comment.rating,
			images: comment.images,
			create_date: comment.create_date,
			user: userMap[comment.user_id] || {
				username: '未知用户',
				avatar: '/static/avatar/default-avatar.png'
			}
		}))
		console.log("comments",comments)
		return {
			code: 0,
			message: 'success',
			data: {
				list: comments,
				total
			}
		}
	} catch (e) {
		console.error('获取评论列表失败:', e)
		return {
			code: 1,
			message: '获取评论列表失败'
		}
	}
} 