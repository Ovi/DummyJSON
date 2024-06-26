const mongoose = require('mongoose');
const { isDbConnected, updatedDbConnectionStatus } = require('../utils/db');

const { MONGODB_URI, MONGODB_DB_NAME } = process.env;

connectDB();

async function connectDB() {
  if (!MONGODB_URI || isDbConnected()) return;
  const dbOptions = {
    dbName: MONGODB_DB_NAME || 'DummyJSON-Test-DB',
  };

  try {
    await mongoose.connect(MONGODB_URI, dbOptions);
    updatedDbConnectionStatus(true);
    console.info('[Service:Database] Connected.');
  } catch (err) {
    updatedDbConnectionStatus(false);
    console.error('[Service:Database] Err: Failed to Connect.', err);
    process.exit(1);
  }
}

// If mongoose gets disconnected, show this message
mongoose.connection.on('disconnected', () => {
  updatedDbConnectionStatus(false);
  console.info('[Service:Database] Disconnected.');

  // [optional] exit app when database is disconnected
  // process.exit(1);
});

// If node exits, terminate mongoose connection
process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    console.info('INFO: Node is down. So the Mongoose.');

    process.exit(0);
  });
});
