// server.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { User, Item, Donation } = require('./db');
const app = express();

// --- Middleware ---
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000'],
    credentials: true
}));

// --- JWT Middleware ---
function authenticateToken(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).send("Access denied. No token provided.");
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { id, username }
        next();
    } catch (err) {
        return res.status(403).send("Invalid or expired token.");
    }
}

// --- AUTH ROUTES ---

// POST /signup
app.post("/signup", async (req, res) => {
    try {
        const { email, password, username } = req.body;

        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(409).send("User with this email or username already exists");
        }

        const newUser = new User({ email, password, username });
        await newUser.save();

        res.status(201).send("User created successfully");
    } catch (error) {
        res.status(500).send("Server error during signup");
    }
});

// POST /login
app.post("/login", async (req, res) => {
    try {
        const { password, username } = req.body;
        const user = await User.findOne({ username });

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).send("Invalid username or password");
        }

        const tokenPayload = { id: user._id, username: user.username };
        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '1d' });

        res
            .cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Strict',
                maxAge: 24 * 60 * 60 * 1000
            })
            .status(200)
            .json({ message: "Login successful", username: user.username });
    } catch (error) {
        res.status(500).send("Server error during login");
    }
});

// POST /logout
app.post("/logout", (req, res) => {
    res.clearCookie("token").status(200).json({ message: "Logged out" });
});

// --- INVENTORY ROUTES ---

// GET /items - fetch logged-in user's inventory
app.get("/items", authenticateToken, async (req, res) => {
    try {
        const items = await Item.find({ userId: req.user.id }).sort({ expiryDate: 1 });
        res.status(200).json(items);
    } catch (error) {
        res.status(500).send("Server error fetching items");
    }
});

// POST /items - add item
app.post("/items", authenticateToken, async (req, res) => {
    try {
        const { name, category, quantity, unit, purchaseDate, expiryDate } = req.body;
        if (!name || !category || quantity === undefined || !unit || !purchaseDate || !expiryDate) {
            return res.status(400).send("All fields are required");
        }

        const newItem = new Item({
            name,
            category,
            quantity,
            unit,
            purchaseDate,
            expiryDate,
            userId: req.user.id,
        });
        const saved = await newItem.save();
        res.status(201).json(saved);
    } catch (error) {
        res.status(500).send("Server error adding item");
    }
});

// PUT /items/:id - update item
app.put("/items/:id", authenticateToken, async (req, res) => {
    try {
        const item = await Item.findOne({ _id: req.params.id, userId: req.user.id });
        if (!item) return res.status(404).send("Item not found");

        const { name, category, quantity, unit, purchaseDate, expiryDate, donated } = req.body;
        if (name !== undefined) item.name = name;
        if (category !== undefined) item.category = category;
        if (quantity !== undefined) item.quantity = quantity;
        if (unit !== undefined) item.unit = unit;
        if (purchaseDate !== undefined) item.purchaseDate = purchaseDate;
        if (expiryDate !== undefined) item.expiryDate = expiryDate;
        if (donated !== undefined) item.donated = donated;

        const updated = await item.save();
        res.status(200).json(updated);
    } catch (error) {
        res.status(500).send("Server error updating item");
    }
});

// DELETE /items/:id - delete item
app.delete("/items/:id", authenticateToken, async (req, res) => {
    try {
        const item = await Item.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!item) return res.status(404).send("Item not found");
        res.status(200).json({ message: "Item deleted" });
    } catch (error) {
        res.status(500).send("Server error deleting item");
    }
});

// --- DONATION ROUTES ---

// GET /donations - fetch all available community donations
app.get("/donations", authenticateToken, async (req, res) => {
    try {
        const donations = await Donation.find({ status: 'available' }).sort({ expiryDate: 1 });
        res.status(200).json(donations);
    } catch (error) {
        res.status(500).send("Server error fetching donations");
    }
});

