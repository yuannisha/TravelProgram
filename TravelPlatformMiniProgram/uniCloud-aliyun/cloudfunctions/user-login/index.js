'use strict';

const { Console } = require("console");

const db = uniCloud.database()
const userCollection = db.collection('uni-id-users')

exports.main = async (event, context) => {
	const { phone, password, code } = event
	
	try {
		// 验证参数
		if (!phone || !password || !code) {
			return {
				code: 1,
				message: '手机号、密码和验证码不能为空'
			}
		}
		
		// 验证手机号格式
		if (!/^1[3-9]\d{9}$/.test(phone)) {
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

		// 查找用户
		const user = await userCollection.where({
			mobile: phone
		}).get()

		if (user.data.length === 0) {
			return {
				code: 1,
				message: '用户不存在，请先注册'
			}
		}
		
		// 验证密码
		if (user.data[0].password !== password) {
			return {
				code: 1,
				message: '密码错误'
			}
		}
		
		// 生成token
		const token = Buffer.from(`${phone}-${Date.now()}`).toString('base64')
		
		// 更新用户token和最后登录时间
		await userCollection.doc(user.data[0]._id).update({
			token: token,
			last_login_date: new Date()
		})
		
		return {
			code: 0,
			message: '登录成功',
			token: token,
			userInfo: {
				id: user.data[0]._id,
				username: user.data[0].username,
				mobile: user.data[0].mobile,
				avatar: user.data[0].avatar || '/static/avatar/default-avatar.png',
				gender: user.data[0].gender
			}
		}
		
	} catch (e) {
		console.error(e)
		return {
			code: 1,
			message: '登录失败'
		}
	}
} 