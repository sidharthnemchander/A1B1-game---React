import { useState } from "react";

function Register({ onRegister, goToLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async () => {
    const res = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Registration failed");
      return;
    }

    setMessage("Registration successful. Please login.");
    setTimeout(() => {
      onRegister();
    }, 1000);
  };

  return (
    <div className="auth-container">
      <h2>Register</h2>

      <input
        className="auth-input"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <br />
      <br />

      <input
        className="auth-input"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <br />
      <br />

      <button className="auth-button" onClick={handleRegister}>
        Register
      </button>

      <br />
      <br />

      <button className="auth-button" onClick={goToLogin}>
        Back to Login
      </button>

      <p className="auth-message">{message}</p>
    </div>
  );
}

export default Register;
