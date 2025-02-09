'use strict';

const db = uniCloud.database()
const $ = db.command.aggregate
const spotCollection = db.collection('travel-spots')
const commentCollection = db.collection('travel-comments')
const favoriteCollection = db.collection('travel-favorites')

exports.main = async (event, context) => {
	const {
		id, // 景点ID
		longitude, // 经度
		latitude // 纬度
	} = event
	
	if (!id) {
		return {
			code: -1,
			message: '景点ID不能为空'
		}
	}
	
	try {
		// 获取景点基本信息
		const spotPipeline = [{
			$match: {
				_id: id
			}
		}]
		
		// 如果提供了经纬度，计算距离
		if (longitude && latitude) {
			spotPipeline.push({
				$geoNear: {
					near: {
						type: 'Point',
						coordinates: [parseFloat(longitude), parseFloat(latitude)]
					},
					distanceField: 'distance',
					spherical: true,
					distanceMultiplier: 0.001 // 转换为公里
				}
			})
		}
		
		// 获取评论列表（最新的5条）
		const commentPipeline = [{
			$match: {
				spot_id: id
			}
		}, {
			$sort: {
				create_date: -1
			}
		}, {
			$limit: 5
		}, {
			$lookup: {
				from: 'uni-id-users',
				localField: 'user_id',
				foreignField: '_id',
				as: 'user'
			}
		}, {
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
		}]
		
		// 获取是否已收藏
		const uid = context.USERID
		let isFavorite = false
		if (uid) {
			const favoriteResult = await favoriteCollection.where({
				user_id: uid,
				spot_id: id
			}).count()
			isFavorite = favoriteResult.total > 0
		}
		
		// 并行执行查询
		const [spotResult, commentResult] = await Promise.all([
			spotCollection.aggregate(spotPipeline).end(),
			commentCollection.aggregate(commentPipeline).end()
		])
		
		if (!spotResult.data[0]) {
			return {
				code: -1,
				message: '景点不存在'
			}
		}
		
		// 处理评论用户信息
		const comments = commentResult.data.map(comment => {
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
			message: 'success',
			data: {
				...spotResult.data[0],
				isFavorite,
				comments
			}
		}
	} catch (e) {
		return {
			code: -1,
			message: e.message || '获取景点详情失败'
		}
	}
} 