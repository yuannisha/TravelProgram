# 基于UniApp的旅游平台小程序设计与实现

## 🚀 项目简介
一款功能完整的旅游平台小程序，基于UniApp跨端开发框架，采用uniCloud云开发方案，实现了景点展示、用户管理、收藏功能和地图导航等核心功能。本项目致力于为用户提供便捷的旅游信息获取和行程规划服务。

## 📱 功能使用指南

### 1. 首页浏览
- **热门景点轮播**：首页顶部展示精选热门景点，支持左右滑动查看
- **分类快捷入口**：提供景点分类快速访问（自然风光、人文古迹、主题乐园等）
- **推荐行程**：展示精选旅行计划，帮助用户快速找到心仪的行程
- **搜索功能**：支持景点名称、地址、标签等多维度搜索
- **定位服务**：自动定位当前城市，推荐周边热门景点

### 2. 景点探索
- **分类浏览**：
  - 按景点类型（自然风光/人文古迹/美食街区等）筛选
  - 按评分高低排序
  - 按价格区间筛选
- **景点详情**：
  - 高清图片展示（支持放大预览）
  - 详细地理位置（支持一键导航）
  - 门票价格信息
  - 开放时间说明
  - 建议游玩时间
- **用户评价**：
  - 查看其他游客的评分和点评
  - 发表个人游玩体验
  - 上传游玩实拍照片（最多9张）

### 3. 行程规划
- **浏览行程**：
  - 查看他人分享的公开行程
  - 查看行程详细安排
- **创建行程**：
  - 添加计划游玩景点
  - 设置游玩日期
  - 添加景点备注
  - 设置行程标题和描述
- **行程管理**：
  - 修改行程内容
  - 删除行程
  - 分享行程给好友
  - 将行程设为公开/私密

### 4. 地图功能
- **景点导航**：
  - 查看景点具体位置
  - 显示到达路线
  - 支持多种交通方式
- **周边探索**：
  - 在地图上显示周边景点
  - 查看景点基本信息
  - 一键导航至景点

### 5. 个人中心
- **账户管理**：
  - 手机号注册/登录
  - 修改个人资料
  - 更换头像
  - 修改密码
  - 更换绑定手机
- **收藏管理**：
  - 收藏喜欢的景点
  - 收藏心仪的行程
  - 查看收藏列表
  - 取消收藏

### 6. 社交分享
- **内容分享**：
  - 分享景点给好友
  - 分享行程给好友
  - 复制分享链接

### 7. 安全保障
- **隐私保护**：
  - 个人信息加密存储
  - 位置信息脱敏处理
- **账户安全**：
  - 短信验证码校验
  - 敏感操作验证

## 🌟 核心功能
- **首页推荐**：动态轮播图展示热门景点，分类导航快速访问
- **景点浏览**：支持按类型（自然/人文/美食等）分类展示，支持搜索和筛选
- **用户中心**：用户注册登录、个人信息管理
- **收藏管理**：用户可收藏/取消收藏景点和行程，支持收藏列表查看
- **地图导航**：集成高德地图SDK，显示景点位置及周边设施
- **评分点评**：用户可对景点进行评分和评论
- **行程规划**：支持创建、编辑和分享旅行计划

## 🛠 技术架构
- **前端框架**：
  - UniApp (Vue3)
  - uni-ui组件库
  - Sass/SCSS
- **云服务**：
  - uniCloud 阿里云版
  - 云函数
  - 云对象
- **数据库**：
  - JQL语法
  - DB Schema
- **存储服务**：
  - 云存储
  - 内容安全检测
- **地图服务**：
  - 高德地图SDK
  - 定位服务
  - 路线规划API

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

5. **旅行计划模块**
   - 创建个人行程
   - 浏览公开行程
   - 行程详情管理
   - 智能路线规划
   - 行程分享功能

## 📊 数据库设计

### 数据库表结构

