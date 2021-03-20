const mongoose = require('mongoose')

const txnSchema = mongoose.Schema({
    userEmail:{
        type: String,
        require: true
    },
    amount:{
        type: Number,
        require: true
    },
    date:{
        type: Date,
        require: true,
        default: Date()
    }
})

txnSchema.index({
    userEmail: 1,
});

module.exports = mongoose.model('Txn', txnSchema)