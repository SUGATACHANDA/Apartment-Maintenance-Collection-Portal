const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Transaction = require('../models/Transaction');

// Admin auth middleware
const verifyAdmin = (req, res, next) => {
    try {
        const token = req.headers.token;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden' });
        }
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

// GET all transactions
router.get('/all-transactions', verifyAdmin, async (req, res) => {
    try {
        const transactions = await Transaction.find().sort({ date: -1 });
        res.json({ transactions });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch transactions' });
    }
});

module.exports = router;
