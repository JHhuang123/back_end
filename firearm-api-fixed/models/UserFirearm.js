// models/UserFirearm.js
const mongoose = require("mongoose");
const userDb = require("../utils/userDb");

const NoteSubSchema = new mongoose.Schema({
  noteId: { type: String, required: true },
  title: { type: String },
  content: { type: String },
  date: { type: Date, default: Date.now }
}, { _id: true }); // 让每条笔记也保留一个 MongoDB 自带的 _id

const UserFirearmSchema = new mongoose.Schema({
  userId: String,
  firearmId: mongoose.Types.ObjectId,
  customName: String,
  purchaseDate: Date,
  purchasePrice: Number,
  accessories: Array,
  maintenanceRecords: Array,
  ammoRecords: Array,
  lastMaintenance: Date,
  maintenanceIntervalDays: Number,
  nextMaintenance: Date,
  notes: [NoteSubSchema] // ✅ 替换为新的结构
}, {
  collection: "User_Firearm"
});

const UserFirearm = userDb.model("UserFirearm", UserFirearmSchema);
module.exports = UserFirearm;