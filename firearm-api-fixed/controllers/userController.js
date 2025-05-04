const User = require("../models/User");
const path = require("path");

// 获取所有用户
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json({ total: users.length, data: users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 获取单个用户
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

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

// 删除用户
exports.deleteUser = async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "User not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 更新用户信息
exports.updateUser = async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: "User not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ 获取用户资料（兼容字段名，完整返回）
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.id });

    if (!user) return res.status(404).json({ message: "User not found." });

    res.json({
      userId: user.userId,
      username: user.userName || user.username || "",  // ← 自动兼容
      email: user.email || "",
      bio: user.bio || "",
      avatarUrl: user.avatarUrl || "",
      userLevel: user.userLevel || ""
    });
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
};

// 编辑用户资料（推荐版）
exports.updateUserProfile = async (req, res) => {
  try {
    const { username, email, bio } = req.body;

    const updatePayload = {};
    if (username !== undefined) updatePayload.userName = username;
    if (email !== undefined) updatePayload.email = email;
    if (bio !== undefined) updatePayload.bio = bio;

    const updatedUser = await User.findOneAndUpdate(
      { userId: req.params.id },
      updatePayload,
      { new: true, runValidators: true }
    );

    if (!updatedUser) return res.status(404).json({ message: "User not found." });

    res.json({
      userId: updatedUser.userId,
      username: updatedUser.userName || updatedUser.username || "",  // ← 修复这里
      email: updatedUser.email || "",
      bio: updatedUser.bio || "",
      avatarUrl: updatedUser.avatarUrl || ""
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to update user profile." });
  }
};

// 上传头像（本地上传）
exports.uploadAvatar = async (req, res) => {
  try {
    const filename = req.file.filename;
    const avatarUrl = `/uploads/avatars/${filename}`;

    const updated = await User.findOneAndUpdate(
      { userId: req.params.id },
      { avatarUrl },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({ avatarUrl });
  } catch (err) {
    res.status(500).json({ error: "Failed to upload avatar." });
  }
};

// 设置头像链接（外链）
exports.setAvatarUrl = async (req, res) => {
  const { avatarUrl } = req.body;

  if (!avatarUrl || typeof avatarUrl !== "string") {
    return res.status(400).json({ error: "avatarUrl is required and must be a string." });
  }

  try {
    const updatedUser = await User.findOneAndUpdate(
      { userId: req.params.id },
      { avatarUrl },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.json({
      avatarUrl: updatedUser.avatarUrl
    }); // ✅ 确保返回的 JSON 有内容
  } catch (err) {
    console.error("Error updating avatar URL:", err);
    res.status(500).json({ error: "Failed to update avatar URL." });
  }
};

// 获取偏好设置
exports.getUserSettings = async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.id }).select("settings");
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user.settings || {});
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve settings" });
  }
};

// 更新偏好设置
exports.updateUserSettings = async (req, res) => {
  const settings = req.body;

  try {
    const updated = await User.findOneAndUpdate(
      { userId: req.params.id },
      { settings },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ error: "User not found" });

    res.json(updated.settings);
  } catch (err) {
    res.status(500).json({ error: "Failed to update settings" });
  }
};