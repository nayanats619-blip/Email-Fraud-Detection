const mongoose = require("mongoose");

// Email Analysis Schema
const emailAnalysisSchema = new mongoose.Schema(
  {
    senderEmail: {
      type: String,
      required: true,
      lowercase: true,
    },
    emailText: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Safe", "Suspicious", "Fraud"],
      required: true,
    },
    riskScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    reasons: {
      type: [String],
      default: [],
    },
    keywords: {
      type: [String],
      default: [],
    },
    ipReputation: {
      type: String,
      default: "Unknown",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("EmailAnalysis", emailAnalysisSchema);
