const mongoose = require("mongoose");
const userDb = require("../utils/userDb");

const UserFirearmSchema = new mongoose.Schema({
  userId: String,
  firearmId: mongoose.Types.ObjectId,
  customName: String,
  purchaseDate: Date,
  purchasePrice: Number,
  accessories: Array,
  maintenanceRecords: Array,
  ammoRecords: Array,
  lastMaintenance: Date,
  maintenanceIntervalDays: Number,
  nextMaintenance: Date,
  notes: [
    {
      id: String,
      date: Date,
      note: String
    }
  ]
}, {
  collection: "User_Firearm"
});

const UserFirearm = userDb.model("UserFirearm", UserFirearmSchema);
module.exports = UserFirearm;