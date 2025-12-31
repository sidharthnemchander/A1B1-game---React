const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },

    totalGames: {
      type: Number,
      default: 0,
    },

    totalWins: {
      type: Number,
      default: 0,
    },

    dailyGamesPlayed: {
      type: Number,
      default: 0,
    },

    dailyWins: {
      type: Number,
      default: 0,
    },

    avgAttempts: {
      type: Number,
      default: 0,
    },

    lastPlayedDate: {
      type: String, // "YYYY-MM-DD"
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
