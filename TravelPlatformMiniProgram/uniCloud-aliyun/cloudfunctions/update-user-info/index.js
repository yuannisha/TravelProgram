'use strict';

const db = uniCloud.database()
const userCollection = db.collection('uni-id-users')

exports.main = async (event, context) => {
	const { userId, field, value } = event
	
	try {
		if (!userId || !field || value === undefined) {
			return {
				code: 1,
				message: '参数不完整'
			}
		}
		
		// 检查字段是否允许修改
		const allowedFields = ['username', 'nickname']
		if (!allowedFields.includes(field)) {
			return {
				code: 1,
				message: '该字段不允许修改'
			}
		}
		
		// 如果是修改用户名，需要检查是否已存在
		if (field === 'username') {
			const existUser = await userCollection.where({
				username: value,
				_id: {
					$ne: userId
				}
			}).get()
			
			if (existUser.data.length > 0) {
				return {
					code: 1,
					message: '用户名已存在'
				}
			}
		}
		
		// 更新用户信息
		const updateData = {}
		updateData[field] = value
		
		await userCollection.doc(userId).update(updateData)
		
		return {
			code: 0,
			message: '更新成功'
		}
		
	} catch (e) {
		console.error(e)
		return {
			code: 1,
			message: '更新失败'
		}
	}
} 