// POST /donations - list an item for donation
app.post("/donations", authenticateToken, async (req, res) => {
    try {
        const { itemId, itemName, category, expiryDate, quantity, unit, location } = req.body;
        if (!itemId || !itemName || !category || !expiryDate || !quantity || !unit) {
            return res.status(400).send("Missing required fields");
        }

        // Mark the item as donated
        await Item.findOneAndUpdate(
            { _id: itemId, userId: req.user.id },
            { donated: true }
        );

        const donation = new Donation({
            itemId,
            donorId: req.user.id,
            donorName: req.user.username,
            itemName,
            category,
            expiryDate,
            quantity,
            unit,
            location: location || '',
        });
        const saved = await donation.save();
        res.status(201).json(saved);
    } catch (error) {
        res.status(500).send("Server error listing donation");
    }
});

// PUT /donations/:id/claim - claim a donation
app.put("/donations/:id/claim", authenticateToken, async (req, res) => {
    try {
        const donation = await Donation.findOne({ _id: req.params.id, status: 'available' });
        if (!donation) return res.status(404).send("Donation not found or already claimed");

        donation.status = 'claimed';
        donation.claimedBy = req.user.id;
        const updated = await donation.save();
        res.status(200).json(updated);
    } catch (error) {
        res.status(500).send("Server error claiming donation");
    }
});

// --- ANALYTICS ROUTE ---

// GET /analytics - return full analytics data for logged-in user
app.get("/analytics", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const items = await Item.find({ userId });
        const userDonations = await Donation.find({ donorId: userId });

        // --- Status Breakdown ---
        const now = new Date();
        const getDays = (expiryDate) => {
            const expiry = new Date(expiryDate);
            const diffMs = expiry.setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0);
            return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        };
        const statusBreakdown = { fresh: 0, warning: 0, critical: 0, expired: 0 };
        items.forEach(item => {
            const days = getDays(item.expiryDate);
            if (days < 0) statusBreakdown.expired++;
            else if (days <= 3) statusBreakdown.critical++;
            else if (days <= 7) statusBreakdown.warning++;
            else statusBreakdown.fresh++;
        });

        // --- Category Breakdown ---
        const catMap = {};
        items.forEach(item => {
            const cat = (item.category || 'other').toLowerCase();
            catMap[cat] = (catMap[cat] || 0) + 1;
        });
        const categoryBreakdown = Object.entries(catMap)
            .map(([category, count]) => ({ category, count }))
            .sort((a, b) => b.count - a.count);

        // --- Weekly Trend (last 8 weeks) ---
        const weeks = [];
        for (let i = 7; i >= 0; i--) {
            const weekStart = new Date();
            weekStart.setDate(weekStart.getDate() - i * 7);
            weekStart.setHours(0, 0, 0, 0);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 7);

            const added = items.filter(item => {
                const created = new Date(item.createdAt);
                return created >= weekStart && created < weekEnd;
            }).length;

            const donated = userDonations.filter(d => {
                const created = new Date(d.createdAt);
                return created >= weekStart && created < weekEnd;
            }).length;

            const expired = items.filter(item => {
                const expiry = new Date(item.expiryDate);
                return expiry >= weekStart && expiry < weekEnd && getDays(item.expiryDate) < 0;
            }).length;

            const label = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            weeks.push({ week: label, added, donated, expired });
        }

        // --- Carbon Footprint ---
        const estimateKg = (qty, unit) => {
            const u = (unit || '').toLowerCase();
            if (u === 'kg') return qty;
            if (u === 'g') return qty / 1000;
            if (u === 'l') return qty;
            if (u === 'ml') return qty / 1000;
            if (u === 'pcs') return qty * 0.2;
            return qty * 0.2;
        };

        let donatedKg = 0;
        userDonations.forEach(d => { donatedKg += estimateKg(d.quantity, d.unit); });

        const co2Saved = donatedKg * 2.5; // 2.5 kg CO2 per kg food waste prevented (EPA 2023)
        const carKmAvoided = Math.round(co2Saved / 0.21); // avg car emits 0.21 kg CO2/km
        const treesEquivalent = Math.round(co2Saved / 21); // avg tree absorbs ~21kg CO2/year
        const mealsEquivalent = Math.round(donatedKg / 0.5); // avg meal ~500g

        res.json({
            statusBreakdown,
            categoryBreakdown,
            weeklyTrend: weeks,
            carbonFootprint: {
                donatedItems: userDonations.length,
                donatedKg: Math.round(donatedKg * 10) / 10,
                co2Saved: Math.round(co2Saved * 10) / 10,
                carKmAvoided,
                treesEquivalent,
                mealsEquivalent,
            },
            totalItems: items.length,
            totalDonated: userDonations.length,
            totalExpired: statusBreakdown.expired,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error fetching analytics");
    }
});

