const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// Middleware to verify admin token
const verifyAdmin = async (req, res, next) => {
    try {
        const token = req.headers.token;
        if (!token) return res.status(401).json({ message: 'Token missing' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ consumerId: decoded.consumerId });

        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied: Admins only' });
        }

        req.admin = user;
        next();
    } catch (err) {
        console.error('Admin auth error:', err);
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};

// ✅ GET all users (for admin panel)
router.get('/all-users', verifyAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-otp -otpExpire -password');
        res.json({ users });
    } catch (err) {
        console.error('Failed to fetch users:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/user-transactions/:consumerId', verifyAdmin, async (req, res) => {
    try {
        const { consumerId } = req.params;
        const transactions = await Transaction.find({ consumerId }).sort({ date: -1 });
        res.json({ transactions });
    } catch (err) {
        console.error('Error fetching user transactions:', err);
        res.status(500).json({ message: 'Server error' });
    }
});


// ✅ PUT update user by ID
router.put('/update-user/:id', verifyAdmin, async (req, res) => {
    try {
        const userId = req.params.id;
        const updateData = req.body;

        const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
            new: true,
            runValidators: true,
        });

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User updated successfully', user: updatedUser });
    } catch (err) {
        console.error('Failed to update user:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
