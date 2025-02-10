'use strict';

const db = uniCloud.database()
const userCollection = db.collection('uni-id-users')

exports.main = async (event, context) => {
	const { userId, newMobile, code } = event
	
	try {
		if (!userId || !newMobile || !code) {
			return {
				code: 1,
				message: '参数不完整'
			}
		}
		
		// 验证手机号格式
		if (!/^1[3-9]\d{9}$/.test(newMobile)) {
			return {
				code: 1,
				message: '手机号格式不正确'
			}
		}
		
		// 验证验证码（这里简化处理，实际应该验证存储的验证码）
		if (code !== '123456') {
			return {
				code: 1,
				message: '验证码错误'
			}
		}
		
		// 检查手机号是否已被使用
		const existUser = await userCollection.where({
			mobile: newMobile,
			_id: {
				$ne: userId
			}
		}).get()
		
		if (existUser.data.length > 0) {
			return {
				code: 1,
				message: '该手机号已被使用'
			}
		}
		
		// 更新手机号
		await userCollection.doc(userId).update({
			mobile: newMobile,
		})
		
		return {
			code: 0,
			message: '手机号更换成功'
		}
		
	} catch (e) {
		console.error(e)
		return {
			code: 1,
			message: '更换失败'
		}
	}
} 