// --- SEED DEMO DONATIONS ---
// POST /seed-demo  — creates sample community donations for demo purposes
app.post("/seed-demo", authenticateToken, async (req, res) => {
    try {
        const username = req.user.username;
        const now = new Date();
        const addDays = (d) => { const dt = new Date(now); dt.setDate(dt.getDate() + d); return dt; };

        const seeds = [
            { donorName: 'anita_k',   itemName: 'Whole Milk',       category: 'dairy',     expiryDate: addDays(2),  quantity: 2,   unit: 'L',   location: 'Sector 12 Community Centre' },
            { donorName: 'raj_m',     itemName: 'Sandwich Bread',   category: 'grains',    expiryDate: addDays(1),  quantity: 3,   unit: 'pcs', location: 'Green Park Apartment Lobby' },
            { donorName: 'priya_s',   itemName: 'Greek Yogurt',     category: 'dairy',     expiryDate: addDays(3),  quantity: 4,   unit: 'g',   location: 'Sunrise Towers Gate 2' },
            { donorName: 'vikram_d',  itemName: 'Bananas',          category: 'produce',   expiryDate: addDays(2),  quantity: 8,   unit: 'pcs', location: 'Near Bus Stop 5' },
            { donorName: 'meera_t',   itemName: 'Orange Juice',     category: 'beverages', expiryDate: addDays(5),  quantity: 1,   unit: 'L',   location: 'Palm Grove Society' },
            { donorName: 'suresh_b',  itemName: 'Eggs',             category: 'dairy',     expiryDate: addDays(7),  quantity: 6,   unit: 'pcs', location: 'MG Road Market' },
            { donorName: 'lakshmi_p', itemName: 'Carrots',          category: 'produce',   expiryDate: addDays(4),  quantity: 5,   unit: 'pcs', location: 'Ashok Nagar Park Gate' },
            { donorName: 'arjun_r',   itemName: 'Granola Bars',     category: 'snacks',    expiryDate: addDays(12), quantity: 4,   unit: 'pcs', location: 'Tech Park Canteen' },
            { donorName: 'divya_n',   itemName: 'Spinach',          category: 'produce',   expiryDate: addDays(1),  quantity: 150, unit: 'g',   location: 'Rainbow Residency' },
            { donorName: 'kiran_g',   itemName: 'Cheddar Cheese',   category: 'dairy',     expiryDate: addDays(6),  quantity: 200, unit: 'g',   location: 'City Mall Basement' },
            { donorName: 'nisha_v',   itemName: 'Pasta',            category: 'grains',    expiryDate: addDays(60), quantity: 500, unit: 'g',   location: 'Block C Canteen' },
            { donorName: 'rohit_c',   itemName: 'Mixed Nuts',       category: 'snacks',    expiryDate: addDays(30), quantity: 200, unit: 'g',   location: 'Fitness Zone Reception' },
        ];

        // Remove existing demo donations first (to allow re-seeding)
        await Donation.deleteMany({ donorId: { $exists: false } });

        const docs = seeds.map(s => ({
            ...s,
            donorId: req.user.id,
            status: 'available',
        }));
        await Donation.insertMany(docs);
        res.status(201).json({ message: `${docs.length} demo donations created` });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error seeding demo data");
    }
});

// --- Start Server ---
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`🚀 Server listening on port ${PORT}`);
});
