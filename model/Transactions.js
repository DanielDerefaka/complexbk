const mongoose = require ("mongoose")

const Transactions = new mongoose.Schema({
    transactionType: {
        type: String,
        required: true,
    },
    transactionStatus: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        required: true,
    },
    TransactorWalletAddress: {
        type: String,
        required: true,
    },
    TransactorEmailAddress: {
        type: String,
        required: true,
    },
    TransactorUsername: {
        type: String,
        required: true,
    },
    proofOfDeposit: {
        type: String,
        required: false, 
        default : null     
    },
    entryDate: {
        type: Date,
        required: false,
        default: Date.now(),
    },
})

module.exports = mongoose.model('Transactions', Transactions)

