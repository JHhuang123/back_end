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
  
  // 📌 GET /armory/:armoryId/videos?type=guide视频
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

  router.post("/users/:uid/armory", async (req, res) => {
    const { uid } = req.params;
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ error: "Missing productId" });
  
    try {
      const collections = [
        "AR Parts", "Ammo", "Cleanning Supplies", "Gear", "HOLSTERS_AND_HOLDERS",
        "HUNTING_GEAR", "Handguns", "KNIVES_AND_TOOLS", "MAGAZINES", "OPTICS",
        "Pistol", "RANGE_GEAR", "RIFLES", "SHOTGUNS", "SILENCERS", "SILENCER_ACCESSORIES"
      ];
  
      let foundItem = null;
      let sourceCollection = null;
      const mongoose = require("mongoose");
  
      for (const name of collections) {
        const schema = new mongoose.Schema({}, { strict: false });
        const Model = require('../utils/firearmsDb').model(name.replace(/ /g, "_"), schema, name);
        foundItem = await Model.findById(productId);
        if (foundItem) {
          sourceCollection = name;
          break;
        }
      }
  
      if (!foundItem) {
        return res.status(404).json({ error: "Firearm not found in any collection" });
      }
  
      const UserFirearm = require("../models/UserFirearm");
      const newEntry = new UserFirearm({
        userId: uid,
        firearmId: foundItem._id,
        customName: foundItem.name,
        purchaseDate: new Date(),
        purchasePrice: foundItem.price || 0,
        accessories: [],
        maintenanceRecords: [],
        ammoRecords: [],
        lastMaintenance: null,
        maintenanceIntervalDays: null,
        nextMaintenance: null,
        notes: []
      });
  
      const saved = await newEntry.save();
  
      res.status(201).json({ success: true, armoryItem: saved });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // 📌 删除某用户的一支枪
router.delete("/users/:uid/armory/:armoryId", async (req, res) => {
    const { uid, armoryId } = req.params;
    try {
      const deleted = await UserFirearm.findOneAndDelete({
        _id: armoryId,
        userId: uid
      });
  
      if (!deleted) {
        return res.status(404).json({ error: "User firearm not found" });
      }
  
      res.json({ message: "Firearm deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });  

  // 📌 编辑某用户的一支枪
router.put("/users/:uid/armory/:armoryId", async (req, res) => {
    const { uid, armoryId } = req.params;
    const updates = req.body;
  
    try {
      const updated = await UserFirearm.findOneAndUpdate(
        { _id: armoryId, userId: uid },
        updates,
        { new: true }
      );
  
      if (!updated) {
        return res.status(404).json({ error: "User firearm not found" });
      }
  
      res.json({ message: "Firearm updated", data: updated });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });  

  // ✅ 为某支枪新增一个配件
router.post("/:id/accessories", async (req, res) => {
    const { id } = req.params;
    const { accessoryId, customName, purchaseDate, purchasePrice } = req.body;
  
    if (!accessoryId || !customName || !purchaseDate || purchasePrice === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }
  
    const newAccessory = {
      accessoryId,
      customName,
      purchaseDate,
      purchasePrice
    };
  
    try {
      const updated = await UserFirearm.findByIdAndUpdate(
        id,
        { $push: { accessories: newAccessory } },
        { new: true }
      );
      if (!updated) return res.status(404).json({ error: "User firearm not found" });
  
      res.status(201).json({ message: "Accessory added", accessory: newAccessory });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });  

module.exports = router;