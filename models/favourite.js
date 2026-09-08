const mongoose = require('mongoose');

const favouriteSchema = mongoose.Schema({
  houseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Home',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

favouriteSchema.index({ userId: 1, houseId: 1 }, { unique: true });

const Favourite = mongoose.model('Favourite', favouriteSchema);

// Safe sync: drop legacy index 'houseId_1' when MongoDB connection is established
if (mongoose.connection) {
  const dropLegacyIndex = async () => {
    try {
      const collection = mongoose.connection.collection('favourites');
      const indexes = await collection.indexes();
      const hasLegacyIndex = indexes.some(idx => idx.name === 'houseId_1' || (idx.key && idx.key.houseId === 1 && !idx.key.userId));
      if (hasLegacyIndex) {
        console.log('Dropping legacy houseId_1 index from favourites collection...');
        await collection.dropIndex('houseId_1');
        console.log('✅ Dropped legacy houseId_1 index successfully.');
      }
    } catch (err) {
      // Ignore if collection doesn't exist yet or index already dropped
      if (err.codeName !== 'NamespaceNotFound' && err.code !== 26) {
        console.log('Legacy index sync note:', err.message);
      }
    }
  };

  if (mongoose.connection.readyState === 1) {
    dropLegacyIndex();
  } else {
    mongoose.connection.once('open', dropLegacyIndex);
  }
}

module.exports = Favourite;