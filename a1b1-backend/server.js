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
const PORT = process.env.PORT || 5000;
const cc = process.env.CLIENT_URL;

app.use(express.json());
app.use(
  cors({
    origin: cc,
    credentials: true,
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

app.get("/api/word/random", (req, res) => {
  const randomIndex = Math.floor(Math.random() * words.length);
  const randomWord = words[randomIndex];

  res.json({
    mode: "random",
    word: randomWord,
  });
});

app.get("/api/game/daily-status", authMiddleware, async (req, res) => {
  const today = getTodayString();

  const played = await GameResult.exists({
    userId: req.userId,
    mode: "daily",
    date: today,
  });

  res.json({ played: !!played });
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
    const { mode, won, attemptsUsed, word } = req.body;

    if (mode !== "daily") {
      return res.json({ ignored: true });
    }

    const today = getTodayString();

    const existing = await GameResult.findOne({
      userId: req.userId,
      date: today,
      mode: "daily",
    });

    if (existing) {
      return res.status(403).json({
        error: "Daily challenge already played today",
      });
    }

    const gameResult = new GameResult({
      userId: req.userId,
      mode: "daily",
      word,
      attemptsUsed,
      maxAttempts: 10,
      won,
      date: today,
    });

    await gameResult.save();

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/leaderboard/daily", async (req, res) => {
  try {
    const leaderboard = await GameResult.aggregate([
      { $match: { mode: "daily" } },

      {
        $group: {
          _id: "$userId",
          totalWins: {
            $sum: { $cond: ["$won", 1, 0] },
          },
          totalGames: { $sum: 1 },
          avgAttempts: { $avg: "$attemptsUsed" },
          firstWinDate: {
            $min: {
              $cond: ["$won", "$date", null],
            },
          },
        },
      },

      { $sort: { totalWins: -1, avgAttempts: 1, firstWinDate: 1 } },

      { $limit: 10 },

      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },

      { $unwind: "$user" },

      {
        $project: {
          _id: 0,
          username: "$user.username",
          wins: "$totalWins",
          avgAttempts: { $round: ["$avgAttempts", 2] },
        },
      },
    ]);

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
