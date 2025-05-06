const mongoose = require("mongoose");
require("dotenv").config();

// —— 连接 Firearms 数据库 ——
const firearmsDb = mongoose.createConnection(
  process.env.MONGODB_URI_FIREARMS,
  { useNewUrlParser: true, useUnifiedTopology: true }
);

// —— 映射 & 系数 ——
const COLLECTION_MAP = {
  handgun: "Handguns",
  shotgun: "SHOTGUNS",
  rifle:   "RIFLES",
  sniper:  "RIFLES"
};
const TYPE_CALIBER_MAP = {
  handgun: ["9mm", ".40 S&W", ".45 ACP", ".380 ACP"],
  shotgun: ["12 GA", "20 GA", ".410"],
  rifle:   [".22", "5.56", "7.62"],
  sniper:  [".308", ".300 Win Mag", ".50 BMG"]
};
const CALIBER_VALUE_MAP = {
  "9mm": 9.00, ".40 S&W": 10.16, ".45 ACP": 11.43, ".380 ACP": 9.70,
  "12 GA": 18.53, "20 GA": 15.63, ".410": 10.40,
  ".22": 5.59, "5.56": 5.56, "7.62": 7.62,
  ".308": 7.82, ".300 Win Mag": 7.82, ".50 BMG": 12.70
};
const K_TYPE = { handgun: 0.02, shotgun: 0.025, rifle: 0.03, sniper: 0.03 };
const THRESHOLDS = {
  handgun: [300, 600],
  shotgun: [400, 800],
  rifle:   [600, 1200],
  sniper:  [600, 1200]
};
const BUDGET_MAP = {
  handgun: { "<=250": [0,250], "250-400": [250,400], "400-900": [400,900], "900-2000": [900,2000], ">2000": [2000,Infinity] },
  shotgun: { "<=150": [0,150], "150-300": [150,300], "300-800": [300,800], "800-1500": [800,1500], ">1500": [1500,Infinity] },
  rifle:   { "<=600": [0,600], "600-1200":[600,1200], "1200-2000":[1200,2000], ">2000":[2000,Infinity] },
  sniper:  { "<=2000":[0,2000], "2000-4000":[2000,4000], "4000-8000":[4000,8000], ">8000":[8000,Infinity] }
};

// —— 工具函数 ——
function parseSpec(val, unit) {
  if (!val) return NaN;
  const n = parseFloat(val);
  if (isNaN(n)) return NaN;
  if (unit === "oz")     return n * 0.0283495;  // oz -> kg
  if (unit === "inches") return n * 25.4;      // in -> mm
  return n;
}
function computeE(k, d, L) { return k * d * d * L; }
function computeRI(E, W)      { return E / W; }

exports.recommendGuns = async (req, res) => {
  try {
    const b = req.body;

    // 1) 如果已有武器，则可以这里直接返回空数组（或自行实现“相似商品”逻辑）
    if (b.haveWeapon === "yes" && b.productId) {
      return res.json({ recommendations: [] });
    }

    // 2) 验证类型
    const type = b.firearmType;
    if (!COLLECTION_MAP[type]) {
      return res.status(400).json({ error: "Invalid firearmType" });
    }

    // 3) 加载集合 & 全库查询
    const Model = firearmsDb.model(
      COLLECTION_MAP[type],
      new mongoose.Schema({}, { strict: false }),
      COLLECTION_MAP[type]
    );
    let items = await Model.find({}).lean();

    // 4) 州限制
    items = items.filter(i => {
      const rest = (i.restrictions || "").split(";").map(s => s.trim());
      return !rest.includes(b.state);
    });

    // 5) 品牌过滤
    if (b.brand && b.brand !== "No preference") {
      items = items.filter(i => i.make === b.brand);
    }

    // 6) 口径过滤
    items = items.filter(i => {
      const cal = (b.caliber || "").toLowerCase();
      const ok  = TYPE_CALIBER_MAP[type].map(o => o.toLowerCase());
      return ok.includes(cal)
          && String(i.specs?.Caliber || "").toLowerCase().includes(cal);
    });

    // 7) 预算过滤
    items = items.filter(i => {
      const price = parseFloat(i.price?.["$numberDouble"] || i.price || 0);
      const [min, max] = BUDGET_MAP[type][b.budget] || [0, Infinity];
      return price >= min && price <= max;
    });

    // 8) 计算后坐力指数 RI 并标记分级（仅用于展示，不再再过滤）
    items = items.map(i => {
      const d  = CALIBER_VALUE_MAP[b.caliber] || 0;
      const L  = parseSpec(i.specs["Barrel Length"], "inches");
      const W  = parseSpec(i.specs.Weight, "oz");
      const E  = computeE(K_TYPE[type], d, L);
      const RI = computeRI(E, W);
      const [lo, hi] = THRESHOLDS[type];
      const grade = RI < lo ? "A" : RI < hi ? "B" : "C";
      return { ...i, _RI: RI, _grade: grade };
    });

    // 9) 重量过滤
    items = items.filter(i => {
      const kg = parseSpec(i.specs.Weight, "oz");
      switch (b.weightReq) {
        case "ultra-light": return kg < 0.6;
        case "light":       return kg >= 0.6 && kg < 0.8;
        case "balanced":    return kg >= 0.8 && kg < 1.0;
        case "heavy":       return kg >= 1.0;
        default:            return true;
      }
    });

    // 10) 枪管长度过滤
    items = items.filter(i => {
      if (b.barrelLength === "No preference") return true;
      const want   = parseSpec(b.barrelLength, "inches");
      const actual = parseSpec(i.specs["Barrel Length"], "inches");
      return Math.abs(actual - want) <= 25;
    });

    // 11) 发射机制过滤
    if (b.actionType && b.actionType !== "No preference") {
      const a = b.actionType.toLowerCase();
      items = items.filter(i =>
        String(i.specs.Action || "").toLowerCase().includes(a)
      );
    }

    // 12) 按价格升序，取 Top 3
    items.sort((a, c) =>
      parseFloat(a.price?.["$numberDouble"] || a.price || 0)
      - parseFloat(c.price?.["$numberDouble"] || c.price || 0)
    );

    res.json({ recommendations: items.slice(0, 3) });
  } catch (err) {
    console.error("⚠️ recommendGuns error:", err);
    res.status(500).json({ error: err.message });
  }
};