# 基于UniApp的旅游平台小程序设计与实现

## 🚀 项目简介
一款功能完整的旅游平台小程序，基于UniApp跨端开发框架，采用uniCloud云开发方案，实现了景点展示、用户管理、收藏功能和地图导航等核心功能。本项目致力于为用户提供便捷的旅游信息获取和行程规划服务。

## 🌟 核心功能
- **首页推荐**：动态轮播图展示热门景点，分类导航快速访问
- **景点浏览**：支持按类型（自然/人文/美食等）分类展示，支持搜索和筛选
- **用户中心**：用户注册登录、个人信息管理
- **收藏管理**：用户可收藏/取消收藏景点，支持收藏列表查看
- **地图导航**：集成地图SDK，显示景点位置、周边设施及路线规划
- **评分点评**：用户可对景点进行评分和评论
- **旅游攻略**：景点详情页展示参观建议、最佳游玩时间等信息

## 🛠 技术架构
- **前端框架**：UniApp
- **云服务**：uniCloud
- **数据库**：云数据库
- **存储服务**：云存储
- **地图服务**：高德地图SDK

## 📱 功能模块
1. **用户模块**
   - 账号注册与登录
   - 个人信息管理
   - 头像上传
   - 修改密码
   - 更换手机号

2. **景点模块**
   - 景点信息展示
   - 分类浏览
   - 关键词搜索
   - 评分评论
   - 图片预览

3. **收藏模块**
   - 收藏/取消收藏
   - 收藏列表管理
   - 收藏状态同步

4. **地图模块**
   - 景点位置显示
   - 距离计算
   - 模拟导航

## 🎯 项目特点
- 界面设计简洁美观，操作流畅
- 采用云开发架构，降低开发维护成本
- 支持跨平台部署，一次开发多端运行
- 模块化设计，代码结构清晰，易于维护
- 完整的错误处理和状态管理
- 支持图片上传和预览功能

## 📦 安装部署

### 环境要求
- HBuilderX 3.6.0+
- Node.js 14.0.0+
- 微信开发者工具 1.06.2409140+
- uniCloud 阿里云版本

### 安装步骤
1. 克隆项目代码
```bash
git clone [项目地址]
cd TravelPlatformMiniProgram
```

2. HBuilderX 配置
- 安装必要的插件：uni-app（Vue3）、scss/sass编译
- 开启 ES6 转 ES5 功能
- 安装微信开发者工具

3. uniCloud 配置
- 注册/登录 uniCloud 账号
- 开通阿里云服务空间
- 将服务空间 ID 配置到项目中
- 上传云函数和公共模块
- 初始化数据库集合和Schema

4. 微信小程序配置
- 注册小程序账号并获取 AppID
- 在 manifest.json 中配置 AppID
- 配置服务器域名和业务域名

### 运行项目
1. 导入项目到 HBuilderX
2. 运行到微信开发者工具
3. 真机调试需要配置自定义基座

## 🔧 开发注意事项

### 1. 微信开发者工具配置
- 需要开启"不校验合法域名"
- 建议开启"增强编译"
- 需要设置最新的基础库版本

### 2. 云开发相关
- 确保云函数和数据库已正确初始化
- 注意配置跨域访问规则
- 云函数调用需要做好错误处理
- 数据库查询需要建立合适的索引

### 3. 性能优化
- 合理使用分页加载
- 图片资源需要压缩处理
- 避免频繁的云函数调用
- 适当使用缓存机制

### 4. 安全性
- 用户密码需要加密存储
- 敏感操作需要验证用户身份
- 注意防止SQL注入
- 控制云函数访问权限

## 🐛 常见问题解决

1. 搜索功能相关
- 确保云函数已更新到最新版本
- 检查正则表达式语法
- 验证数据库索引是否正确

2. 图片上传问题
- 检查云存储权限设置
- 确认文件大小限制
- 验证文件格式支持

3. 定位功能异常
- 检查微信权限设置
- 确认地图 SDK 配置
- 验证经纬度数据格式

## 📝 测试数据

