const UserFirearm = require('../models/UserFirearm');
const mongoose = require('mongoose');

// 获取所有用户的枪支（可分页）
exports.getAll = async (req, res) => {
  try {
    const userId = req.query.userId;
    const query = userId ? { userId } : {};
    const data = await UserFirearm.find(query);
    res.json({ count: data.length, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 获取指定枪支
exports.getById = async (req, res) => {
  try {
    const item = await UserFirearm.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 添加用户枪支
exports.create = async (req, res) => {
  try {
    const { userId, firearmId } = req.body;
    if (!userId || !firearmId) {
      return res.status(400).json({ error: "Missing userId or firearmId" });
    }

    const newItem = await UserFirearm.create({
      ...req.body,
      firearmId: new mongoose.Types.ObjectId(firearmId),
      purchaseDate: req.body.purchaseDate ? new Date(req.body.purchaseDate) : new Date(),
      lastMaintenance: new Date(),
      nextMaintenance: new Date(Date.now() + 180 * 86400000),
      maintenanceIntervalDays: 180,
      accessories: [],
      maintenanceRecords: [],
      ammoRecords: [],
    });

    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 修改用户枪支
exports.update = async (req, res) => {
  try {
    const updated = await UserFirearm.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 删除用户枪支
exports.delete = async (req, res) => {
  try {
    const deleted = await UserFirearm.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};