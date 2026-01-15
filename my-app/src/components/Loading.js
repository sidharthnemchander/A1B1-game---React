import { useEffect, useState } from "react";

const messages = [
  "Thanks for playing ❤️",
  "Do you like word games ?",
  "You look great !!!",
  "Free tier problems, sorry 😅",
  "You come here often ?",
];

function Loading({ apiUrl, onDone }) {
  const [progress, setProgress] = useState(0);
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const msgTimer = setInterval(() => {
      setMsgIndex((i) => (i + 1) % messages.length);
    }, 9000);

    return () => clearInterval(msgTimer);
  }, []);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      setProgress(30);
      await wait(7000);

      setProgress(75);
      await wait(6000);

      setProgress(95);

      while (mounted) {
        try {
          const res = await fetch(`${apiUrl}/api/test`);
          if (res.ok) break;
        } catch (e) {}

        await wait(1500);
      }

      setProgress(100);
      await wait(500);
      onDone();
    };

    run();
    return () => (mounted = false);
  }, [apiUrl, onDone]);

  return (
    <div className="loading-overlay">
      <div className="loading-box">
        <div className="loading-text">{messages[msgIndex]}</div>
        <div className="loading-bar">
          <div className="loading-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export default Loading;
