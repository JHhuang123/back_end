// routes/firearms.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const firearmsDb = require('../utils/firearmsDb');

// 获取某类枪支的所有记录
router.get('/:category', async (req, res) => {
  const { category } = req.params;
  try {
    const Model = firearmsDb.model(category, new mongoose.Schema({}, { strict: false }), category);
    const items = await Model.find();
    res.json({ total: items.length, data: items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 获取某类枪支中的某条记录详情
router.get('/:category/:id', async (req, res) => {
  const { category, id } = req.params;
  try {
    const Model = firearmsDb.model(category, new mongoose.Schema({}, { strict: false }), category);
    const item = await Model.findById(id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;