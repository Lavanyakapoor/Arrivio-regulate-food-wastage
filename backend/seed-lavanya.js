// Seed script — demo data for lavanya ONLY
// Run: node seed-lavanya.js

require('dotenv').config();
const mongoose = require('mongoose');
const { User, Item, Donation } = require('./db');

const daysFromNow = (d) => {
  const dt = new Date();
  dt.setDate(dt.getDate() + d);
  dt.setHours(23, 59, 0, 0);
  return dt;
};

const daysAgo = (d) => {
  const dt = new Date();
  dt.setDate(dt.getDate() - d);
  dt.setHours(10, 0, 0, 0);
  return dt;
};

// Items spread across 8 weeks with realistic expiry dates
// createdAt = when it was added, expiryDate = when it expires
const ITEMS = [
  // ── 7–8 weeks ago ──
  { name: 'Basmati Rice',       category: 'grains',     qty: 2,   unit: 'kg',  purchase: daysAgo(54), expiry: daysFromNow(180), created: daysAgo(54) },
  { name: 'Olive Oil',          category: 'other',      qty: 500, unit: 'mL',  purchase: daysAgo(52), expiry: daysFromNow(270), created: daysAgo(52) },
  { name: 'Pasta',              category: 'grains',     qty: 500, unit: 'g',   purchase: daysAgo(50), expiry: daysFromNow(120), created: daysAgo(50) },

  // ── 5–6 weeks ago ──
  { name: 'Granola Bars',       category: 'snacks',     qty: 6,   unit: 'pcs', purchase: daysAgo(43), expiry: daysFromNow(45),  created: daysAgo(43) },
  { name: 'Frozen Peas',        category: 'frozen',     qty: 400, unit: 'g',   purchase: daysAgo(41), expiry: daysFromNow(90),  created: daysAgo(41) },
  { name: 'Oats',               category: 'grains',     qty: 1,   unit: 'kg',  purchase: daysAgo(40), expiry: daysFromNow(200), created: daysAgo(40) },
  { name: 'Dark Chocolate',     category: 'snacks',     qty: 100, unit: 'g',   purchase: daysAgo(38), expiry: daysFromNow(60),  created: daysAgo(38) },

  // ── 3–4 weeks ago ──
  { name: 'Cheddar Cheese',     category: 'dairy',      qty: 200, unit: 'g',   purchase: daysAgo(28), expiry: daysFromNow(14),  created: daysAgo(28) },
  { name: 'Butter',             category: 'dairy',      qty: 250, unit: 'g',   purchase: daysAgo(26), expiry: daysFromNow(30),  created: daysAgo(26) },
  { name: 'Orange Juice',       category: 'beverages',  qty: 1,   unit: 'L',   purchase: daysAgo(25), expiry: daysFromNow(3),   created: daysAgo(25) },
  { name: 'Eggs',               category: 'dairy',      qty: 12,  unit: 'pcs', purchase: daysAgo(24), expiry: daysFromNow(18),  created: daysAgo(24) },

  // ── 2 weeks ago ──
  { name: 'Greek Yogurt',       category: 'dairy',      qty: 400, unit: 'g',   purchase: daysAgo(14), expiry: daysFromNow(5),   created: daysAgo(14) },
  { name: 'Spinach',            category: 'produce',    qty: 200, unit: 'g',   purchase: daysAgo(13), expiry: daysFromNow(-2),  created: daysAgo(13) },
  { name: 'Carrots',            category: 'produce',    qty: 6,   unit: 'pcs', purchase: daysAgo(12), expiry: daysFromNow(6),   created: daysAgo(12) },
  { name: 'Whole Milk',         category: 'dairy',      qty: 2,   unit: 'L',   purchase: daysAgo(11), expiry: daysFromNow(2),   created: daysAgo(11) },
  { name: 'Sandwich Bread',     category: 'grains',     qty: 1,   unit: 'pcs', purchase: daysAgo(10), expiry: daysFromNow(2),   created: daysAgo(10) },

  // ── 1 week ago ──
  { name: 'Bananas',            category: 'produce',    qty: 6,   unit: 'pcs', purchase: daysAgo(7),  expiry: daysFromNow(1),   created: daysAgo(7) },
  { name: 'Apples',             category: 'produce',    qty: 5,   unit: 'pcs', purchase: daysAgo(6),  expiry: daysFromNow(10),  created: daysAgo(6) },
  { name: 'Paneer',             category: 'meat',       qty: 200, unit: 'g',   purchase: daysAgo(5),  expiry: daysFromNow(-1),  created: daysAgo(5) },
  { name: 'Tomatoes',           category: 'produce',    qty: 5,   unit: 'pcs', purchase: daysAgo(5),  expiry: daysFromNow(4),   created: daysAgo(5) },

  // ── This week ──
  { name: 'Mozzarella',         category: 'dairy',      qty: 125, unit: 'g',   purchase: daysAgo(3),  expiry: daysFromNow(7),   created: daysAgo(3) },
  { name: 'Blueberry Juice',    category: 'beverages',  qty: 500, unit: 'mL',  purchase: daysAgo(3),  expiry: daysFromNow(20),  created: daysAgo(3) },
  { name: 'Vitamin C Tablets',  category: 'medicine',   qty: 30,  unit: 'pcs', purchase: daysAgo(2),  expiry: daysFromNow(365), created: daysAgo(2) },
  { name: 'Frozen Pizza',       category: 'frozen',     qty: 1,   unit: 'pcs', purchase: daysAgo(1),  expiry: daysFromNow(60),  created: daysAgo(1) },
  { name: 'Sour Cream',         category: 'dairy',      qty: 200, unit: 'g',   purchase: daysAgo(1),  expiry: daysFromNow(3),   created: daysAgo(1) },
];