#### 1. 用户集合 (uni-id-users)
```json
{
  "_id": "用户ID，系统自动生成",
  "username": "用户名，不允许重复",
  "password": "密码，加密存储",
  "gender": "性别：0 未知 1 男性 2 女性",
  "status": "用户状态：0 正常 1 禁用 2 审核中 3 审核拒绝",
  "mobile": "手机号码",
  "mobile_confirmed": "手机号验证状态：0 未验证 1 已验证",
  "avatar": "头像地址，默认值：/static/avatar/default-avatar.png",
  "register_date": "注册时间",
  "last_login_date": "最后登录时间",
  "last_login_ip": "最后登录IP",
  "token": [{
    "token": "登录标识",
    "create_date": "标识创建时间"
  }]
}
```

#### 2. 景点集合 (travel-spots)
```json
{
  "_id": "景点ID，系统自动生成",
  "name": "景点名称",
  "categoryId": "分类ID（1-4）",
  "imageUrl": "主图地址",
  "images": ["图片URL数组"],
  "price": "价格（单位：分）",
  "rating": "评分（0-5分）",
  "commentCount": "评论数",
  "tags": ["标签列表"],
  "address": "详细地址",
  "location": {
    "type": "Point",
    "coordinates": [经度, 纬度]
  },
  "description": "景点介绍",
  "openTime": "开放时间",
  "suggestedTime": "建议游玩时间",
  "creator_id": "创建者ID",
  "create_date": "创建时间",
  "update_date": "更新时间"
}
```

#### 3. 评论集合 (travel-comments)
```json
{
  "_id": "评论ID，系统自动生成",
  "user_id": "用户ID",
  "spot_id": "景点ID",
  "content": "评论内容",
  "rating": "评分（1-5分）",
  "images": ["图片URL数组，最多9张"],
  "create_date": "评论时间",
  "update_date": "更新时间"
}
```

#### 4. 收藏集合 (travel-favorites)
```json
{
  "_id": "收藏ID，系统自动生成",
  "user_id": "用户ID",
  "spot_id": "景点ID",
  "plan_id": "旅行计划ID",
  "type": "收藏类型，默认spot",
  "create_date": "收藏时间"
}
```

#### 5. 行程集合 (travel-plans)
```json
{
  "_id": "行程ID，系统自动生成",
  "user_id": "创建用户ID",
  "title": "行程标题",
  "description": "行程描述",
  "start_date": "开始日期",
  "end_date": "结束日期",
  "spots": [{
    "spot_id": "景点ID",
    "visit_date": "计划游览日期",
    "notes": "景点游览备注"
  }],
  "status": "计划状态：0-计划中，1-进行中，2-已完成",
  "is_public": "是否公开：true-公开，false-私有",
  "create_date": "创建时间",
  "update_date": "更新时间"
}
```

## 📝 测试数据

