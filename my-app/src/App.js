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
  const [gameStatus, setGameStatus] = useState("playing");
  const [showHelp, setShowHelp] = useState(false);
  const [message, setMessage] = useState("");
  const [gameMode, setGameMode] = useState(null);
  const [resultSent, setResultSent] = useState(false);
  const [dailyPlayed, setDailyPlayed] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [boardKey, setBoardKey] = useState(0);

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

  const playAgain = () => {
    setGameStatus("playing");
    setResultSent(false);
    setBoardKey((k) => k + 1);
    fetchWord("random");
  };

  const reportGameResult = async (won, attemptsUsed) => {
    if (resultSent) return;

    if (gameMode !== "daily") return;

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
    reportGameResult(false, attemptsUsed);
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

  if (showLeaderboard) {
    return (
      <div className="App">
        <button
          className="leaderboard-link"
          style={{ bottom: "auto", top: "20px" }}
          onClick={() => setShowLeaderboard(false)}
        >
          ← Back to Game
        </button>
        <Leaderboard />
      </div>
    );
  }

  if (showLogin && !loggedIn) {
    return (
      <Login
        onLogin={() => {
          setLoggedIn(true);
          setShowLogin(false);
        }}
        goToRegister={() => {
          setShowLogin(false);
        }}
      />
    );
  }

  if (!gameMode) {
    return (
      <div className="mode-selection">
        <MessageBox message={message} />
        <h1 className="main-title">THE A1B1 GAME</h1>

        {/* Daily Challenge - Left Panel */}
        <div
          className={`mode-panel left ${dailyPlayed ? "disabled" : ""}`}
          onClick={() => {
            if (!loggedIn) {
              showMessage("Login Required");
              return;
            }
            if (!dailyPlayed) {
              handleModeSelect("daily");
            }
          }}
        >
          <div className="mode-content">
            <p className="mode-title">Ranked</p>
            <button className="mode-button-daily" disabled={dailyPlayed}>
              DAILY CHALLENGE
            </button>
            {dailyPlayed && (
              <p className="daily-played-msg">Already played today</p>
            )}
          </div>
        </div>

        <div className="lightning-crack"></div>

        {/* Free Play - Right Panel */}
        <div
          className="mode-panel right"
          onClick={() => handleModeSelect("random")}
        >
          <div className="mode-content">
            <p className="mode-title">Practice</p>
            <button className="mode-button">FREE PLAY</button>

            <div className="auth-buttons">
              <button
                className="auth-mode-button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowLeaderboard(true);
                }}
              >
                Leaderboard
              </button>

              <button
                className={`logout-button ${
                  loggedIn ? "logged-in" : "logged-out"
                }`}
                onClick={(e) => {
                  e.stopPropagation();

                  if (loggedIn) {
                    localStorage.removeItem("token");
                    setLoggedIn(false);
                    showMessage("Logged out");
                  } else {
                    setShowLogin(true);
                  }
                }}
              >
                {loggedIn ? "Logout" : "Login"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <h1 id="title">The A1B1 GAME</h1>

      <p className="mode-badge">
        Mode: {gameMode === "daily" ? "Daily Challenge" : "Free Play"}
      </p>

      <hr />
      <br />
      <Dash word={word} onWin={handleWin} />
      <Board
        word={word}
        onGameOver={handleGameOver}
        onWin={handleWin}
        key={boardKey}
        showMessage={showMessage}
      />
      {gameStatus === "lose" && <GameOver word={word} gameover={true} />}
      <MessageBox message={message} />
      {gameStatus === "win" && <WinMessage gameover={true} />}
      <button id="help" onClick={handleHelpClick}>
        ?
      </button>
      {showHelp && <HelpSlider />}
      {gameMode === "random" && gameStatus !== "playing" && (
        <button className="play-again-button" onClick={playAgain}>
          PLAY AGAIN ?
        </button>
      )}
    </div>
  );
}

export default App;
