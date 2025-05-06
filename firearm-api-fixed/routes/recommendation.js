const express = require('express');
const router = express.Router();
const { recommendGuns } = require('../controllers/recommendationController');

router.post('/', (req, res, next) => {
  console.log('🏓 [ROUTE] POST /recommendation', req.body);
  next();
}, recommendGuns);

module.exports = router;