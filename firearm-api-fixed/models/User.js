const mongoose = require("mongoose");
const userDb = require("../utils/userDb");

const favoriteSchema = new mongoose.Schema({
  type: { type: String, required: true },
  targetId: { type: String, required: true },
  title: { type: String },
  timestamp: { type: Date, default: Date.now }
}, { _id: true });  // 让每条 favorite 自动生成 _id 方便删除

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  userName: { type: String, required: true },
  email: { type: String, required: true },
  passwordHash: { type: String, required: true },

  avatarUrl: { type: String, default: "" },
  userLevel: { type: String, default: "Beginner" },
  nickname: { type: String, default: "" },
  bio: { type: String, default: "" },

  follow: { type: [String], default: [] },

  favorites: { type: [favoriteSchema], default: [] }, // ✅ 使用子 schema 避免混淆
  collection: { type: [mongoose.Schema.Types.Mixed], default: [] },

  notifications: { type: [mongoose.Schema.Types.Mixed], default: [] },
  newsPreference: { type: [Object], default: [] },

  maintenance: { type: [Object], default: [] },
  notes: { type: [Object], default: [] },

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

  location: {
    latitude: Number,
    longitude: Number,
    city: String,
    region: String,
    country: String,
    postalCode: String
  },

  registeredAt: { type: Date },
  lastLogin: { type: Date },
  isVerified: { type: Boolean, default: false }
}, {
  collection: "users"
});

module.exports = userDb.model("User", userSchema);