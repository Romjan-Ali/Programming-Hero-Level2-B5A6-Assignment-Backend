/* // scripts/migrateDirect.js
const { MongoClient } = require('mongodb');
require('dotenv').config();

async function migrateTransactions() {
  let client;
  
  try {
    console.log('🔗 Connecting to MongoDB...');
    
    // Create MongoDB client
    client = new MongoClient(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    // Connect to MongoDB
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db();
    const transactionsCollection = db.collection('transactions');
    
    // Find transactions with string references
    console.log('🔍 Finding transactions with string references...');
    const stringTransactions = await transactionsCollection.find({
      $or: [
        { from: { $type: 'string' } },
        { to: { $type: 'string' } }
      ]
    }).toArray();

    console.log(`📊 Found ${stringTransactions.length} transactions with string references`);

    if (stringTransactions.length === 0) {
      console.log('✅ No migrations needed - all references are already ObjectIds');
      return;
    }

    // Show sample data
    console.log('\n🔍 Sample of transactions with string references:');
    stringTransactions.slice(0, 3).forEach((t, i) => {
      console.log(`  ${i + 1}. Transaction ${t._id}:`);
      console.log(`     from: "${t.from}" (type: ${typeof t.from})`);
      console.log(`     to: "${t.to}" (type: ${typeof t.to})`);
    });

    let migratedCount = 0;
    let errorCount = 0;
    
    console.log('\n🔄 Starting migration...');
    
    // Process each transaction
    for (const transaction of stringTransactions) {
      try {
        const updateData = {};
        let needsUpdate = false;
        
        // Convert 'from' field if it's a string and valid ObjectId
        if (typeof transaction.from === 'string') {
          if (isValidObjectId(transaction.from)) {
            updateData.from = new ObjectId(transaction.from);
            needsUpdate = true;
            console.log(`   Converting from: "${transaction.from}" -> ObjectId`);
          } else {
            console.warn(`   ⚠️  Invalid from ID: "${transaction.from}" in transaction ${transaction._id}`);
          }
        }
        
        // Convert 'to' field if it's a string and valid ObjectId
        if (typeof transaction.to === 'string') {
          if (isValidObjectId(transaction.to)) {
            updateData.to = new ObjectId(transaction.to);
            needsUpdate = true;
            console.log(`   Converting to: "${transaction.to}" -> ObjectId`);
          } else {
            console.warn(`   ⚠️  Invalid to ID: "${transaction.to}" in transaction ${transaction._id}`);
          }
        }
        
        if (needsUpdate) {
          const result = await transactionsCollection.updateOne(
            { _id: transaction._id },
            { $set: updateData }
          );
          
          if (result.modifiedCount > 0) {
            migratedCount++;
            console.log(`   ✅ Updated transaction ${transaction._id}`);
          } else {
            console.warn(`   ⚠️  No documents modified for transaction ${transaction._id}`);
          }
        }
        
      } catch (error) {
        errorCount++;
        console.error(`   ❌ Error migrating transaction ${transaction._id}:`, error.message);
      }
    }

    console.log('\n📊 Migration completed:');
    console.log(`   ✅ Successfully migrated: ${migratedCount} transactions`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📝 Total processed: ${stringTransactions.length}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    // Close the connection
    if (client) {
      await client.close();
      console.log('✅ Disconnected from MongoDB');
    }
  }
}

// Helper function to validate ObjectId
function isValidObjectId(id) {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

// Import ObjectId from MongoDB
const { ObjectId } = require('mongodb');

// Run the migration
migrateTransactions().catch(console.error); */