const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    googleId: { type: String, unique: true },
    email: { type: String, unique: true },
    displayName: String,
    image: String,
    provider: { type: String, default: "google" },
    createdAt: { type: Date, default: Date.now },
}, { timestmaps: true }
);

module.exports = mongoose.model("User", userSchema);