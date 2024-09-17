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

    // Instead of exiting, we'll just log the error
    // process.exit(1);
  }
}

mongoose.connection.on('connected', () => {
  updatedDbConnectionStatus(true);
  log('Mongoose connected to DB', { workerId: process.pid });
});

mongoose.connection.on('error', error => {
  updatedDbConnectionStatus(false);
  logError('Mongoose connection error', { error });
});

mongoose.connection.on('disconnected', () => {
  updatedDbConnectionStatus(false);

  // Instead of exiting, we'll attempt to reconnect
  logError('Mongoose disconnected from DB - Attempting to reconnect...', { workerId: process.pid });
  setTimeout(connectDB, 5000); // Try to reconnect after 5 seconds
});

// If node exits, terminate mongoose connection
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    updatedDbConnectionStatus(false);

    log('Node is down. So is Mongoose.', { workerId: process.pid });
    process.exit(0);
  } catch (error) {
    logError('Error while closing Mongoose connection', { error });
    process.exit(1);
  }
});

module.exports = connectDB;