### 1. 景点数据 (travel-spots)
```js
{"_id":{"$oid":"67a8b9843d029caca1cdcb17"},"name":"西湖","categoryId":1,"imageUrl":"/static/spots/xihu.jpg","images":["/static/spots/xihu1.jpg","/static/spots/xihu2.jpg","/static/spots/xihu3.jpg"],"price":8000,"rating":4.8,"commentCount":256,"tags":["自然风光","文化遗产","摄影胜地"],"address":"浙江省杭州市西湖区","location":{"type":"Point","coordinates":[120.149953,30.242846]},"description":"西湖，位于浙江省杭州市西湖区龙井路1号，是中国大陆首个世界遗产公园。","openTime":"全天开放","suggestedTime":"建议游玩3-4小时","creator_id":{"$oid":"67a8aa8a0d2b3168f7518cc4"},"create_date":{"$date":"2025-02-09T13:15:52.567Z"},"update_date":{"$date":"2025-02-09T13:15:52.567Z"}}

{"_id":{"$oid":"67a8badae0ec19c842bce11b"},"name":"上海迪士尼乐园","categoryId":4,"imageUrl":"/static/spots/disney.jpg","images":["/static/spots/disney1.jpg","/static/spots/disney2.jpg","/static/spots/disney3.jpg"],"price":68900,"rating":4.6,"commentCount":1526,"tags":["主题乐园","亲子游玩","娱乐项目"],"address":"上海市浦东新区川沙新镇黄赵路310号","location":{"type":"Point","coordinates":[121.674272,31.145279]},"description":"上海迪士尼度假区是中国内地首个迪士尼度假区。","openTime":"8:00-20:00","suggestedTime":"建议游玩1-2天","creator_id":{"$oid":"67a8aa8a0d2b3168f7518cc4"},"create_date":{"$date":"2025-02-09T13:15:52.567Z"},"update_date":{"$date":"2025-02-09T13:15:52.567Z"}}

{"_id":{"$oid":"67a8bae9466d41ded409dbc9"},"name":"宽窄巷子","categoryId":3,"imageUrl":"/static/spots/kuanzhai.jpg","images":["/static/spots/kuanzhai1.jpg","/static/spots/kuanzhai2.jpg","/static/spots/kuanzhai3.jpg"],"price":0,"rating":4,"commentCount":3,"tags":["美食街区","文化古迹","休闲娱乐"],"address":"四川省成都市青羊区宽窄巷子","location":{"type":"Point","coordinates":[104.062225,30.669996]},"description":"宽窄巷子是成都市三大历史文化名城保护街区之一。","openTime":"全天开放","suggestedTime":"建议游玩3-4小时","creator_id":{"$oid":"67a8aa8a0d2b3168f7518cc4"},"create_date":{"$date":"2025-02-09T13:15:52.567Z"},"update_date":{"$date":"2025-02-09T13:15:52.567Z"}}

{"_id":{"$oid":"67a8bca63d029caca1ce29a8"},"name":"故宫","categoryId":2,"imageUrl":"/static/spots/gugong.jpg","images":["/static/spots/gugong1.jpg","/static/spots/gugong2.jpg","/static/spots/gugong3.jpg"],"price":6000,"rating":4.9,"commentCount":528,"tags":["历史古迹","宫廷建筑","文化遗产"],"address":"北京市东城区景山前街4号","location":{"type":"Point","coordinates":[116.403414,39.924091]},"description":"故宫又名紫禁城，是中国明清两代的皇家宫殿。","openTime":"8:30-17:00","suggestedTime":"建议游玩4-6小时","creator_id":{"$oid":"67a8aa8a0d2b3168f7518cc4"},"create_date":{"$date":"2025-02-09T13:15:52.567Z"},"update_date":{"$date":"2025-02-09T13:15:52.567Z"}}

{"_id":{"$oid":"67a8bcbbce5ec9e5aaf864fb"},"name":"黄山","categoryId":1,"imageUrl":"/static/spots/huangshan.jpg","images":["/static/spots/huangshan1.jpg","/static/spots/huangshan2.jpg","/static/spots/huangshan3.jpg"],"price":19000,"rating":4,"commentCount":1,"tags":["自然风光","山水景观","云海日出"],"address":"安徽省黄山市黄山区","location":{"type":"Point","coordinates":[118.337481,30.131949]},"description":"黄山以奇松、怪石、云海、温泉四绝闻名于世。","openTime":"6:30-17:30","suggestedTime":"建议游玩2-3天","creator_id":{"$oid":"67a8aa8a0d2b3168f7518cc4"},"create_date":{"$date":"2025-02-09T13:15:52.567Z"},"update_date":{"$date":"2025-02-09T13:15:52.567Z"}}

{"_id":{"$oid":"67a8bcd5e0ec19c842bd2033"},"name":"八达岭长城","categoryId":2,"imageUrl":"/static/spots/changcheng.jpg","images":["/static/spots/changcheng1.jpg","/static/spots/changcheng2.jpg","/static/spots/changcheng3.jpg"],"price":4000,"rating":4.7,"commentCount":986,"tags":["历史古迹","文化遗产","登山徒步"],"address":"北京市延庆区八达岭长城路","location":{"type":"Point","coordinates":[116.016389,40.359167]},"description":"八达岭长城是明长城中最具代表性的一段。","openTime":"7:30-17:30(夏季) 7:30-17:00(冬季)","suggestedTime":"建议游玩3-4小时","creator_id":{"$oid":"67a8aa8a0d2b3168f7518cc4"},"create_date":{"$date":"2025-02-09T13:15:52.567Z"},"update_date":{"$date":"2025-02-09T13:15:52.567Z"}}

```

