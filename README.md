# Firearm App Backend API

本项目为 Firearm App 的后端服务，使用 Node.js + Express + MongoDB 搭建，支持用户枪支管理、配件记录、维护提醒、地图搜索、AI 推荐与对话、收藏等核心功能。

---

## ✅ 已完成功能

### 🔫 用户枪支管理（UserFirearm）
- 用户持有枪支的增删改查
- 支持记录配件（accessories）、弹药记录（ammoRecords）、保养记录（maintenanceRecords）、笔记（notes）

### 🛠️ 维护提醒功能
- `GET /api/user_firearm/reminders`：获取需维护提醒的枪支

### 🔍 枪支详情页
- `GET /firearm-details/:id`：根据 Firearm ID 查询枪支详情

### 📦 枪支商品数据访问
- `GET /handguns?all=true`：获取所有手枪
- `GET /rifles?all=true`：获取所有步枪
- `GET /[collectionName]?all=true`：获取任意类别商品（如 shotguns、optics 等）

### 🧰 Armory 模块（用户枪支拓展管理）
- `POST /api/armory/users/:uid/armory`：将商品添加为用户枪支
- `GET /api/armory/users/:uid/armory/:armoryId`：获取用户单支枪详情
- `DELETE /api/armory/users/:uid/armory/:armoryId`：删除该枪
- `PUT /api/armory/users/:uid/armory/:armoryId`：编辑该枪
- `GET /api/armory/:armoryId/accessories`：获取配件列表
- `POST /api/armory/:id/accessories`：添加配件
- `GET /api/armory/:armoryId/maintenance`：获取保养记录
- `GET /api/armory/:armoryId/notes`：获取笔记信息
- `GET /api/armory/:armoryId/videos?type=guide`：获取操作视频

### 📝 用户笔记系统
- 支持添加、修改、删除、查询、清空某支枪笔记

---

## ❌ 待开发功能

### 👤 用户资料与偏好
- `GET /users/{uid}/profile`、`PUT`：查看与编辑资料
- `POST /users/{uid}/avatar`：上传头像
- `GET /users/{uid}/settings` / `PUT`：查看/修改应用偏好（语言、主题、隐私、通知）

### ❤️ 收藏与喜好
- 收藏增删查：`GET/POST/DELETE /users/{uid}/favorites`
- 支持收藏产品、帖子

### ✳️ 枪支推荐系统（问卷推荐）
- `POST /recommendation`：提交问卷、返回推荐枪支列表

### 🔎 搜索系统
- 关键词搜索：`GET /search/items`
- 搜索建议：`GET /search/suggestions`
- 高级筛选：`POST /search/advanced`
- 搜索记录：`GET /users/{uid}/searches`

### 🎯 产品详情拓展
- `GET /products/{id}`：详情
- `GET /products/{id}/videos`、`/compliance`、`/related`、`/safetyRules`、`/reviews`

### 🔁 枪支比较
- `GET /firearms/compare?ids=id1,id2,...`：返回对比数据结构

### 🧠 AI 教练模块
- 会话管理：`GET/POST /ai/conversations`
- 发送消息：`POST /ai/conversations/{convId}/messages`
- 聊天流：`GET /ai/conversations/{convId}/stream`

### 📋 问答推荐模块
- 热门问题：`GET /questions/trending`
- 提问：`POST /questions`

### 🌐 地图功能（地图 & 附近设施）
- `GET /dealers`：附近经销商
- `GET /ranges`：靶场
- `GET /hunting/areas`：猎区

### 🏛️ 社区模块
- 帖子增删改查：`/community/posts`
- 评论：`/community/posts/{id}/comments`
- 点赞：`/community/posts/{id}/like`
- 举报：`POST /reports`

### 🔔 通知模块
- 获取：`GET /users/{uid}/notifications`
- 标为已读：`POST /users/{uid}/notifications/mark-read`

### 🧾 用户成就与等级
- 射击/打猎统计：`GET /users/{uid}/stats`
- 成就勋章：`GET /users/{uid}/achievements`
- 等级/经验：`GET /users/{uid}/level`

### 🎮 AR / 3D 模型模块
- 模型列表：`GET /ar/models?category=handgun&page=1`
- 模型详情：`GET /ar/models/{modelId}`（含 downloadUrl）

### ⚙️ 系统设置与版本控制
- 应用配置：`GET /app/config`
- 版本更新检查：`GET /app/version`

### 🔐 用户认证模块
- 登录/登出：`POST /auth/login`, `/auth/logout`
- 注册：`POST /auth/register`
- OAuth 登录：Google / Apple / Facebook
- 密码重置与修改：`/auth/password-reset-request`, `/auth/change-password`, `/auth/refresh`

### 📣 用户反馈与举报
- 意见反馈：`POST /feedback`
- 内容举报：`POST /reports`

---

## 📁 环境变量 `.env` 示例

```env
PORT=3000
MONGODB_URI_FIREARMS=mongodb+srv://jiahua:iChdH6qu97SC8bQn@xrings.syuol.mongodb.net/Firearms
MONGODB_URI_USERDATABASE=mongodb+srv://jiahua:iChdH6qu97SC8bQn@xrings.syuol.mongodb.net/userDatabase
