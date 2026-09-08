const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const DB_PATH = process.env.MONGODB_URI || "mongodb+srv://root:aditya123@keepcoding.xp3rkci.mongodb.net/?retryWrites=true&w=majority&appName=KeepCoding";

async function backupAndMigrateFavourites() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(DB_PATH);
    console.log('Connected to MongoDB successfully.');

    const db = mongoose.connection.db;
    const favouritesCollection = db.collection('favourites');

    // 1. Inspect existing indexes
    console.log('\n--- 1. Current Indexes on "favourites" Collection ---');
    const indexes = await favouritesCollection.indexes();
    console.log(JSON.stringify(indexes, null, 2));

    // 2. Inspect existing documents
    console.log('\n--- 2. Inspecting Existing Documents in "favourites" ---');
    const existingDocs = await favouritesCollection.find({}).toArray();
    console.log(`Found ${existingDocs.length} total documents in "favourites".`);

    const legacyDocsWithoutUserId = existingDocs.filter(doc => !doc.userId);
    console.log(`Documents missing userId: ${legacyDocsWithoutUserId.length}`);

    // 3. Backup legacy documents to a JSON file and a dedicated backup collection
    if (legacyDocsWithoutUserId.length > 0) {
      const backupPath = path.join(__dirname, 'legacy_favourites_backup.json');
      fs.writeFileSync(backupPath, JSON.stringify(legacyDocsWithoutUserId, null, 2));
      console.log(`\n✅ Backed up ${legacyDocsWithoutUserId.length} legacy documents to file: ${backupPath}`);

      const backupCollection = db.collection('legacy_favourites_backup');
      await backupCollection.deleteMany({}); // clear any old backup
      await backupCollection.insertMany(legacyDocsWithoutUserId);
      console.log(`✅ Backed up ${legacyDocsWithoutUserId.length} legacy documents to MongoDB collection "legacy_favourites_backup".`);

      // Archive legacy documents without userId out of active favourites collection so required: true is maintained
      const deleteResult = await favouritesCollection.deleteMany({ userId: { $exists: false } });
      console.log(`✅ Archived ${deleteResult.deletedCount} unowned legacy documents from active "favourites" collection.`);
    } else {
      console.log('No legacy documents without userId found.');
    }

    // 4. Safely drop legacy index 'houseId_1' if present
    const hasHouseIdIndex = indexes.some(idx => idx.name === 'houseId_1' || (idx.key && idx.key.houseId === 1 && !idx.key.userId));
    if (hasHouseIdIndex) {
      console.log('\nDropping legacy unique index "houseId_1"...');
      try {
        await favouritesCollection.dropIndex('houseId_1');
        console.log('✅ Successfully dropped legacy index "houseId_1".');
      } catch (err) {
        console.log('Note on dropping houseId_1 index:', err.message);
      }
    } else {
      console.log('\nLegacy index "houseId_1" not found or already dropped.');
    }

    // 5. Create new compound index { userId: 1, houseId: 1 }
    console.log('\nCreating compound index { userId: 1, houseId: 1 } with unique: true...');
    await favouritesCollection.createIndex({ userId: 1, houseId: 1 }, { unique: true });
    console.log('✅ Compound index { userId: 1, houseId: 1 } successfully created.');

    const updatedIndexes = await favouritesCollection.indexes();
    console.log('\n--- Final Indexes on "favourites" Collection ---');
    console.log(JSON.stringify(updatedIndexes, null, 2));

    console.log('\n🎉 Migration and Backup completed safely with ZERO data loss.');
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

backupAndMigrateFavourites();
