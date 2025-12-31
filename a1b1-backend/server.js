require("dotenv").config();

const express = require("express");
const cors = require("cors");
const words = require("./words.json");
const mongoose = require("mongoose");
const dbURI = process.env.dbURI;
const User = require("./models/User");
const GameResult = require("./models/GameResult");

mongoose
  .connect(dbURI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(cors());

function getTodayString() {
  const today = new Date();
  return today.toISOString().split("T")[0];
}

function getDailyWordIndex() {
  const todayStr = getTodayString();

  let sum = 0;
  for (let i = 0; i < todayStr.length; i++) {
    sum += todayStr.charCodeAt(i);
  }

  return sum % words.length;
}

app.get("/api/word/daily", (req, res) => {
  const index = getDailyWordIndex();
  const dailyWord = words[index];

  res.json({
    mode: "daily",
    date: getTodayString(),
    word: dailyWord,
  });
});

app.get("/api/word/random", (req, res) => {
  const randomIndex = Math.floor(Math.random() * words.length);
  const randomWord = words[randomIndex];

  res.json({
    mode: "random",
    word: randomWord,
  });
});

app.get("/api/test-db", async (req, res) => {
  const user = new User({
    username: "testuser",
    gamesPlayed: 1,
    wins: 1,
  });

  await user.save();
  res.send("User saved");
});

app.post("/api/game/result", async (req, res) => {
  try {
    const { mode, won, attemptsUsed, maxAttempts, word } = req.body;

    if (!mode || !["daily", "random"].includes(mode)) {
      return res.status(400).json({ error: "Invalid mode" });
    }

    if (typeof won !== "boolean") {
      return res.status(400).json({ error: "Invalid win status" });
    }

    //  Get or create user
    let user = await User.findOne({ username: "testuser" });

    if (!user) {
      user = new User({ username: "testuser" });
      await user.save();
    }

    const today = getTodayString();

    if (mode === "daily") {
      if (user.lastPlayedDate === today && user.dailyGamesPlayed >= 1) {
        return res.status(403).json({
          error: "Daily challenge already played today",
        });
      }
    }

    // Save game result
    const gameResult = new GameResult({
      userId: user._id,
      mode,
      word,
      attemptsUsed,
      maxAttempts,
      won,
      date: today,
    });

    await gameResult.save();
    user.totalGames += 1;

    if (won) {
      user.totalWins += 1;
    }

    // Daily mode affects daily stats
    if (mode === "daily") {
      // Reset daily counters if new day
      if (user.lastPlayedDate !== today) {
        user.dailyGamesPlayed = 0;
        user.dailyWins = 0;
      }

      user.dailyGamesPlayed += 1;

      if (won) {
        user.dailyWins += 1;
      }

      user.lastPlayedDate = today;
    }

    // Avg attempts update (simple running average)
    const prevGames = user.totalGames - 1;
    user.avgAttempts =
      prevGames === 0
        ? attemptsUsed
        : (user.avgAttempts * prevGames + attemptsUsed) / user.totalGames;

    await user.save();

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/leaderboard/daily", async (req, res) => {
  try {
    const today = getTodayString();

    const leaderboard = await User.find({
      lastPlayedDate: today,
    })
      .sort({
        dailyWins: -1,
        avgAttempts: 1,
        updatedAt: 1,
      })
      .limit(10)
      .select("username dailyWins avgAttempts -_id");

    res.json(leaderboard);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
