const mongoose = require('mongoose');
const favourite = require('./favourite');
const booking = require('./booking');

const homeSchema = mongoose.Schema({
  houseName: {
    type: String,
    required: [true, 'House name is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [0, 'Rating cannot be less than 0'],
    max: [5, 'Rating cannot be greater than 5']
  },
  photoUrl: {
    type: String,
    default: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'
  },
  description: String,
});

homeSchema.pre('findOneAndDelete', async function() {
  const query = this.getQuery();
  const homeId = query._id;
  if (homeId) {
    await Promise.all([
      favourite.deleteMany({ houseId: homeId }),
      booking.deleteMany({ houseId: homeId })
    ]);
  }
});

module.exports = mongoose.model('Home', homeSchema);