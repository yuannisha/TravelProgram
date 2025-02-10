'use strict';

const db = uniCloud.database()
const userCollection = db.collection('uni-id-users')

exports.main = async (event, context) => {
	const { userId, avatar } = event
	
	try {
		if (!userId || !avatar) {
			return {
				code: 1,
				message: '参数不完整'
			}
		}
		
		// 更新用户头像
		await userCollection.doc(userId).update({
			avatar: avatar
		})
		
		return {
			code: 0,
			message: '头像更新成功',
			avatar: avatar
		}
		
	} catch (e) {
		console.error(e)
		return {
			code: 1,
			message: '头像更新失败'
		}
	}
} 