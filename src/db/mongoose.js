const mongoose = require('mongoose');
const { isDbConnected, updatedDbConnectionStatus } = require('../utils/db');

const { MONGODB_URI, MONGODB_DB_NAME } = process.env;

async function connectDB() {
  if (!MONGODB_URI || isDbConnected()) return;

  const dbOptions = {
    dbName: MONGODB_DB_NAME || 'DummyJSON-Test-DB',
    maxPoolSize: 20,
    serverSelectionTimeoutMS: 5000, // Time out after 5 seconds if no server is found
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  };

  try {
    await mongoose.connect(MONGODB_URI, dbOptions);
    updatedDbConnectionStatus(true);
  } catch (err) {
    updatedDbConnectionStatus(false);
    _log('error', `Err: Failed to Connect. ${err}`);
    process.exit(1);
  }
}

module.exports = connectDB;

mongoose.connection.on('connected', () => {
  _log('info', 'Mongoose connected to DB');
});

mongoose.connection.on('error', err => {
  updatedDbConnectionStatus(true);
  _log('error', `Mongoose connection error: ${err}`);
});

mongoose.connection.on('disconnected', () => {
  updatedDbConnectionStatus(false);
  _log('info', 'Mongoose disconnected from DB');

  // exit app when database is disconnected
  // process.exit(1);
});

// If node exits, terminate mongoose connection
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    _log('info', 'Node is down. So is Mongoose.');
    process.exit(0);
  } catch (err) {
    _log('error', `Err: Mongoose disconnection. ${err}`);
    process.exit(1); // Exit with an error code if something goes wrong
  }
});

function _log(type, message) {
  console[type](`[Service:Database][PID: ${process.pid}] ${message}`);
}
