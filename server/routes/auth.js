const express = require('express');
const router = express.Router();
const User = require('../models/User');
const sendOtp = require('../utils/sendOtp');
const jwt = require('jsonwebtoken');

router.post('/login', async (req, res) => {
    const { consumerId } = req.body;
    const user = await User.findOne({ consumerId });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();
    await sendOtp(user.email, otp);

    res.json({ message: 'OTP sent to email' });
});

router.post('/verify', async (req, res) => {
    const { consumerId, otp } = req.body;
    const user = await User.findOne({ consumerId });
    if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
        return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.otp = null;
    user.otpExpires = null;
    await user.save();

    const token = jwt.sign({ consumerId: user.consumerId, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
});

router.get('/me', async (req, res) => {
    try {
        const token = req.headers.token;
        const { consumerId } = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ consumerId });

        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json({
            flatNo: user.flatNo,
            consumerId: user.consumerId,
            email: user.email,
            phone: user.phone,
            maintenanceAmount: user.maintenanceAmount,
            lastPaidAt: user.lastPaidAt
        });
    } catch (err) {
        console.error('Failed to fetch user:', err);
        res.status(400).json({ message: 'Invalid token or server error' });
    }
});

module.exports = router;