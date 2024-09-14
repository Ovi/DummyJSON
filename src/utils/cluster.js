const https = require('node:https');
const cluster = require('node:cluster');
const { timeDifference } = require('./util');

const clusterUtils = {};

const counts = {
  requestCount: 0,
  customRequestCount: 0,
};

clusterUtils.handleClusterExit = (worker, code, signal) => {
  let reason;

  if (signal) {
    reason = `Worker was killed by signal: ${signal}`;
  } else if (code !== 0) {
    reason = `Worker exited with error code: ${code}`;
  } else {
    reason = 'Worker exited successfully';
  }

  console.info(`[Master] ${worker.process.pid} died. ${reason}`);

  cluster.fork();
};

clusterUtils.handleClusterMessage = (worker, message) => {
  if (message.type === 'request_counts') {
    counts.requestCount += message.requestCount || 0;
    counts.customRequestCount += message.customRequestCount || 0;
  }

  if (message.type === 'error') {
    console.info(`[Master] Received error from worker ${worker.process.pid}: ${message.error}`);
    clusterUtils.sendWorkedDiedPushNotification(worker.process.pid, message.error || 'No error details');
  }
};

clusterUtils.logCounts = () => {
  const startTime = Date.now();

  setInterval(() => {
    const diff = timeDifference(startTime, Date.now());

    console.info(`[Count] ${counts.requestCount} requests in ${diff}`);
    console.info(`[Count] ${counts.customRequestCount} custom requests in ${diff}`);
  }, 30 * 1000 /* 30 seconds */);
};

clusterUtils.sendWorkedDiedPushNotification = (workerId, errorDetails) => {
  const { PUSHOVER_USER_KEY, PUSHOVER_API_TOKEN } = process.env;
  if (!PUSHOVER_USER_KEY || !PUSHOVER_API_TOKEN) return;

  const postData = JSON.stringify({
    token: PUSHOVER_API_TOKEN,
    user: PUSHOVER_USER_KEY,
    title: `Cluster Alert: Worker ${workerId} Died`,
    message: `Worker with ID ${workerId} has died.\nError Stack: ${errorDetails}`,
  });

  const options = {
    hostname: 'api.pushover.net',
    port: 443,
    path: '/1/messages.json',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': postData.length,
    },
  };

  const req = https.request(options, res => {
    res.on('data', d => {
      process.stdout.write(d);
      console.info('\nNotification sent!');
    });
  });

  req.on('error', e => {
    console.error(`Error sending notification: ${e.message}`);
  });

  req.write(postData);
  req.end();
};

module.exports = clusterUtils;
