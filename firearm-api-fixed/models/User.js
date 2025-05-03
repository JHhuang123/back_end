const mongoose = require("mongoose");
const userDb = require('../utils/userDb');

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  nickname: { type: String },
  follow: { type: [String], default: [] },
  favorites: { type: [String], default: [] },
  collection: { type: [String], default: [] },
  notifications: { type: [String], default: [] },
  newsPreference: { type: Object, default: {} },
  maintenance: { type: [Object], default: [] },
  notes: { type: [Object], default: [] }
}, {
  collection: 'users' // 确保与你 MongoDB Atlas 集合一致
});

module.exports = userDb.model('User', userSchema);