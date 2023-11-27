const mongoose = require('mongoose')

const InvestmentSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    investorEmail: {
        type: String,
        required: true
    },
    investorUsername: {
        type: String,
        required: true
    },
    amountInvested: {
        type: Number,
        required: true
    },
    entryDate: {
        type: Date,
        required: false,
        default: Date.now()
    }
})

const Investments = mongoose.model('investments', InvestmentSchema)

module.exports = Investments