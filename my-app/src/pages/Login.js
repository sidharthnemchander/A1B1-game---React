import { useState } from "react";

function Login({ onLogin, goToRegister }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin() {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message || "Login failed");
      console.error("Login failed:", data.error);
      return;
    }

    localStorage.setItem("token", data.token);
    onLogin();
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login</h2>
        <p className="auth-subtitle">
          Welcome back! Please enter your details.
        </p>
        <div className="auth-form">
          <div className="auth-input-group">
            <label className="auth-input-label">Username</label>
            <input
              className="auth-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
            />
          </div>
          <div className="auth-input-group">
            <label className="auth-input-label">Password</label>
            <input
              className="auth-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />
          </div>
          <button onClick={handleLogin} className="auth-button">
            Login
          </button>
          <div className="auth-switch">
            Don't have an account?{" "}
            <button onClick={goToRegister}>Create Account</button>
          </div>
          {error && <p className="auth-message">{error}</p>}
        </div>
      </div>
    </div>
  );
}

export default Login;
