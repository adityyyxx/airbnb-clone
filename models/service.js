const mongoose = require('mongoose');

const serviceSchema = mongoose.Schema({
  serviceName: {
    type: String,
    required: true
  },
  provider: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Photography', 'Chefs', 'Massage', 'Training', 'Make-up', 'Hair', 'Spa treatments', 'Catering', 'Nails', 'Prepared meals']
  },
  price: {
    type: Number,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    default: 0
  },
  photoUrl: String,
  description: String,
  isPopular: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Service', serviceSchema);
