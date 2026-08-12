const mongoose = require('mongoose');

const paymentTransactionSchema = mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  razorpayOrderId: {
    type: String,
    required: true,
    index: true
  },
  razorpayPaymentId: {
    type: String,
    index: true
  },
  razorpaySignature: {
    type: String
  },
  amount: {
    type: Number,
    required: true // in INR
  },
  currency: {
    type: String,
    default: 'INR'
  },
  status: {
    type: String,
    enum: ['created', 'authorized', 'captured', 'failed', 'refunded'],
    default: 'created'
  },
  idempotencyKey: {
    type: String,
    unique: true,
    sparse: true
  },
  webhookEventId: {
    type: String,
    unique: true,
    sparse: true
  },
  webhookPayload: {
    type: mongoose.Schema.Types.Mixed
  },
  errorMessage: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PaymentTransaction', paymentTransactionSchema);
