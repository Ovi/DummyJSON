import mongoose from 'mongoose';

const { Schema } = mongoose;

const webhookRequestSchema = new Schema(
  {
    requestId: {
      type: String,
      required: true,
    },
    method: {
      type: String,
      required: true,
    },
    headers: {
      type: Object,
      required: true,
    },
    query: {
      type: Object,
      required: true,
    },
    body: {
      type: Schema.Types.Mixed,
    },
    receivedAt: {
      type: Date,
      default: Date.now,
    },
    _meta: {
      type: Object,
    },
  },
  { _id: false },
);

const webhookSchema = new Schema(
  {
    identifier: {
      type: String,
      required: true,
      unique: true,
    },
    creatorIP: {
      type: String,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    requests: {
      type: [webhookRequestSchema],
      default: [],
    },
  },
  { timestamps: true, versionKey: false },
);

webhookSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Webhook = mongoose.model('Webhook', webhookSchema);

export default Webhook;
