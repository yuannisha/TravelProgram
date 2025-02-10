'use strict';

const db = uniCloud.database()
const userCollection = db.collection('uni-id-users')

exports.main = async (event, context) => {
	const { userId, oldPassword, newPassword } = event
	
	try {
		if (!userId || !oldPassword || !newPassword) {
			return {
				code: 1,
				message: '参数不完整'
			}
		}
		
		// 验证密码格式
		if (newPassword.length < 6 || newPassword.length > 20) {
			return {
				code: 1,
				message: '新密码长度应为6-20位'
			}
		}
		
		if (!/^[a-zA-Z0-9_]+$/.test(newPassword)) {
			return {
				code: 1,
				message: '新密码只能包含字母、数字和下划线'
			}
		}
		
		// 查找用户
		const user = await userCollection.doc(userId).get()
		
		if (!user.data || user.data.length === 0) {
			return {
				code: 1,
				message: '用户不存在'
			}
		}
		
		// 验证旧密码
		if (user.data[0].password !== oldPassword) {
			return {
				code: 1,
				message: '当前密码错误'
			}
		}
		
		// 更新密码
		await userCollection.doc(userId).update({
			password: newPassword
		})
		
		return {
			code: 0,
			message: '密码修改成功'
		}
		
	} catch (e) {
		console.error(e)
		return {
			code: 1,
			message: '修改失败'
		}
	}
} 