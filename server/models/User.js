const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    flatNo: String,
    consumerId: { type: String, unique: true },
    email: String,
    phone: String,
    maintenanceAmount: Number,
    otp: String,
    otpExpires: Date,
    lastPaidAt: Date, // NEW FIELD,
    role: {
        type: String,
        default: 'user', // 'admin' or 'user'
    },
});

module.exports = mongoose.model('User', userSchema);