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
    <div>
      <h2>Login</h2>

      <input
        className="auth-input"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
      />

      <input
        className="auth-input"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />

      <button onClick={handleLogin} className="auth-button">
        Login
      </button>
      <button className="auth-button" onClick={goToRegister}>
        Create Account
      </button>

      <p className="auth-message">{error}</p>
    </div>
  );
}

export default Login;
