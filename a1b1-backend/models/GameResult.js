const mongoose = require("mongoose");

const gameResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    mode: {
      type: String,
      enum: ["daily", "random"],
      required: true,
    },

    word: {
      type: String,
      required: true,
    },

    attemptsUsed: {
      type: Number,
      required: true,
    },

    maxAttempts: {
      type: Number,
      required: true,
    },

    won: {
      type: Boolean,
      required: true,
    },

    date: {
      type: String, // "YYYY-MM-DD"
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GameResult", gameResultSchema);
