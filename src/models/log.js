const mongoose = require('mongoose');

const { Schema } = mongoose;

const LogSchema = new Schema(
  {
    time: {
      required: true,
      type: String,
    },

    request: {
      required: true,
      type: String,
    },

    response: {
      required: true,
      type: String,
    },

    userAgent: String,

    referer: String,

    totalTimeMS: String,
  },
  {
    timestamps: false,
  },
);

const Log = mongoose.model('Log', LogSchema);

module.exports = Log;
