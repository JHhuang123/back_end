// utils/firearmsDb.js
const mongoose = require('mongoose');

const firearmsDb = mongoose.createConnection(process.env.MONGODB_URI_FIREARMS, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

firearmsDb.on('connected', () => {
  console.log('✅ Connected to Firearms database');
});

firearmsDb.on('error', (err) => {
  console.error('❌ Firearms DB connection error:', err);
});

module.exports = firearmsDb;