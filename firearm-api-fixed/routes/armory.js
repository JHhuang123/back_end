// routes/armory.js
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const UserFirearm = require("../models/UserFirearm");
const firearmsDb = require('../utils/firearmsDb');

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

  const collections = [
    "AR Parts", "Ammo", "Cleanning Supplies", "Gear", "HOLSTERS_AND_HOLDERS",
    "HUNTING_GEAR", "Handguns", "KNIVES_AND_TOOLS", "MAGAZINES", "OPTICS",
    "Pistol", "RANGE_GEAR", "RIFLES", "SHOTGUNS", "SILENCERS", "SILENCER_ACCESSORIES"
  ];
  
  // 📌 GET /armory/:armoryId/videos?type=guide
  router.get('/:armoryId/videos', async (req, res) => {
    const { armoryId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(armoryId)) {
      return res.status(400).json({ error: "Invalid firearm ID" });
    }
  
    const objectId = new mongoose.Types.ObjectId(armoryId);
  
    for (const collectionName of collections) {
      try {
        const schema = new mongoose.Schema({}, { strict: false });
        const modelName = collectionName.replace(/ /g, "_");
        const Model = firearmsDb.model(modelName, schema, collectionName);
        const item = await Model.findById(objectId);
        if (item && item.video_list && item.video_list.length > 0) {
          return res.json({
            total: item.video_list.length,
            videos: item.video_list.map(v => ({
              title: v.title,
              link: v.link,
              providerVideoId: v.providerVideoId
            }))
          });
        }
      } catch (err) {
        console.error(`Error searching in ${collectionName}:`, err.message);
      }
    }
  
    return res.status(404).json({ error: "Firearm or videos not found" });
  });  

module.exports = router;