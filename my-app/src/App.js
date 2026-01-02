import { useEffect, useState } from "react";
import "./App.css";
import Board from "./components/Board";
import Dash from "./components/Dash";
import GameOver from "./components/GameOver";
import HelpSlider from "./components/HelpSlider";
import MessageBox from "./components/MessageBox";
import WinMessage from "./components/WinMessage";
import Leaderboard from "./pages/Leaderboard";
import Login from "./pages/Login";
function App() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("token"));

  const [word, setWord] = useState("");
  const [gameStatus, setGameStatus] = useState("playing"); // 'playing', 'win', 'lose'
  const [showHelp, setShowHelp] = useState(false);
  const [message, setMessage] = useState("");
  const [gameMode, setGameMode] = useState(null);
  const [resultSent, setResultSent] = useState(false);
  const [dailyPlayed, setDailyPlayed] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const fetchWord = async (mode) => {
    const url =
      mode === "daily"
        ? "http://localhost:5000/api/word/daily"
        : "http://localhost:5000/api/word/random";

    const response = await fetch(url);
    const data = await response.json();
    setWord(data.word);
  };
  useEffect(() => {
    if (loggedIn) {
      fetchDailyStatus();
    }
  }, [loggedIn]);

  const handleModeSelect = (mode) => {
    setResultSent(false);
    setGameMode(mode);
    fetchWord(mode);
    setResultSent(false);
  };

  // const fetchRandomWord = async () => {
  //   const response = await fetch("http://localhost:5000/api/word");
  //   const data = await response.json();
  //   setWord(data.word);
  //   console.log(data.word);
  // };

  const reportGameResult = async (won, attemptsUsed) => {
    if (resultSent) return;

    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:5000/api/game/result", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        mode: gameMode,
        won,
        word: word,
        attemptsUsed,
        maxAttempts: 10,
      }),
    });
    const data = await res.json();
    if (res.status === 401) {
      console.error("Unauthorized – token invalid or expired");
      return;
    }

    if (!res.ok) {
      console.error("Game result failed");
      showMessage(data.error);
      return;
    }

    setResultSent(true);
  };

  const fetchDailyStatus = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:5000/api/game/daily-status", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    setDailyPlayed(data.played);
  };

  const handleGameOver = (attemptsUsed) => {
    setGameStatus("lose");
    reportGameResult(true, attemptsUsed);
  };

  const handleWin = (attemptsUsed) => {
    setGameStatus("win");
    reportGameResult(true, attemptsUsed);
  };

  const handleHelpClick = () => {
    setShowHelp(!showHelp);
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 2000);
  };

  if (!loggedIn) {
    return <Login onLogin={() => setLoggedIn(true)} />;
  }
  if (showLeaderboard) {
    return (
      <div className="App">
        <button onClick={() => setShowLeaderboard(false)}>
          ← Back to Game
        </button>
        <Leaderboard />
      </div>
    );
  }

  if (!gameMode) {
    return (
      <div className="App">
        <h1 id="title">The A1B1 Game</h1>
        <p>Select a mode to start</p>

        <button disable={dailyPlayed} onClick={() => handleModeSelect("daily")}>
          Daily Challenge
        </button>
        {dailyPlayed && (
          <p style={{ color: "red" }}>
            You have already played today’s daily challenge.
          </p>
        )}

        <button onClick={() => handleModeSelect("random")}>Free Play</button>
        <button onClick={() => setShowLeaderboard(true)}>Leaderboard</button>
      </div>
    );
  }

  return (
    <div className="App">
      <h1 id="title">The A1B1 Game</h1>
      <p style={{ textAlign: "center" }}>
        Mode: {gameMode === "daily" ? "Daily Challenge" : "Free Play"}
      </p>

      <hr />
      <br />
      <Dash word={word} onWin={handleWin} />
      <Board
        word={word}
        onGameOver={handleGameOver}
        onWin={handleWin}
        showMessage={showMessage}
      />
      {gameStatus === "lose" && <GameOver word={word} gameover={true} />}
      <MessageBox message={message} />
      {gameStatus === "win" && <WinMessage gameover={true} />}
      <button id="help" onClick={handleHelpClick}>
        ?
      </button>
      {showHelp && <HelpSlider />}
    </div>
  );
}

export default App;
