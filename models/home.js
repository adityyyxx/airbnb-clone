const mongoose = require('mongoose');
const favourite = require('./favourite');
const booking = require('./booking');

const homeSchema = mongoose.Schema({
  houseName: {
    type: String,
    required: true
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
    required: true
  },
  photoUrl: String,
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