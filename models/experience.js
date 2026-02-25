const mongoose = require('mongoose');

const experienceSchema = mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  host: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Adventure', 'Food & Drink', 'Art & Culture', 'Wellness', 'Nature', 'Music', 'Sports', 'Nightlife']
  },
  price: {
    type: Number,
    required: true
  },
  duration: {
    type: String,
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
  },
  maxGuests: {
    type: Number,
    default: 10
  }
});

module.exports = mongoose.model('Experience', experienceSchema);
