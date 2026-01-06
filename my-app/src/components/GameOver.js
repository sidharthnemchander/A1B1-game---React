const GameOver = ({ word, gameover }) => {
  if (!gameover) return null;
  return (
    <div id="game-over-popup">
      <div className="game-over-content">
        <p className="message">BETTER LUCK NEXT TIME!</p>
        <p className="word-label">THE WORD WAS:</p>
        <p className="word">{word}</p>
      </div>
    </div>
  );
};

export default GameOver;
