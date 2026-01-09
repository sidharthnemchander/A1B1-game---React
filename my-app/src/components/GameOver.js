const GameOver = ({ word, gameover, onBackHome }) => {
  if (!gameover) return null;
  return (
    <div id="game-over-popup">
      <button className="leaderboard-link" onClick={onBackHome}>
        ← Back to Home
      </button>
      <div className="game-over-content">
        <p className="message">BETTER LUCK NEXT TIME!</p>
        <p className="word-label">THE WORD WAS:</p>
        <p className="word">{word}</p>
      </div>
    </div>
  );
};

export default GameOver;
