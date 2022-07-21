const mongoose = require('mongoose');

const { Schema } = mongoose;

const RequestSchema = new Schema(
  {
    requestIP: String,
    requestMethod: String,
    requestTimeISO: String,
    requestUA: String,
    requestURL: String,
  },
  { timestamps: false },
);

const ResponseSchema = new Schema(
  {
    responseCode: String,
    responseTimeMS: String,
  },
  { timestamps: false },
);

const LogSchema = new Schema(
  {
    requestMetaData: {
      required: true,
      type: [RequestSchema],
    },

    responseMetaData: {
      required: true,
      type: [ResponseSchema],
    },

    referrer: String,
    totalTimeMS: String,
  },
  {
    timestamps: false,
  },
);

const Log = mongoose.model('Log', LogSchema);

module.exports = Log;
