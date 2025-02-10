'use strict';

const db = uniCloud.database()
const userCollection = db.collection('uni-id-users')

exports.main = async (event, context) => {
	const { phone, code, password, username, gender, status, mobile_confirmed } = event
	
	try {
		// 验证参数
		if (!phone || !code || !password || !username || !gender) {
			return {
				code: 1,
				message: '请填写完整信息'
			}
		}
		
		// 验证手机号格式
		if (!/^1[3-9]\d{9}$/.test(phone)) {
			return {
				code: 1,
				message: '手机号格式不正确'
			}
		}
		
		// 验证密码格式
		if (password.length < 6 || password.length > 20) {
			return {
				code: 1,
				message: '密码长度应为6-20位'
			}
		}
		
		if (!/^[a-zA-Z0-9_]+$/.test(password)) {
			return {
				code: 1,
				message: '密码只能包含字母、数字和下划线'
			}
		}
		
		// 验证性别
		if (gender !== 1 && gender !== 2) {
			return {
				code: 1,
				message: '请选择性别'
			}
		}
		
		// 验证验证码（这里简化处理，实际应该验证存储的验证码）
		if (code !== '123456') {
			return {
				code: 1,
				message: '验证码错误'
			}
		}
		
		// 检查手机号是否已注册
		const existUser = await userCollection.where({
			mobile: phone
		}).get()
		
		if (existUser.data.length > 0) {
			return {
				code: 1,
				message: '该手机号已注册'
			}
		}
		
		// 生成简单的token（实际应使用更安全的方式）
		const token = Buffer.from(`${phone}-${Date.now()}`).toString('base64')
		
		// 创建用户
		const user = {
			password: password, // 实际应该加密存储
			username: username,
			gender: gender,
			status: status || 1,
			mobile: phone,
			mobile_confirmed: mobile_confirmed || 1,
			avatar: '/static/avatar/default-avatar.png',
			token: token,
			register_date: new Date(),
			last_login_date: new Date()
		}
		
		const result = await userCollection.add(user)
		
		return {
			code: 0,
			message: '注册成功',
			token: token,
			userInfo: {
				id: result.id,
				username: user.username,
				gender: user.gender,
				mobile: user.mobile,
				avatar: user.avatar
			}
		}
		
	} catch (e) {
		console.error(e)
		return {
			code: 1,
			message: '注册失败'
		}
	}
} 