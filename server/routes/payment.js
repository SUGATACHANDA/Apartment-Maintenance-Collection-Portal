const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay order
router.post('/create-order', async (req, res) => {
  const { token } = req.body;
  try {
    const { consumerId } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ consumerId });

    const order = await razorpay.orders.create({
      amount: user.maintenanceAmount * 100,
      currency: 'INR',
      receipt: `rcpt_${consumerId}_${Date.now()}`,
    });

    res.json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(400).json({ message: err.message || 'Invalid token or internal error' });
  }
});

// Verify Razorpay payment and store transaction
router.post('/verify-payment', async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, token } = req.body;

  const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
  hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const generated_signature = hmac.digest('hex');

  if (generated_signature !== razorpay_signature) {
    return res.status(400).json({ message: 'Payment verification failed' });
  }

  try {
    const { consumerId } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ consumerId });

    const transactionDate = new Date();
    user.lastPaidAt = transactionDate;
    await user.save();

    const transaction = await Transaction.create({
      transactionId: razorpay_payment_id,
      consumerId,
      email: user.email,
      amount: user.maintenanceAmount,
      date: transactionDate,
    });

    res.json({
      success: true,
      transaction: {
        transactionId: transaction.transactionId,
        consumerId,
        email: transaction.email,
        date: transactionDate.toLocaleString('en-IN'),
        amount: transaction.amount,
      },
    });
  } catch (err) {
    console.error('Verification failed:', err);
    res.status(400).json({ message: 'Verification failed or token invalid' });
  }
});

// ✅ Check if user is eligible to pay (no overrideDate support)
router.post('/can-pay', async (req, res) => {
  try {
    const { token } = req.body;
    const { consumerId } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ consumerId });

    const today = new Date();
    const todayMonth = today.getMonth();
    const todayYear = today.getFullYear();
    const day = today.getDate();

    const lastPaid = new Date(user.lastPaidAt);
    const paidMonth = lastPaid.getMonth();
    const paidYear = lastPaid.getFullYear();

    const alreadyPaidThisMonth =
      user.lastPaidAt &&
      paidMonth === todayMonth &&
      paidYear === todayYear;

    // ✅ Only allow payment if it's 5th or later and not already paid this month
    const canPay = !alreadyPaidThisMonth && day >= 1;

    return res.json({ canPay });
  } catch (err) {
    console.error('Can-pay check failed:', err);
    res.status(400).json({ message: 'Invalid token or server error' });
  }
});


// Transaction history
router.get('/history', async (req, res) => {
  try {
    const token = req.headers.token;
    const { consumerId } = jwt.verify(token, process.env.JWT_SECRET);
    const history = await Transaction.find({ consumerId }).sort({ date: -1 });
    res.json({ history });
  } catch (err) {
    console.error('Error fetching history:', err);
    res.status(400).json({ message: 'Invalid token or failed to fetch history' });
  }
});

module.exports = router;
