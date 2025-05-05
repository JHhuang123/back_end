const mongoose = require("mongoose");
const userDb = require("../utils/userDb");

// ✅ 子文档 schema：收藏项结构
const favoriteSchema = new mongoose.Schema({
  type: { type: String, required: true }, // e.g., "article", "firearmInfo", "video"
  targetId: { type: String, required: true },
  title: { type: String, default: "" },
  timestamp: { type: Date, default: Date.now }
}, { _id: true });

// ✅ 用户主 schema
const userSchema = new mongoose.Schema({
  // 🆔 用户基本信息
  userId: { type: String, required: true, unique: true },
  userName: { type: String, required: true },
  email: { type: String, required: true },
  passwordHash: { type: String, required: true },

  // 👤 个人展示信息
  avatarUrl: { type: String, default: "" },
  userLevel: { type: String, default: "Beginner" },
  nickname: { type: String, default: "" },
  bio: { type: String, default: "" },

  // 🧭 用户社交与互动
  follow: { type: [String], default: [] },

  // 🌟 收藏功能
  favorites: { type: [favoriteSchema], default: [] }, // 单一收藏列表（可选）
  favoriteFolders: {
    type: [
      {
        name: { type: String, required: true },
        items: {
          type: [favoriteSchema],
          default: []
        }
      }
    ],
    default: []
  },

  // 🎯 自定义枪支收藏记录
  collection: { type: [mongoose.Schema.Types.Mixed], default: [] },

  // 🔔 通知与订阅
  notifications: { type: [mongoose.Schema.Types.Mixed], default: [] },
  newsPreference: { type: [Object], default: [] },

  // 🛠️ 枪支维护与笔记
  maintenance: { type: [Object], default: [] },
  notes: { type: [Object], default: [] },

  // ⚙️ 用户偏好设置
  settings: {
    type: Object,
    default: {
      language: "en",
      theme: "light",
      notifications: true,
      privacy: {
        showProfile: true,
        shareActivity: true
      }
    }
  },

  // 🌍 地理位置信息
  location: {
    latitude: Number,
    longitude: Number,
    city: String,
    region: String,
    country: String,
    postalCode: String
  },

  // 📅 注册与登录状态
  registeredAt: { type: Date },
  lastLogin: { type: Date },
  isVerified: { type: Boolean, default: false }

}, {
  collection: "users"
});

module.exports = userDb.model("User", userSchema);