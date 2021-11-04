const mongoose = require('mongoose');

const { MONGODB_URI } = process.env;

mongoose
  .connect(MONGODB_URI, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
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

  process.exit(1);
});

// If node exits, terminate mongoose connection
process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    console.info('INFO: Node is down. So the Mongoose.');

    process.exit(0);
  });
});
