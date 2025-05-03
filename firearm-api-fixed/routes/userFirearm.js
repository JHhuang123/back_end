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

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const threshold = new Date(today);
    threshold.setDate(today.getDate() + leadDays);

    const records = await UserFirearm.find({
      userId: userId,
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
    if (!item) return res.status(404).json({ error: "Not found" });
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

// 📌 添加 accessory / ammo / maintenance
router.post('/:id/:arrayField', async (req, res) => {
  const { id, arrayField } = req.params;
  const record = req.body;

  const validFields = ['accessories', 'ammoRecords', 'maintenanceRecords'];
  if (!validFields.includes(arrayField)) {
    return res.status(400).json({ error: 'Invalid array field' });
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

// 📌 修改 accessory / ammo / maintenance
router.patch('/:id/:arrayField/:recordId', async (req, res) => {
  const { id, arrayField, recordId } = req.params;
  const updates = req.body;

  const validFields = {
    accessories: 'accessoryId',
    ammoRecords: 'ammoId',
    maintenanceRecords: 'maintenanceId'
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

// 📌 删除 accessory / ammo / maintenance
router.delete('/:id/:arrayField/:recordId', async (req, res) => {
  const { id, arrayField, recordId } = req.params;

  const validFields = {
    accessories: 'accessoryId',
    ammoRecords: 'ammoId',
    maintenanceRecords: 'maintenanceId'
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


// 📌 📓 NOTE APIs: 增删改查
router.get('/:id/notes', async (req, res) => {
  try {
    const firearm = await UserFirearm.findById(req.params.id);
    if (!firearm) return res.status(404).json({ error: 'Not found' });
    res.json(firearm.notes || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/notes', async (req, res) => {
  try {
    const { note } = req.body;
    const newNote = {
      id: uuidv4(),
      date: new Date(),
      note
    };

    const updated = await UserFirearm.findByIdAndUpdate(
      req.params.id,
      { $push: { notes: newNote } },
      { new: true }
    );

    res.json(updated.notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/notes/:noteId', async (req, res) => {
  try {
    const { note } = req.body;
    const firearm = await UserFirearm.findById(req.params.id);
    if (!firearm) return res.status(404).json({ error: 'Not found' });

    const index = firearm.notes.findIndex(n => n.id === req.params.noteId);
    if (index === -1) return res.status(404).json({ error: 'Note not found' });

    firearm.notes[index].note = note;
    await firearm.save();

    res.json(firearm.notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id/notes/:noteId', async (req, res) => {
  try {
    const updated = await UserFirearm.findByIdAndUpdate(
      req.params.id,
      { $pull: { notes: { id: req.params.noteId } } },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated.notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;