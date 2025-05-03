# Firearm App Backend API

本项目为 Firearm App 的后端服务，使用 Node.js + Express + MongoDB 搭建，支持用户枪支管理、配件记录、维护提醒、地图搜索、AI 推荐与对话、收藏等核心功能。

---

## ✅ 已完成功能

### 🔫 用户枪支管理（UserFirearm）
- 用户持有枪支的增删改查
- 支持记录配件（accessories）、弹药记录（ammoRecords）、保养记录（maintenanceRecords）

### 🛠️ 维护提醒功能
- `GET /user_firearm/reminders`：获取需维护提醒的枪支

### 🔍 枪支详情页
- `GET /firearm-details/:id`：根据 Firearm ID 查询枪支详情

---

## ❌ 待开发功能

### 👤 用户信息管理
- `GET /users/{uid}/profile`：查看用户资料  
- `PUT /users/{uid}/profile`：编辑用户资料  
- `POST /users/{uid}/avatar`：上传用户头像

### ❤️ 收藏/喜好功能
- `GET /users/{uid}/favorites`：获取收藏列表  
- `POST /users/{uid}/favorites`：添加收藏  
- `DELETE /users/{uid}/favorites/{itemId}`：取消收藏

### ✳️ 推荐系统（问卷推荐枪支）
- `POST /recommendation`：提交问卷，返回推荐枪支

### 🔎 搜索模块
- `GET /search/items?keyword=xxx&page=1&limit=20`：关键词搜索  
- `GET /search/suggestions?q=xxx`：搜索联想词（品牌/型号）  
- `POST /search/advanced`：多条件筛选  
- `GET /users/{uid}/searches`：获取用户历史搜索记录

### 🎯 产品详情页拓展
- `GET /products/{productId}`：产品详情  
- `GET /products/{id}/videos`：产品视频  
- `GET /products/{id}/compliance?state=CA`：合规信息  
- `GET /products/{id}/related`：相关推荐  
- `GET /products/{id}/safetyRules`：安全规则  
- `GET /products/{id}/reviews?page=1`：用户评价

### 🔁 枪支比较功能
- `GET /firearms/compare?ids=id1,id2`：对比枪支参数

### 🧠 AI Coach 聊天机器人
- `GET /ai/conversations?userId={uid}`：获取会话历史  
- `POST /ai/conversations`：创建新会话  
- `POST /ai/conversations/{convId}/messages`：发送消息  
- `GET /ai/conversations/{convId}/stream?userId={uid}`：流式响应（用于实时聊天）

### 📋 推荐问答模块
- `GET /questions/trending`：获取热门问题  
- `POST /questions`：用户提问

### 🛠️ Armory 模块（拓展用户枪支细节）
- `GET /users/{uid}/armory/{armoryId}`：获取单支枪详情  
- `GET /armory/{armoryId}/accessories`：配件详情  
- `GET /armory/{armoryId}/maintenance`：保养记录  
- `GET /armory/{armoryId}/notes`：笔记信息  
- `GET /armory/{armoryId}/videos?type=guide`：操作视频  
- `DELETE /users/{uid}/armory/{armoryId}`：删除该枪  
- `PUT /users/{uid}/armory/{armoryId}`：编辑该枪  
- `POST /armory/{id}/image`：上传枪支照片  
- `POST /armory/{id}/accessories`：新增配件信息

### 🗺️ 地图功能
- `GET /dealers`：附近经销商  
- `GET /ranges`：附近靶场  
- `GET /hunting/areas`：附近狩猎区域

---

## 🛠 技术栈
- Node.js / Express.js
- MongoDB Atlas
- Mongoose ODM
- Multer（头像、图片上传）
- Google Maps API（地理定位功能，待集成）
- Gemini AI / GPT（AI Coach 功能，待集成）

---

## 📁 环境变量 `.env` 示例

```env
PORT=3000
MONGODB_URI_FIREARMS=mongodb+srv://jiahua:iChdH6qu97SC8bQn@xrings.syuol.mongodb.net/Firearms
MONGODB_URI_USERDATABASE=mongodb+srv://jiahua:iChdH6qu97SC8bQn@xrings.syuol.mongodb.net/userDatabase