// Donations — spread over last few weeks for trend chart
const DONATIONS = [
  { name: 'Greek Yogurt',   category: 'dairy',    qty: 200, unit: 'g',   expiry: daysFromNow(5),  location: 'Chitkara Campus Gate 1',  created: daysAgo(35) },
  { name: 'Sandwich Bread', category: 'grains',   qty: 1,   unit: 'pcs', expiry: daysFromNow(1),  location: 'Sector 12 Community Box', created: daysAgo(22) },
  { name: 'Whole Milk',     category: 'dairy',    qty: 1,   unit: 'L',   expiry: daysFromNow(2),  location: 'Green Park Lobby',        created: daysAgo(15) },
  { name: 'Spinach',        category: 'produce',  qty: 150, unit: 'g',   expiry: daysFromNow(-2), location: 'Near Bus Stop 5',         created: daysAgo(8) },
  { name: 'Orange Juice',   category: 'beverages',qty: 500, unit: 'mL',  expiry: daysFromNow(3),  location: 'Chitkara Library Block',  created: daysAgo(4) },
  { name: 'Bananas',        category: 'produce',  qty: 4,   unit: 'pcs', expiry: daysFromNow(1),  location: 'Rajpura Community Centre',created: daysAgo(2) },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB connected');

  const user = await User.findOne({ username: 'lavanya' });
  if (!user) {
    console.error('❌ User lavanya not found. Create account first.');
    process.exit(1);
  }
  const userId = user._id;
  console.log(`👤 Seeding for: lavanya (${userId})`);

  // Clear existing items and donations for lavanya
  const deletedItems = await Item.deleteMany({ userId });
  const deletedDonations = await Donation.deleteMany({ donorId: userId });
  console.log(`🗑️  Cleared ${deletedItems.deletedCount} items, ${deletedDonations.deletedCount} donations`);

  // Insert items with custom createdAt
  for (const item of ITEMS) {
    const doc = new Item({
      name: item.name,
      category: item.category,
      quantity: item.qty,
      unit: item.unit,
      purchaseDate: item.purchase,
      expiryDate: item.expiry,
      userId,
      donated: false,
    });
    doc.createdAt = item.created;
    doc.updatedAt = item.created;
    await Item.collection.insertOne({
      ...doc.toObject(),
      createdAt: item.created,
      updatedAt: item.created,
    });
  }
  console.log(`📦 Inserted ${ITEMS.length} inventory items`);

  // Insert donations with custom createdAt
  for (const d of DONATIONS) {
    await Donation.collection.insertOne({
      itemId: null,
      donorId: userId,
      donorName: 'lavanya',
      itemName: d.name,
      category: d.category,
      expiryDate: d.expiry,
      quantity: d.qty,
      unit: d.unit,
      location: d.location,
      status: 'available',
      claimedBy: null,
      createdAt: d.created,
      updatedAt: d.created,
    });
  }
  console.log(`🤝 Inserted ${DONATIONS.length} donations`);

  // Summary
  const statusSummary = { fresh: 0, warning: 0, critical: 0, expired: 0 };
  const now = new Date();
  for (const item of ITEMS) {
    const days = Math.ceil((item.expiry - now) / (1000 * 60 * 60 * 24));
    if (days < 0) statusSummary.expired++;
    else if (days <= 3) statusSummary.critical++;
    else if (days <= 7) statusSummary.warning++;
    else statusSummary.fresh++;
  }
  console.log('\n📊 Inventory preview:');
  console.log(`   ✅ Fresh:    ${statusSummary.fresh} items`);
  console.log(`   ⚠️  Warning:  ${statusSummary.warning} items`);
  console.log(`   🔴 Critical: ${statusSummary.critical} items`);
  console.log(`   ❌ Expired:  ${statusSummary.expired} items`);
  console.log(`\n🌱 Donations: ${DONATIONS.length} items`);
  const totalDonatedKg = DONATIONS.reduce((s, d) => {
    const u = d.unit.toLowerCase();
    if (u === 'kg') return s + d.qty;
    if (u === 'g') return s + d.qty / 1000;
    if (u === 'l') return s + d.qty;
    if (u === 'ml') return s + d.qty / 1000;
    return s + d.qty * 0.2;
  }, 0);
  console.log(`🌍 Est. CO₂ saved: ${(totalDonatedKg * 2.5).toFixed(1)} kg`);
  console.log('\n✅ Done! Login with: lavanya / arrivio123');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