### 1. 景点数据 (travel-spots)
```js
{"_id":{"$oid":"67a8b9843d029caca1cdcb17"},"name":"西湖","categoryId":1,"imageUrl":"/static/spots/xihu.jpg","images":["/static/spots/xihu1.jpg","/static/spots/xihu2.jpg","/static/spots/xihu3.jpg"],"price":8000,"rating":4.8,"commentCount":0,"tags":["自然风光","文化遗产","摄影胜地"],"address":"浙江省杭州市西湖区","location":{"type":"Point","coordinates":[120.149953,30.242846]},"description":"西湖，位于浙江省杭州市西湖区龙井路1号，是中国大陆首个世界遗产公园。","openTime":"全天开放","suggestedTime":"建议游玩3-4小时","creator_id":{"$oid":"67a8aa8a0d2b3168f7518cc4"},"create_date":{"$date":"2025-02-09T13:15:52.567Z"},"update_date":{"$date":"2025-02-09T13:15:52.567Z"}}

{"_id":{"$oid":"67a8badae0ec19c842bce11b"},"name":"上海迪士尼乐园","categoryId":4,"imageUrl":"/static/spots/disney.jpg","images":["/static/spots/disney1.jpg","/static/spots/disney2.jpg","/static/spots/disney3.jpg"],"price":68900,"rating":4.6,"commentCount":0,"tags":["主题乐园","亲子游玩","娱乐项目"],"address":"上海市浦东新区川沙新镇黄赵路310号","location":{"type":"Point","coordinates":[121.674272,31.145279]},"description":"上海迪士尼度假区是中国内地首个迪士尼度假区。","openTime":"8:00-20:00","suggestedTime":"建议游玩1-2天","creator_id":{"$oid":"67a8aa8a0d2b3168f7518cc4"},"create_date":{"$date":"2025-02-09T13:15:52.567Z"},"update_date":{"$date":"2025-02-09T13:15:52.567Z"}}

{"_id":{"$oid":"67a8bae9466d41ded409dbc9"},"name":"宽窄巷子","categoryId":3,"imageUrl":"/static/spots/kuanzhai.jpg","images":["/static/spots/kuanzhai1.jpg","/static/spots/kuanzhai2.jpg","/static/spots/kuanzhai3.jpg"],"price":0,"rating":4,"commentCount":3,"tags":["美食街区","文化古迹","休闲娱乐"],"address":"四川省成都市青羊区宽窄巷子","location":{"type":"Point","coordinates":[104.062225,30.669996]},"description":"宽窄巷子是成都市三大历史文化名城保护街区之一。","openTime":"全天开放","suggestedTime":"建议游玩3-4小时","creator_id":{"$oid":"67a8aa8a0d2b3168f7518cc4"},"create_date":{"$date":"2025-02-09T13:15:52.567Z"},"update_date":{"$date":"2025-02-09T13:15:52.567Z"}}

{"_id":{"$oid":"67a8bca63d029caca1ce29a8"},"name":"故宫","categoryId":2,"imageUrl":"/static/spots/gugong.jpg","images":["/static/spots/gugong1.jpg","/static/spots/gugong2.jpg","/static/spots/gugong3.jpg"],"price":6000,"rating":4.9,"commentCount":0,"tags":["历史古迹","宫廷建筑","文化遗产"],"address":"北京市东城区景山前街4号","location":{"type":"Point","coordinates":[116.403414,39.924091]},"description":"故宫又名紫禁城，是中国明清两代的皇家宫殿。","openTime":"8:30-17:00","suggestedTime":"建议游玩4-6小时","creator_id":{"$oid":"67a8aa8a0d2b3168f7518cc4"},"create_date":{"$date":"2025-02-09T13:15:52.567Z"},"update_date":{"$date":"2025-02-09T13:15:52.567Z"}}

{"_id":{"$oid":"67a8bcbbce5ec9e5aaf864fb"},"name":"黄山","categoryId":1,"imageUrl":"/static/spots/huangshan.jpg","images":["/static/spots/huangshan1.jpg","/static/spots/huangshan2.jpg","/static/spots/huangshan3.jpg"],"price":19000,"rating":4,"commentCount":0,"tags":["自然风光","山水景观","云海日出"],"address":"安徽省黄山市黄山区","location":{"type":"Point","coordinates":[118.337481,30.131949]},"description":"黄山以奇松、怪石、云海、温泉四绝闻名于世。","openTime":"6:30-17:30","suggestedTime":"建议游玩2-3天","creator_id":{"$oid":"67a8aa8a0d2b3168f7518cc4"},"create_date":{"$date":"2025-02-09T13:15:52.567Z"},"update_date":{"$date":"2025-02-09T13:15:52.567Z"}}

{"_id":{"$oid":"67a8bcd5e0ec19c842bd2033"},"name":"八达岭长城","categoryId":2,"imageUrl":"/static/spots/changcheng.jpg","images":["/static/spots/changcheng1.jpg","/static/spots/changcheng2.jpg","/static/spots/changcheng3.jpg"],"price":4000,"rating":4.7,"commentCount":0,"tags":["历史古迹","文化遗产","登山徒步"],"address":"北京市延庆区八达岭长城路","location":{"type":"Point","coordinates":[116.016389,40.359167]},"description":"八达岭长城是明长城中最具代表性的一段。","openTime":"7:30-17:30(夏季) 7:30-17:00(冬季)","suggestedTime":"建议游玩3-4小时","creator_id":{"$oid":"67a8aa8a0d2b3168f7518cc4"},"create_date":{"$date":"2025-02-09T13:15:52.567Z"},"update_date":{"$date":"2025-02-09T13:15:52.567Z"}}

```

