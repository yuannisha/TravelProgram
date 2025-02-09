'use strict';

const db = uniCloud.database()
const userCollection = db.collection('uni-id-users')

exports.main = async (event, context) => {
	const {
		phone,
		code,
		password,
		nickname
	} = event
	
	// 参数校验
	if (!phone || !code || !password || !nickname) {
		return {
			code: -1,
			message: '参数不完整'
		}
	}
	
	try {
		// 验证手机号格式
		if (!/^1[3-9]\d{9}$/.test(phone)) {
			return {
				code: -1,
				message: '手机号格式不正确'
			}
		}
		
		// 验证密码格式
		if (password.length < 6 || password.length > 20) {
			return {
				code: -1,
				message: '密码长度应为6-20位'
			}
		}
		
		// 验证验证码
		// TODO: 实际项目中需要验证短信验证码
		if (code !== '123456') {
			return {
				code: -1,
				message: '验证码错误'
			}
		}
		
		// 检查手机号是否已注册
		const existUser = await userCollection.where({
			mobile: phone,
			mobile_confirmed: 1
		}).count()
		
		if (existUser.total > 0) {
			return {
				code: -1,
				message: '该手机号已注册'
			}
		}
		
		// 创建用户
		const userResult = await userCollection.add({
			username: phone,
			password: password, // 实际项目中需要加密存储
			nickname: nickname,
			mobile: phone,
			mobile_confirmed: 1,
			status: 0,
			gender: 0
		})
		
		// 生成token
		const token = 'mock_token_' + userResult.id // 实际项目中需要使用proper token
		
		// 更新用户token
		await userCollection.doc(userResult.id).update({
			token: [{
				token: token,
				create_date: Date.now()
			}]
		})
		
		return {
			code: 0,
			message: '注册成功',
			token: token
		}
	} catch (e) {
		return {
			code: -1,
			message: e.message || '注册失败'
		}
	}
} 