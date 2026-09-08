import mongoose from 'mongoose';
import { log, logError } from '../helpers/logger.js';

const { MONGODB_URI, MONGODB_DB_NAME } = process.env;

export const connectDB = async () => {
  if (!MONGODB_URI) return;

  const dbOptions = {
    dbName: MONGODB_DB_NAME || 'dummyjson-test-db',
    maxPoolSize: 20,
    serverSelectionTimeoutMS: 5000, // Time out after 5 seconds if no server is found
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  };

  try {
    await mongoose.connect(MONGODB_URI, dbOptions);
  } catch (error) {
    logError('Failed to connect to MongoDB', { error });
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
  } catch (error) {
    logError('Error while closing Mongoose connection', { error });
  }
};

mongoose.connection.on('connected', () => {
  log('Mongoose connected to DB');
});

mongoose.connection.on('error', error => {
  logError('Mongoose connection error', { error });
});

mongoose.connection.on('disconnected', () => {
  // Instead of exiting, we'll attempt to reconnect
  logError('Mongoose disconnected from DB - Attempting to reconnect...');
  setTimeout(connectDB, 5000); // Try to reconnect after 5 seconds
});
