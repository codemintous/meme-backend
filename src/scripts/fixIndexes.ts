import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function fixIndexes() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hedera-agent');
    console.log('Connected to MongoDB');

    // Get the users collection
    const usersCollection = mongoose.connection.collection('users');

    // Drop all existing indexes except _id
    const indexes = await usersCollection.indexes();
    for (const index of indexes) {
      if (index.name && index.name !== '_id_') {
        await usersCollection.dropIndex(index.name);
        console.log(`Dropped index: ${index.name}`);
      }
    }

    // Create new indexes with proper configuration
    await usersCollection.createIndex({ username: 1 }, { unique: true });
    await usersCollection.createIndex({ userAddress: 1 }, { unique: true });
    await usersCollection.createIndex({ publicKey: 1 }, { unique: true, sparse: true });

    console.log('Created new indexes with proper configuration');
    console.log('Index fixes completed successfully');
  } catch (error) {
    console.error('Error fixing indexes:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
}

fixIndexes(); 