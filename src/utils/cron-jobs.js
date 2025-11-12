import cron from 'node-cron';
import CustomResponse from '../models/custom-response.js';
import { customResponseExpiresInDays } from '../constants/index.js';
import { logError, log } from '../helpers/logger.js';

const deleteOldCustomResponses = async () => {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - customResponseExpiresInDays);
  ninetyDaysAgo.setHours(0, 0, 0, 0); // Set to midnight of that day

  try {
    // delete and count deleted
    const { deletedCount } = await CustomResponse.deleteMany({ lastAccessedAt: { $lt: ninetyDaysAgo } });
    log(`[CUSTOM RESPONSE] Deleted ${deletedCount} old CustomResponse entries.`);
  } catch (err) {
    logError('[CUSTOM RESPONSE] Error deleting old CustomResponse entries', { error: err });
  }
};

const setupCRONJobs = () => {
  // Schedule cron job to run deleteOldCustomResponses every day at midnight
  cron.schedule('0 0 * * *', deleteOldCustomResponses);
};

export { setupCRONJobs };
