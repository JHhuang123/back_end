// controllers/userController.js
const User = require('../models/User');

// 创建用户
exports.createUser = async (req, res) => {
  try {
    const newUser = new User(req.body);
    const saved = await newUser.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 获取所有用户
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json({ total: users.length, data: users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 获取指定用户
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 删除指定用户
exports.deleteUser = async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ 更新用户信息（PUT）
exports.updateUser = async (req, res) => {
  try {
    const updatedUser = await req.userDatabase
      .model("User")
      .findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!updatedUser) return res.status(404).json({ error: "找不到该用户" });

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};