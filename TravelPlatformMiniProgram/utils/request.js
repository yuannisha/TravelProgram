// 请求拦截器
const request = {
    baseUrl: '',
    
    async request(options = {}) {
        // 统一处理请求
        const token = uni.getStorageSync('token')
        const header = options.header || {}
        if (token) {
            header.Authorization = `Bearer ${token}`
        }
        
        try {
            const res = await uni.request({
                url: this.baseUrl + options.url,
                method: options.method || 'GET',
                data: options.data,
                header
            })
            
            if (res.statusCode === 401) {
                // token过期处理
                uni.removeStorageSync('token')
                uni.navigateTo({
                    url: '/pages/user/login'
                })
                return
            }
            
            return res.data
        } catch (e) {
            uni.showToast({
                title: '网络请求失败',
                icon: 'none'
            })
            throw e
        }
    }
}

export default request 