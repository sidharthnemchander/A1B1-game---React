import { useEffect, useState } from "react";

function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [error, setError] = useState("");
  const API = process.env.REACT_APP_API_URL;
  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`${API}/api/leaderboard/daily`);
      const data = await res.json();

      if (!res.ok) {
        setError("Failed to load leaderboard");
        return;
      }

      setLeaders(data);
    } catch (err) {
      setError("Server error");
    }
  };

  return (
    <div className="leaderboard-container">
      <h2>🏆 Daily Leaderboard</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {leaders.length === 0 ? (
        <p className="leaderboard-empty">No games played today.</p>
      ) : (
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Username</th>
              <th>Wins</th>
              <th>Avg Attempts</th>
            </tr>
          </thead>
          <tbody>
            {leaders.map((user, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{user.username}</td>
                <td>{user.wins}</td>
                <td>{user.avgAttempts?.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Leaderboard;
