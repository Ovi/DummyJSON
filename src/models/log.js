const mongoose = require('mongoose');

const { Schema } = mongoose;

const LogSchema = new Schema(
  {
    time: {
      required: true,
      type: String,
    },

    method: {
      required: true,
      type: String,
    },

    url: {
      required: true,
      type: String,
    },

    httpVersion: String,

    ip: String,

    userAgent: String,

    referer: String,

    status: String,

    responseTime: Number,

    totalTime: Number,
  },
  {
    timestamps: true,
  },
);

const Log = mongoose.model('Log', LogSchema);

module.exports = Log;
