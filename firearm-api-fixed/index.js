require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ 数据库连接（Firearms 和 用户数据库）
const firearmsDb = mongoose.createConnection(process.env.MONGODB_URI_FIREARMS, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const userDatabaseDb = mongoose.createConnection(process.env.MONGODB_URI_USERDATABASE, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// ✅ 所有 Firearms 分类集合名
const firearmsCollections = [
  "AR Parts", "Ammo", "Cleanning Supplies", "Gear", "HOLSTERS_AND_HOLDERS",
  "HUNTING_GEAR", "Handguns", "KNIVES_AND_TOOLS", "MAGAZINES", "OPTICS",
  "Pistol", "RANGE_GEAR", "RIFLES", "SHOTGUNS", "SILENCERS", "SILENCER_ACCESSORIES"
];

// ✅ 为所有 Firearms 集合动态生成 RESTful 路由
firearmsCollections.forEach((collectionName) => {
  const schema = new mongoose.Schema({}, { strict: false });
  const modelName = collectionName.replace(/ /g, "_");
  const Model = firearmsDb.model(modelName, schema, collectionName);
  const routeBase = `/api/firearms/${modelName.toLowerCase()}`;

  app.get(routeBase, async (req, res) => {
    try {
      const data = await Model.find();
      res.json({ total: data.length, data });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
});

// ✅ 注入 userDatabase 到所有请求中，供 controller 调用
app.use((req, res, next) => {
  req.userDatabase = userDatabaseDb;
  next();
});

// ✅ 路由挂载（对应 /routes 下文件）
const userRoutes = require("./routes/users");
const firearmRoutes = require("./routes/userFirearm");
const noteRoutes = require("./routes/notes");
const notificationRoutes = require("./routes/notifications");
const searchRoutes = require("./routes/search");
const questionnaireRoutes = require("./routes/questionnaire");

app.use("/api/users", userRoutes);
app.use("/api/user_firearm", firearmRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/questionnaire", questionnaireRoutes);

// ✅ 健康检查接口
app.get("/", (req, res) => {
  res.send("✅ Firearm API Server is Running");
});

// ✅ 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});