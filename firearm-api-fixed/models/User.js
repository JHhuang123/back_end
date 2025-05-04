const mongoose = require("mongoose");
const userDb = require("../utils/userDb");

const userSchema = new mongoose.Schema({
  // 🆔 用户基本信息
  userId: { type: String, required: true, unique: true },
  userName: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },

  // 👤 个人展示信息
  avatarUrl: { type: String, default: "" },
  userLevel: { type: String, default: "Beginner" },
  nickname: { type: String, default: "" },
  bio: { type: String, default: "" },

  // 🧭 用户社交与互动
  follow: { type: [String], default: [] },

  // 🌟 收藏相关
  favorites: { type: [String], default: [] },
  collection: { type: [String], default: [] },

  // 🔔 通知与订阅偏好
  notifications: { type: [String], default: [] },
  newsPreference: { type: Object, default: {} },

  // 🛠️ 枪支维护与笔记
  maintenance: { type: [Object], default: [] },
  notes: { type: [Object], default: [] },

  // ⚙️ 应用设置偏好（语言、主题、隐私等）
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
  }
}, {
  collection: "users"
});

module.exports = userDb.model("User", userSchema);