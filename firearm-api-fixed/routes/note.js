// routes/note.js
const express = require('express');
const router = express.Router();
const UserFirearm = require('../models/UserFirearm');

// 展示某支枪的所有笔记页面
router.get('/:id/notes', async (req, res) => {
  try {
    const firearm = await UserFirearm.findById(req.params.id);
    if (!firearm) return res.status(404).send("Firearm not found");

    res.render('notes', {
      title: firearm.customName || 'Firearm Notes',
      firearmId: req.params.id,
      notes: firearm.notes || []
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;