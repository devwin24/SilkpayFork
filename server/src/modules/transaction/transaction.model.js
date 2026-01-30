const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  merchant_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Merchant',
    required: true,
    index: true
  },
  merchant_no: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['PAYOUT', 'REFUND', 'FEE', 'ADJUSTMENT'],
    required: true,
    index: true
  },
  payout_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payout',
    index: true
  },
  amount: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
    get: (v) => v ? parseFloat(v.toString()) : 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  balance_before: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
    get: (v) => v ? parseFloat(v.toString()) : 0
  },
  balance_after: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
    get: (v) => v ? parseFloat(v.toString()) : 0
  },
  description: {
    type: String,
    required: true
  },
  reference_no: {
    type: String,
    index: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

// Compound indexes for queries
TransactionSchema.index({ merchant_id: 1, createdAt: -1 });
TransactionSchema.index({ merchant_id: 1, type: 1, createdAt: -1 });

module.exports = mongoose.model('Transaction', TransactionSchema);
