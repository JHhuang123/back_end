// utils/userDb.js
const mongoose = require("mongoose");

const userDb = mongoose.createConnection(process.env.MONGODB_URI_USERDATABASE, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

userDb.on("connected", () => {
  console.log("✅ Connected to userDatabase");
});

userDb.on("error", (err) => {
  console.error("❌ userDatabase connection error:", err);
});

module.exports = userDb;