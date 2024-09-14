const cron = require('node-cron');
const CustomResponse = require('../models/custom-response');
const { customResponseExpiresInDays } = require('../constants');
const { isDbConnected } = require('./db');
const connectDB = require('../db/mongoose');

const deleteOldCustomResponses = async () => {
  await connectDB();

  if (!isDbConnected()) {
    console.error('[CUSTOM RESPONSE] DB not connected. Exiting deleteOldCustomResponses');
    return;
  }

  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - customResponseExpiresInDays);
  ninetyDaysAgo.setHours(0, 0, 0, 0); // Set to midnight of that day

  try {
    // delete and count deleted
    const { deletedCount } = await CustomResponse.deleteMany({ lastAccessedAt: { $lt: ninetyDaysAgo } });
    console.info(`[CUSTOM RESPONSE] Deleted ${deletedCount} old CustomResponse entries.`);
  } catch (err) {
    console.log('[CUSTOM RESPONSE] Error deleting old CustomResponse entries:', err);
  }
};

const setupCRONJobs = () => {
  // Schedule cron job to run deleteOldCustomResponses every day at midnight
  cron.schedule('0 0 * * *', deleteOldCustomResponses);
};

module.exports = {
  setupCRONJobs,
};