### 表关系说明

#### 主要关系
1. **用户-景点评论关系**
   - 一个用户可以对多个景点发表评论（1:N）
   - 每条评论必须关联一个用户和一个景点
   - 通过 user_id 和 spot_id 建立关联

2. **用户-收藏关系**
   - 用户可以收藏景点或行程（1:N）
   - 每个收藏记录通过 type 字段区分类型
   - 使用联合唯一索引确保同一用户不会重复收藏

3. **用户-行程关系**
   - 用户可以创建多个行程计划（1:N）
   - 行程可以设置公开或私密
   - 通过 user_id 关联创建者

4. **行程-景点关系**
   - 一个行程可以包含多个景点
   - 每个景点可以设置具体游览日期和备注
   - 通过 spots 数组存储关联信息

### 索引设计
1. **用户集合**
   - _id: 主键索引
   - username: 唯一索引
   - mobile: 唯一索引

2. **景点集合**
   - _id: 主键索引
   - categoryId: 普通索引
   - location: 地理位置索引
   - rating: 普通索引

3. **评论集合**
   - _id: 主键索引
   - spot_id: 普通索引（优化景点评论查询）

4. **收藏集合**
   - _id: 主键索引
   - user_id + spot_id: 联合唯一索引（防止重复收藏）

5. **行程集合**
   - _id: 主键索引
   - user_id: 普通索引（优化用户行程查询）

### 权限控制
1. **景点集合**
   - 读取：所有人可读
   - 创建/更新：登录用户
   - 删除：仅创建者

2. **评论集合**
   - 读取：所有人可读
   - 创建：登录用户
   - 更新/删除：仅评论作者

3. **收藏集合**
   - 读取/创建：登录用户
   - 更新/删除：仅收藏所有者

4. **行程集合**
   - 读取：登录用户
   - 创建：登录用户
   - 更新/删除：仅创建者

### 数据完整性
1. **外键关联**
   - 评论表 spot_id 关联景点表
   - 收藏表 spot_id/plan_id 关联对应表
   - 行程表 spots.spot_id 关联景点表

2. **字段验证**
   - 必填字段验证
   - 数值范围验证
   - 字符串长度限制
   - 日期格式验证

## 📡 API接口说明

### 用户相关接口
- **user-register**: 用户注册
- **user-login**: 用户登录
- **send-sms-code**: 发送短信验证码
- **update-user-info**: 更新用户信息
- **update-avatar**: 更新用户头像
- **change-password**: 修改密码
- **change-mobile**: 更换手机号

### 景点相关接口
- **get-spots**: 获取景点列表
- **get-spot-detail**: 获取景点详情
- **get-spot-withId**: 根据ID获取景点信息

### 评论相关接口
- **get-comments**: 获取评论列表
- **add-comment**: 添加评论

### 收藏相关接口
- **get-favorites**: 获取收藏列表
- **toggle-favorite**: 收藏/取消收藏
- **get-favorite-status**: 获取收藏状态

### 行程相关接口
- **manage-plans**: 行程管理（创建、更新、删除）

### 数据库字段验证规则

#### 景点集合 (travel-spots)
- name: 必填，字符串类型
- categoryId: 必填，范围1-4
- imageUrl: 必填，字符串类型
- price: 必填，整数类型（分）
- rating: 0-5分，默认5分
- commentCount: 整数，默认0
- description: 选填，字符串类型

#### 评论集合 (travel-comments)
- content: 必填，最大长度500字符
- rating: 必填，范围1-5
- images: 最多9张图片
- spot_id: 必填，关联景点表

#### 行程集合 (travel-plans)
- title: 必填，最大长度100字符
- description: 选填，最大长度500字符
- spots.notes: 选填，最大长度200字符
- status: 0-计划中，1-进行中，2-已完成

