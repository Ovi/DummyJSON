const mongoose = require('mongoose');

const { MONGODB_URI, MONGODB_DB_NAME } = process.env;

mongoose
  .connect(MONGODB_URI, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: MONGODB_DB_NAME || 'logs',
  })
  .then(() => {
    console.info('[Service:Database] Connected.');
  })
  .catch(err => {
    console.error('[Service:Database] Err: Failed to Connect.', err);

    process.exit(1);
  });

// If mongoose gets disconnected, show this message
mongoose.connection.on('disconnected', () => {
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
