const mongoose = require('mongoose');

const Wallet = new mongoose.Schema({
    ownerUsername: {
        type: String,
        unique: true,
        required: true
    },
    ownerEmail: {
        type: String,
        unique: true,
        required: true
    },
    usdt: {
        type: Number,
        required: false,
        default: 0
    },
    usdc: {
        type: Number,
        required: false,
        default: 0
    },
    btc: {
        type: Number,
        required: false,
        default: 0
    },
    ltc: {
        type: Number,
        required: false,
        default: 0
    },
    eth: {
        type: Number,
        required: false,
        default: 0
    },
    xrp: {
        type: Number,
        required: false,
        default: 0
    },
    entryDate: {
        type: Date,
        required: false,
        default: Date.now()
    }
})

const WalletDB =  mongoose.model('Wallet', Wallet)

module.exports = WalletDB