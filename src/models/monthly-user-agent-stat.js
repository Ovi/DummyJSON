import mongoose from 'mongoose';

const MonthlyUserAgentStatSchema = new mongoose.Schema(
  {
    month: {
      type: Date, // truncated to first day of month (00:00:00)
      required: true,
      index: true,
      unique: true,
    },
    userAgents: [
      {
        _id: false,
        ua: {
          type: String,
          required: true,
        },
        count: {
          type: Number,
          default: 1,
        },
      },
    ],
  },
  { timestamps: true, versionKey: false },
);

const MonthlyUserAgentStat = mongoose.model('MonthlyUserAgentStat', MonthlyUserAgentStatSchema);

export default MonthlyUserAgentStat;
