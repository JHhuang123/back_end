const mongoose = require('mongoose');
require('dotenv').config();

// 连接 Firearms 数据库
const firearmsDb = mongoose.createConnection(
  process.env.MONGODB_URI_FIREARMS,
  { useNewUrlParser:true, useUnifiedTopology:true }
);

const COLLECTION_MAP = {
  handgun:'Handguns',
  shotgun:'SHOTGUNS',
  rifle:'RIFLES',
  sniper:'RIFLES'
};

const TYPE_CALIBER_MAP = {
  handgun:['9mm','.40 s&w','.45 acp','.380 acp'],
  rifle:['.22','5.56','7.62'],
  shotgun:['12 ga','20 ga','.410'],
  sniper:['.308','.300 win mag','.50 bmg']
};

// 统一预算区间
const BUDGET_BRACKETS = {
  '<=250':[0,250], '250-400':[250,400],
  '400-900':[400,900], '900-2000':[900,2000],
  '>2000':[2000,Infinity]
};

// 重量阈值 (kg) per type
const WEIGHT_MAP = {
  handgun:  { 'ultra-light': 0.6, light: 0.8, balanced: 1.0, heavy: Infinity },
  shotgun:  { 'ultra-light': 2.5, light: 3.0, balanced: 4.0, heavy: Infinity },
  rifle:    { 'ultra-light': 3.0, light: 4.0, balanced: 5.0, heavy: Infinity },
  sniper:   { 'ultra-light': 3.0, light: 4.0, balanced: 5.0, heavy: Infinity }
};

// 枪管长度区间 (inches) per type
const BARREL_MAP = {
  handgun:{'<3':[0,3],'3-4':[3,4],'4-5':[4,5],'>5':[5,Infinity]},
  shotgun:{'<18':[0,18],'18-24':[18,24],'24-28':[24,28],'>28':[28,Infinity]},
  rifle:  {'<16':[0,16],'16-20':[16,20],'20-24':[20,24],'>24':[24,Infinity]},
  sniper: {'<20':[0,20],'20-24':[20,24],'24-28':[24,28],'>28':[28,Infinity]}
};

function parseSpec(val, unit){
  if(!val) return NaN;
  const n = parseFloat(val);
  if(isNaN(n)) return NaN;
  if(unit==='oz')     return n*0.0283495;
  if(unit==='inches') return n*25.4;
  return n;
}

exports.recommendGuns = async (req, res) => {
  try {
    const b = req.body;
    if(b.haveWeapon==='yes' && b.productId){
      return res.json({ recommendations: [] });
    }

    const type = b.firearmType;
    const coll = COLLECTION_MAP[type];
    if(!coll) return res.status(400).json({ error:'Invalid firearmType' });

    const Model = firearmsDb.model(coll, new mongoose.Schema({}, {strict:false}), coll);
    let items = await Model.find({}).lean();

    // 价格初筛
    items = items.filter(i=>{
      const raw = i.price?.$numberDouble ?? i.price;
      const f = parseFloat(raw);
      return raw!=null && !isNaN(f) && f>0;
    });

    // 州限制
    items = items.filter(i=>{
      const bans = (i.restrictions||'').split(';').map(s=>s.trim());
      return !bans.includes(b.state);
    });

    // 口径过滤
    items = items.filter(i=>{
      const reqCal = (b.caliber||'').toLowerCase();
      return TYPE_CALIBER_MAP[type].includes(reqCal)
         && (i.specs?.Caliber||'').toLowerCase().includes(reqCal);
    });

    // 预算过滤
    items = items.filter(i=>{
      const p = parseFloat(i.price.$numberDouble ?? i.price);
      const [min,max] = BUDGET_BRACKETS[b.budget]||[0,Infinity];
      return p>=min && p<=max;
    });

    // 重量过滤
    items = items.filter(i=>{
      const kg = parseSpec(i.specs.Weight,'oz');
      const wmap = WEIGHT_MAP[type];
      const req = b.weightReq;
      if(!req||req==='No preference') return true;
      return req==='heavy'
        ? kg>=wmap.balanced
        : kg< wmap[req];
    });

    // 枪管长度过滤
    if(b.barrelLength && b.barrelLength!=='No preference'){
      const [minI,maxI] = BARREL_MAP[type][b.barrelLength];
      items = items.filter(i=>{
        const inInches = parseSpec(i.specs['Barrel Length'],'inches')/25.4;
        return inInches>=minI && inInches<=maxI;
      });
    }

    // 排序 & Top3
    items.sort((a,z)=>
      parseFloat(a.price.$numberDouble ?? a.price)
      -parseFloat(z.price.$numberDouble ?? z.price)
    );
    res.json({ recommendations: items.slice(0,5) });

  } catch(err){
    console.error(err);
    res.status(500).json({ error:err.message });
  }
};