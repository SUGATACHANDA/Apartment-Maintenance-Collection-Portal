const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    transactionId: String,
    consumerId: String,
    amount: Number,
    email: String,
    date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Transaction', transactionSchema);
