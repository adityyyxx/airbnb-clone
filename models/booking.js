const mongoose = require('mongoose');

const bookingSchema = mongoose.Schema({
  houseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Home',
    required: true
  },
  checkIn: {
    type: Date,
    required: true
  },
  checkOut: {
    type: Date,
    required: true
  },
  guests: {
    type: Number,
    default: 1
  }
});

module.exports = mongoose.model('Booking', bookingSchema);
