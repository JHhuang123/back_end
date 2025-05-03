// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: String,
  email: String,
  passwordHash: String,
  registeredAt: Date,
  lastLogin: Date,
  isVerified: Boolean,
  userLevel: String,
  avatarUrl: String,
  follow: [String],
  collection: [
    {
      firearmId: mongoose.Schema.Types.ObjectId,
      customName: String,
      purchaseDate: Date,
      purchasePrice: Number,
      accessories: [String]
    }
  ],
  notifications: [
    {
      firearmId: mongoose.Schema.Types.ObjectId,
      creationDate: String,
      intervalDays: Number,
      lastNotificationSent: String
    }
  ],
  location: {
    latitude: Number,
    longitude: Number,
    city: String,
    region: String,
    country: String,
    postalCode: String
  },
  newsPreference: [
    {
      newsId: String,
      timestamp: String
    }
  ],
  maintenance: [
    {
      firearmId: mongoose.Schema.Types.ObjectId,
      lastMaintained: String,
      nextMaintenance: String
    }
  ],
  notes: [
    {
      firearmId: mongoose.Schema.Types.ObjectId,
      noteText: String,
      createdAt: String
    }
  ],
  favorites: [
    {
      type: String, // "article" or "firearmInfo"
      targetId: mongoose.Schema.Types.ObjectId,
      title: String,
      timestamp: String
    }
  ]
}, { strict: false });

module.exports = mongoose.model('User', UserSchema, 'users');