// controllers/userController.js
const User = require("../models/User");
const path = require("path");

// --- 用户管理 ---
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json({ total: users.length, data: users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const newUser = new User(req.body);
    const saved = await newUser.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "User not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: "User not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- 用户资料 ---
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.id });
    if (!user) return res.status(404).json({ message: "User not found." });

    res.json({
      userId: user.userId,
      username: user.userName || user.username || "",
      email: user.email || "",
      bio: user.bio || "",
      avatarUrl: user.avatarUrl || "",
      userLevel: user.userLevel || ""
    });
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
};

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
      username: updatedUser.userName || updatedUser.username || "",
      email: updatedUser.email || "",
      bio: updatedUser.bio || "",
      avatarUrl: updatedUser.avatarUrl || ""
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to update user profile." });
  }
};

// --- 头像上传 ---
exports.uploadAvatar = async (req, res) => {
  try {
    const filename = req.file.filename;
    const avatarUrl = `/uploads/avatars/${filename}`;
    const updated = await User.findOneAndUpdate(
      { userId: req.params.id },
      { avatarUrl },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "User not found." });

    res.json({ avatarUrl });
  } catch (err) {
    res.status(500).json({ error: "Failed to upload avatar." });
  }
};

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
    if (!updatedUser) return res.status(404).json({ message: "User not found." });
    res.json({ avatarUrl: updatedUser.avatarUrl });
  } catch (err) {
    res.status(500).json({ error: "Failed to update avatar URL." });
  }
};

// --- 偏好设置 ---
exports.getUserSettings = async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.id }).select("settings");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user.settings || {});
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve settings" });
  }
};

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

// --- 收藏 ---
exports.getFavorites = async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.id });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ favorites: user.favorites || [] });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch favorites" });
  }
};

exports.addFavorite = async (req, res) => {
  const userId = req.params.id;
  const { type, targetId, title } = req.body;

  if (!type || !targetId) {
    return res.status(400).json({ error: "type and targetId are required." });
  }

  try {
    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ error: "User not found." });

    const alreadyExists = user.favorites.some(
      fav => fav.type === type && fav.targetId === targetId
    );

    if (!alreadyExists) {
      user.favorites.push({ type, targetId, title });
      await user.save();
    }

    res.json({ favorites: user.favorites });
  } catch (err) {
    res.status(500).json({ error: "Failed to add favorite.", details: err.message });
  }
};

exports.removeFavorite = async (req, res) => {
  const { id: userId, itemId } = req.params;

  try {
    const user = await User.findOneAndUpdate(
      { userId },
      { $pull: { favorites: { _id: itemId } } },
      { new: true }
    );

    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ favorites: user.favorites });
  } catch (err) {
    res.status(500).json({ error: "Failed to remove favorite", details: err.message });
  }
};

// --- 收藏夹逻辑（使用数组） ---
exports.createFavoriteFolder = async (req, res) => {
  const userId = req.params.id;
  const { name } = req.body;

  if (!name) return res.status(400).json({ error: "Folder name is required." });

  try {
    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ error: "User not found." });

    const exists = user.favoriteFolders.find(f => f.name === name);
    if (exists) {
      return res.status(400).json({ error: "Folder already exists." });
    }

    user.favoriteFolders.push({ name, items: [] });
    await user.save();

    res.status(201).json({ message: "Folder created.", favoriteFolders: user.favoriteFolders });
  } catch (err) {
    res.status(500).json({ error: "Failed to create folder.", details: err.message });
  }
};

exports.getAllFolders = async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.id });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ favoriteFolders: user.favoriteFolders || [] });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch folders", details: err.message });
  }
};

exports.addItemToFavoriteFolder = async (req, res) => {
  const userId = req.params.id;
  const folderName = req.params.folderName;
  const { type, targetId, title } = req.body;

  if (!type || !targetId) {
    return res.status(400).json({ error: "type and targetId are required." });
  }

  try {
    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ error: "User not found." });

    const folder = user.favoriteFolders.find(f => f.name === folderName);
    if (!folder) return res.status(404).json({ error: "Folder not found." });

    folder.items.push({ type, targetId, title });
    await user.save();

    res.json({ message: "Item added.", items: folder.items });
  } catch (err) {
    res.status(500).json({ error: "Failed to add item.", details: err.message });
  }
};

exports.removeItemFromFavoriteFolder = async (req, res) => {
  const { id: userId, folderName, itemId } = req.params;
  try {
    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ error: "User not found" });

    const folder = user.favoriteFolders.find(f => f.name === folderName);
    if (!folder) return res.status(404).json({ error: "Folder not found" });

    folder.items = folder.items.filter(i => i._id.toString() !== itemId);
    await user.save();

    res.json({ message: "Item removed.", items: folder.items });
  } catch (err) {
    res.status(500).json({ error: "Failed to remove item", details: err.message });
  }
};

exports.deleteFavoriteFolder = async (req, res) => {
  const { id: userId, folderName } = req.params;
  try {
    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ error: "User not found" });

    user.favoriteFolders = user.favoriteFolders.filter(f => f.name !== folderName);
    await user.save();

    res.json({ message: "Folder deleted.", favoriteFolders: user.favoriteFolders });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete folder", details: err.message });
  }
};