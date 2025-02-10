'use strict';

exports.main = async (event, context) => {
	const { phone, type } = event
	
	try {
		// 验证参数
		if (!phone || !type) {
			return {
				code: 1,
				message: '手机号和验证类型不能为空'
			}
		}
		
		// 验证手机号格式
		if (!/^1[3-9]\d{9}$/.test(phone)) {
			return {
				code: 1,
				message: '手机号格式不正确'
			}
		}
		
		// 验证类型
		if (!['login', 'register'].includes(type)) {
			return {
				code: 1,
				message: '验证码类型不正确'
			}
		}
		
		// 模拟发送验证码，固定返回123456
		console.log(`向手机号 ${phone} 发送验证码: 123456`)
		
		return {
			code: 0,
			message: '验证码发送成功'
		}
		
	} catch (e) {
		console.error(e)
		return {
			code: 1,
			message: '发送验证码失败'
		}
	}
} 