### 2. 用户数据 (uni-id-users)
```js
{"_id":{"$oid":"67a8aa8a0d2b3168f7518cc4"},"password":"123456","username":"222","gender":1,"status":1,"mobile":"13312345678","mobile_confirmed":1,"avatar":"https://mp-61955188-4c98-45ca-a1f1-471cc333073c.cdn.bspapp.com/cloudstorage/cd114ae8-6125-4076-af87-27d6c2152122.jpg","token":"MTMzMTIzNDU2NzgtMTczOTIxMjY3Mzc3Ng==","register_date":{"$date":"2025-02-09T13:15:52.567Z"},"last_login_date":{"$date":"2025-02-10T18:37:53.776Z"}}
{"_id":{"$oid":"67a8b5b0bd02205f7b2bcba2"},"password":"111111","username":"用户二","gender":2,"status":1,"mobile":"13912345678","mobile_confirmed":1,"avatar":"https://mp-61955188-4c98-45ca-a1f1-471cc333073c.cdn.bspapp.com/cloudstorage/6bcb1ae2-5969-4901-9dec-a3f59b650587.jpg","token":"MTM5MTIzNDU2NzgtMTczOTIxNjUzMDU5Mg==","register_date":{"$date":"2025-02-09T14:03:27.08Z"},"last_login_date":{"$date":"2025-02-10T19:42:10.593Z"}}
{"_id":{"$oid":"67a8b83821821b610dc7a845"},"password":"123456","username":"用户三","gender":2,"status":1,"mobile":"13812345678","mobile_confirmed":1,"avatar":"/static/avatar/default-avatar.png","token":"MTM4MTIzNDU2NzgtMTczOTIxMjk3Mjk4OQ==","register_date":{"$date":"2025-02-09T14:14:14.335Z"},"last_login_date":{"$date":"2025-02-10T18:42:52.989Z"}}

```

