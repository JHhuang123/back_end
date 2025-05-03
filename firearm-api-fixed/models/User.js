const mongoose = require("mongoose");

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
});

module.exports = mongoose.model("User", userSchema);