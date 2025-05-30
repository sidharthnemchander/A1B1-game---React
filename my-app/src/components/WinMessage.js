import confetti from 'canvas-confetti';
import React, { useEffect } from 'react';


const WinMessage = ({ gameover }) => {
  useEffect(() => {
    if (gameover) {
      const duration = 5 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();
    }
  }, [gameover]);

  if (!gameover) return null;
  return (
    <div id="game-win-message">
      You've won the game!
    </div>
  );
};

export default WinMessage;