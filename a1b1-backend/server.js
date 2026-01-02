require("dotenv").config();

const express = require("express");
const cors = require("cors");
const words = require("./words.json");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("./middleware/auth");
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
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

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

app.get("/api/game/daily-status", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const today = getTodayString();

    const played = user.lastPlayedDate === today && user.dailyGamesPlayed >= 1;

    res.json({ played });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
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

app.post("/api/game/result", authMiddleware, async (req, res) => {
  try {
    const { mode, won, attemptsUsed, maxAttempts, word } = req.body;

    if (!mode || !["daily", "random"].includes(mode)) {
      return res.status(400).json({ error: "Invalid mode" });
    }

    if (typeof won !== "boolean") {
      return res.status(400).json({ error: "Invalid win status" });
    }

    //  Get or create user
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
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

app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      password: hashedPassword,
    });

    await user.save();

    res.json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/debug/register", async (req, res) => {
  try {
    const username = "sid";
    const password = "123456";

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.json({ message: "User already exists" });
    }

    const hashedPassword = await require("bcryptjs").hash(password, 10);

    const user = new User({
      username,
      password: hashedPassword,
    });

    await user.save();

    res.json({ message: "Debug user registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Debug register failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
