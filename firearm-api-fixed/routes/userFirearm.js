const express = require('express');
const router = express.Router();
const UserFirearm = require('../models/UserFirearm');
const { v4: uuidv4 } = require("uuid");

// 📌 获取所有用户枪支
router.get('/', async (req, res) => {
  try {
    const data = await UserFirearm.find();
    res.json({ total: data.length, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 获取提醒维护的用户枪支（提前 N 天）
router.get('/reminders', async (req, res) => {
  const { userId } = req.query;
  const leadDays = parseInt(req.query.days || '7');
  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const threshold = new Date(today);
    threshold.setDate(today.getDate() + leadDays);

    const records = await UserFirearm.find({
      userId,
      nextMaintenance: { $gte: today, $lte: threshold }
    });

    res.json({ total: records.length, data: records });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 获取单条用户枪支记录
router.get('/:id', async (req, res) => {
  try {
    const item = await UserFirearm.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 添加用户枪支记录（自动计算 nextMaintenance）
router.post('/', async (req, res) => {
  try {
    const body = req.body;
    if (body.lastMaintenance && body.maintenanceIntervalDays) {
      const next = new Date(body.lastMaintenance);
      next.setDate(next.getDate() + parseInt(body.maintenanceIntervalDays));
      body.nextMaintenance = next;
    }
    const newItem = new UserFirearm(body);
    const saved = await newItem.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 修改用户枪支记录
router.put('/:id', async (req, res) => {
  try {
    const updated = await UserFirearm.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 删除用户枪支记录
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await UserFirearm.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 添加 accessory / ammo / maintenance / notes
router.post('/:id/:arrayField', async (req, res) => {
  const { id, arrayField } = req.params;
  let record = req.body;

  const validFields = ['accessories', 'ammoRecords', 'maintenanceRecords', 'notes'];
  const idFields = {
    accessories: 'accessoryId',
    ammoRecords: 'ammoId',
    maintenanceRecords: 'maintenanceId',
    notes: 'noteId'
  };

  if (!validFields.includes(arrayField)) {
    return res.status(400).json({ error: 'Invalid array field' });
  }

  // 自动生成 ID（各类都需要）
  record[idFields[arrayField]] = uuidv4();

  // notes 需要补日期
  if (arrayField === 'notes' && !record.date) {
    record.date = new Date();
  }

  try {
    const updated = await UserFirearm.findByIdAndUpdate(
      id,
      { $push: { [arrayField]: record } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'User firearm not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 修改 accessory / ammo / maintenance / notes
router.patch('/:id/:arrayField/:recordId', async (req, res) => {
  const { id, arrayField, recordId } = req.params;
  const updates = req.body;

  const validFields = {
    accessories: 'accessoryId',
    ammoRecords: 'ammoId',
    maintenanceRecords: 'maintenanceId',
    notes: 'noteId'
  };

  const idField = validFields[arrayField];
  if (!idField) return res.status(400).json({ error: 'Invalid array field' });

  try {
    const result = await UserFirearm.findOneAndUpdate(
      { _id: id, [`${arrayField}.${idField}`]: recordId },
      {
        $set: Object.fromEntries(
          Object.entries(updates).map(([k, v]) => [`${arrayField}.$.${k}`, v])
        )
      },
      { new: true }
    );
    if (!result) return res.status(404).json({ error: 'Record not found' });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 删除 accessory / ammo / maintenance / notes
router.delete('/:id/:arrayField/:recordId', async (req, res) => {
  const { id, arrayField, recordId } = req.params;

  const validFields = {
    accessories: 'accessoryId',
    ammoRecords: 'ammoId',
    maintenanceRecords: 'maintenanceId',
    notes: 'noteId'
  };

  const idField = validFields[arrayField];
  if (!idField) return res.status(400).json({ error: 'Invalid array field' });

  try {
    const updated = await UserFirearm.findByIdAndUpdate(
      id,
      { $pull: { [arrayField]: { [idField]: recordId } } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Record not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 获取某支枪的所有笔记
router.get('/:id/notes', async (req, res) => {
  try {
    const firearm = await UserFirearm.findById(req.params.id);
    if (!firearm) return res.status(404).json({ error: 'Firearm not found' });

    res.json({
      count: firearm.notes.length,
      data: firearm.notes
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 添加单条笔记（包含 title、content、date）
router.post('/:id/notes', async (req, res) => {
  try {
    const { title, content, date } = req.body;

    const newNote = {
      noteId: uuidv4(),
      title: title || '',
      content: content || '',
      date: date ? new Date(date) : new Date()
    };

    const updated = await UserFirearm.findByIdAndUpdate(
      req.params.id,
      { $push: { notes: newNote } },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: 'Firearm not found' });

    res.status(201).json(newNote);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 清空某支枪的所有笔记
router.delete('/:id/notes', async (req, res) => {
  try {
    const updated = await UserFirearm.findByIdAndUpdate(
      req.params.id,
      { $set: { notes: [] } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Firearm not found' });

    res.json({ message: 'All notes cleared', firearmId: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 删除某条笔记（通过 noteId）
router.delete('/:id/notes/:noteId', async (req, res) => {
  try {
    const { id, noteId } = req.params;

    const updated = await UserFirearm.findByIdAndUpdate(
      id,
      { $pull: { notes: { noteId } } },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: 'Firearm not found or note not found' });

    res.json({ message: 'Note deleted', noteId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;