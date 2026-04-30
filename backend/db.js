// db.js

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB connected successfully"))
    .catch((err) => console.error("❌ Error in MongoDB Connection:", err));

// --- User Schema ---
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
    },
}, { timestamps: true });

// --- Mongoose Middleware to Hash Password before saving ---
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// --- Method to compare entered password with hashed password ---
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

// --- Item Schema ---
const itemSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true, trim: true },
    purchaseDate: { type: Date, required: true },
    expiryDate: { type: Date, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    donated: { type: Boolean, default: false },
}, { timestamps: true });

const Item = mongoose.model('Item', itemSchema);

// --- Donation Schema ---
const donationSchema = new mongoose.Schema({
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', default: null },
    donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    donorName: { type: String, required: true },
    itemName: { type: String, required: true },
    category: { type: String, required: true },
    expiryDate: { type: Date, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    location: { type: String, default: '' },
    status: { type: String, enum: ['available', 'claimed'], default: 'available' },
    claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

const Donation = mongoose.model('Donation', donationSchema);

module.exports = { User, Item, Donation };
