import { useState } from "react";
import "./App.css";
import Board from "./components/Board";
import Dash from "./components/Dash";
import GameOver from "./components/GameOver";
import HelpSlider from "./components/HelpSlider";
import MessageBox from "./components/MessageBox";
import WinMessage from "./components/WinMessage";

function App() {
  const [word, setWord] = useState("");
  const [gameStatus, setGameStatus] = useState("playing"); // 'playing', 'win', 'lose'
  const [showHelp, setShowHelp] = useState(false);
  const [message, setMessage] = useState("");
  const [gameMode, setGameMode] = useState(null);

  const fetchWord = async (mode) => {
    const url =
      mode === "daily"
        ? "http://localhost:5000/api/word/daily"
        : "http://localhost:5000/api/word/random";

    const response = await fetch(url);
    const data = await response.json();
    setWord(data.word);
  };
  const handleModeSelect = (mode) => {
    setGameMode(mode);
    fetchWord(mode);
  };

  const fetchRandomWord = async () => {
    const response = await fetch("http://localhost:5000/api/word");
    const data = await response.json();
    setWord(data.word);
    console.log(data.word);
  };

  const handleGameOver = () => {
    setGameStatus("lose");
  };

  const handleWin = () => {
    setGameStatus("win");
  };

  const handleHelpClick = () => {
    setShowHelp(!showHelp);
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 2000);
  };

  if (!gameMode) {
    return (
      <div className="App">
        <h1 id="title">The A1B1 Game</h1>
        <p>Select a mode to start</p>

        <button onClick={() => handleModeSelect("daily")}>
          Daily Challenge
        </button>

        <button onClick={() => handleModeSelect("random")}>Free Play</button>
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
