// routes/armory.js
const express = require("express");
const router = express.Router();
const UserFirearm = require("../models/UserFirearm");

// ✅ 获取某用户的一支枪的完整信息
router.get("/users/:uid/armory/:armoryId", async (req, res) => {
  const { uid, armoryId } = req.params;
  try {
    const firearm = await UserFirearm.findOne({ _id: armoryId, userId: uid });
    if (!firearm) {
      return res.status(404).json({ error: "User firearm not found" });
    }
    res.json(firearm);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 获取某支枪的所有配件信息
router.get("/armory/:armoryId/accessories", async (req, res) => {
    const { armoryId } = req.params;
    try {
      const firearm = await UserFirearm.findById(armoryId);
      if (!firearm) return res.status(404).json({ error: "Firearm not found" });
      res.json({ count: firearm.accessories.length, data: firearm.accessories });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });  

  // 📌 获取 maintenance 记录
router.get('/:id/maintenance', async (req, res) => {
    try {
      const firearm = await UserFirearm.findById(req.params.id);
      if (!firearm) return res.status(404).json({ error: 'User firearm not found' });
  
      res.json({ count: firearm.maintenanceRecords.length, data: firearm.maintenanceRecords });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });  

  // 📌 获取笔记信息
router.get("/armory/:armoryId/notes", async (req, res) => {
    const { armoryId } = req.params;
    try {
      const firearm = await UserFirearm.findById(armoryId);
      if (!firearm) return res.status(404).json({ error: "Firearm not found" });
      res.json({ count: firearm.notes.length, data: firearm.notes });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });  

module.exports = router;