### 已实现功能
1. **用户功能**
   - [x] 手机号注册/登录
   - [x] 短信验证码
   - [x] 个人信息修改
   - [x] 头像上传
   - [x] 密码修改
   - [x] 手机号更换

2. **景点功能**
   - [x] 景点列表展示
   - [x] 分类筛选
   - [x] 详情查看
   - [x] 地图定位
   - [x] 评分评论

3. **收藏功能**
   - [x] 景点收藏
   - [x] 行程收藏
   - [x] 收藏列表
   - [x] 取消收藏

4. **行程功能**
   - [x] 创建行程
   - [x] 编辑行程
   - [x] 行程分享
   - [x] 公开/私密设置

### 待实现功能
1. **社交功能**
   - [ ] 评论点赞
   - [ ] 用户关注
   - [ ] 消息通知

2. **特色功能**
   - [ ] 离线地图
   - [ ] 语音导览
   - [ ] 天气提醒
   - [ ] 智能助手

## 🎯 项目特点
- 支持多端适配（微信小程序、H5、App）
- 基于云开发，无需部署服务器
- 组件化开发，代码复用性高
- 完整的用户权限管理
- 数据安全性保障
- 支持离线缓存功能
- 界面设计简洁美观，操作流畅
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

## 🔄 开发流程
1. **环境配置**
   - IDE配置
   - 插件安装
   - 云服务初始化
2. **开发阶段**
   - 组件开发
   - 页面实现
   - 云函数编写
3. **测试阶段**
   - 功能测试
   - 性能测试
   - 兼容性测试
4. **部署上线**
   - 代码审查
   - 性能优化
   - 发布配置

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

### 性能优化措施
1. **前端优化**
   - 组件按需加载
   - 图片懒加载
   - 数据分页处理
   - 防抖节流处理
2. **后端优化**
   - 数据库索引优化
   - 云函数冷启动优化
   - 缓存策略优化
   - 并发请求处理

## 🧪 测试用例
1. **功能测试**
   - 用户注册登录流程
   - 景点浏览和搜索
   - 收藏功能验证
   - 评论互动功能
2. **性能测试**
   - 页面加载速度
   - 图片加载优化
   - 接口响应时间
3. **兼容性测试**
   - 不同机型适配
   - 不同系统版本

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

## 📂 项目结构
```
TravelPlatformMiniProgram
├── pages                        // 页面文件夹
│   ├── index                   // 首页模块
│   │   └── index.vue          // 首页
│   ├── spots                   // 景点模块
│   │   ├── spots.vue          // 景点列表
│   │   ├── detail.vue         // 景点详情
│   │   ├── search.vue         // 景点搜索
│   │   └── comments.vue       // 景点评论
│   ├── plans                   // 旅行计划模块
│   │   ├── plans.vue          // 我的计划列表
│   │   ├── public-plans.vue   // 公开计划列表
│   │   ├── plan-detail.vue    // 计划详情
│   │   ├── plan-edit.vue      // 计划编辑
│   │   └── spot-select.vue    // 景点选择
│   ├── user                    // 用户模块
│   │   ├── user.vue           // 个人中心
│   │   ├── login.vue          // 登录
│   │   ├── register.vue       // 注册
│   │   ├── favorites.vue      // 我的收藏
│   │   ├── profile.vue        // 个人资料
│   │   ├── settings.vue       // 设置
│   │   ├── about.vue          // 关于
│   │   ├── avatar.vue         // 头像设置
│   │   ├── change-mobile.vue  // 更换手机
│   │   └── change-password.vue // 修改密码
│   └── map                     // 地图模块
│       └── map.vue            // 地图页面
├── static                      // 静态资源
├── uni_modules                 // uni-app组件
├── uniCloud-aliyun            // 云开发相关
├── utils                      // 工具函数
├── common                     // 公共资源
├── App.vue                    // 应用配置
├── main.js                    // 入口文件
├── manifest.json              // 配置文件
├── pages.json                 // 页面配置
└── uni.scss                   // 全局样式
```



