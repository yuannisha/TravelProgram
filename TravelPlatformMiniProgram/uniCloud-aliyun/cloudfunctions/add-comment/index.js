'use strict';

const db = uniCloud.database()
const $ = db.command.aggregate

exports.main = async (event, context) => {
	const {
		spotId, // 景点ID
		content, // 评论内容
		rating, // 评分
		images = [] // 图片列表
	} = event
	
	// 获取用户ID
	const uid = event.uid
	if (!uid) {
		return {
			code: 403,
			message: '请先登录'
		}
	}
	
	// 参数验证
	if (!spotId) {
		return {
			code: 1,
			message: '景点ID不能为空'
		}
	}
	if (!content || content.trim().length === 0) {
		return {
			code: 2,
			message: '评论内容不能为空'
		}
	}
	
	if (!rating || rating < 1 || rating > 5) {
		return {
			code: 3,
			message: '请选择评分'
		}
	}
	
	try {
		const commentCollection = db.collection('travel-comments')
		const spotCollection = db.collection('travel-spots')
		
		// 添加评论
		await commentCollection.add({
			user_id: uid,
			spot_id: spotId,
			content: content.trim(),
			rating: Number(rating),
			images: images,
			create_date: Date.now(),
			update_date: Date.now()
		})
		
		// 获取当前景点的所有评论
		const commentsRes = await commentCollection.where({
			spot_id: spotId
		}).get()
		
		const comments = commentsRes.data
		const totalRating = comments.reduce((sum, comment) => sum + comment.rating, 0)
		const newRating = (totalRating / comments.length).toFixed(1)
		
		// 更新景点信息
		await spotCollection.doc(spotId).update({
			rating: Number(newRating),
			commentCount: comments.length
		})
		
		return {
			code: 0,
			message: 'success'
		}
		
	} catch (e) {
		console.error('添加评论失败:', e)
		return {
			code: -1,
			message: '添加评论失败'
		}
	}
} 