const mongoose = require('mongoose');
const { isDbConnected, updatedDbConnectionStatus } = require('../utils/db');
const { logError, log } = require('../helpers/logger');

const { MONGODB_URI, MONGODB_DB_NAME } = process.env;

async function connectDB() {
  if (!MONGODB_URI || isDbConnected()) return;

  const dbOptions = {
    dbName: MONGODB_DB_NAME || 'dummyjson-test-db',
    maxPoolSize: 20,
    serverSelectionTimeoutMS: 5000, // Time out after 5 seconds if no server is found
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  };

  try {
    await mongoose.connect(MONGODB_URI, dbOptions);
    updatedDbConnectionStatus(true);
  } catch (error) {
    updatedDbConnectionStatus(false);
    logError('Failed to connect to MongoDB', { error });
    process.exit(1);
  }
}

module.exports = connectDB;

mongoose.connection.on('connected', () => {
  updatedDbConnectionStatus(true);
  log('Mongoose connected to DB', { workerId: process.pid });
});

mongoose.connection.on('error', error => {
  updatedDbConnectionStatus(false);
  logError('Mongoose connection error', { error });
});

mongoose.connection.on('disconnected', error => {
  updatedDbConnectionStatus(false);
  logError('Mongoose disconnected from DB', { error });

  // exit app when database is disconnected
  process.exit(1);
});

// If node exits, terminate mongoose connection
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    updatedDbConnectionStatus(false);
    // _log('info', 'Node is down. So is Mongoose.');
    log('Node is down. So is Mongoose.', { workerId: process.pid });

    process.exit(0);
  } catch (error) {
    logError('Error while closing Mongoose connection', { error });

    process.exit(1); // Exit with an error code if something goes wrong
  }
});