### 3. 评论数据 (travel-comments)
```js
{"_id":{"$oid":"67aa034e149854207f5e9850"},"user_id":{"$oid":"67a8b5b0bd02205f7b2bcba2"},"spot_id":{"$oid":"67a8bae9466d41ded409dbc9"},"content":"111111111111","rating":4.1,"images":["https://mp-61955188-4c98-45ca-a1f1-471cc333073c.cdn.bspapp.com/cloudstorage/a8dcfa86-62a7-4896-8e8c-8381dadbace8.jpg","https://mp-61955188-4c98-45ca-a1f1-471cc333073c.cdn.bspapp.com/cloudstorage/9fbb2a8f-e63a-480c-8342-6b8fb443a82a.jpg","https://mp-61955188-4c98-45ca-a1f1-471cc333073c.cdn.bspapp.com/cloudstorage/f9bb39db-e04d-4af1-a396-f10c6aa57fd7.jpg","https://mp-61955188-4c98-45ca-a1f1-471cc333073c.cdn.bspapp.com/cloudstorage/6c679398-c79a-4a57-9873-ca555e4ed96c.jpg","https://mp-61955188-4c98-45ca-a1f1-471cc333073c.cdn.bspapp.com/cloudstorage/6926819f-83ac-4fd7-b0b3-a577aa45a295.jpg","https://mp-61955188-4c98-45ca-a1f1-471cc333073c.cdn.bspapp.com/cloudstorage/9adf87cb-c20a-4bb6-bd2d-c6e83740c935.jpg","https://mp-61955188-4c98-45ca-a1f1-471cc333073c.cdn.bspapp.com/cloudstorage/fa204392-6e63-45ee-9756-6a1327a358b7.jpg","https://mp-61955188-4c98-45ca-a1f1-471cc333073c.cdn.bspapp.com/cloudstorage/71f5658e-837c-4735-b2cf-e3e70538aae0.jpg","https://mp-61955188-4c98-45ca-a1f1-471cc333073c.cdn.bspapp.com/cloudstorage/0c514bf8-8065-45e9-84fe-7db00f760a5a.jpg"],"create_date":1739195212734,"update_date":1739195212734}

{"_id":{"$oid":"67aa3dde466d41ded432869e"},"user_id":{"$oid":"67a8b5b0bd02205f7b2bcba2"},"spot_id":{"$oid":"67a8bcbbce5ec9e5aaf864fb"},"content":"哈哈哈哈哈","rating":4,"images":["https://mp-61955188-4c98-45ca-a1f1-471cc333073c.cdn.bspapp.com/cloudstorage/7f9f499b-765b-4213-8a6a-14bef8a5c635.jpg"],"create_date":1739210206594,"update_date":1739210206594}

{"_id":{"$oid":"67aa47a6466d41ded43308ba"},"user_id":{"$oid":"67a8aa8a0d2b3168f7518cc4"},"spot_id":{"$oid":"67a8bae9466d41ded409dbc9"},"content":"快快快快快快快快快","rating":4.6,"images":["https://mp-61955188-4c98-45ca-a1f1-471cc333073c.cdn.bspapp.com/cloudstorage/3be3b6a8-d054-4a7a-af6c-89c4c00af3c8.jpg"],"create_date":1739212708291,"update_date":1739212708291}

{"_id":{"$oid":"67aa47f9466d41ded4330c2f"},"user_id":{"$oid":"67a8b83821821b610dc7a845"},"spot_id":{"$oid":"67a8bae9466d41ded409dbc9"},"content":"天天吞吞吐吐","rating":3.4,"images":["https://mp-61955188-4c98-45ca-a1f1-471cc333073c.cdn.bspapp.com/cloudstorage/c0027000-afdb-4091-9b6b-f32bd5cbbb57.jpg"],"create_date":1739212791200,"update_date":1739212791200}

```   

### 4. 喜欢数据 (travel-favorites)
```js
{"_id":{"$oid":"67a9fdeb337a9f4a9f694689"},"user_id":{"$oid":"67a8b5b0bd02205f7b2bcba2"},"spot_id":{"$oid":"67a8bcbbce5ec9e5aaf864fb"},"create_date":{"$date":"2025-02-10T13:23:54.239Z"}}

{"_id":{"$oid":"67aa06616523418be840b4d5"},"user_id":{"$oid":"67a8aa8a0d2b3168f7518cc4"},"spot_id":{"$oid":"67a8bae9466d41ded409dbc9"},"create_date":{"$date":"2025-02-10T13:59:59.907Z"}}
```



## 📅 更新日志

### v1.0.0 (2024-03-xx)
- 初始版本发布
- 实现基础功能模块
- 完成云开发集成
- 支持微信小程序端运行 