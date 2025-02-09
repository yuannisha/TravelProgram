'use strict';

exports.main = async (event, context) => {
	const {
		phone,
		type // register-注册 login-登录 reset-重置密码
	} = event
	
	// 参数校验
	if (!phone) {
		return {
			code: -1,
			message: '手机号不能为空'
		}
	}
	
	if (!type) {
		return {
			code: -1,
			message: '验证码类型不能为空'
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
		
		// TODO: 实际项目中需要调用短信服务发送验证码
		// 这里模拟发送验证码，固定使用123456
		
		return {
			code: 0,
			message: '发送成功'
		}
	} catch (e) {
		return {
			code: -1,
			message: e.message || '发送失败'
		}
	}
} 