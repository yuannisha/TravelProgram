'use strict';

const db = uniCloud.database()
const dbCmd = db.command

exports.main = async (event, context) => {
	const {
		spotId, // 景点ID
		content, // 评论内容
		rating, // 评分
		images = [] // 图片列表
	} = event
	
	if (!spotId) {
		return {
			code: -1,
			message: '景点ID不能为空'
		}
	}
	
	if (!content) {
		return {
			code: -1,
			message: '评论内容不能为空'
		}
	}
	
	if (!rating || rating < 1 || rating > 5) {
		return {
			code: -1,
			message: '请选择评分'
		}
	}
	
	const uid = context.USERID
	if (!uid) {
		return {
			code: -2,
			message: '请先登录'
		}
	}
	
	const transaction = await db.startTransaction()
	try {
		// 添加评论
		const commentCollection = transaction.collection('travel-comments')
		const commentResult = await commentCollection.add({
			user_id: uid,
			spot_id: spotId,
			content,
			rating,
			images
		})
		
		// 更新景点评分和评论数
		const spotCollection = transaction.collection('travel-spots')
		const spotResult = await spotCollection.doc(spotId).update({
			commentCount: dbCmd.inc(1),
			rating: dbCmd.avg('$rating') // 使用聚合计算平均分
		})
		
		await transaction.commit()
		
		return {
			code: 0,
			message: '评论成功',
			data: {
				id: commentResult.id
			}
		}
	} catch (e) {
		await transaction.rollback()
		return {
			code: -1,
			message: e.message || '评论失败'
		}
	}
} 