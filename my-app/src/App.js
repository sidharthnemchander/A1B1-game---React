import React, { useEffect, useState } from 'react';
import './App.css';
import Board from './components/Board';
import Dash from './components/Dash';
import GameOver from './components/GameOver';
import HelpSlider from './components/HelpSlider';
import MessageBox from './components/MessageBox';
import WinMessage from './components/WinMessage';

function App() {
  const [word, setWord] = useState('');
  const [gameStatus, setGameStatus] = useState('playing'); // 'playing', 'win', 'lose'
  const [showHelp, setShowHelp] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchRandomWord().then(setWord);
  }, []);

  const fetchRandomWord = async () => {
    const response = await fetch('https://random-word-api.herokuapp.com/word?number=1&length=5');
    const words = await response.json();
    console.log(words);
    return words[0].toUpperCase();
  };

  const handleGameOver = () => {
    setGameStatus('lose');
  };

  const handleWin = () => {
    setGameStatus('win');
  };

  const handleHelpClick = () => {
    setShowHelp(!showHelp);
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 2000);
  };

  return (
    <div className="App">
      <h1 id="title">The A1B1 Game</h1>
      <hr />
      <br />
      <Dash word={word} onWin={handleWin} />
      <Board word={word} onGameOver={handleGameOver} onWin={handleWin} showMessage={showMessage} />
      {gameStatus === 'lose' && <GameOver word={word} gameover={true} />}
      <MessageBox message={message} />
      {gameStatus === 'win' && <WinMessage gameover={true} />}
      <button id="help" onClick={handleHelpClick}>?</button>
      {showHelp && <HelpSlider />}
    </div>
  );
}

export default App;