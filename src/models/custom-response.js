const mongoose = require('mongoose');

const { Schema } = mongoose;

const customResponseSchema = new Schema(
  {
    identifier: {
      type: String,
      required: true,
      unique: true,
    },
    hash: {
      type: String,
      required: true,
      unique: true,
    },
    json: {
      type: Object,
      required: true,
    },
    method: {
      type: String,
      required: true,
      enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

const CustomResponse = mongoose.model('CustomResponse', customResponseSchema);

module.exports = CustomResponse;
