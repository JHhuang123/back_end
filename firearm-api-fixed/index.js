// index.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ 连接 MongoDB 数据库（两套）
const firearmsDb = mongoose.createConnection(process.env.MONGODB_URI_FIREARMS, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userDatabaseDb = mongoose.createConnection(process.env.MONGODB_URI_USERDATABASE, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// ✅ 所有集合分类（Firearms & Users）
const firearmsCollections = [
  "AR Parts", "Ammo", "Cleanning Supplies", "Gear", "HOLSTERS_AND_HOLDERS",
  "HUNTING_GEAR", "Handguns", "KNIVES_AND_TOOLS", "MAGAZINES", "OPTICS",
  "Pistol", "RANGE_GEAR", "RIFLES", "SHOTGUNS", "SILENCERS", "SILENCER_ACCESSORIES"
];

const userDatabaseCollections = ["users"];

// ✅ 通用集合接口生成器
const createCollectionRoutes = (db, collectionName) => {
  const schema = new mongoose.Schema({}, { strict: false });
  const modelName = collectionName.replace(/ /g, "_");
  const Model = db.model(modelName, schema, collectionName);
  const routeBase = `/${modelName.toLowerCase()}`;

  app.get(routeBase, async (req, res) => {
    try {
      const page = parseInt(req.query.page);
      const limit = parseInt(req.query.limit);

      if (req.query.all === 'true') {
        const all = await Model.find({}).lean();
        return res.json({ total: all.length, data: all });
      }

      const actualPage = page || 1;
      const actualLimit = limit || 100;
      const skip = (actualPage - 1) * actualLimit;

      const items = await Model.find().skip(skip).limit(actualLimit);
      const total = await Model.countDocuments();

      res.json({
        page: actualPage,
        limit: actualLimit,
        total,
        totalPages: Math.ceil(total / actualLimit),
        data: items
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get(`${routeBase}/:id`, async (req, res) => {
    try {
      const item = await Model.findById(req.params.id);
      if (!item) return res.status(404).json({ error: "Not found" });
      res.json(item);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post(routeBase, async (req, res) => {
    try {
      const newItem = new Model(req.body);
      const saved = await newItem.save();
      res.status(201).json(saved);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put(`${routeBase}/:id`, async (req, res) => {
    try {
      const updated = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete(`${routeBase}/:id`, async (req, res) => {
    try {
      await Model.findByIdAndDelete(req.params.id);
      res.json({ message: "Deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
};

// ✅ 注册所有动态集合路由
firearmsCollections.forEach(name => createCollectionRoutes(firearmsDb, name));
userDatabaseCollections.forEach(name => createCollectionRoutes(userDatabaseDb, name));

// ✅ 单独 firearm-details 查询所属分类 & 图像
app.get("/firearm-details/:id", async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid ID format" });
  }
  const objectId = new mongoose.Types.ObjectId(id);
  for (const collectionName of firearmsCollections) {
    try {
      const modelName = collectionName.replace(/ /g, "_");
      const schema = new mongoose.Schema({}, { strict: false });
      const Model = firearmsDb.model(modelName, schema, collectionName);
      const item = await Model.findById(objectId);
      if (item) {
        return res.json({
          name: item.name || "Unknown",
          image: item.img || item.link || null,
          category: item.category || "N/A",
          make: item.make || "N/A",
          collection: collectionName
        });
      }
    } catch (err) {
      console.error(`Error in ${collectionName}:`, err.message);
    }
  }
  res.status(404).json({ error: "Firearm not found in any collection" });
});

// ✅ 加载 modular 路由
const userRoutes = require("./routes/users");
const userFirearmRoutes = require("./routes/userFirearm");
const firearmRoutes = require("./routes/firearms");
const armoryRoutes = require("./routes/armory");
const noteRoutes = require('./routes/note');

app.use("/api/users", userRoutes);
app.use("/api/user_firearm", userFirearmRoutes);
app.use("/api/firearms", firearmRoutes);
app.use('/api/armory', armoryRoutes);
app.use('/note', noteRoutes);
app.use("/uploads", express.static("uploads"));

// ✅ JSON 导出接口
app.get("/export/:collection", async (req, res) => {
  const name = req.params.collection;
  try {
    const schema = new mongoose.Schema({}, { strict: false });
    const modelName = name.replace(/ /g, "_");
    const Model = firearmsDb.model(modelName, schema, name);
    const data = await Model.find({}).lean();

    res.setHeader("Content-Disposition", `attachment; filename=${name}.json`);
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify(data, null, 2));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ 健康检查
app.get("/", (req, res) => {
  res.send("Firearm API is running ✅");
});

// ✅ 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 服务器运行中：http://localhost:${PORT}`);
});